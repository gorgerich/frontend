"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { cn } from "./utils";

// Контекст для вкладок
type TabsContextType = {
  value: string;
  setValue: (value: string) => void;
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
        value={{ value: currentValue, setValue }}
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
  const { value: currentValue, setValue } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "px-6 py-2 text-sm rounded-full transition-all",
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
  const { value: currentValue } = useTabsContext();
  if (currentValue !== value) return null;

  return <div className={className}>{children}</div>;
}