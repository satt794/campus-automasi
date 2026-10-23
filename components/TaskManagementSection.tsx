"use client";

import React, { useState } from "react";
import { useTaskManager, Task } from "@/hooks/useTaskManager";
import { formatDateIndo } from "@/lib/utils";
import {
  Flame,
  Coffee,
  CheckCircle2,
  Circle,
  PlusCircle,
  Trash2,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface TaskManagementSectionProps {
  userId: string | undefined;
}

export function TaskManagementSection({ userId }: TaskManagementSectionProps) {
  const {
    urgentTasks,
    relaxTasks,
    completedTasks,
    loading,
    addTask,
    toggleTaskStatus,
    deleteTask,
  } = useTaskManager(userId);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tab: "all", "urgent", "relax", "completed"
  const [activeFilter, setActiveFilter] = useState<"urgent" | "relax" | "completed">("urgent");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    setIsSubmitting(true);
    await addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: new Date(deadline).toISOString(),
    });

    setTitle("");
    setDescription("");
    setDeadline("");
    setIsSubmitting(false);
  };

  const renderTaskList = (tasks: Task[], type: "urgent" | "relax" | "completed") => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-10 text-sm text-slate-400">
          {type === "urgent"
            ? "Tidak ada tugas mendesak saat ini. Santai sejenak! ☕"
            : type === "relax"
            ? "Belum ada tugas santai terdaftar."
            : "Belum ada tugas yang diselesaikan."}
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between ${
              task.is_completed
                ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                : type === "urgent"
                ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 hover:border-rose-300"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start space-x-3 flex-1 min-w-0 pr-2">
              <button
                onClick={() => toggleTaskStatus(task.id, task.is_completed)}
                className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors"
                title={task.is_completed ? "Tandai belum selesai" : "Tandai selesai"}
              >
                {task.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <h4
                  className={`text-sm font-semibold truncate ${
                    task.is_completed
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center space-x-1.5 mt-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span
                    className={`font-medium ${
                      type === "urgent" && !task.is_completed
                        ? "text-rose-600 dark:text-rose-400 font-semibold"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Deadline: {formatDateIndo(task.deadline)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Hapus Tugas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveFilter("urgent")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === "urgent"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Urgent (&lt; 3 Hari)
            </span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {urgentTasks.length} Tugas
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prioritas utama & masuk notifikasi bot
          </p>
        </div>

        <div
          onClick={() => setActiveFilter("relax")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === "relax"
              ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Relax (&ge; 3 Hari)
            </span>
            <Coffee className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {relaxTasks.length} Tugas
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Masih ada cukup banyak waktu
          </p>
        </div>

        <div
          onClick={() => setActiveFilter("completed")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === "completed"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Selesai
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {completedTasks.length} Tugas
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pekerjaan yang telah rampung
          </p>
        </div>
      </div>

      {/* Main Grid: Add Task Form + Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add Task */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Tambah Tugas Baru</span>
          </h3>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Judul Tugas
              </label>
              <input
                type="text"
                placeholder="Contoh: Makalah AI Bab 1-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tenggat Waktu (Deadline)
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Keterangan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Format IEEE, submit via Google Classroom"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Tugas"}
            </button>
          </form>
        </div>

        {/* Task List filtered */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              {activeFilter === "urgent" && <Flame className="w-5 h-5 text-rose-500" />}
              {activeFilter === "relax" && <Coffee className="w-5 h-5 text-indigo-500" />}
              {activeFilter === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              <span>
                {activeFilter === "urgent" && "Daftar Tugas Urgent"}
                {activeFilter === "relax" && "Daftar Tugas Relax"}
                {activeFilter === "completed" && "Daftar Tugas Selesai"}
              </span>
            </h3>

            <div className="flex space-x-1">
              <button
                onClick={() => setActiveFilter("urgent")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === "urgent"
                    ? "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Urgent
              </button>
              <button
                onClick={() => setActiveFilter("relax")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === "relax"
                    ? "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Relax
              </button>
              <button
                onClick={() => setActiveFilter("completed")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === "completed"
                    ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[460px] pr-1">
            {loading ? (
              <div className="text-center py-10 text-sm text-slate-400">
                Memuat daftar tugas...
              </div>
            ) : (
              renderTaskList(
                activeFilter === "urgent"
                  ? urgentTasks
                  : activeFilter === "relax"
                  ? relaxTasks
                  : completedTasks,
                activeFilter
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
