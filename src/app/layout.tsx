import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Navbar, Footer, MobileHeader, MobileBottomNav } from '@/components/layout'
import { Toaster } from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo'
import { QueryProvider } from '@/lib/query/QueryProvider'
import { ErrorBoundary } from '@/components/ui'
import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/theme'

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
  metadataBase: new URL('https://restiqa.com'),
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
    google: '7ihYkOccgaKwxxVZqTx9d6MrWcQuXIIgILAW2SlbG4o',
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
        <meta name="heleket" content="59dd1cbe" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Restiqa" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Restiqa" />
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Analytics />
        <SpeedInsights />
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ThemeProvider>
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
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

