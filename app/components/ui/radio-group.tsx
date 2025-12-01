"use client";

import * as React from "react";
import { cn } from "./utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

function RadioGroup({
  className,
  value,
  onValueChange,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        data-slot="radio-group"
        className={cn("grid gap-3", className)}
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
}

function RadioGroupItem({
  className,
  value,
  id,
  ...props
}: RadioGroupItemProps) {
  const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext);
  const isChecked = groupValue === value;

  return (
    <div className="relative flex items-center">
      <input
        type="radio"
        id={id}
        value={value}
        checked={isChecked}
        onChange={(e) => {
          if (e.target.checked && onValueChange) {
            onValueChange(value);
          }
        }}
        data-slot="radio-group-item"
        className={cn(
          "peer appearance-none border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <div className="pointer-events-none absolute left-0 top-0 flex size-4 items-center justify-center">
        <div className={cn(
          "size-2 rounded-full bg-gray-900 transition-opacity",
          isChecked ? "opacity-100" : "opacity-0"
        )} />
      </div>
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
