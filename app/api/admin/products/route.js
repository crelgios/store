import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSlug, normalizeProduct, parseList } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function adminError(auth) {
  return NextResponse.json({ error: auth.message }, { status: auth.status });
}

function validateProduct(body) {
  const name = String(body.name || "").trim();
  const price = Number(body.price);
  const images = Array.isArray(body.images) ? body.images.filter(Boolean).slice(0, 4) : [];

  if (!name) return "Product name is required.";
  if (!Number.isFinite(price) || price <= 0) return "Valid price is required.";
  if (images.length > 4) return "Maximum 4 product images allowed.";
  return null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return adminError(auth);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ products: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not load products." }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return adminError(auth);

  try {
    const body = await request.json();
    const validationError = validateProduct(body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const product = normalizeProduct({
      name: body.name,
      slug: body.slug || createSlug(body.name),
      gender: body.gender || "Women",
      category: body.category || "Suits",
      description: body.description || "",
      price: Number(body.price),
      compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null,
      sizes: parseList(body.sizes),
      colors: parseList(body.colors),
      images: Array.isArray(body.images) ? body.images.slice(0, 4) : [],
      stock: Number(body.stock || 0),
      status: body.status === "draft" ? "draft" : "published"
    });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("products").insert(product).select("*").single();

    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Product could not be saved." }, { status: 500 });
  }
}
