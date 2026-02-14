import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#14B8A6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://restiqo.com"),
  title: {
    default: "Restiqo - Properties & Tours in Bangladesh",
    template: "%s | Restiqo",
  },
  description:
    "Discover Bangladesh's finest properties and tours. Book your perfect stay or adventure with trusted local hosts.",
  keywords: [
    "Bangladesh",
    "property rental",
    "tours",
    "travel",
    "hotels",
    "apartments",
    "vacation",
    "booking",
    "Restiqo",
  ],
  authors: [{ name: "Restiqo" }],
  creator: "Restiqo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://restiqo.com",
    siteName: "Restiqo",
    title: "Restiqo - Properties & Tours in Bangladesh",
    description:
      "Discover Bangladesh's finest properties and tours. Book your perfect stay or adventure with trusted local hosts.",
    images: [
      {
        url: "/images/restiqo-logo.png",
        width: 1200,
        height: 630,
        alt: "Restiqo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Restiqo - Properties & Tours in Bangladesh",
    description:
      "Discover Bangladesh's finest properties and tours. Book your perfect stay or adventure with trusted local hosts.",
    images: ["/images/restiqo-logo.png"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/restiqo-logo.png" type="image/png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
