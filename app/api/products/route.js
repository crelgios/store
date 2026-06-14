import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sampleProducts } from "@/lib/sampleData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    return NextResponse.json({
      products: sampleProducts,
      preview: true,
      message: "Using sample products until Supabase environment variables and tables are configured."
    });
  }
}
