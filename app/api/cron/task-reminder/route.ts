import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const { data: urgentTasks, error: taskError } = await supabaseAdmin
    .from("tasks")
    .select("id, title, deadline, user_id")
    .eq("is_completed", false)
    .lte("deadline", threeDaysLater.toISOString())
    .gte("deadline", now.toISOString())
    .order("deadline", { ascending: true });

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 });
  }

  if (!urgentTasks || urgentTasks.length === 0) {
    return NextResponse.json({ success: true, notified_users: 0 });
  }

  const userIds = Array.from(new Set(urgentTasks.map((t) => t.user_id)));
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, telegram_chat_id")
    .in("id", userIds);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.telegram_chat_id]));

  const groupedTasks: Record<string, typeof urgentTasks> = {};
  for (const task of urgentTasks) {
    const telegramChatId = profileMap.get(task.user_id);
    if (telegramChatId) {
      const chatId = String(telegramChatId);
      if (!groupedTasks[chatId]) groupedTasks[chatId] = [];
      groupedTasks[chatId].push(task);
    }
  }

  let notifiedUsers = 0;
  for (const [chatId, tasks] of Object.entries(groupedTasks)) {
    let taskList = "";
    tasks.forEach((t, i) => {
      const deadlineDate = new Date(t.deadline).toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      taskList += `${i + 1}. *${t.title}*\n   📅 Deadline: ${deadlineDate}\n`;
    });

    const message = `🚨 *Pengingat Tugas Urgent (< 3 Hari)*\n\nKamu memiliki ${tasks.length} tugas mendesak:\n\n${taskList}\nSemangat menyelesaikan! 💪`;
    const ok = await sendTelegramMessage(chatId, message);
    if (ok) notifiedUsers++;
  }

  return NextResponse.json({ success: true, notified_users: notifiedUsers });
}
