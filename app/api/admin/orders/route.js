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
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ orders: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not load orders." }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const supabase = getSupabaseAdmin();

    // Remove order items first, then orders. This resets the admin Orders/New Orders/Total Sales numbers.
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .not("id", "is", null);

    if (itemsError) throw itemsError;

    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .not("id", "is", null);

    if (ordersError) throw ordersError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Orders could not be cleared." }, { status: 500 });
  }
}
