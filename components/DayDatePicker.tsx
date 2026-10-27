"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarCheck,
} from "lucide-react";
import { DAYS_OF_WEEK } from "@/hooks/useClassSchedule";

interface DayDatePickerProps {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  onChangeDay: (day: number) => void;
}

const MONTH_NAMES_INDO = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_SHORT_INDO = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Re-ordered starting from Monday (1) to Sunday (0) for natural university week
const ORDERED_DAYS = [
  { index: 1, label: "Senin", short: "Sen" },
  { index: 2, label: "Selasa", short: "Sel" },
  { index: 3, label: "Rabu", short: "Rab" },
  { index: 4, label: "Kamis", short: "Kam" },
  { index: 5, label: "Jumat", short: "Jum" },
  { index: 6, label: "Sabtu", short: "Sab" },
  { index: 0, label: "Minggu", short: "Min" },
];

export function DayDatePicker({ dayOfWeek, onChangeDay }: DayDatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calendar navigation state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateNote, setSelectedDateNote] = useState<string | null>(null);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Calendar calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (dayNum: number) => {
    const clickedDate = new Date(viewYear, viewMonth, dayNum);
    const dayIndex = clickedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    onChangeDay(dayIndex);

    const dayName = DAYS_OF_WEEK[dayIndex];
    const monthName = MONTH_NAMES_INDO[viewMonth];
    setSelectedDateNote(
      `${dayName}, ${dayNum} ${monthName} ${viewYear}`
    );
    setIsCalendarOpen(false);
  };

  const currentDayName = DAYS_OF_WEEK[dayOfWeek];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Hari Perkuliahan <span className="text-rose-500">*</span>
        </label>

        {/* Button to open visual monthly calendar */}
        <div className="relative" ref={calendarRef}>
          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-0.5 px-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Pilih Lewat Kalender Tanggal</span>
          </button>

          {/* Calendar Popover */}
          {isCalendarOpen && (
            <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Month Navigation */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {MONTH_NAMES_INDO[viewMonth]} {viewYear}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAY_SHORT_INDO.map((d, i) => (
                  <span
                    key={d}
                    className={`text-[10px] font-semibold ${
                      i === 0 ? "text-rose-500" : "text-slate-400"
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty offset spaces */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7 w-7" />
                ))}

                {/* Day numbers */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateObj = new Date(viewYear, viewMonth, dayNum);
                  const isSun = dateObj.getDay() === 0;
                  const isCurrentDayMatch = dateObj.getDay() === dayOfWeek;
                  const isToday =
                    dayNum === today.getDate() &&
                    viewMonth === today.getMonth() &&
                    viewYear === today.getFullYear();

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handleSelectDate(dayNum)}
                      className={`h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                        isCurrentDayMatch
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : isToday
                          ? "border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                          : isSun
                          ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Klik tanggal untuk memilih hari kuliah otomatis.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day Chips Selector (Senin - Minggu) */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
        {ORDERED_DAYS.map((day) => {
          const isSelected = dayOfWeek === day.index;
          const isToday = today.getDay() === day.index;

          return (
            <button
              key={day.index}
              type="button"
              onClick={() => {
                onChangeDay(day.index);
                setSelectedDateNote(null);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all relative flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <span>{day.short}</span>
              <span className="text-[10px] font-normal opacity-85">
                {day.label}
              </span>
              {isToday && (
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    isSelected ? "bg-amber-300" : "bg-indigo-500"
                  }`}
                  title="Hari Ini"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Notice */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
        <CalendarCheck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
        <span>
          {selectedDateNote ? (
            <>
              Terpilih dari kalender:{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {selectedDateNote}
              </strong>{" "}
              (Setiap hari {currentDayName})
            </>
          ) : (
            <>
              Terjadwal setiap hari:{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {currentDayName}
              </strong>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
