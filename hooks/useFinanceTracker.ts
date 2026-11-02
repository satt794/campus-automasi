"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type Category = "Transportasi" | "Uang Makan" | "Uang Print" | "Lain-lain";

export interface Transaction {
  id: string;
  category: Category;
  amount: number;
  note: string | null;
  transaction_date: string;
  created_at: string;
}

export function useFinanceTracker(userId: string | undefined) {
  const supabase = useMemo(() => createClient(), []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [weeklyBudget, setWeeklyBudget] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Helper: Start of current week (Monday)
  const startOfWeek = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setWeeklyBudget(0);
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // Fetch Profile for Weekly Budget (strictly for this userId)
      const { data: profile } = await supabase
        .from("profiles")
        .select("weekly_budget")
        .eq("id", userId)
        .maybeSingle();

      setWeeklyBudget(profile ? Number(profile.weekly_budget) || 0 : 0);

      // Fetch Transactions (strictly for this userId)
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      setTransactions((txs as Transaction[]) || []);
    } catch (err) {
      console.error("Error fetching finance data:", err);
      setTransactions([]);
      setWeeklyBudget(0);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived calculations
  const weeklyTransactions = useMemo(() => {
    return transactions.filter(
      (t) => new Date(t.transaction_date) >= startOfWeek
    );
  }, [transactions, startOfWeek]);

  const weeklySpent = useMemo(() => {
    return weeklyTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [weeklyTransactions]);

  const remainingBalance = useMemo(() => {
    return weeklyBudget - weeklySpent;
  }, [weeklyBudget, weeklySpent]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<Category, number> = {
      Transportasi: 0,
      "Uang Makan": 0,
      "Uang Print": 0,
      "Lain-lain": 0,
    };
    weeklyTransactions.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return map;
  }, [weeklyTransactions]);

  const addTransaction = async (tx: {
    category: Category;
    amount: number;
    note?: string;
    transaction_date?: string;
  }) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...tx, user_id: userId }])
      .select()
      .single();

    if (!error && data) {
      setTransactions((prev) => [data as Transaction, ...prev]);
    }
    return { data, error };
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return { error: new Error("Belum login") };
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (!error) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
    return { error };
  };

  const updateBudget = async (newBudget: number) => {
    if (!userId) return { error: new Error("Belum login") };
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          weekly_budget: newBudget,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (!error) setWeeklyBudget(newBudget);
    return { error };
  };

  return {
    transactions,
    weeklyTransactions,
    weeklyBudget,
    weeklySpent,
    remainingBalance,
    categoryBreakdown,
    loading,
    addTransaction,
    deleteTransaction,
    updateBudget,
    refresh: fetchData,
  };
}
