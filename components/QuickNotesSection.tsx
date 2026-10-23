"use client";

import React from "react";
import { useQuickNotes, SaveStatus } from "@/hooks/useQuickNotes";
import {
  FileText,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface QuickNotesSectionProps {
  userId: string | undefined;
}

export function QuickNotesSection({ userId }: QuickNotesSectionProps) {
  const { content, status, lastSavedAt, handleContentChange, forceSave } =
    useQuickNotes(userId);

  const getStatusBadge = (s: SaveStatus) => {
    switch (s) {
      case "saving":
        return (
          <span className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Menyimpan otomatis...</span>
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5" />
            <span>Tersimpan</span>
          </span>
        );
      case "unsaved":
        return (
          <span className="flex items-center space-x-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Mengetik (auto-save 1.5s)...</span>
          </span>
        );
      case "error":
        return (
          <span className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Gagal menyimpan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Quick Notes Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Catat ide, to-do instan, atau catatan dosen. Tersimpan otomatis 1,5 detik setelah mengetik.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {getStatusBadge(status)}
          {lastSavedAt && (
            <span className="hidden md:inline-block text-xs text-slate-400">
              Terakhir: {lastSavedAt.toLocaleTimeString("id-ID")}
            </span>
          )}
        </div>
      </div>

      {/* Editor Container */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
        <textarea
          rows={16}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Mulai ketik catatan cepat Anda di sini... (misal: link zoom, draft ide skripsi, catatan rapat kelompok)"
          className="w-full bg-transparent resize-y text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm leading-relaxed focus:outline-none"
        />

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Debounced Auto-Save Engine Aktif</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>{content.length} Karakter</span>
            <button
              onClick={forceSave}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Simpan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
