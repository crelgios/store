import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductListing from "@/components/ProductListing";
import { getPublishedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Women Suits",
  description: "Browse Alna's Hub women’s suits, embroidered suits, festive wear, and daily wear."
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <main className="min-h-screen bg-[#fffaf3] text-stone-950">
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-14 text-stone-500">Loading products...</div>}>
        <ProductListing products={products} />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
