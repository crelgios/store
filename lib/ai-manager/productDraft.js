import { createSlug, parseList } from "@/lib/format";

const categoryDefaults = {
  "Suits": {
    title: "Suit Set",
    description: "A refined suit set designed with a modern ethnic look, comfortable styling, and elegant detailing."
  }
};

function cleanAuto(value, fallback) {
  const text = String(value || "").trim();
  if (!text || text.toLowerCase() === "auto") return fallback;
  return text;
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function generateProductDraft({ price, gender, category, color, sizes, stock, notes }) {
  const finalGender = cleanAuto(gender, "Women");
  const finalCategory = cleanAuto(category, "Suits");
  const finalColor = cleanAuto(color, "Elegant");
  const finalSizes = parseList(sizes || "XS, S, M, L, XL, XXL");
  const defaultCopy = categoryDefaults[finalCategory] || categoryDefaults["Suits"];
  const noteText = String(notes || "").trim();

  const titleParts = [finalColor, defaultCopy.title]
    .filter(Boolean)
    .map(titleCase);
  const title = titleParts.join(" ").replace(/\s+/g, " ").trim();

  const colorText = finalColor.toLowerCase() === "elegant" ? "" : ` The ${finalColor.toLowerCase()} tone gives it a soft, polished look.`;
  const extra = noteText ? ` ${noteText}` : "";
  const description = `${defaultCopy.description}${colorText} Suitable for customers looking for suit styles with a clean, modern shopping experience.${extra}`;

  return {
    title,
    slug: createSlug(`${title}-${Date.now()}`),
    description,
    gender: finalGender,
    category: finalCategory,
    colors: [finalColor],
    sizes: finalSizes.length ? finalSizes : ["S", "M", "L"],
    tags: ["suits", finalCategory.toLowerCase(), finalGender.toLowerCase()].filter(Boolean),
    price: Number(price || 0),
    stock: Number(stock || 0)
  };
}
