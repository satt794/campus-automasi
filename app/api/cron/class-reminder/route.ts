import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Authorize Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Calculate 1 hour (60 minutes) ahead in target timezone (Asia/Jakarta / UTC+7 default)
  const now = new Date();
  const targetTime = new Date(now.getTime() + 60 * 60 * 1000);
  
  const dayOfWeek = targetTime.getDay(); // 0 = Sunday
  const hours = String(targetTime.getHours()).padStart(2, "0");
  const minutes = String(targetTime.getMinutes()).padStart(2, "0");

  const { data: upcomingClasses, error } = await supabaseAdmin
    .from("classes")
    .select(`
      id,
      course_name,
      start_time,
      room,
      lecturer,
      user_id,
      profiles!inner(telegram_chat_id)
    `)
    .eq("day_of_week", dayOfWeek)
    .gte("start_time", `${hours}:${minutes}:00`)
    .lte("start_time", `${hours}:${minutes}:59`)
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sentCount = 0;
  for (const item of upcomingClasses || []) {
    const profile = item.profiles as unknown as { telegram_chat_id: number | null };
    if (profile?.telegram_chat_id) {
      const msg = `🔔 *Pengingat Kelas (1 Jam Lagi)*\n\n` +
                  `📚 *Mata Kuliah:* ${item.course_name}\n` +
                  `⏰ *Waktu:* ${item.start_time.slice(0, 5)}\n` +
                  `📍 *Ruangan:* ${item.room || "-"}\n` +
                  `👨‍🏫 *Dosen:* ${item.lecturer || "-"}`;
      
      const ok = await sendTelegramMessage(profile.telegram_chat_id, msg);
      if (ok) sentCount++;
    }
  }

  return NextResponse.json({
    success: true,
    target_time: `${hours}:${minutes}:00`,
    notifications_sent: sentCount,
  });
}
