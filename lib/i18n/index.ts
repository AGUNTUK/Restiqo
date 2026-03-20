import { cookies } from "next/headers";
import { dictionaries, Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value as Locale;
  return locale === "bn" ? "bn" : "en";
}

export async function getDictionary() {
  const locale = await getLocale();
  return dictionaries[locale];
}
