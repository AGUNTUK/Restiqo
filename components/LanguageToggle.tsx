"use client";

import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/app/actions/locale";
import { startTransition } from "react";

export default function LanguageToggle({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();

  const toggleLanguage = () => {
    startTransition(async () => {
      const nextLocale = currentLocale === "en" ? "bn" : "en";
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  };

  return (
    <button 
      onClick={toggleLanguage} 
      className="neo-btn px-4 py-2 font-semibold text-sm rounded-[12px] flex items-center gap-2"
      aria-label="Toggle Language"
    >
      {currentLocale === "bn" ? "EN 🇺🇸" : "বাংলা 🇧🇩"}
    </button>
  );
}
