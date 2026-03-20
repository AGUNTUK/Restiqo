import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";
import { getDictionary, getLocale } from "@/lib/i18n";

/**
 * Server Component wrapper.
 * Reads the Supabase session (if credentials are configured) and passes
 * user info down to the interactive NavbarClient.
 */
export default async function Navbar() {
  let user: { email: string; name: string | null } | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        user = {
          email: data.user.email!,
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            null,
        };
      }
    } catch {
      // Silently fail — show unauthenticated navbar
    }
  }

  const dict = await getDictionary();
  const locale = await getLocale();

  return <NavbarClient user={user} dict={dict.nav} locale={locale} />;
}
