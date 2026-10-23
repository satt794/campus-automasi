"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  is_completed: boolean;
  created_at: string;
}

export function useTaskManager(userId: string | undefined) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("deadline", { ascending: true });

      if (data) setTasks(data as Task[]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-split into Urgent (< 3 days) and Relax (>= 3 days)
  const { urgentTasks, relaxTasks, completedTasks } = useMemo(() => {
    const now = new Date().getTime();
    const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;

    const urgent: Task[] = [];
    const relax: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach((task) => {
      if (task.is_completed) {
        completed.push(task);
        return;
      }
      const timeRemaining = new Date(task.deadline).getTime() - now;

      if (timeRemaining <= threeDaysInMillis) {
        urgent.push(task);
      } else {
        relax.push(task);
      }
    });

    return { urgentTasks: urgent, relaxTasks: relax, completedTasks: completed };
  }, [tasks]);

  const addTask = async (payload: { title: string; description?: string; deadline: string }) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...payload, user_id: userId }])
      .select()
      .single();

    if (!error && data) setTasks((prev) => [...prev, data as Task]);
    return { data, error };
  };

  const toggleTaskStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !currentStatus })
      .eq("id", id);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_completed: !currentStatus } : t))
      );
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tasks,
    urgentTasks,
    relaxTasks,
    completedTasks,
    loading,
    addTask,
    toggleTaskStatus,
    deleteTask,
    refresh: fetchTasks,
  };
}
