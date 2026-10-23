import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { chatId, message } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "chatId wajib diisi" }, { status: 400 });
    }

    const testMessage = message || "🤖 *Test Koneksi Campus Automasi*\nBot Telegram Anda telah terhubung dengan sukses!";
    const ok = await sendTelegramMessage(chatId, testMessage);

    if (ok) {
      return NextResponse.json({ success: true, message: "Pesan berhasil dikirim ke Telegram!" });
    } else {
      return NextResponse.json({ error: "Gagal mengirim pesan. Pastikan TELEGRAM_BOT_TOKEN valid dan pengguna sudah menekan /start di bot." }, { status: 500 });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
