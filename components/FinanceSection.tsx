"use client";

import React, { useState } from "react";
import { useFinanceTracker, Category } from "@/hooks/useFinanceTracker";
import { formatRupiah } from "@/lib/utils";
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  Trash2,
  Bus,
  Utensils,
  Printer,
  MoreHorizontal,
  Sliders,
} from "lucide-react";

interface FinanceSectionProps {
  userId: string | undefined;
}

const CATEGORIES: Category[] = [
  "Transportasi",
  "Uang Makan",
  "Uang Print",
  "Lain-lain",
];

const categoryIcons: Record<Category, React.ReactNode> = {
  Transportasi: <Bus className="w-4 h-4 text-blue-500" />,
  "Uang Makan": <Utensils className="w-4 h-4 text-emerald-500" />,
  "Uang Print": <Printer className="w-4 h-4 text-amber-500" />,
  "Lain-lain": <MoreHorizontal className="w-4 h-4 text-purple-500" />,
};

export function FinanceSection({ userId }: FinanceSectionProps) {
  const {
    transactions,
    weeklyBudget,
    weeklySpent,
    remainingBalance,
    categoryBreakdown,
    loading,
    addTransaction,
    deleteTransaction,
    updateBudget,
  } = useFinanceTracker(userId);

  // Form states
  const [category, setCategory] = useState<Category>("Uang Makan");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Budget Edit Modal / State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState<string>("");

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    await addTransaction({
      category,
      amount: num,
      note: note.trim() || undefined,
    });
    setAmount("");
    setNote("");
    setIsSubmitting(false);
  };

  const handleSaveBudget = async () => {
    const num = parseFloat(newBudgetValue);
    if (!isNaN(num) && num >= 0) {
      await updateBudget(num);
    }
    setIsEditingBudget(false);
  };

  // Budget progress percentage
  const budgetPercentage = weeklyBudget > 0
    ? Math.min(Math.round((weeklySpent / weeklyBudget) * 100), 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Weekly Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-sm font-medium">Budget Mingguan</span>
            <button
              onClick={() => {
                setNewBudgetValue(String(weeklyBudget));
                setIsEditingBudget(true);
              }}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Ubah Anggaran"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatRupiah(weeklyBudget)}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Pagu maksimal per minggu
          </p>
        </div>

        {/* Weekly Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-sm font-medium">Terpakai Minggu Ini</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatRupiah(weeklySpent)}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercentage > 85 ? "bg-rose-500" : "bg-indigo-600"
              }`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-sm font-medium">Sisa Saldo</span>
            <PiggyBank className="w-4 h-4 text-emerald-500" />
          </div>
          <div
            className={`text-2xl font-bold ${
              remainingBalance < 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {formatRupiah(remainingBalance)}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {remainingBalance < 0 ? "Melebihi budget!" : "Aman terkendali"}
          </p>
        </div>
      </div>

      {/* Category Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center space-x-3"
          >
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              {categoryIcons[cat]}
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                {cat}
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {formatRupiah(categoryBreakdown[cat] || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Action & Records Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add Transaction */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Tambah Transaksi</span>
          </h3>

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                placeholder="Contoh: 15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="100"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Nasi padang + es teh"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
          </form>
        </div>

        {/* Transaction History List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Riwayat Transaksi</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: {transactions.length}
            </span>
          </h3>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] pr-1">
            {loading ? (
              <div className="text-center py-10 text-sm text-slate-400">
                Memuat riwayat transaksi...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-xs">
                      {categoryIcons[tx.category]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {tx.note || tx.category}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {tx.category} • {tx.transaction_date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                      -{formatRupiah(tx.amount)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
              Atur Budget Mingguan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tentukan batas alokasi uang jajan atau kebutuhan kuliah per minggu.
            </p>

            <input
              type="number"
              value={newBudgetValue}
              onChange={(e) => setNewBudgetValue(e.target.value)}
              placeholder="Contoh: 300000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditingBudget(false)}
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBudget}
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
