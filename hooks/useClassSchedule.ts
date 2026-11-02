"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ClassSession {
  id: string;
  course_name: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  room: string | null;
  lecturer: string | null;
  is_active: boolean;
  created_at: string;
}

export const DAYS_OF_WEEK = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export function useClassSchedule(userId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [telegramChatId, setTelegramChatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!userId) {
      setClasses([]);
      setTelegramChatId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Get profile telegram chat id for this user
      const { data: profile } = await supabase
        .from("profiles")
        .select("telegram_chat_id")
        .eq("id", userId)
        .maybeSingle();

      setTelegramChatId(profile?.telegram_chat_id ?? null);

      // Get classes strictly for this user
      const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("user_id", userId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      setClasses((data as ClassSession[]) || []);
    } catch (err) {
      console.error("Error fetching class schedule:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const addClass = async (payload: {
    course_name: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room?: string;
    lecturer?: string;
  }) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("classes")
      .insert([{ ...payload, user_id: userId, is_active: true }])
      .select()
      .single();

    if (!error && data) {
      setClasses((prev) => [...prev, data as ClassSession]);
    }
    return { data, error };
  };

  const deleteClass = async (id: string) => {
    if (!userId) return { error: new Error("Belum login") };
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
    }
    return { error };
  };

  const updateTelegramChatId = async (chatId: number) => {
    if (!userId) return { error: new Error("Belum login") };
    try {
      const res = await fetch("/api/profile/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, telegramChatId: chatId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.error || "Gagal menyimpan Chat ID") };
      }
      setTelegramChatId(chatId);
      return { error: null };
    } catch (err: unknown) {
      const error = err as Error;
      return { error };
    }
  };

  return {
    classes,
    telegramChatId,
    loading,
    addClass,
    deleteClass,
    updateTelegramChatId,
    refresh: fetchClasses,
  };
}
