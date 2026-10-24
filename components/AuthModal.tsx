"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  KeyRound,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string | null;
  onAuthSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUserEmail,
  onAuthSuccess,
}: AuthModalProps) {
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setFeedback({ type: "error", message: error.message });
      } else {
        setFeedback({
          type: "success",
          message: "Berhasil masuk! Memuat data akun Anda...",
        });
        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", message: error.message || "Gagal masuk." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setFeedback({ type: "error", message: error.message });
      } else {
        setFeedback({
          type: "success",
          message:
            "Akun berhasil didaftarkan! Jika verifikasi email aktif, cek inbox Anda.",
        });
        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", message: error.message || "Gagal mendaftar." });
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await fetch("/api/auth/ensure-demo", { method: "POST" });
      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@campusautomasi.local",
        password: "CampusAutomasiDemoPassword123!",
      });

      if (error) {
        setFeedback({ type: "error", message: error.message });
      } else {
        setFeedback({
          type: "success",
          message: "Berhasil beralih ke Akun Demo!",
        });
        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 1000);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({
        type: "error",
        message: error.message || "Gagal masuk ke akun demo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setFeedback({
        type: "success",
        message: "Berhasil keluar dari akun.",
      });
      setTimeout(() => {
        onAuthSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", message: error.message || "Gagal keluar." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Akun Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola sesi login dan isolasi data pribadi Anda.
            </p>
          </div>
        </div>

        {currentUserEmail && (
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Sesi Aktif
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                {currentUserEmail}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setFeedback(null);
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              mode === "login"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setFeedback(null);
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              mode === "register"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Baru</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Mahasiswa
            </label>
            <input
              type="email"
              required
              placeholder="nama@kampus.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Baru</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleUseDemo}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gunakan Akun Demo (Instant 1-Click Login)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
