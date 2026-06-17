import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSlug, normalizeProduct, parseList } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function adminError(auth) {
  return NextResponse.json({ error: auth.message }, { status: auth.status });
}

async function getUniqueSlug(supabase, requestedSlug, currentProductId) {
  const baseSlug = createSlug(requestedSlug || "product");
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    let query = supabase.from("products").select("id").eq("slug", slug).limit(1);
    if (currentProductId) query = query.neq("id", currentProductId);

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return adminError(auth);

  try {
    const { id } = await params;
    const body = await request.json();
    const images = Array.isArray(body.images) ? body.images.filter(Boolean).slice(0, 4) : [];

    if (!body.name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    if (images.length > 4) return NextResponse.json({ error: "Maximum 4 product images allowed." }, { status: 400 });

    const supabase = getSupabaseAdmin();

    const { data: existingProduct, error: existingError } = await supabase
      .from("products")
      .select("id, slug")
      .eq("id", id)
      .single();

    if (existingError) throw existingError;

    // Keep the current product URL/slug when editing normal fields like description.
    // Only change the slug if a slug is explicitly sent from the admin form/API.
    const requestedSlug = typeof body.slug === "string" && body.slug.trim() ? body.slug : existingProduct.slug;
    const safeSlug = await getUniqueSlug(supabase, requestedSlug || body.name, id);

    const product = normalizeProduct({
      name: body.name,
      slug: safeSlug,
      gender: body.gender || "Women",
      category: body.category || "Suits",
      description: body.description || "",
      price: Number(body.price || 0),
      compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null,
      sizes: parseList(body.sizes),
      colors: parseList(body.colors),
      images,
      stock: Number(body.stock || 0),
      status: body.status === "draft" ? "draft" : "published",
      updated_at: new Date().toISOString()
    });

    const { data, error } = await supabase.from("products").update(product).eq("id", id).select("*").single();

    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Product could not be updated." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return adminError(auth);

  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Product could not be deleted." }, { status: 500 });
  }
}
