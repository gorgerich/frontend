import * as DialogPrimitive from "@radix-ui/react-dialog";

import * as React from "react";
import { X } from "../Icons";
import { cn } from "./utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerElement: HTMLElement | null;
  setTriggerElement: (element: HTMLElement | null) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within Dialog");
  }
  return context;
}

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [triggerElement, setTriggerElement] = React.useState<HTMLElement | null>(null);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const handleOpenChange = onOpenChange || setUncontrolledOpen;

  return (
    <DialogContext.Provider
      value={{ open, onOpenChange: handleOpenChange, triggerElement, setTriggerElement }}
    >
      {children}
    </DialogContext.Provider>
  );
}

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, type, ...props }, ref) => {
  const { onOpenChange, setTriggerElement } = useDialog();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTriggerElement(e.currentTarget);
    onOpenChange(true);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    }>;
    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        setTriggerElement(event.currentTarget);
        child.props.onClick?.(event);
        if (!event.defaultPrevented) {
          onOpenChange(true);
        }
      },
    });
  }

  return (
    <button ref={ref} type={type ?? "button"} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

function DialogPortal({ children }: { children: React.ReactNode }) {
  const { open } = useDialog();
  
  if (!open) return null;
  
  return typeof document !== "undefined" 
    ? ReactDOM?.createPortal?.(children, document.body) ?? null
    : null;
}

// For environments where ReactDOM might not be available, provide fallback
const ReactDOM = (() => {
  try {
    return require("react-dom");
  } catch {
    return null;
  }
})();

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, type, ...props }, ref) => {
  const { onOpenChange } = useDialog();
  
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      onClick={(e) => {
        onOpenChange(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DialogClose.displayName = "DialogClose";

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { onOpenChange } = useDialog();
  
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      aria-hidden="true"
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, onOpenChange, triggerElement } = useDialog();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);
  
  React.useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const root = contentRef.current;
      if (!root) return;
      const firstFocusable = root.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable ?? root).focus();
    });

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      const focusTarget = triggerElement ?? previousActiveElementRef.current;
      if (focusTarget && document.contains(focusTarget)) {
        focusTarget.focus();
      }
    };
  }, [open, onOpenChange, triggerElement]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)]",
          "translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-white p-6 shadow-lg",
          "duration-200 sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <DialogClose
          aria-label="Закрыть диалог"
          className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Закрыть</span>
        </DialogClose>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
