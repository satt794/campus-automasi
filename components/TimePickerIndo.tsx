"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, Check, Sparkles } from "lucide-react";
import { formatTimeIndo } from "@/lib/utils";

interface TimePickerIndoProps {
  label: string;
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  required?: boolean;
  minTime?: string;
}

const COMMON_HOURS = [
  "07", "08", "09", "10", "11", "12",
  "13", "14", "15", "16", "17", "18",
  "19", "20", "21"
];

const COMMON_MINUTES = ["00", "10", "15", "20", "30", "40", "45", "50"];

const QUICK_PRESETS = [
  { label: "Pagi 1", time: "07:30" },
  { label: "Pagi 2", time: "08:00" },
  { label: "Siang 1", time: "09:40" },
  { label: "Siang 2", time: "10:00" },
  { label: "Dzuhur", time: "13:00" },
  { label: "Sore 1", time: "14:40" },
  { label: "Sore 2", time: "15:30" },
  { label: "Malam", time: "18:30" },
];

export function TimePickerIndo({
  label,
  value,
  onChange,
  required = false,
}: TimePickerIndoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current hour and minute (default 08:00)
  const parts = (value || "08:00").split(":");
  const currentHour = parts[0]?.padStart(2, "0") || "08";
  const currentMinute = parts[1]?.padStart(2, "0") || "00";

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleHourSelect = (h: string) => {
    onChange(`${h}:${currentMinute}`);
  };

  const handleMinuteSelect = (m: string) => {
    onChange(`${currentHour}:${m}`);
  };

  const handlePresetSelect = (presetTime: string) => {
    onChange(presetTime);
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {/* Trigger Button with Indonesian Format */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-800"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600"
        } text-slate-900 dark:text-white shadow-xs`}
      >
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="font-semibold tracking-wide">
            {formatTimeIndo(value || "08:00")}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Time Picker (Format Indonesia 24 Jam) */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Pemilih Jam Kuliah
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Format 24 Jam (WIB)
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200/60 dark:border-indigo-800/60">
              {formatTimeIndo(value || "08:00")}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Slot Jam Populer</span>
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_PRESETS.map((p) => {
                const isSelected = value === p.time;
                return (
                  <button
                    key={p.time}
                    type="button"
                    onClick={() => handlePresetSelect(p.time)}
                    className={`py-1 px-1.5 rounded-lg text-[11px] font-medium transition-all text-center ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div>{p.time.replace(":", ".")}</div>
                    <div className="text-[9px] opacity-75">{p.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hours Grid (07 to 21) */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Pilih Jam (Pukul)
              </span>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {currentHour}.00
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 max-h-24 overflow-y-auto pr-0.5">
              {COMMON_HOURS.map((h) => {
                const isSelected = currentHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minutes Grid */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Pilih Menit
              </span>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                :{currentMinute}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {COMMON_MINUTES.map((m) => {
                const isSelected = currentMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteSelect(m)}
                    className={`py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    :{m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {formatTimeIndo(value || "08:00")}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center space-x-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Gunakan Jam Ini</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
