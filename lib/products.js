import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sampleProducts } from "@/lib/sampleData";

function sortProducts(products) {
  return [...products].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export async function getPublishedProducts() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    return sortProducts(sampleProducts);
  }
}

export async function getProductBySlug(slug) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return sampleProducts.find((product) => product.slug === slug) || null;
  }
}
