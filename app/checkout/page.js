import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata = {
  title: "Checkout",
  description: "Review cart and place your Aliwvide Store order using Cash on Delivery or Manual UPI Payment."
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <SiteHeader />
      <CheckoutClient />
      <SiteFooter />
    </main>
  );
}
