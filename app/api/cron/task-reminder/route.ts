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

  const { data: urgentTasks, error } = await supabaseAdmin
    .from("tasks")
    .select(`
      id,
      title,
      deadline,
      user_id,
      profiles!inner(telegram_chat_id)
    `)
    .eq("is_completed", false)
    .lte("deadline", threeDaysLater.toISOString())
    .gte("deadline", now.toISOString())
    .order("deadline", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const groupedTasks: Record<string, typeof urgentTasks> = {};
  for (const task of urgentTasks || []) {
    const profile = task.profiles as unknown as { telegram_chat_id: number | null };
    if (profile?.telegram_chat_id) {
      const chatId = String(profile.telegram_chat_id);
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
