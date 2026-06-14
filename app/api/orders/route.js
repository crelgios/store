import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function createOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ALW-${datePart}-${randomPart}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const customer = body.customer || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = body.payment_method;
    const upiTransactionId = String(body.upi_transaction_id || "").trim();
    const allowedPayments = ["Cash on Delivery", "Manual UPI Payment"];

    if (!customer.full_name || !customer.phone || !customer.address || !customer.city) {
      return badRequest("Please fill name, phone, address, and city.");
    }

    if (!allowedPayments.includes(paymentMethod)) {
      return badRequest("Invalid payment method.");
    }

    if (paymentMethod === "Manual UPI Payment" && !upiTransactionId) {
      return badRequest("Please enter the UPI transaction ID after payment.");
    }

    if (items.length === 0) {
      return badRequest("Cart is empty.");
    }

    const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];
    if (productIds.length === 0) {
      return badRequest("No valid products found in cart.");
    }

    const supabase = getSupabaseAdmin();
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, name, price, images, stock, status")
      .in("id", productIds)
      .eq("status", "published");

    if (productError) throw productError;

    const productMap = new Map((products || []).map((product) => [product.id, product]));
    const preparedItems = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) return badRequest("One or more products are no longer available.");

      const quantity = Math.max(1, Math.min(Number(item.quantity || 1), 20));
      preparedItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: Number(product.price || 0),
        quantity,
        selected_size: String(item.selected_size || "").trim(),
        selected_color: String(item.selected_color || "").trim(),
        product_snapshot: product
      });
    }

    const subtotal = preparedItems.reduce((total, item) => total + item.unit_price * item.quantity, 0);
    const deliveryCharge = Number(process.env.DELIVERY_CHARGE || 99);
    const totalAmount = subtotal + deliveryCharge;
    const orderNumber = createOrderNumber();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customer.full_name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_city: customer.city,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "Manual UPI Payment" ? "Payment Submitted" : "Pending",
        upi_transaction_id: paymentMethod === "Manual UPI Payment" ? upiTransactionId : null,
        order_status: "New Order",
        subtotal,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount
      })
      .select("*")
      .single();

    if (orderError) throw orderError;

    const orderItems = preparedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      selected_size: item.selected_size,
      selected_color: item.selected_color,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.unit_price * item.quantity,
      product_snapshot: item.product_snapshot
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return NextResponse.json({
      ok: true,
      order_number: order.order_number,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      order_status: order.order_status
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Order could not be placed." }, { status: 500 });
  }
}
