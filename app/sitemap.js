import { getPublishedProducts } from "@/lib/products";

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://store.aliwvide.com";
  const products = await getPublishedProducts();

  const baseRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/products", priority: 0.9, changeFrequency: "daily" },
    { path: "/checkout", priority: 0.3, changeFrequency: "monthly" }
  ];

  return [
    ...baseRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    }))
  ];
}
