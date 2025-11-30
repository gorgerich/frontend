"use client";

import * as React from "react";
import { cn } from "./utils";

type CheckboxProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">;

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-gray-900 " +
          "focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 " +
          "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      checked={checked}
      onChange={(e) => {
        if (onCheckedChange) {
          onCheckedChange(e.target.checked);
        }
      }}
      {...props}
    />
  );
}