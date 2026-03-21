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
  metadataBase: new URL("https://www.restiqa.com"),
  title: {
    default: "Restiqa — Premium Travel Marketplace in Bangladesh",
    template: "%s | Restiqa",
  },
  description:
    "Discover unique stays across Bangladesh. From Cox's Bazar sea views to Sajek Valley resorts, find your perfect home away from home with Restiqa.",
  keywords: [
    "bangladesh travel", "dhaka rentals", "cox's bazar hotels", "sajek resorts", "villas in sylhet", "restiqa",
    "বাংলাদেশ ভ্রমণ", "ঢাকা রেন্টাল", "কক্সবাজার হোটেল", "সাজেক রিসোর্ট", "সিলেট ভিলা", "রেস্টিকা"
  ],
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
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Restiqa",
  },
};

export const viewport = {
  themeColor: "#6c63ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility but starting at 1
};

import { getDictionary, getLocale } from "@/lib/i18n";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import PWAProvider from "@/components/PWAProvider";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const dict = await getDictionary();
  const locale = await getLocale();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7PJEXZ6FWJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7PJEXZ6FWJ');
          `}
        </Script>
      </head>
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
        <PWAProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer dict={dict} locale={locale} />
          <SpeedInsights />
          <Analytics />
        </PWAProvider>
      </body>
    </html>
  );
}
