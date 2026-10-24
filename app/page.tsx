"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FinanceSection } from "@/components/FinanceSection";
import { ClassScheduleSection } from "@/components/ClassScheduleSection";
import { TaskManagementSection } from "@/components/TaskManagementSection";
import { QuickNotesSection } from "@/components/QuickNotesSection";
import { FileManagerSection } from "@/components/FileManagerSection";
import { TelegramSettingsModal } from "@/components/TelegramSettingsModal";
import { AuthModal } from "@/components/AuthModal";
import {
  Wallet,
  Calendar,
  CheckSquare,
  FileText,
  HardDrive,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [telegramChatId, setTelegramChatId] = useState<number | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const initUser = useCallback(async () => {
    try {
      // 1. Check existing authenticated session
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      let activeUser = currentUser;

      // 2. If no user session, auto sign-in to demo account so everything works out of the box
      if (!activeUser) {
        try {
          await fetch("/api/auth/ensure-demo", { method: "POST" });
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: "demo@campusautomasi.local",
            password: "CampusAutomasiDemoPassword123!",
          });
          activeUser = signInData?.user || null;
        } catch (e) {
          console.error("Auto demo sign-in error:", e);
        }
      }

      if (activeUser) {
        setUserId(activeUser.id);
        setUserEmail(activeUser.email || "Mahasiswa");

        const { data: profile } = await supabase
          .from("profiles")
          .select("telegram_chat_id")
          .eq("id", activeUser.id)
          .maybeSingle();

        if (profile?.telegram_chat_id) {
          setTelegramChatId(profile.telegram_chat_id);
        } else {
          setTelegramChatId(null);
        }
      } else {
        setUserId(undefined);
        setUserEmail(null);
        setTelegramChatId(null);
      }
    } catch (err) {
      console.error("Auth init error:", err);
    }
  }, [supabase]);

  useEffect(() => {
    initUser();

    // Listen for auth state changes (login, logout, switch account)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "Mahasiswa");
        const { data: profile } = await supabase
          .from("profiles")
          .select("telegram_chat_id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.telegram_chat_id) {
          setTelegramChatId(profile.telegram_chat_id);
        } else {
          setTelegramChatId(null);
        }
      } else {
        // If logged out, re-run initUser to re-attach demo account cleanly
        initUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initUser, supabase]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sticky Header with Navigation, Auth & Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        telegramChatId={telegramChatId}
        onOpenTelegramSettings={() => setIsTelegramModalOpen(true)}
        userEmail={userEmail}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Section Rendering */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl shadow-indigo-500/15 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sistem Otomasi Kampus Terpadu</span>
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Selamat Datang di Campus Automasi!
                </h1>
                <p className="mt-3 text-indigo-100 text-sm sm:text-base leading-relaxed">
                  Kelola rutinitas perkuliahan, kontrol keuangan mahasiswa, simpan materi kuliah, dan biarkan Bot Telegram mengingatkan kelas Anda secara otomatis.
                </p>
              </div>

              {/* Decorative background shapes */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Quick Navigation Cards */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Modul Aplikasi
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Finance Card */}
                <div
                  onClick={() => setActiveTab("finance")}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Finance Tracker
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Catat pengeluaran makan, print, & transportasi dengan kalkulasi sisa budget mingguan.
                  </p>
                </div>

                {/* Class Schedule Card */}
                <div
                  onClick={() => setActiveTab("classes")}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Jadwal & Bot Telegram
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Pengingat otomatis via bot Telegram tepat 1 jam sebelum jadwal kuliah dimulai.
                  </p>
                </div>

                {/* Tasks Card */}
                <div
                  onClick={() => setActiveTab("tasks")}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      <CheckSquare className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Task Management
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Klasifikasi cerdas Urgent (&lt; 3 hari) vs Relax serta rekap pengingat harian.
                  </p>
                </div>

                {/* Notes Card */}
                <div
                  onClick={() => setActiveTab("notes")}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Quick Notes Auto-Save
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Editor catatan cepat responsif dengan penyimpanan debounced 1,5 detik otomatis.
                  </p>
                </div>

                {/* Storage Card */}
                <div
                  onClick={() => setActiveTab("files")}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Manajemen Berkas Kuliah
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Simpan dan unduh dokumen presentasi (.ppt, .pptx) dan materi kuliah (.pdf) secara aman.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "finance" && <FinanceSection userId={userId} />}
        {activeTab === "classes" && <ClassScheduleSection userId={userId} />}
        {activeTab === "tasks" && <TaskManagementSection userId={userId} />}
        {activeTab === "notes" && <QuickNotesSection userId={userId} />}
        {activeTab === "files" && <FileManagerSection userId={userId} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Campus Automasi &copy; {new Date().getFullYear()} — Dirancang untuk Efisiensi & Produktivitas Mahasiswa.
      </footer>

      {/* Telegram Settings Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        userId={userId}
        currentChatId={telegramChatId}
        onSaveSuccess={(newId) => {
          setTelegramChatId(newId);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUserEmail={userEmail}
        onAuthSuccess={() => initUser()}
      />
    </div>
  );
}
