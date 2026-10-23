"use client";

import { useState, useEffect, useCallback } from "react";
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
  const supabase = createClient();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [telegramChatId, setTelegramChatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Get profile telegram chat id
      const { data: profile } = await supabase
        .from("profiles")
        .select("telegram_chat_id")
        .eq("id", userId)
        .maybeSingle();

      if (profile) setTelegramChatId(profile.telegram_chat_id);

      // Get classes
      const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("user_id", userId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (data) setClasses(data as ClassSession[]);
    } catch (err) {
      console.error("Error fetching class schedule:", err);
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
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
    }
    return { error };
  };

  const updateTelegramChatId = async (chatId: number) => {
    if (!userId) return;
    const { error } = await supabase
      .from("profiles")
      .update({ telegram_chat_id: chatId })
      .eq("id", userId);

    if (!error) setTelegramChatId(chatId);
    return { error };
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
