"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const [currentMonth, setCurrentMonth] = React.useState(props.month || new Date());

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      className={cn("p-6 bg-gradient-to-br from-gray-50/80 to-white/90 rounded-3xl border border-gray-200/50", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-6",
        caption: "flex justify-between items-center mb-4 relative",
        caption_label: "hidden",
        nav: "hidden",
        table: "w-full border-collapse",
        head_row: "flex gap-2 mb-3",
        head_cell: "text-[#a0a0c8] uppercase text-xs w-[42px] text-center tracking-wide",
        row: "flex gap-2 mb-2",
        cell: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-md [&:has(>.day-range-start)]:rounded-md first:[&:has([aria-selected])]:rounded-md last:[&:has([aria-selected])]:rounded-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: "w-[42px] h-[42px] p-0 text-[#3a3a5f] hover:bg-blue-50/50 hover:text-[#0066ff] rounded-md transition-all duration-150 aria-selected:opacity-100",
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: "bg-[#0066ff] text-white hover:bg-[#0052cc] hover:text-white focus:bg-[#0066ff] focus:text-white shadow-lg shadow-blue-500/30 scale-105",
        day_today: "bg-blue-50 text-[#0066ff] ring-2 ring-blue-200/50",
        day_outside: "day-outside text-[#d4d4e8] opacity-50 aria-selected:text-white",
        day_disabled: "text-[#d4d4e8] opacity-30",
        day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-[#0066ff]",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatWeekdayName: (date) => {
          const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
          return days[(date.getDay() + 6) % 7];
        },
      }}
      modifiersClassNames={{
        weekend: "text-[#0066ff]",
      }}
      modifiers={{
        weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
      }}
      components={{
        Caption: () => (
          <div className="flex justify-between items-center w-full mb-4">
            <div className="text-[#1a1a4d] italic tracking-tight" style={{ fontFamily: 'Georgia, serif', fontSize: '24px' }}>
              Rowi
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl text-[#1a1a4d] tracking-tight">
                {monthNames[currentMonth.getMonth()]}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="size-8 bg-white/80 hover:bg-white border border-gray-200 rounded-lg opacity-60 hover:opacity-100 transition-all duration-150 flex items-center justify-center"
                >
                  <ChevronLeft className="size-4 text-[#1a1a4d]" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="size-8 bg-white/80 hover:bg-white border border-gray-200 rounded-lg opacity-60 hover:opacity-100 transition-all duration-150 flex items-center justify-center"
                >
                  <ChevronRight className="size-4 text-[#1a1a4d]" />
                </button>
              </div>
            </div>
          </div>
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
