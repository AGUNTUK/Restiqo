import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Stays & Experiences',
  description: 'Find your perfect apartment, hotel, or tour. Filter by price, amenities, and location to book the best accommodation for your trip.',
  openGraph: {
    title: 'Search Stays & Experiences | Restiqa',
    description: 'Find your perfect apartment, hotel, or tour. Filter by price, amenities, and location to book the best accommodation for your trip.',
  }
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
