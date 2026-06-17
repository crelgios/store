"use client";

import Link from "next/link";
import { ArrowLeft, Filter, Heart, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

const categoryChips = ["All", "Suits"];
const hiddenMenuCategories = ["Suits", "All Products"];

export default function ProductListing({ products }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "Suits";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categoryChips.includes(initialCategory) ? initialCategory : "Suits");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let items = products.filter((product) => {
      const text = `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    if (sort === "low-high") items = [...items].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === "high-low") items = [...items].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return items;
  }, [products, search, category, sort]);

  return (
    <section className="min-h-screen bg-[#fffaf3] pb-24 md:pb-12">
      <div className="sticky top-[73px] z-40 border-b border-stone-200 bg-white/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" aria-label="Back"><ArrowLeft size={30} /></Link>
          <div className="flex-1 px-4">
            <h1 className="text-lg font-bold">Suits</h1>
            <p className="text-sm text-stone-500">{filtered.length} Products</p>
          </div>
          <div className="flex items-center gap-4">
            <Search size={28} />
            <Heart size={28} />
            <ShoppingBag size={28} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-5 md:py-12">
        <div className="hidden rounded-[2rem] bg-[#f6efe5] p-8 md:block">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9b745f]">Women’s suits</p>
          <h1 className="mt-3 font-serif text-5xl text-[#2c251e]">Shop Suits</h1>
          <p className="mt-3 max-w-2xl text-stone-600">Browse your current suits collection with a clean mobile-friendly shopping layout.</p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 md:mt-8">
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-[#5b3c2f] shadow-sm">
              <SlidersHorizontal size={18} /> Collection Menu
            </summary>
            <div className="absolute left-0 top-14 z-30 w-64 rounded-2xl border border-amber-100 bg-white p-3 shadow-2xl">
              {hiddenMenuCategories.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setCategory(chip === "All Products" ? "All" : chip)}
                  className={`block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold ${category === chip || (chip === "All Products" && category === "All") ? "bg-[#5b3c2f] text-white" : "text-stone-700 hover:bg-[#fffaf3]"}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </details>
          <p className="hidden text-sm text-stone-500 md:block">Categories are inside the left menu to keep the page clean.</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search suits, collections, designs..."
              className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-[#5b3c2f]"
            />
          </label>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="hidden rounded-2xl border border-stone-200 bg-white px-4 py-3 font-semibold outline-none md:block">
            <option value="newest">Sort: Newest</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
          <button className="hidden items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 font-semibold md:inline-flex"><SlidersHorizontal size={18} /> Filters</button>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-600">No products found. Try another category or search.</div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-3 border-t border-stone-700 bg-stone-950 text-white md:hidden">
        <button onClick={() => setSort(sort === "low-high" ? "high-low" : "low-high")} className="flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase"><SlidersHorizontal size={18} /> Sort By</button>
        <button onClick={() => setCategory(category === "Suits" ? "All" : "Suits")} className="border-x border-stone-700 py-4 text-sm font-bold uppercase">Menu</button>
        <button className="flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase"><Filter size={18} /> Filters</button>
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const discount = product.compare_at_price ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100) : 0;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 shadow-sm ring-1 ring-stone-200">
        <img src={product.images?.[0] || "/placeholder-product.svg"} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <button type="button" className="absolute bottom-3 right-3 rounded-full bg-white p-2 shadow" aria-label="Wishlist"><Heart size={20} /></button>
        {discount > 0 && <span className="absolute left-3 top-3 rounded bg-[#b85b67] px-2 py-1 text-xs font-bold text-white">-{discount}%</span>}
      </div>
      <div className="pt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-stone-800 md:text-base">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-stone-950">{formatPrice(product.price)}</span>
          {product.compare_at_price ? <span className="text-sm text-stone-400 line-through">{formatPrice(product.compare_at_price)}</span> : null}
          {discount > 0 ? <span className="text-sm font-bold text-green-700">{discount}% off</span> : null}
        </div>
      </div>
    </Link>
  );
}
