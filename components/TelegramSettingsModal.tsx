"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
} from "lucide-react";

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  currentChatId: number | null;
  onSaveSuccess: (newChatId: number) => void;
}

export function TelegramSettingsModal({
  isOpen,
  onClose,
  userId,
  currentChatId,
  onSaveSuccess,
}: TelegramSettingsModalProps) {
  const supabase = createClient();
  const [chatIdInput, setChatIdInput] = useState<string>(
    currentChatId ? String(currentChatId) : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!userId) {
      setStatusMessage({
        type: "error",
        text: "User ID tidak ditemukan. Pastikan Anda sudah login.",
      });
      return;
    }

    const num = parseInt(chatIdInput.trim(), 10);
    if (isNaN(num)) {
      setStatusMessage({
        type: "error",
        text: "Chat ID harus berupa angka.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { id: userId, telegram_chat_id: num, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );

      if (error) {
        setStatusMessage({
          type: "error",
          text: `Gagal menyimpan: ${error.message}`,
        });
      } else {
        setStatusMessage({
          type: "success",
          text: "Chat ID berhasil disimpan ke akun Anda!",
        });
        onSaveSuccess(num);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    const targetChatId = chatIdInput.trim() || currentChatId;
    if (!targetChatId) {
      setStatusMessage({
        type: "error",
        text: "Masukkan Chat ID terlebih dahulu sebelum mengetes.",
      });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: targetChatId,
          message:
            "🔔 *Tes Notifikasi Mandiri Campus Automasi*\n\nAkun Anda telah berhasil terhubung dengan sistem! Anda akan menerima:\n1. ⏰ Pengingat kelas 1 jam sebelum jadwal dimulai.\n2. 🚨 Rekap tugas urgent (< 3 hari) setiap pagi.\n\nSemangat kuliahnya! 🎓",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: "Pesan tes berhasil terkirim ke Telegram Anda!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Gagal mengirim pesan. Pastikan sudah klik /start di bot.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Gagal terhubung ke API Telegram.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Pengaturan Notifikasi Telegram
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setiap pengguna dapat menghubungkan akun Telegram pribadinya masing-masing.
            </p>
          </div>
        </div>

        {/* 3 Step Instruction Guide */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 mb-6 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cara Mendapatkan Chat ID (Untuk Siapa Saja)</span>
          </span>

          <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Buka bot resmi di Telegram:{" "}
              <a
                href="https://t.me/AutomasiCampus_Bot"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-indigo-600 dark:text-indigo-400 underline inline-flex items-center space-x-0.5"
              >
                <span>@AutomasiCampus_Bot</span>
                <ExternalLink className="w-3 h-3 inline ml-0.5" />
              </a>{" "}
              lalu klik tombol <b>START</b>.
            </li>
            <li>
              Buka bot pembantu{" "}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-indigo-600 dark:text-indigo-400 underline inline-flex items-center space-x-0.5"
              >
                <span>@userinfobot</span>
                <ExternalLink className="w-3 h-3 inline ml-0.5" />
              </a>{" "}
              dan klik Start untuk melihat angka <b>Id</b> Anda.
            </li>
            <li>Masukkan angka ID tersebut ke kolom di bawah ini dan klik <b>Simpan</b>.</li>
          </ol>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chat ID Telegram Anda
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Contoh: 7455955755"
                value={chatIdInput}
                onChange={(e) => setChatIdInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tersimpan aman di profil akun Anda di database Supabase.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={handleTestNotification}
              disabled={isTesting}
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isTesting ? "Mengirim..." : "Kirim Pesan Tes"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan Chat ID"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
