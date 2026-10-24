import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEMO_EMAIL = "demo@campusautomasi.local";
const DEMO_PASSWORD = "CampusAutomasiDemoPassword123!";

export async function POST() {
  try {
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    let demoUser = usersData.users.find((u) => u.email === DEMO_EMAIL);

    if (!demoUser) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name: "Mahasiswa Demo" },
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      demoUser = newUser.user;
    }

    // Ensure profile exists
    if (demoUser) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", demoUser.id)
        .maybeSingle();

      if (!profile) {
        await supabaseAdmin.from("profiles").insert([{ id: demoUser.id, weekly_budget: 350000 }]);
      }
    }

    return NextResponse.json({
      success: true,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      userId: demoUser?.id,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Failed to ensure demo user" },
      { status: 500 }
    );
  }
}
