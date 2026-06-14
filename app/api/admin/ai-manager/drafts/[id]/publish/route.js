import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSlug, normalizeProduct } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: draft, error: draftError } = await supabase
      .from("product_drafts")
      .select("*")
      .eq("id", id)
      .single();

    if (draftError) throw draftError;
    if (!draft) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    if (draft.status === "published") return NextResponse.json({ error: "Draft already published." }, { status: 400 });

    const product = normalizeProduct({
      name: draft.title,
      slug: draft.slug || createSlug(draft.title),
      gender: draft.gender || "Women",
      category: draft.category || "Suits",
      description: draft.description || "",
      price: Number(draft.price || 0),
      compare_at_price: null,
      sizes: draft.sizes || [],
      colors: draft.colors || [],
      images: draft.images || [],
      stock: Number(draft.stock || 0),
      status: "published"
    });

    const { data: createdProduct, error: productError } = await supabase
      .from("products")
      .insert(product)
      .select("*")
      .single();

    if (productError) throw productError;

    const { data: updatedDraft, error: updateError } = await supabase
      .from("product_drafts")
      .update({
        status: "published",
        published_product_id: createdProduct.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ product: createdProduct, draft: updatedDraft });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Draft could not be published." }, { status: 500 });
  }
}
