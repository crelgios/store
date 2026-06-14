const storeWhatsAppNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER || "";
const siteName = process.env.NEXT_PUBLIC_STORE_NAME || "Aliwvide Store";

export default function FloatingWhatsApp() {
  const cleanNumber = storeWhatsAppNumber.replace(/\D/g, "");

  if (!cleanNumber) {
    return null;
  }

  const message = encodeURIComponent(
    `Hello ${siteName}, I need help with a suit order.`
  );

  return (
    <a
      href={`https://wa.me/${cleanNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Aliwvide Store on WhatsApp"
      className="fixed bottom-20 right-4 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl ring-4 ring-white/80 transition hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 md:bottom-6 md:right-6 md:h-16 md:w-16"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8 md:h-9 md:w-9"
        fill="currentColor"
      >
        <path d="M16.04 3C8.86 3 3.02 8.74 3.02 15.8c0 2.26.62 4.47 1.78 6.4L3 29l6.98-1.78a13.18 13.18 0 0 0 6.06 1.5c7.18 0 13.02-5.74 13.02-12.8S23.22 3 16.04 3Zm0 23.54c-1.92 0-3.8-.5-5.45-1.45l-.39-.22-4.14 1.06 1.1-4-.25-.41a10.59 10.59 0 0 1-1.65-5.72c0-5.86 4.84-10.62 10.78-10.62s10.78 4.76 10.78 10.62-4.84 10.74-10.78 10.74Zm5.9-7.96c-.32-.16-1.9-.92-2.2-1.03-.3-.1-.51-.16-.73.16-.21.31-.84 1.02-1.03 1.23-.19.21-.38.24-.7.08-.32-.16-1.35-.49-2.57-1.56-.95-.83-1.6-1.86-1.78-2.17-.19-.32-.02-.49.14-.64.15-.14.32-.37.49-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.73-1.73-1-2.37-.26-.62-.53-.54-.73-.55h-.62c-.21 0-.56.08-.86.4-.3.31-1.13 1.08-1.13 2.64 0 1.56 1.16 3.06 1.32 3.27.16.21 2.28 3.42 5.52 4.8.77.33 1.38.53 1.85.68.78.24 1.48.21 2.04.13.62-.09 1.9-.76 2.17-1.5.27-.74.27-1.37.19-1.5-.08-.13-.3-.21-.62-.37Z" />
      </svg>
    </a>
  );
}
