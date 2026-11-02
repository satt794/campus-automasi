import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, telegramChatId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID tidak ditemukan. Pastikan Anda sudah login." },
        { status: 400 }
      );
    }

    const parsedId =
      telegramChatId === null || telegramChatId === ""
        ? null
        : Number(telegramChatId);

    if (parsedId !== null && isNaN(parsedId)) {
      return NextResponse.json(
        { error: "Chat ID Telegram harus berupa angka yang valid." },
        { status: 400 }
      );
    }

    // Jika Chat ID ini sebelumnya terhubung di akun demo atau akun lama milik user,
    // lepaskan dulu agar tidak terkena error UNIQUE constraint di tabel profiles
    if (parsedId !== null) {
      await supabaseAdmin
        .from("profiles")
        .update({ telegram_chat_id: null })
        .eq("telegram_chat_id", parsedId)
        .neq("id", userId);
    }

    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        telegram_chat_id: parsedId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      telegramChatId: parsedId,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan pengaturan Telegram." },
      { status: 500 }
    );
  }
}

