import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { orderStatuses } from "@/lib/sampleData";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await request.json();
    const orderStatus = String(body.order_status || "");
    const paymentStatus = String(body.payment_status || "");

    if (orderStatus && !orderStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (orderStatus) updates.order_status = orderStatus;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select("*, order_items(*)").single();

    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Order could not be updated." }, { status: 500 });
  }
}
