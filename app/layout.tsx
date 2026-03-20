import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://restiqa-market.vercel.app"),
  title: {
    default: "Restiqa — Premium Travel Marketplace in Bangladesh",
    template: "%s | Restiqa",
  },
  description:
    "Discover unique stays across Bangladesh. From Cox's Bazar sea views to Sajek Valley resorts, find your perfect home away from home with Restiqa.",
  keywords: ["bangladesh travel", "dhaka rentals", "cox's bazar hotels", "sajek resorts", "villas in sylhet", "restiqa"],
  authors: [{ name: "Restiqa Team" }],
  openGraph: {
    title: "Restiqa — Premium Travel Marketplace in Bangladesh",
    description: "Discover and book unique stays across Bangladesh with ease.",
    url: "https://restiqa-market.vercel.app",
    siteName: "Restiqa",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Restiqa Travel Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restiqa — Premium Travel Marketplace in Bangladesh",
    description: "Discover and book unique stays across Bangladesh with ease.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { getDictionary, getLocale } from "@/lib/i18n";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const dict = await getDictionary();
  const locale = await getLocale();

  return (
    <html lang={locale} className={inter.variable}>
      <body
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "var(--font-inter, system-ui, sans-serif)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer dict={dict} locale={locale} />
      </body>
    </html>
  );
}
