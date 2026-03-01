import Script from 'next/script'

interface OrganizationJsonLdProps {
  name?: string
  url?: string
  logo?: string
  description?: string
}

export function OrganizationJsonLd({
  name = 'Restiqa',
  url = 'https://restiqa.com',
  logo = 'https://restiqa.com/logo.png',
  description = 'Premium Travel & Accommodation Booking Platform in Bangladesh',
}: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880-1234-567890',
      contactType: 'customer service',
      availableLanguage: ['English', 'Bengali'],
    },
    sameAs: [
      'https://facebook.com/restiqa',
      'https://twitter.com/restiqa',
      'https://instagram.com/restiqa',
    ],
  }

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface WebSiteJsonLdProps {
  name?: string
  url?: string
  description?: string
}

export function WebSiteJsonLd({
  name = 'Restiqa',
  url = 'https://restiqa.com',
  description = 'Discover amazing apartments, hotels, and tours. Your perfect stay and experience awaits you in Bangladesh and beyond.',
}: WebSiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface PropertyJsonLdProps {
  id: string
  title: string
  description: string
  images: string[]
  pricePerNight: number
  currency?: string
  rating?: number
  reviewCount?: number
  address: {
    street: string
    city: string
    country: string
  }
  propertyType: 'apartment' | 'hotel' | 'tour'
  bedrooms?: number
  bathrooms?: number
  maxGuests: number
  amenities: string[]
  hostName?: string
}

export function PropertyJsonLd({
  id,
  title,
  description,
  images,
  pricePerNight,
  currency = 'BDT',
  rating,
  reviewCount,
  address,
  propertyType,
  bedrooms,
  bathrooms,
  maxGuests,
  amenities,
  hostName,
}: PropertyJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://restiqa.com'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': propertyType === 'hotel' ? 'Hotel' : 'LodgingBusiness',
    '@id': `${baseUrl}/property/${id}`,
    name: title,
    description,
    image: images,
    url: `${baseUrl}/property/${id}`,
    priceRange: `৳${pricePerNight}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressCountry: address.country,
    },
    ...(rating && reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    amenityFeature: amenities.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    numberOfRooms: bedrooms,
    numberOfBathroomsTotal: bathrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: maxGuests,
    },
    ...(hostName
      ? {
          provider: {
            '@type': 'Person',
            name: hostName,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      price: pricePerNight,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <Script
      id={`property-jsonld-${id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface FAQJsonLdProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ReviewJsonLdProps {
  review: {
    author: string
    datePublished: string
    reviewBody: string
    rating: number
  }
  itemReviewed: {
    name: string
    type: 'LodgingBusiness' | 'Hotel' | 'TouristTrip'
  }
}

export function ReviewJsonLd({ review, itemReviewed }: ReviewJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': itemReviewed.type,
      name: itemReviewed.name,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  }

  return (
    <Script
      id="review-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

