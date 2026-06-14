export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://store.aliwvide.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/aliwvide-control-7291", "/api/admin"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
