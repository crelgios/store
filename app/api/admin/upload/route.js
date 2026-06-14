import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET_NAME = "product-images";
const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getExtension(filename, contentType) {
  const original = String(filename || "image");
  const fromName = original.includes(".") ? original.split(".").pop().toLowerCase() : "";
  if (["jpg", "jpeg", "png", "webp"].includes(fromName)) return fromName;
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("images").filter(Boolean);

    if (files.length === 0) {
      return NextResponse.json({ error: "No images selected." }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: "Maximum 4 product images allowed." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const uploaded = [];

    for (const file of files) {
      if (!String(file.type || "").startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Each image must be 5MB or smaller." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const extension = getExtension(file.name, file.type);
      const path = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: false
      });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    return NextResponse.json({ urls: uploaded });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Image upload failed." }, { status: 500 });
  }
}
