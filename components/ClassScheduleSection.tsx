"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useClassSchedule, DAYS_OF_WEEK } from "@/hooks/useClassSchedule";
import { TimePickerIndo } from "@/components/TimePickerIndo";
import { DayDatePicker } from "@/components/DayDatePicker";
import {
  formatTimeIndo,
  formatTimeRangeIndo,
  calculateDuration,
} from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  UserCheck,
  PlusCircle,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  CalendarDays,
  ListFilter,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface ClassScheduleSectionProps {
  userId: string | undefined;
}

// Ordered Monday (1) to Sunday (0)
const ORDERED_DAYS = [
  { index: 1, label: "Senin" },
  { index: 2, label: "Selasa" },
  { index: 3, label: "Rabu" },
  { index: 4, label: "Kamis" },
  { index: 5, label: "Jumat" },
  { index: 6, label: "Sabtu" },
  { index: 0, label: "Minggu" },
];

export function ClassScheduleSection({ userId }: ClassScheduleSectionProps) {
  const {
    classes,
    telegramChatId,
    loading,
    addClass,
    deleteClass,
    updateTelegramChatId,
  } = useClassSchedule(userId);

  // Form states
  const [courseName, setCourseName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday default
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:40");
  const [room, setRoom] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // View state: "calendar" or "list"
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | "all">("all");

  // Telegram test state
  const [inputChatId, setInputChatId] = useState(
    telegramChatId ? String(telegramChatId) : ""
  );
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const todayDayIndex = new Date().getDay(); // 0 = Sunday

  useEffect(() => {
    if (telegramChatId) {
      setInputChatId(String(telegramChatId));
    }
  }, [telegramChatId]);

  // Duration calculation for current form inputs
  const currentDuration = useMemo(() => {
    return calculateDuration(startTime, endTime);
  }, [startTime, endTime]);

  // Handle quick SKS duration buttons
  const handleApplyDuration = (minutes: number) => {
    const [h, m] = startTime.split(":").map(Number);
    const totalMin = h * 60 + m + minutes;
    const newH = Math.floor(totalMin / 60) % 24;
    const newM = totalMin % 60;
    setEndTime(
      `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
    );
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await addClass({
      course_name: courseName.trim(),
      day_of_week: dayOfWeek,
      start_time: startTime.length === 5 ? startTime + ":00" : startTime,
      end_time: endTime.length === 5 ? endTime + ":00" : endTime,
      room: room.trim() || undefined,
      lecturer: lecturer.trim() || undefined,
    });

    if (res?.error) {
      setFeedback({
        type: "error",
        message: `Gagal menyimpan jadwal: ${
          res.error.message || "Pastikan Anda sudah login"
        }`,
      });
    } else {
      setFeedback({
        type: "success",
        message: `Jadwal "${courseName.trim()}" (${formatTimeRangeIndo(
          startTime,
          endTime
        )}) berhasil ditambahkan!`,
      });
      setCourseName("");
      setRoom("");
      setLecturer("");
      setTimeout(() => setFeedback(null), 3500);
    }
    setIsSubmitting(false);
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Hapus jadwal "${name}"?`)) return;
    const res = await deleteClass(id);
    if (res?.error) {
      alert(`Gagal menghapus: ${res.error.message}`);
    }
  };

  const handleSaveTelegram = async () => {
    const num = parseInt(inputChatId, 10);
    if (!isNaN(num)) {
      const res = await updateTelegramChatId(num);
      if (res?.error) {
        setTestStatus(`❌ Gagal menyimpan Chat ID: ${res.error.message}`);
      } else {
        setTestStatus("✅ Chat ID berhasil disimpan ke akun Anda!");
      }
      setTimeout(() => setTestStatus(null), 3000);
    }
  };

  const handleTestTelegram = async () => {
    const targetChatId = inputChatId || telegramChatId;
    if (!targetChatId) {
      setTestStatus("Silakan masukkan Chat ID Telegram Anda terlebih dahulu.");
      return;
    }

    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: targetChatId,
          message:
            "🔔 *Tes Notifikasi Campus Automasi!*\n\nBot berhasil terhubung ke akun Anda! Anda akan menerima pengingat otomatis 1 jam sebelum jadwal kuliah dimulai. 🎓",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestStatus("✅ Notifikasi tes berhasil terkirim!");
      } else {
        setTestStatus(`❌ Gagal: ${data.error || "Cek bot token"}`);
      }
    } catch {
      setTestStatus("❌ Terjadi kesalahan jaringan.");
    } finally {
      setIsTesting(false);
    }
  };

  // Group classes by day for Calendar View
  const classesByDay = useMemo(() => {
    const map = new Map<number, typeof classes>();
    ORDERED_DAYS.forEach((d) => map.set(d.index, []));

    classes.forEach((c) => {
      const list = map.get(c.day_of_week) || [];
      list.push(c);
      map.set(c.day_of_week, list);
    });

    // Sort each day by start_time
    map.forEach((list) => {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return map;
  }, [classes]);

  // Statistics calculation
  const totalSks = useMemo(() => {
    return classes.reduce((acc, c) => {
      const { sks } = calculateDuration(c.start_time, c.end_time);
      return acc + sks;
    }, 0);
  }, [classes]);

  const todayClassesCount = useMemo(() => {
    return classes.filter((c) => c.day_of_week === todayDayIndex).length;
  }, [classes, todayDayIndex]);

  // Filtered classes for list view
  const filteredClasses = useMemo(() => {
    if (selectedDayFilter === "all") return classes;
    return classes.filter((c) => c.day_of_week === selectedDayFilter);
  }, [classes, selectedDayFilter]);

  return (
    <div className="space-y-6">
      {/* Telegram Configuration Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-blue-200 dark:border-indigo-900/50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Integrasi Bot Telegram (Pengingat 1 Jam Sebelum Kelas)</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Mulai chat dengan bot Anda di Telegram, ketik{" "}
              <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 font-mono">
                /start
              </code>
              , lalu masukkan Chat ID Anda di bawah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Chat ID (misal: 7455955755)"
              value={inputChatId}
              onChange={(e) => setInputChatId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
            />
            <button
              onClick={handleSaveTelegram}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs"
            >
              Simpan ID
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTesting}
              type="button"
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              {isTesting ? "Mengirim..." : "Kirim Tes"}
            </button>
          </div>
        </div>

        {testStatus && (
          <div className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {testStatus}
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total Mata Kuliah
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {classes.length} Kelas
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Estimasi Beban SKS
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ~{totalSks} SKS
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Kuliah Hari Ini ({DAYS_OF_WEEK[todayDayIndex]})
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {todayClassesCount} Kelas
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Schedule List/Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Add Class (4 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Tambah Jadwal Kuliah</span>
          </h3>

          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleAddClass} className="space-y-4">
            {/* Nama Mata Kuliah */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nama Mata Kuliah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pemrograman Web Lanjut"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Day Selector with Calendar Date Picker Option */}
            <DayDatePicker
              dayOfWeek={dayOfWeek}
              onChangeDay={(newDay) => setDayOfWeek(newDay)}
            />

            {/* Time Pickers (Format Indonesia 24 Jam WIB) */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <TimePickerIndo
                  label="Jam Mulai (WIB)"
                  value={startTime}
                  onChange={(val) => setStartTime(val)}
                  required
                />
                <TimePickerIndo
                  label="Jam Selesai (WIB)"
                  value={endTime}
                  onChange={(val) => setEndTime(val)}
                  required
                />
              </div>

              {/* Quick SKS Duration Presets & Info */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium">
                    Durasi:{" "}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {currentDuration.text}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">
                    Atur Cepat:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyDuration(50)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                    title="1 SKS (50 Menit)"
                  >
                    1 SKS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDuration(100)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                    title="2 SKS (100 Menit)"
                  >
                    2 SKS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDuration(150)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition-colors shadow-2xs"
                    title="3 SKS (150 Menit)"
                  >
                    3 SKS
                  </button>
                </div>
              </div>
            </div>

            {/* Ruangan */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Ruangan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Lab Komputer 3 / Gedung B.201"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Dosen */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Dosen Pengampu (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom"
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Jadwal Kuliah</span>
              )}
            </button>
          </form>
        </div>

        {/* Schedule Display: Calendar / List View (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-4">
          {/* Header with View Toggle & Total */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Jadwal Perkuliahan Mingguan</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {classes.length} Kelas
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Waktu disesuaikan dengan format 24 jam Indonesia (WIB)
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "calendar"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Kalender</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Daftar</span>
              </button>
            </div>
          </div>

          {/* Filter Bar (Day Selector) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedDayFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex-shrink-0 ${
                selectedDayFilter === "all"
                  ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Semua Hari
            </button>
            {ORDERED_DAYS.map((d) => {
              const isSelected = selectedDayFilter === d.index;
              const isToday = todayDayIndex === d.index;
              const count = classesByDay.get(d.index)?.length || 0;

              return (
                <button
                  key={d.index}
                  type="button"
                  onClick={() => setSelectedDayFilter(d.index)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 flex-shrink-0 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{d.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-amber-300" : "bg-indigo-500"
                      }`}
                      title="Hari Ini"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto max-h-[520px] pr-1 space-y-4">
            {loading ? (
              <div className="text-center py-14 text-sm text-slate-400 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span>Memuat jadwal perkuliahan...</span>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-14 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Belum Ada Jadwal Kuliah
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Gunakan formulir di sebelah kiri untuk menambahkan mata kuliah, jam mulai & selesai (format Indonesia WIB), serta ruangan kuliah.
                </p>
              </div>
            ) : viewMode === "calendar" ? (
              /* CALENDAR / TIMETABLE VIEW */
              <div className="space-y-4">
                {ORDERED_DAYS.filter(
                  (d) =>
                    selectedDayFilter === "all" || selectedDayFilter === d.index
                ).map((day) => {
                  const dayClasses = classesByDay.get(day.index) || [];
                  const isToday = todayDayIndex === day.index;

                  if (selectedDayFilter !== "all" && dayClasses.length === 0) {
                    return (
                      <div
                        key={day.index}
                        className="text-center py-10 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl"
                      >
                        Tidak ada kelas terdaftar pada hari {day.label}.
                      </div>
                    );
                  }

                  // If showing all days, omit empty days or show minimal notice
                  if (dayClasses.length === 0) return null;

                  return (
                    <div
                      key={day.index}
                      className={`p-4 rounded-2xl border transition-all ${
                        isToday
                          ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-500/20"
                          : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800"
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-bold text-sm ${
                              isToday
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {day.label}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-2xs">
                              HARI INI
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {dayClasses.length} Mata Kuliah
                        </span>
                      </div>

                      {/* Class cards in chronological timeline */}
                      <div className="space-y-2.5">
                        {dayClasses.map((cls) => {
                          const duration = calculateDuration(
                            cls.start_time,
                            cls.end_time
                          );
                          return (
                            <div
                              key={cls.id}
                              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-start justify-between gap-3 group"
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Indonesian Time Badge */}
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono">
                                    <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    <span>
                                      {formatTimeRangeIndo(
                                        cls.start_time,
                                        cls.end_time
                                      )}
                                    </span>
                                  </span>

                                  {/* Duration Badge */}
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {duration.text}
                                  </span>
                                </div>

                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                  {cls.course_name}
                                </h4>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                  {cls.room && (
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{cls.room}</span>
                                    </span>
                                  )}
                                  {cls.lecturer && (
                                    <span className="flex items-center space-x-1">
                                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{cls.lecturer}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  handleDeleteClass(cls.id, cls.course_name)
                                }
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-75 group-hover:opacity-100 flex-shrink-0"
                                title="Hapus Kelas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* FLAT LIST VIEW */
              <div className="space-y-2.5">
                {filteredClasses.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    Tidak ada jadwal kelas pada filter ini.
                  </div>
                ) : (
                  filteredClasses.map((cls) => {
                    const duration = calculateDuration(
                      cls.start_time,
                      cls.end_time
                    );
                    const isToday = todayDayIndex === cls.day_of_week;

                    return (
                      <div
                        key={cls.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isToday
                            ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60"
                            : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-800"
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                              {DAYS_OF_WEEK[cls.day_of_week]}
                            </span>
                            {isToday && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                                HARI INI
                              </span>
                            )}
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                              {cls.course_name}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <span className="flex items-center space-x-1 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {formatTimeRangeIndo(
                                  cls.start_time,
                                  cls.end_time
                                )}
                              </span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({duration.text})
                            </span>
                            {cls.room && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{cls.room}</span>
                              </span>
                            )}
                            {cls.lecturer && (
                              <span className="flex items-center space-x-1">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                <span>{cls.lecturer}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleDeleteClass(cls.id, cls.course_name)
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
