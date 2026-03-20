import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when real credentials have been added to .env.local */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_URL !== "https://your-project-id.supabase.co" &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY !== "your-anon-key-here"
  );
}

/**
 * Server-side Supabase client.
 * Throws a descriptive error if credentials haven't been configured yet.
 * Guard with `isSupabaseConfigured()` before calling in optional contexts (e.g. Navbar).
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase credentials are not configured. " +
        "Copy .env.local.example to .env.local and fill in your " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component — session refresh
          // handled by middleware.
        }
      },
    },
  });
}
