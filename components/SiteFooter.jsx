import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-amber-100 bg-[#f6efe5] text-stone-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl text-[#5b3c2f]">Alna's</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#9b745f]">Hub</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">Elegant suits for the modern woman. Premium-looking styles, simple ordering, COD, Manual UPI, and WhatsApp confirmation.</p>
        </div>
        <FooterCol title="Shop" links={["Suits", "New Arrivals", "Best Sellers", "Checkout"]} />
        <FooterCol title="Help" links={["Track Order", "Shipping Policy", "Returns & Exchanges", "Size Guide", "FAQs", "Contact Us"]} />
        <FooterCol title="Policies" links={["Privacy Policy", "Terms & Conditions", "Refund Policy", "Return Policy"]} />
      </div>
      <div className="border-t border-stone-200 px-5 py-4 text-center text-xs text-stone-500">© 2026 Alna's Hub. All rights reserved.</div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
      <div className="mt-4 space-y-2 text-sm text-stone-600">
        {links.map((link) => (
          <Link key={link} href="/products" className="block hover:text-[#5b3c2f]">{link}</Link>
        ))}
      </div>
    </div>
  );
}
