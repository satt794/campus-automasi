import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format standard time string (HH:MM or HH:MM:SS) into Indonesian time format (HH.MM WIB)
 * Example: "08:00:00" -> "08.00 WIB"
 */
export function formatTimeIndo(timeStr: string, includeWib = true): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  const h = parts[0]?.padStart(2, "0") || "00";
  const m = parts[1]?.padStart(2, "0") || "00";
  return includeWib ? `${h}.${m} WIB` : `${h}.${m}`;
}

/**
 * Format start and end time range into Indonesian format
 * Example: ("08:00", "09:40") -> "08.00 - 09.40 WIB"
 */
export function formatTimeRangeIndo(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";
  const start = formatTimeIndo(startTime, false);
  const end = formatTimeIndo(endTime, false);
  return `${start} - ${end} WIB`;
}

/**
 * Calculate duration between start and end time in minutes and SKS equivalent
 */
export function calculateDuration(startTime: string, endTime: string): {
  minutes: number;
  text: string;
  sks: number;
} {
  if (!startTime || !endTime) return { minutes: 0, text: "-", sks: 0 };
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  let totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // handle overnight if any

  // 1 SKS lecture is approximately 50 minutes in Indonesian higher education
  const sks = Math.max(1, Math.round(totalMinutes / 50));
  const text = `${totalMinutes} mnt (${sks} SKS)`;

  return { minutes: totalMinutes, text, sks };
}

