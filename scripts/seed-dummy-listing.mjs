#!/usr/bin/env node
/**
 * Seed Script: Dummy Listing for Company Verification
 * 
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed-dummy-listing.mjs
 * 
 * Or with the values from your project:
 *   node scripts/seed-dummy-listing.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(`
❌ Missing environment variables. Please run:

  $env:NEXT_PUBLIC_SUPABASE_URL="https://otkfbeqwavcjtwcwcjql.supabase.co"
  $env:SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
  node scripts/seed-dummy-listing.mjs

Your service role key is in:
  Supabase Dashboard → Project Settings → API → service_role (secret)
`);
  process.exit(1);
}

// Use service-role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log("🔗 Connecting to Supabase:", SUPABASE_URL);

  // 1. Find the first admin or any user as host
  let { data: adminUser, error: userErr } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (userErr || !adminUser) {
    // fall back to any user
    const { data: anyUser, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error || !anyUser) {
      console.error("❌ No users found in the database. Create an account first, then re-run.");
      process.exit(1);
    }

    adminUser = anyUser;
    console.log(`⚠️  No admin found. Using first user as host: ${anyUser.email} (${anyUser.role})`);
  } else {
    console.log(`✅ Using admin as host: ${adminUser.email}`);
  }

  const LISTING_ID = "00000000-0000-0000-0000-000000000001";

  // 2. Upsert the dummy listing
  const { data, error } = await supabase
    .from("listings")
    .upsert({
      id: LISTING_ID,
      host_id: adminUser.id,
      title: "Restiqa Showcase Suite — Dhaka City View",
      description:
        "Welcome to Restiqa's flagship showcase property — a premium suite in the heart of Dhaka.\n\n" +
        "This listing is used for platform demonstration and company verification. It features a modern " +
        "open-plan layout with panoramic city views, high-speed WiFi, and a fully equipped kitchen.\n\n" +
        "Ideal for business travellers and digital nomads looking for a comfortable, centrally located stay.",
      price: 8500,
      location: "Gulshan-2, Dhaka 1212",
      city: "Dhaka",
      country: "Bangladesh",
      latitude: 23.7937,
      longitude: 90.4066,
      type: "apartment",
      beds: 2,
      baths: 2,
      max_guests: 4,
      amenities: ["WiFi", "Air Conditioning", "Kitchen", "TV", "Washing Machine", "Parking", "Elevator", "24/7 Security"],
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      ],
      is_available: true,
      status: "approved",
    }, { onConflict: "id" })
    .select("id, title, city, status")
    .single();

  if (error) {
    console.error("❌ Failed to insert listing:", error.message);
    console.error("   Details:", error.details || error.hint || "");
    process.exit(1);
  }

  console.log("\n✅ Dummy listing seeded successfully!\n");
  console.log("   ID:     ", data.id);
  console.log("   Title:  ", data.title);
  console.log("   City:   ", data.city);
  console.log("   Status: ", data.status);
  console.log("\n🌐 View it at: https://restiqa.vercel.app/listings\n");
}

main().catch(console.error);
