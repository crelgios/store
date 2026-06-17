import "./globals.css";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const siteName = process.env.NEXT_PUBLIC_STORE_NAME || "Alna's Hub";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alnascloset.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Women Suits`,
    template: `%s | ${siteName}`
  },
  description:
    "Shop elegant suits, embroidered suit sets, festive wear, and daily wear for women.",
  openGraph: {
    title: `${siteName} | Women Suits`,
    description:
      "Elegant women suits with simple checkout, COD, Manual UPI, and WhatsApp order confirmation.",
    url: siteUrl,
    siteName,
    type: "website",
    images: ["/suits/hero-suits.jpg"]
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
