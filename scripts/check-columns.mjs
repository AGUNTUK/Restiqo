import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load env from .env.local
const envContent = readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...value] = line.split("=");
  if (key && value.length > 0) {
    env[key.trim()] = value.join("=").trim().replace(/^"(.*)"$/, "$1");
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
    console.log("🔍 Checking 'listings' table columns...");
    const { data: one, error: oneErr } = await supabase.from('listings').select('*').limit(1).single();
    if (one) {
        console.log("Existing columns in 'listings':", Object.keys(one));
    } else {
        console.log("No records in 'listings' or error:", oneErr?.message);
    }

    console.log("\n🔍 Checking 'bookings' table columns...");
    const { data: bOne, error: bOneErr } = await supabase.from('bookings').select('*').limit(1).single();
    if (bOne) {
        console.log("Existing columns in 'bookings':", Object.keys(bOne));
    } else {
        console.log("No records in 'bookings' or error:", bOneErr?.message);
    }

    console.log("\n🔍 Checking 'reviews' table columns...");
    const { data: rOne, error: rOneErr } = await supabase.from('reviews').select('*').limit(1).single();
    if (rOne) {
        console.log("Existing columns in 'reviews':", Object.keys(rOne));
    } else {
        console.log("No records in 'reviews' or error:", rOneErr?.message);
    }

    console.log("\n🔍 Checking 'users' table columns...");
    const { data: uOne, error: uOneErr } = await supabase.from('users').select('*').limit(1).single();
    if (uOne) {
        console.log("Existing columns in 'users':", Object.keys(uOne));
    } else {
        console.log("No records in 'users' or error:", uOneErr?.message);
    }
}

main().catch(console.error);
