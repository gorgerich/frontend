"use client";

import * as React from "react";

export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ScrollArea({
  children,
  className = "",
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={`overflow-y-auto overflow-x-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}