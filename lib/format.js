export function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });
}

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function parseList(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product.price || 0),
    compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
    sizes: Array.isArray(product.sizes) ? product.sizes : parseList(product.sizes),
    colors: Array.isArray(product.colors) ? product.colors : parseList(product.colors),
    images: Array.isArray(product.images) ? product.images.filter(Boolean).slice(0, 4) : []
  };
}
