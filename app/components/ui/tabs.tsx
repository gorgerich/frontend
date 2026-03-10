"use client";

import React, {
  createContext,
  useContext,
  useId,
  useState,
  ReactNode,
} from "react";
import { cn } from "./utils";

// Контекст для вкладок
type TabsContextType = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs components must be used inside <Tabs>");
  }
  return ctx;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

// Корневой компонент Tabs
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const baseId = useId();

  const currentValue = value ?? internalValue;

  const setValue = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    if (onValueChange) {
      onValueChange(next);
    }
  };

  return (
    <div className={className}>
      <TabsContext.Provider
        value={{ value: currentValue, setValue, baseId }}
      >
        {children}
      </TabsContext.Provider>
    </div>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

// Контейнер для кнопок-вкладок
export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gray-100 p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

// Кнопка-вкладка
export function TabsTrigger({
  value,
  children,
  className,
}: TabsTriggerProps) {
  const { value: currentValue, setValue, baseId } = useTabsContext();
  const isActive = currentValue === value;
  const triggerId = `${baseId}-trigger-${value}`;
  const contentId = `${baseId}-content-${value}`;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      role="tab"
      id={triggerId}
      aria-controls={contentId}
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "px-6 py-2 text-sm rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-1",
        isActive
          ? "bg-gray-900 text-white shadow"
          : "text-gray-700 hover:bg-white",
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

// Контент вкладки
export function TabsContent({
  value,
  children,
  className,
}: TabsContentProps) {
  const { value: currentValue, baseId } = useTabsContext();
  if (currentValue !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-content-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      className={className}
    >
      {children}
    </div>
  );
}
