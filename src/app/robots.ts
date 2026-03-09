import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://restiqa.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard/',
          '/host/',
          '/admin/',
          '/profile/',
          '/bookings/',
          '/wishlist/',
          '/debug/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

