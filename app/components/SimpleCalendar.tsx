"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./ui/utils";

interface SimpleCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: { before?: Date };
  className?: string;
}

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function SimpleCalendar({
  selected,
  onSelect,
  disabled,
  className,
}: SimpleCalendarProps) {
  const initialDate = selected ?? new Date();
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (!selected) return;
    setYear(selected.getFullYear());
    setMonth(selected.getMonth());
  }, [selected]);

  const disabledBefore = disabled?.before
    ? startOfDay(disabled.before)
    : undefined;

  const isDateDisabled = (date: Date) => {
    if (!disabledBefore) return false;
    return startOfDay(date).getTime() < disabledBefore.getTime();
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((current) => current - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((current) => current + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    if (isDateDisabled(date)) return;
    onSelect?.(date);
  };

  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();

  const grid = [];

  for (let i = 0; i < firstDay; i += 1) {
    grid.push(
      <div key={`empty-start-${i}`} className="w-[42px] h-[42px]" />,
    );
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const isDisabled = isDateDisabled(date);
    const isSelected = selected ? isSameDay(date, selected) : false;
    const isToday = isSameDay(date, today);

    grid.push(
      <button
        key={`day-${day}`}
        type="button"
        onClick={() => handleDayClick(day)}
        disabled={isDisabled}
        className={cn(
          "w-[42px] h-[42px] p-0 rounded-xl transition-all duration-200 font-medium",
          "text-[#3a3a5f] text-sm",
          !isDisabled
            && !isSelected
            && "hover:bg-blue-50/70 hover:text-[#0066ff] hover:scale-110 active:scale-95",
          isSelected
            && "bg-gradient-to-br from-[#0066ff] to-[#0052cc] text-white hover:from-[#0052cc] hover:to-[#003d99] shadow-lg shadow-blue-500/40 scale-110 ring-2 ring-blue-200/50",
          isToday
            && !isSelected
            && "bg-gradient-to-br from-blue-50 to-blue-100/50 text-[#0066ff] ring-2 ring-blue-200/60 font-semibold",
          isDisabled && "text-[#d4d4e8] opacity-25 cursor-not-allowed hover:scale-100",
        )}
      >
        {day}
      </button>,
    );
  }

  const totalCells = firstDay + daysInMonth;
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 0; i < trailingCells; i += 1) {
    grid.push(
      <div key={`empty-end-${i}`} className="w-[42px] h-[42px]" />,
    );
  }

  return (
    <div
      className={cn(
        "p-6 bg-gradient-to-br from-gray-50/80 to-white/90 rounded-3xl border border-gray-200/50 shadow-sm",
        className,
      )}
    >
      <div className="flex justify-between items-center w-full mb-5">
        <div className="flex items-center gap-3">
          <div className="text-[#1a1a4d] font-serif italic tracking-tight text-[26px]">
            Rowi
          </div>
          <div className="h-5 w-px bg-gray-300/60" />
          <span className="text-xl text-[#1a1a4d] tracking-tight font-medium">
            {MONTHS[month]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="size-9 bg-white/90 hover:bg-white border border-gray-200 rounded-xl opacity-70 hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:shadow-sm hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="size-4 text-[#1a1a4d]" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="size-9 bg-white/90 hover:bg-white border border-gray-200 rounded-xl opacity-70 hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:shadow-sm hover:scale-105 active:scale-95"
          >
            <ChevronRight className="size-4 text-[#1a1a4d]" />
          </button>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

      <div className="flex gap-2 mb-4 px-0.5">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-[#9090b8] uppercase text-[11px] w-[42px] text-center tracking-wider font-semibold"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid}
      </div>
    </div>
  );
}
