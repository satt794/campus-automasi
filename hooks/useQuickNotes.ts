"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function useQuickNotes(userId: string | undefined) {
  const supabase = createClient();
  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Initial Fetch
  useEffect(() => {
    if (!userId) return;

    async function loadNote() {
      try {
        const { data, error } = await supabase
          .from("quick_notes")
          .select("content, updated_at")
          .eq("user_id", userId)
          .maybeSingle();

        if (!error && data) {
          setContent(data.content || "");
          if (data.updated_at) setLastSavedAt(new Date(data.updated_at));
        }
      } catch (err) {
        console.error("Error loading note:", err);
      } finally {
        isInitialLoad.current = false;
      }
    }

    loadNote();
  }, [userId, supabase]);

  // Database Upsert Callback
  const saveToDatabase = useCallback(
    async (text: string) => {
      if (!userId) return;
      setStatus("saving");

      try {
        const { error } = await supabase.from("quick_notes").upsert(
          {
            user_id: userId,
            content: text,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (error) {
          console.error("Auto-save failed:", error);
          setStatus("error");
        } else {
          setStatus("saved");
          setLastSavedAt(new Date());
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        setStatus("error");
      }
    },
    [userId, supabase]
  );

  // Debounce: Triggers 1.5s after user stops typing
  const handleContentChange = (newText: string) => {
    setContent(newText);
    setStatus("unsaved");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveToDatabase(newText);
    }, 1500); // exactly 1.5s
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    content,
    status,
    lastSavedAt,
    handleContentChange,
    forceSave: () => saveToDatabase(content),
  };
}
