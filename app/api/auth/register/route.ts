import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const fullName = (body.fullName || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    // Buat user baru lewat Admin API dengan email_confirm: true
    // agar akun langsung aktif dan terisolasi tanpa terkendala limit email konfirmasi
    const { data: createdData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || email.split("@")[0],
          name: fullName || email.split("@")[0],
        },
      });

    if (createError) {
      const msg = createError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return NextResponse.json(
          {
            error:
              "Email ini sudah terdaftar. Silakan masuk (Login) menggunakan akun Anda.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const newUser = createdData.user;

    if (newUser) {
      // Pastikan baris profile terisolasi dibuat dengan budget awal 0
      await supabaseAdmin.from("profiles").upsert(
        [
          {
            id: newUser.id,
            weekly_budget: 0,
            telegram_chat_id: null,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "id" }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser?.id,
        email: newUser?.email,
        fullName: fullName || email.split("@")[0],
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mendaftarkan akun." },
      { status: 500 }
    );
  }
}

