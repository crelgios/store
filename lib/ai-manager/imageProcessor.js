import crypto from "crypto";
import sharp from "sharp";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export function validateImageFile(file) {
  if (!file || !String(file.type || "").startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  if (ALLOWED_TYPES.size && !ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Each raw product image must be 12MB or smaller.");
  }
}

async function tryRemoveBackground(inputBuffer, filename) {
  const apiKey = process.env.REMOVEBG_API_KEY;

  if (!apiKey) {
    return { buffer: inputBuffer, removed: false, note: "Background removal API key not configured. Image was optimized, resized, centered, and compressed." };
  }

  try {
    const formData = new FormData();
    const blob = new Blob([inputBuffer]);
    formData.append("image_file", blob, filename || "product-image.png");
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData
    });

    if (!response.ok) {
      return { buffer: inputBuffer, removed: false, note: "Background removal failed. Image was optimized without background removal." };
    }

    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), removed: true, note: "Background removed, centered, resized, and compressed." };
  } catch {
    return { buffer: inputBuffer, removed: false, note: "Background removal failed. Image was optimized without background removal." };
  }
}

export async function processAndUploadDraftImages({ files, supabase }) {
  const uploaded = [];
  const notes = [];

  for (const file of files) {
    validateImageFile(file);
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const removed = await tryRemoveBackground(rawBuffer, file.name);

    const processed = await sharp(removed.buffer)
      .rotate()
      .resize({ width: 1200, height: 1600, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 86, effort: 5 })
      .toBuffer();

    const path = `ai-drafts/${Date.now()}-${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, processed, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false
    });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    uploaded.push({ url: data.publicUrl, path });
    notes.push(removed.note);
  }

  return {
    images: uploaded,
    processingNote: [...new Set(notes)].join(" ")
  };
}
