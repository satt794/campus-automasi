"use client";

import React, { useState, useEffect } from "react";
import { useClassSchedule, DAYS_OF_WEEK } from "@/hooks/useClassSchedule";
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  PlusCircle,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ClassScheduleSectionProps {
  userId: string | undefined;
}

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

  // Telegram test state
  const [inputChatId, setInputChatId] = useState(telegramChatId ? String(telegramChatId) : "");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (telegramChatId) {
      setInputChatId(String(telegramChatId));
    }
  }, [telegramChatId]);

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
        message: `Gagal menyimpan jadwal: ${res.error.message || "Pastikan Anda sudah login"}`,
      });
    } else {
      setFeedback({
        type: "success",
        message: `Jadwal "${courseName.trim()}" berhasil ditambahkan!`,
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
          message: "🔔 *Tes Notifikasi Campus Automasi!*\\n\\nBot berhasil terhubung ke akun Anda! Anda akan menerima pengingat otomatis 1 jam sebelum jadwal kuliah dimulai. 🎓",
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
              Mulai chat dengan bot Anda di Telegram, ketik <code className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 font-mono">/start</code>, lalu masukkan Chat ID Anda di bawah.
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

      {/* Main Grid: Form + Schedule List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add Class */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Tambah Jadwal Kuliah</span>
          </h3>

          {feedback && (
            <div
              className={`mb-4 p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
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
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nama Mata Kuliah
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

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Hari Perkuliahan
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DAYS_OF_WEEK.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Mulai
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Selesai
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

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
                <span>Simpan Jadwal</span>
              )}
            </button>
          </form>
        </div>

        {/* Schedule List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Daftar Kelas Mingguan</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: {classes.length} Kelas
            </span>
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {loading ? (
              <div className="text-center py-10 text-sm text-slate-400 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Memuat jadwal perkuliahan...</span>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">
                Belum ada jadwal kelas yang ditambahkan.
              </div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-all flex items-start justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                        {DAYS_OF_WEEK[cls.day_of_week]}
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {cls.course_name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
                        </span>
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
                    onClick={() => handleDeleteClass(cls.id, cls.course_name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
