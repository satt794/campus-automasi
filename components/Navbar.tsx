"use client";

import React from "react";
import { ThemeToggle } from "./theme-toggle";
import { GraduationCap, Bell, ShieldCheck, Settings } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  telegramChatId: number | null;
  onOpenTelegramSettings: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  telegramChatId,
  onOpenTelegramSettings,
}: NavbarProps) {
  const tabs = [
    { id: "overview", label: "Dashboard" },
    { id: "finance", label: "Keuangan" },
    { id: "classes", label: "Jadwal Kuliah" },
    { id: "tasks", label: "Tugas" },
    { id: "notes", label: "Quick Notes" },
    { id: "files", label: "Berkas" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab("overview")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                Campus Automasi
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                v1.0
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions: Telegram Status & Theme Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenTelegramSettings}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${
                telegramChatId
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                  : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
              }`}
              title="Klik untuk mengatur Chat ID Telegram Anda"
            >
              {telegramChatId ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Bot Terhubung</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Atur Bot</span>
                </>
              )}
              <Settings className="w-3 h-3 ml-0.5 opacity-60" />
            </button>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto space-x-1 py-2 border-t border-slate-100 dark:border-slate-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
