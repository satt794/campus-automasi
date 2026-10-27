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

  const { data: upcomingClasses, error: classError } = await supabaseAdmin
    .from("classes")
    .select("id, course_name, start_time, end_time, room, lecturer, user_id")
    .eq("day_of_week", dayOfWeek)
    .gte("start_time", `${hours}:${minutes}:00`)
    .lte("start_time", `${hours}:${minutes}:59`)
    .eq("is_active", true);

  if (classError) {
    return NextResponse.json({ error: classError.message }, { status: 500 });
  }

  if (!upcomingClasses || upcomingClasses.length === 0) {
    return NextResponse.json({
      success: true,
      target_time: `${hours}:${minutes}:00`,
      notifications_sent: 0,
    });
  }

  const userIds = Array.from(new Set(upcomingClasses.map((c) => c.user_id)));
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, telegram_chat_id")
    .in("id", userIds);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.telegram_chat_id]));

  let sentCount = 0;
  for (const item of upcomingClasses) {
    const telegramChatId = profileMap.get(item.user_id);
    if (telegramChatId) {
      const startFmt = item.start_time.slice(0, 5).replace(":", ".");
      const endFmt = item.end_time ? ` - ${item.end_time.slice(0, 5).replace(":", ".")}` : "";
      const msg = `🔔 *Pengingat Kuliah (1 Jam Lagi)*\n\n` +
                  `📚 *Mata Kuliah:* ${item.course_name}\n` +
                  `⏰ *Waktu:* ${startFmt}${endFmt} WIB\n` +
                  `📍 *Ruangan:* ${item.room || "-"}\n` +
                  `👨‍🏫 *Dosen:* ${item.lecturer || "-"}`;

      const ok = await sendTelegramMessage(telegramChatId, msg);
      if (ok) sentCount++;
    }
  }

  return NextResponse.json({
    success: true,
    target_time: `${hours}:${minutes}:00`,
    notifications_sent: sentCount,
  });
}
