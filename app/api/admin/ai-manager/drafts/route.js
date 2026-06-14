import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("product_drafts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ drafts: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not load AI product drafts." }, { status: 500 });
  }
}
