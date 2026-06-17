import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductDetails from "@/components/ProductDetails";
import { getProductBySlug, getPublishedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at Alna's Hub.`,
    openGraph: {
      title: product.name,
      description: product.description || `Shop ${product.name} at Alna's Hub.`,
      images: product.images?.[0] ? [product.images[0]] : []
    }
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const products = await getPublishedProducts();

  if (!product) notFound();

  const relatedProducts = products
    .filter((item) => item.id !== product.id && (item.category === product.category || item.gender === product.gender))
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#fffaf3] text-stone-950">
      <SiteHeader />
      <ProductDetails product={product} />

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#9b745f]">Related Products</p>
              <h2 className="mt-2 font-serif text-3xl text-[#2c251e]">You may also like</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-stone-700 hover:text-stone-950">View all</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="group overflow-hidden rounded-[1.75rem] border border-amber-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="h-64 overflow-hidden bg-stone-100">
                  <img src={item.images?.[0] || "/placeholder-product.svg"} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-stone-500">{item.category}</p>
                  <h3 className="mt-2 font-bold">{item.name}</h3>
                  <p className="mt-2 font-bold text-stone-950">₹{Number(item.price || 0).toLocaleString("en-IN")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
