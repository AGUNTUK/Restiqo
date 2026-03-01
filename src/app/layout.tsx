import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navbar, Footer, MobileHeader, MobileBottomNav } from '@/components/layout'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo'
import { QueryProvider } from '@/lib/query/QueryProvider'
import { ErrorBoundary } from '@/components/ui'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'Restiqa - Premium Travel & Accommodation Booking',
    template: '%s | Restiqa',
  },
  description: 'Discover amazing apartments, hotels, and tours. Your perfect stay and experience awaits you in Bangladesh and beyond.',
  keywords: ['travel', 'booking', 'apartments', 'hotels', 'tours', 'Bangladesh', 'accommodation', 'vacation rental', 'holiday'],
  authors: [{ name: 'Restiqa Team' }],
  creator: 'Restiqa',
  publisher: 'Restiqa',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://restiqa.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'bn-BD': '/bn',
    },
  },
  openGraph: {
    title: 'Restiqa - Premium Travel & Accommodation Booking',
    description: 'Discover amazing apartments, hotels, and tours. Your perfect stay and experience awaits you in Bangladesh and beyond.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['bn_BD'],
    siteName: 'Restiqa',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Restiqa - Premium Travel & Accommodation Booking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restiqa - Premium Travel & Accommodation Booking',
    description: 'Discover amazing apartments, hotels, and tours. Your perfect stay and experience awaits you in Bangladesh and beyond.',
    images: ['/logo.png'],
    creator: '@restiqa',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#EEF2F6" />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <Analytics />
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                {/* Desktop Navbar - Hidden on mobile */}
                <div className="hidden md:block">
                  <Navbar />
                </div>

                {/* Mobile Header - Hidden on desktop */}
                <MobileHeader />

                <main className="min-h-screen pt-16 md:pt-0 has-mobile-nav">
                  {children}
                </main>

                <Footer />

                {/* Mobile Bottom Navigation - Hidden on desktop */}
                <MobileBottomNav />

                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#EEF2F6',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.08), -8px -8px 16px rgba(255, 255, 255, 0.9)',
                      color: '#1E293B',
                      padding: '16px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#88C51C',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </ErrorBoundary>
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

