'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Search, Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Property } from '@/types/database'

// Mock hotels data
const mockHotels: Property[] = [
  {
    id: '1',
    host_id: 'host1',
    title: 'Grand Palace Hotel',
    description: '5-star luxury hotel with world-class amenities and service',
    property_type: 'hotel',
    category: 'luxury',
    price_per_night: 25000,
    price_per_tour: null,
    location: 'Gulshan',
    address: '100 Gulshan Tower',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 4,
    rating: 4.9,
    review_count: 342,
    is_available: true,
    is_approved: true,
    amenities: ['Pool', 'Spa', 'Restaurant', 'Gym', 'WiFi'],
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    host_id: 'host2',
    title: 'Seaside Resort',
    description: 'Beachfront resort with private beach access and water sports',
    property_type: 'hotel',
    category: 'resort',
    price_per_night: 18000,
    price_per_tour: null,
    location: 'Cox\'s Bazar',
    address: 'Beach Road',
    city: 'Cox\'s Bazar',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 6,
    rating: 4.8,
    review_count: 278,
    is_available: true,
    is_approved: true,
    amenities: ['Beach Access', 'Pool', 'Restaurant', 'WiFi'],
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    host_id: 'host3',
    title: 'Boutique Inn',
    description: 'Charming boutique hotel with personalized service',
    property_type: 'hotel',
    category: 'boutique',
    price_per_night: 12000,
    price_per_tour: null,
    location: 'Old Dhaka',
    address: '50 Heritage Street',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 3,
    rating: 4.6,
    review_count: 145,
    is_available: true,
    is_approved: true,
    amenities: ['Restaurant', 'WiFi', 'Room Service'],
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    host_id: 'host4',
    title: 'Hill View Resort',
    description: 'Mountain retreat with stunning views and hiking trails',
    property_type: 'hotel',
    category: 'resort',
    price_per_night: 15000,
    price_per_tour: null,
    location: 'Bandarban',
    address: 'Hill Top',
    city: 'Bandarban',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 4,
    rating: 4.7,
    review_count: 189,
    is_available: true,
    is_approved: true,
    amenities: ['Hiking', 'Restaurant', 'WiFi', 'Garden'],
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    host_id: 'host5',
    title: 'City Center Hotel',
    description: 'Modern hotel in the heart of the business district',
    property_type: 'hotel',
    category: 'business',
    price_per_night: 10000,
    price_per_tour: null,
    location: 'Motijheel',
    address: 'Commercial Area',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 2,
    rating: 4.5,
    review_count: 234,
    is_available: true,
    is_approved: true,
    amenities: ['Business Center', 'WiFi', 'Restaurant', 'Gym'],
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    host_id: 'host6',
    title: 'Heritage Hotel',
    description: 'Historic hotel with traditional Bengali architecture',
    property_type: 'hotel',
    category: 'boutique',
    price_per_night: 8000,
    price_per_tour: null,
    location: 'Old Dhaka',
    address: 'Heritage Quarter',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 3,
    rating: 4.4,
    review_count: 167,
    is_available: true,
    is_approved: true,
    amenities: ['Restaurant', 'WiFi', 'Garden', 'Cultural Tours'],
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const categories = [
  { id: 'all', label: 'All Hotels' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'resort', label: 'Resorts' },
  { id: 'boutique', label: 'Boutique' },
  { id: 'business', label: 'Business' },
]

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      let filtered = [...mockHotels]

      if (searchQuery) {
        filtered = filtered.filter(
          (hotel) =>
            hotel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter((hotel) => hotel.category === selectedCategory)
      }

      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price_per_night - b.price_per_night)
          break
        case 'price-high':
          filtered.sort((a, b) => b.price_per_night - a.price_per_night)
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        default:
          break
      }

      setHotels(filtered)
      setLoading(false)
    }, 300)
  }, [searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="neu-icon w-16 h-16 mx-auto mb-4 rounded-2xl" style={{ background: 'var(--color-accent)', boxShadow: '4px 4px 8px rgba(136,197,28,0.25), -4px -4px 8px rgba(255,255,255,0.8)' }}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4">
              Discover Amazing Hotels
            </h1>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              From luxury resorts to boutique stays, find your perfect accommodation
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="neu-xl p-2 flex gap-2">
              <Input
                placeholder="Search hotels by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="flex-1"
              />
              <Button variant="accent">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Tabs & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'neu-filter-active text-brand-accent'
                      : 'neu-filter'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="neu-input px-4 py-2.5 appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_12px_center] bg-no-repeat"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Results Count */}
          <p className="text-[#64748B] mb-6">
            {loading ? 'Loading...' : `${hotels.length} hotels found`}
          </p>

          {/* Hotels Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="neu-card overflow-hidden">
                  <div className="skeleton h-56" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="neu-xl inline-block p-8">
                <Building2 className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
                  No hotels found
                </h3>
                <p className="text-[#64748B] mb-4">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="accent"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card property={hotel} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

