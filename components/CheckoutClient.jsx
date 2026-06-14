"use client";

import Link from "next/link";
import { CheckCircle2, CreditCard, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { paymentMethods } from "@/lib/sampleData";

const upiId = process.env.NEXT_PUBLIC_UPI_ID || "aliwvidestore@upi";
const upiQrUrl = process.env.NEXT_PUBLIC_UPI_QR_URL || "";
const storeWhatsAppNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://store.aliwvide.com";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("aliwvide-cart") || "[]");
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("aliwvide-cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

function normalizeWhatsAppNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function buildWhatsAppText(order, items, customer) {
  const itemLines = items.map((item) => `- ${item.name} x ${item.quantity} | Size: ${item.selectedSize || "N/A"} | Color: ${item.selectedColor || "N/A"}`).join("\n");
  return [
    "New order from Aliwvide Store",
    "",
    `Order ID: ${order.order_number}`,
    `Customer: ${customer.fullName}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}, ${customer.city}`,
    "",
    "Products:",
    itemLines,
    "",
    `Total: ${formatPrice(order.total_amount)}`,
    `Payment: ${order.payment_method}`,
    customer.paymentMethod === "Manual UPI Payment" && customer.upiTransactionId ? `UPI Transaction ID: ${customer.upiTransactionId}` : "",
    "",
    `Store: ${siteUrl}`
  ].filter(Boolean).join("\n");
}

function buildWhatsAppUrl(order, items, customer) {
  const phone = normalizeWhatsAppNumber(storeWhatsAppNumber);
  if (!phone) return "";
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppText(order, items, customer))}`;
}

export default function CheckoutClient() {
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "Cash on Delivery",
    upiTransactionId: ""
  });

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0), [cart]);
  const deliveryCharge = cart.length > 0 ? Number(process.env.NEXT_PUBLIC_DELIVERY_CHARGE || 99) : 0;
  const grandTotal = cartTotal + deliveryCharge;

  function updateQuantity(productId, selectedSize, selectedColor, type) {
    const nextCart = cart
      .map((item) => {
        const isSame = item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor;
        if (!isSame) return item;
        const nextQuantity = type === "increase" ? Number(item.quantity || 1) + 1 : Number(item.quantity || 1) - 1;
        return { ...item, quantity: nextQuantity };
      })
      .filter((item) => item.quantity > 0);

    setCart(nextCart);
    saveCart(nextCart);
  }

  function removeFromCart(productId, selectedSize, selectedColor) {
    const nextCart = cart.filter((item) => !(item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor));
    setCart(nextCart);
    saveCart(nextCart);
  }

  async function handleCheckoutSubmit(event) {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Please add at least one product to cart before checkout.");
      return;
    }

    if (!checkoutForm.fullName || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.city) {
      alert("Please fill name, phone, address, and city to place the order.");
      return;
    }

    if (checkoutForm.paymentMethod === "Manual UPI Payment" && !checkoutForm.upiTransactionId) {
      alert("Please enter the UPI transaction ID after payment.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            full_name: checkoutForm.fullName,
            phone: checkoutForm.phone,
            address: checkoutForm.address,
            city: checkoutForm.city
          },
          payment_method: checkoutForm.paymentMethod,
          upi_transaction_id: checkoutForm.upiTransactionId,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            selected_size: item.selectedSize,
            selected_color: item.selectedColor
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order could not be placed.");

      const customerSnapshot = { ...checkoutForm };
      const cartSnapshot = [...cart];
      const orderSnapshot = { ...data, customer: customerSnapshot, items: cartSnapshot };
      const whatsappUrl = buildWhatsAppUrl(orderSnapshot, cartSnapshot, customerSnapshot);

      setOrderPlaced(orderSnapshot);
      setCart([]);
      saveCart([]);
      setCheckoutForm({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        paymentMethod: "Cash on Delivery",
        upiTransactionId: ""
      });

      if (whatsappUrl) {
        window.location.assign(whatsappUrl);
      } else {
        alert("Order saved, but WhatsApp number is missing. Add NEXT_PUBLIC_STORE_WHATSAPP_NUMBER in Vercel.");
      }
    } catch (error) {
      alert(error.message || "Order could not be placed.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:py-14">
      <div className="mb-8 rounded-[2rem] bg-stone-950 p-8 text-white md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-300">Checkout</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Review your order</h1>
        <p className="mt-4 max-w-2xl text-stone-300">
          Cart and checkout are now on a separate page. Customer details and order details will be saved in Supabase after placing the order.
        </p>
      </div>

      {orderPlaced && (
        <div className="mb-6 rounded-[1.5rem] border border-green-200 bg-green-50 p-5 text-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1" size={22} />
            <div>
              <p className="font-bold">Order placed successfully.</p>
              <p className="mt-1 text-sm">Order ID: <strong>{orderPlaced.order_number}</strong></p>
              <p className="mt-1 text-sm">Total: <strong>{formatPrice(orderPlaced.total_amount)}</strong> • Payment: {orderPlaced.payment_method}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold"><MessageCircle size={16} /> Redirecting to WhatsApp with your order details.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Shopping Cart</h2>

          {cart.length === 0 ? (
            <div className="rounded-3xl bg-stone-50 p-8 text-center">
              <ShoppingBag className="mx-auto text-stone-400" size={42} />
              <p className="mt-4 font-semibold text-stone-800">Your cart is empty</p>
              <p className="mt-1 text-sm text-stone-500">Open a product page and add items to cart.</p>
              <Link href="/products" className="mt-5 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800">Continue Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 rounded-3xl border border-stone-200 p-4">
                  <Link href={`/products/${item.slug || ""}`} className="block">
                    <img src={item.images?.[0] || "/placeholder-product.svg"} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <Link href={`/products/${item.slug || ""}`} className="font-bold hover:underline">{item.name}</Link>
                      <p className="mt-1 text-sm text-stone-500">{item.gender} • {item.category} • Size {item.selectedSize} • {item.selectedColor}</p>
                      <p className="mt-1 text-sm font-semibold">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, "decrease")} className="rounded-full border border-stone-200 p-2 hover:bg-stone-100" aria-label="Decrease quantity">
                        <Minus size={16} />
                      </button>
                      <span className="min-w-6 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, "increase")} className="rounded-full border border-stone-200 p-2 hover:bg-stone-100" aria-label="Increase quantity">
                        <Plus size={16} />
                      </button>
                      <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="rounded-full border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Remove item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100"><CreditCard size={20} /></div>
            <div>
              <h2 className="text-xl font-bold">Checkout Details</h2>
              <p className="text-sm text-stone-500">Cash on Delivery or Manual UPI only</p>
            </div>
          </div>

          <div className="mb-5 rounded-3xl bg-stone-50 p-5">
            <PriceRow label="Subtotal" value={cartTotal} />
            <PriceRow label="Delivery" value={deliveryCharge} />
            <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
              <span>Total</span><span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <Input label="Full Name" value={checkoutForm.fullName} onChange={(value) => setCheckoutForm({ ...checkoutForm, fullName: value })} placeholder="Customer name" />
            <Input label="Phone Number" value={checkoutForm.phone} onChange={(value) => setCheckoutForm({ ...checkoutForm, phone: value })} placeholder="Mobile number" />
            <Input label="Address" value={checkoutForm.address} onChange={(value) => setCheckoutForm({ ...checkoutForm, address: value })} placeholder="House number, street, area" />
            <Input label="City" value={checkoutForm.city} onChange={(value) => setCheckoutForm({ ...checkoutForm, city: value })} placeholder="City" />
            <Select label="Payment Method" value={checkoutForm.paymentMethod} onChange={(value) => setCheckoutForm({ ...checkoutForm, paymentMethod: value, upiTransactionId: "" })} options={paymentMethods} />

            {checkoutForm.paymentMethod === "Manual UPI Payment" && (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
                {upiQrUrl ? (
                  <img src={upiQrUrl} alt="UPI QR Code" className="mx-auto h-44 w-44 rounded-2xl bg-white object-contain p-2 shadow-sm" />
                ) : (
                  <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-stone-500 shadow-sm">UPI QR Code</div>
                )}
                <p className="mt-4 font-semibold text-stone-800">Scan and pay manually</p>
                <p className="mt-1 text-sm text-stone-500">UPI ID: {upiId}</p>
                <div className="mt-4 text-left">
                  <Input label="UPI Transaction ID" value={checkoutForm.upiTransactionId} onChange={(value) => setCheckoutForm({ ...checkoutForm, upiTransactionId: value })} placeholder="Enter UPI reference/transaction ID" />
                </div>
              </div>
            )}

            <button type="submit" disabled={checkoutLoading} className="w-full rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
              {checkoutLoading ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function PriceRow({ label, value }) {
  return <div className="mt-3 flex justify-between text-sm first:mt-0"><span>{label}</span><span className="font-semibold">{formatPrice(value)}</span></div>;
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
