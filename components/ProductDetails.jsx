"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, Heart, Minus, PackageCheck, Plus, Ruler, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";

function getCurrentCart() {
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

export default function ProductDetails({ product }) {
  const images = product.images?.length ? product.images : ["/placeholder-product.svg"];
  const sizes = product.sizes?.length ? product.sizes : ["Free Size"];
  const colors = product.colors?.length ? product.colors : ["Default"];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const discount = product.compare_at_price ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100) : 0;
  const saving = product.compare_at_price ? Math.max(0, Number(product.compare_at_price) - Number(product.price || 0)) : 0;

  const detailRows = useMemo(() => [
    ["Top Fabric", "Premium fabric with embroidery"],
    ["Bottom", "Matching trouser / palazzo"],
    ["Dupatta", "Coordinated dupatta included"],
    ["Style", product.category || "Suit Set"],
    ["Available sizes", sizes.join(", ")],
    ["Available colors", colors.join(", ")]
  ], [product, sizes, colors]);

  function buildNextCart() {
    const cart = getCurrentCart();
    const existing = cart.find((item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor);

    if (existing) {
      return cart.map((item) =>
        item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
          ? { ...item, quantity: Number(item.quantity || 1) + quantity }
          : item
      );
    }

    return [
      ...cart,
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        gender: product.gender,
        category: product.category,
        price: Number(product.price || 0),
        images,
        selectedSize,
        selectedColor,
        quantity
      }
    ];
  }

  function addToCart() {
    saveCart(buildNextCart());
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  function buyNow() {
    saveCart(buildNextCart());
    window.location.href = "/checkout";
  }

  return (
    <section className="bg-[#fffaf3] px-4 py-6 md:px-5 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 hidden text-sm text-stone-500 md:block">
          <Link href="/" className="hover:text-stone-950">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-stone-950">Suits</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-800">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="grid gap-4 md:grid-cols-[88px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
              {images.slice(0, 5).map((image) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(image)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white md:h-24 md:w-full ${activeImage === image ? "border-[#b85b67] ring-2 ring-[#b85b67]/20" : "border-stone-200"}`}
                  aria-label="View product image"
                >
                  <img src={image} alt={`${product.name} thumbnail`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="order-1 relative overflow-hidden rounded-[1.5rem] border border-amber-100 bg-white shadow-sm md:order-2">
              {discount > 0 && <span className="absolute left-4 top-4 z-10 rounded bg-[#b85b67] px-3 py-1 text-xs font-bold uppercase text-white">-{discount}% off</span>}
              <button className="absolute right-4 top-4 z-10 rounded-full bg-white p-3 shadow" aria-label="Wishlist"><Heart size={20} /></button>
              <img src={activeImage} alt={product.name} className="h-[430px] w-full object-cover md:h-[660px]" />
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-amber-100 bg-white p-5 shadow-sm md:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded bg-[#f7dfe3] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#b85b67]">Best Seller</span>
              <span className="rounded bg-[#f6efe5] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8a6a47]">{product.category}</span>
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-tight text-[#2c251e] md:text-5xl">{product.name}</h1>
            <p className="mt-4 leading-7 text-stone-600">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <p className="text-3xl font-bold text-[#2c251e]">{formatPrice(product.price)}</p>
              {product.compare_at_price ? <p className="pb-1 text-lg text-stone-400 line-through">{formatPrice(product.compare_at_price)}</p> : null}
              {discount > 0 ? <p className="pb-1 text-sm font-bold text-[#b85b67]">{discount}% OFF</p> : null}
            </div>
            {saving > 0 ? <p className="mt-1 text-sm text-stone-500">You save {formatPrice(saving)}. Inclusive of all taxes.</p> : <p className="mt-1 text-sm text-stone-500">Inclusive of all taxes.</p>}

            <div className="mt-7 border-t border-stone-200 pt-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide">Color: <span className="font-semibold normal-case text-stone-600">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-3">
                {colors.map((color, index) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full border-2 ${selectedColor === color ? "border-[#b85b67]" : "border-stone-200"}`}
                    style={{ backgroundColor: swatchColor(color, index) }}
                    aria-label={`Select ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-wide">Size</p>
                <span className="inline-flex items-center gap-1 text-sm text-stone-500"><Ruler size={15} /> Size Guide</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 rounded-xl border px-4 py-3 text-sm font-semibold ${selectedSize === size ? "border-[#b85b67] bg-[#fff0f2] text-[#b85b67]" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide">Quantity</p>
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-stone-200 bg-white">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3 hover:bg-stone-100" aria-label="Decrease quantity"><Minus size={18} /></button>
                <span className="min-w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="p-3 hover:bg-stone-100" aria-label="Increase quantity"><Plus size={18} /></button>
              </div>
            </div>

            <div className="mt-7 grid gap-3 rounded-2xl border border-stone-200 bg-[#fffaf3] p-4 text-sm md:grid-cols-2">
              <MiniInfo icon={<Truck size={18} />} title="Estimated Delivery" text="3–7 working days" />
              <MiniInfo icon={<PackageCheck size={18} />} title="Cash on Delivery" text="Available" />
              <MiniInfo icon={<ShieldCheck size={18} />} title="Secure Payment" text="Manual UPI & COD" />
              <MiniInfo icon={<CheckCircle2 size={18} />} title="Quality Checked" text="Before dispatch" />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button onClick={addToCart} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#b85b67] bg-white px-6 py-4 font-bold uppercase tracking-wide text-[#b85b67] hover:bg-[#fff0f2]"><ShoppingBag size={18} /> Add to Cart</button>
              <button type="button" onClick={buyNow} className="inline-flex items-center justify-center rounded-xl bg-[#b85b67] px-6 py-4 font-bold uppercase tracking-wide text-white hover:bg-[#994656]">Buy Now</button>
            </div>

            {added && <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">Added to cart successfully.</div>}
          </aside>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-[#2c251e]">Product Details</h2>
            <div className="mt-5 space-y-3 text-sm">
              {detailRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[130px_1fr] gap-4 border-b border-stone-100 pb-3 last:border-0">
                  <span className="font-semibold text-stone-500">{label}</span>
                  <span className="text-stone-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-[#2c251e]">Care, Size & Shipping</h2>
            <div className="mt-5 divide-y divide-stone-100">
              <DetailLine title="Fabric & Care" text="Use gentle wash or dry clean for embroidered suits. Dry in shade and avoid harsh bleach." />
              <DetailLine title="Size & Fit" text="Choose your regular size. For a relaxed fit, select one size above." />
              <DetailLine title="Shipping & Returns" text="Orders are confirmed through WhatsApp. Return support depends on product condition and policy." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniInfo({ icon, title, text }) {
  return <div className="flex gap-3 text-stone-700"><span className="text-[#8a6a47]">{icon}</span><span><b className="block">{title}</b><span className="text-stone-500">{text}</span></span></div>;
}

function DetailLine({ title, text }) {
  return (
    <details className="group py-4" open={title === "Fabric & Care"}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-bold"><span>{title}</span><ChevronDown className="transition group-open:rotate-180" size={18} /></summary>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
    </details>
  );
}

function swatchColor(color, index) {
  const lower = String(color).toLowerCase();
  if (lower.includes("ivory") || lower.includes("cream")) return "#f5eee2";
  if (lower.includes("pink") || lower.includes("blush")) return "#efc4c9";
  if (lower.includes("sage") || lower.includes("green") || lower.includes("mint")) return "#a8b79c";
  if (lower.includes("maroon") || lower.includes("wine")) return "#7d2635";
  if (lower.includes("black")) return "#181818";
  if (lower.includes("navy")) return "#1c2c45";
  if (lower.includes("lavender")) return "#c7b0d8";
  const colors = ["#ead8c6", "#e7b8b8", "#b5c2aa", "#c6b3d6", "#8a6a47"];
  return colors[index % colors.length];
}
