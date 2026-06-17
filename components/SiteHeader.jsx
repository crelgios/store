"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Alna's Hub";

function getCartCount() {
  if (typeof window === "undefined") return 0;
  try {
    const cart = JSON.parse(localStorage.getItem("alnas-closet-cart") || "[]");
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  } catch (error) {
    return 0;
  }
}

export default function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("cart-updated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cart-updated", updateCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-5">
        <div className="flex items-center gap-4">
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-amber-100 bg-[#fffaf3] px-3 py-2 text-sm font-semibold text-[#5b3c2f] hover:bg-[#f6efe5]">
              <Menu size={18} />
              <span className="hidden sm:inline">Menu</span>
            </summary>
            <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border border-amber-100 bg-white p-3 shadow-2xl">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9b745f]">Shop</p>
              <Link href="/products?category=Suits" className="block rounded-xl px-3 py-3 text-sm font-semibold text-stone-700 hover:bg-[#fffaf3]">Suits</Link>
              <Link href="/products" className="block rounded-xl px-3 py-3 text-sm font-semibold text-stone-700 hover:bg-[#fffaf3]">All Products</Link>
              <Link href="/checkout" className="block rounded-xl px-3 py-3 text-sm font-semibold text-stone-700 hover:bg-[#fffaf3]">Checkout</Link>
            </div>
          </details>

          <Link href="/" className="leading-none">
            <span className="block font-serif text-3xl tracking-tight text-[#5b3c2f]">Alna's</span>
            <span className="block text-center text-xs font-semibold uppercase tracking-[0.35em] text-[#9b745f]">Hub</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-stone-700 lg:flex">
          <Link href="/products?category=Suits" className="hover:text-[#5b3c2f]">Suits</Link>
          <Link href="/products" className="hover:text-[#5b3c2f]">New Arrivals</Link>
          <Link href="/products" className="hover:text-[#5b3c2f]">Best Sellers</Link>
          <Link href="/checkout" className="hover:text-[#5b3c2f]">Checkout</Link>
        </nav>

        <div className="flex items-center gap-3 text-stone-800">
          <Link href="/products" className="p-2" aria-label="Search products"><Search size={22} /></Link>
          <Link href="/checkout" className="relative rounded-full p-2" aria-label="Cart">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b85b67] px-1 text-xs font-bold text-white">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
