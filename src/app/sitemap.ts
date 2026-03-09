import { MetadataRoute } from 'next'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/lib/firebase/config'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://restiqa.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/apartments`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/hotels`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tours`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/auth/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/help-center`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/safety`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cancellation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/covid-19-response`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/legal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  let propertyPages: MetadataRoute.Sitemap = []

  try {
    const db = getFirebaseFirestore()
    const propertiesQuery = query(
      collection(db, 'properties'),
      where('isApproved', '==', true),
      where('isAvailable', '==', true)
    )

    const snapshot = await getDocs(propertiesQuery)

    propertyPages = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as { updatedAt?: Date | { toDate?: () => Date } | string }
      const updatedAt = data.updatedAt && typeof data.updatedAt === 'object' && 'toDate' in data.updatedAt
        ? data.updatedAt.toDate?.() || new Date()
        : data.updatedAt
          ? new Date(data.updatedAt as string)
          : new Date()

      return {
        url: `${baseUrl}/property/${docSnap.id}`,
        lastModified: updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error)
  }

  return [...staticPages, ...propertyPages]
}
