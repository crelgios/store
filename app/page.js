import Link from "next/link";
import { ArrowRight, CreditCard, Headphones, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { formatPrice } from "@/lib/format";
import { getPublishedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const benefits = [
  [Truck, "Free Shipping", "On selected orders"],
  [PackageCheck, "Easy Returns", "7-day return support"],
  [CreditCard, "Manual UPI", "Simple payment flow"],
  [ShieldCheck, "Secure Checkout", "Order saved safely"],
  [Headphones, "WhatsApp Support", "Quick confirmation"]
];

export default async function HomePage() {
  const products = await getPublishedProducts();
  const suitProducts = products.filter((product) => product.category === "Suits");
  const bestProducts = (suitProducts.length > 0 ? suitProducts : products).slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fffaf3] text-stone-950">
      <SiteHeader />

      <section className="overflow-hidden border-b border-amber-100 bg-[#f6efe5]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#9b745f]">Timeless tradition. Modern you.</p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.98] text-[#2c251e] md:text-7xl">Suits, Refined Elegance</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">Shop elegant suits with premium-looking designs, soft fabrics, and a simple ordering experience.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products?category=Suits" className="inline-flex items-center gap-2 rounded bg-[#5b3c2f] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#432b22]">Shop Suits <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <span>Premium Fabrics</span>
              <span>COD Available</span>
              <span>WhatsApp Confirm</span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-amber-100">
            <img src="/suits/hero-suits.jpg" alt="Elegant suits hero" className="h-[360px] w-full object-cover object-center md:h-[520px]" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#f6efe5]/50" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-3 md:grid-cols-5">
          {benefits.map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-amber-100 bg-white p-5 text-center shadow-sm">
              <Icon className="mx-auto text-[#8a6a47]" size={24} />
              <h3 className="mt-3 text-sm font-bold uppercase tracking-wide">{title}</h3>
              <p className="mt-1 text-xs text-stone-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-[2rem] border border-amber-100 bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9b745f]">Current collection</p>
          <h2 className="mt-3 font-serif text-4xl text-[#2c251e]">Suits Only</h2>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">Categories are kept inside the left menu so the homepage stays clean while your collection is small.</p>
          <Link href="/products?category=Suits" className="mt-6 inline-flex rounded bg-[#5b3c2f] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white">View Collection</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9b745f]">Our favorites</p>
            <h2 className="mt-2 font-serif text-4xl text-[#2c251e]">Suit Collection</h2>
          </div>
          <Link href="/products" className="hidden rounded border border-[#5b3c2f] px-5 py-2 text-sm font-semibold text-[#5b3c2f] hover:bg-[#5b3c2f] hover:text-white md:inline-flex">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {bestProducts.map((product) => <HomeProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="overflow-hidden rounded-[2rem] bg-[#f0dfd2] shadow-sm ring-1 ring-amber-100 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="p-8 md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9b745f]">Featured collections</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#2c251e]">Elegant suits for every moment</h2>
            <p className="mt-4 max-w-lg leading-7 text-stone-600">A focused collection for daily wear, festive occasions, and graceful styling.</p>
            <Link href="/products" className="mt-6 inline-flex rounded bg-[#5b3c2f] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white">Explore collections</Link>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1">
            {["/suits/maroon-palazzo-suit.jpg", "/suits/sage-lawn-suit.jpg", "/suits/pastel-pink-suit.jpg"].map((image) => (
              <img key={image} src={image} alt="Suit collection" className="h-full min-h-[260px] w-full object-cover" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-center font-serif text-3xl text-[#2c251e]">Frequently Asked Questions</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {["How can I place an order?", "Do you offer Cash on Delivery?", "How do Manual UPI payments work?", "How will I receive order updates?"].map((q) => (
              <details key={q} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <summary className="cursor-pointer font-semibold">{q}</summary>
                <p className="mt-3 text-sm leading-6 text-stone-600">You can select your product, choose size/color, place the order, and confirm through WhatsApp after checkout.</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function HomeProductCard({ product }) {
  const discount = product.compare_at_price ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100) : 0;
  return (
    <Link href={`/products/${product.slug}`} className="group overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-60 overflow-hidden bg-stone-100">
        <img src={product.images?.[0] || "/placeholder-product.svg"} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {discount > 0 && <span className="absolute left-3 top-3 rounded bg-[#b85b67] px-2 py-1 text-xs font-bold text-white">-{discount}%</span>}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-bold">{formatPrice(product.price)}</span>
          {product.compare_at_price ? <span className="text-xs text-stone-400 line-through">{formatPrice(product.compare_at_price)}</span> : null}
        </div>
      </div>
    </Link>
  );
}
