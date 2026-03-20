import { MetadataRoute } from "next";
import { createClient, createStaticClient, isSupabaseConfigured } from "@/lib/supabase/server";

const BASE_URL = "https://restiqa-market.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // SEO Location Pages
    { url: `${BASE_URL}/dhaka`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/coxs-bazar`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/sylhet`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/sajek`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  if (!isSupabaseConfigured()) return staticRoutes;

  const supabase = await createStaticClient();

  // 1. Fetch Listings
  const { data: listings } = await supabase
    .from("listings")
    .select("id, slug, updated_at")
    .eq("status", "approved");

  const listingRoutes: MetadataRoute.Sitemap = (listings || []).map((l) => ({
    url: `${BASE_URL}/listing/${l.slug || l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // 2. Fetch Blog Posts
  const { data: blogs } = await supabase
    .from("blogs")
    .select("slug, updated_at");

  const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((b) => ({
    url: `${BASE_URL}/blog/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...listingRoutes, ...blogRoutes];
}
