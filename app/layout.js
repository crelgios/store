import "./globals.css";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const siteName = process.env.NEXT_PUBLIC_STORE_NAME || "Aliwvide Store";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://store.aliwvide.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Indian & Pakistani Women Suits`,
    template: `%s | ${siteName}`
  },
  description:
    "Shop elegant Indian suits, Pakistani suits, embroidered suit sets, festive wear, and daily wear for women.",
  openGraph: {
    title: `${siteName} | Indian & Pakistani Women Suits`,
    description:
      "Elegant Indian and Pakistani women suits with simple checkout, COD, Manual UPI, and WhatsApp order confirmation.",
    url: siteUrl,
    siteName,
    type: "website",
    images: ["/suits/hero-pakistani.jpg"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
