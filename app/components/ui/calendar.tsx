"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ru } from "date-fns/locale";
import { cn } from "./utils";

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  className?: string;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  weekStartsOn = 1,
  locale = ru,
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  const normalizeMonth = React.useCallback(
    (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1),
    [],
  );

  const [currentMonth, setCurrentMonth] = React.useState(
    normalizeMonth(month || new Date()),
  );

  React.useEffect(() => {
    if (month) {
      setCurrentMonth(normalizeMonth(month));
    }
  }, [month, normalizeMonth]);

  const monthLabel = currentMonth
    .toLocaleDateString("ru-RU", { month: "long" })
    .replace(/^./, (char) => char.toUpperCase());

  const handleMonthChange = (nextMonth: Date) => {
    const normalizedMonth = normalizeMonth(nextMonth);
    if (!month) {
      setCurrentMonth(normalizedMonth);
    }
    onMonthChange?.(normalizedMonth);
  };

  const handlePreviousMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );
    handleMonthChange(nextMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
    handleMonthChange(nextMonth);
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={currentMonth}
      onMonthChange={handleMonthChange}
      weekStartsOn={weekStartsOn}
      locale={locale}
      className={cn(
        "w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
        className,
      )}
      classNames={{
        months: "flex flex-col",
        month: "flex flex-col",
        caption: "mb-4",
        caption_label: "hidden",
        nav: "hidden",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-1 mb-2",
        head_cell: "text-sm font-medium text-indigo-400 text-center",
        row: "grid grid-cols-7 gap-1",
        cell: cn(
          "p-0 text-center flex items-center justify-center",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-md [&:has(>.day-range-start)]:rounded-md first:[&:has([aria-selected])]:rounded-md last:[&:has([aria-selected])]:rounded-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: "h-12 w-12 rounded-xl font-medium text-indigo-900 hover:bg-indigo-50 aria-selected:opacity-100",
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-600",
        day_today: "bg-blue-100 text-blue-700 border border-blue-200",
        day_outside: "opacity-0 pointer-events-none",
        day_disabled: "text-gray-300",
        day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-700",
        day_hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatWeekdayName: (date) => {
          const days = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
          return days[date.getDay()];
        },
      }}
      components={
        {
          Caption: () => (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              <div className="text-indigo-900 font-serif italic text-lg">Rowi</div>
              <div className="text-center text-base font-semibold text-indigo-900">
                {monthLabel}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="h-12 w-12 rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4 mx-auto" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-12 w-12 rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          ),
        } as any
      }
      {...props}
    />
  );
}

export { Calendar };
