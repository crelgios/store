import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generateProductDraft } from "@/lib/ai-manager/productDraft";
import { processAndUploadDraftImages } from "@/lib/ai-manager/imageProcessor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILES = 4;

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const formData = await request.formData();
    const files = formData.getAll("images").filter(Boolean);
    const price = Number(formData.get("price") || 0);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Valid product price is required." }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Upload at least one raw product image." }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: "Maximum 4 product images are allowed." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const processed = await processAndUploadDraftImages({ files, supabase });
    const draft = generateProductDraft({
      price,
      gender: formData.get("gender"),
      category: formData.get("category"),
      color: formData.get("color"),
      sizes: formData.get("sizes"),
      stock: formData.get("stock"),
      notes: formData.get("notes")
    });

    const payload = {
      title: draft.title,
      slug: draft.slug,
      description: draft.description,
      gender: draft.gender,
      category: draft.category,
      tags: draft.tags,
      price: draft.price,
      sizes: draft.sizes,
      colors: draft.colors,
      stock: draft.stock,
      images: processed.images.map((image) => image.url),
      image_paths: processed.images.map((image) => image.path),
      status: "draft_ready",
      processing_note: processed.processingNote,
      raw_input: {
        files: files.map((file) => ({ name: file.name, type: file.type, size: file.size })),
        notes: String(formData.get("notes") || "")
      }
    };

    const { data, error } = await supabase.from("product_drafts").insert(payload).select("*").single();
    if (error) throw error;

    return NextResponse.json({ draft: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || "AI Store Manager could not generate a product draft." }, { status: 500 });
  }
}
