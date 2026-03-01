'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Search, SlidersHorizontal } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Property } from '@/types/database'

// Mock apartments data
const mockApartments: Property[] = [
  {
    id: '1',
    host_id: 'host1',
    title: 'Luxury Downtown Apartment',
    description: 'Modern apartment with stunning city views in the heart of Dhaka',
    property_type: 'apartment',
    category: 'luxury',
    price_per_night: 8500,
    price_per_tour: null,
    location: 'Gulshan',
    address: '123 Gulshan Avenue',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    rating: 4.9,
    review_count: 128,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    host_id: 'host2',
    title: 'Cozy Studio Near Lake',
    description: 'Peaceful studio apartment with beautiful lake views',
    property_type: 'apartment',
    category: 'budget',
    price_per_night: 3500,
    price_per_tour: null,
    location: 'Dhanmondi',
    address: '45 Lake Road',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    rating: 4.7,
    review_count: 89,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    host_id: 'host3',
    title: 'Spacious Family Apartment',
    description: 'Perfect for families with kids, close to schools and parks',
    property_type: 'apartment',
    category: 'family',
    price_per_night: 6500,
    price_per_tour: null,
    location: 'Banani',
    address: '78 Block F',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
    rating: 4.8,
    review_count: 156,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Washer'],
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    host_id: 'host4',
    title: 'Modern Loft in Uttara',
    description: 'Stylish loft apartment with industrial design elements',
    property_type: 'apartment',
    category: 'modern',
    price_per_night: 5500,
    price_per_tour: null,
    location: 'Uttara',
    address: 'Sector 7',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    rating: 4.6,
    review_count: 67,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Gym'],
    images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    host_id: 'host5',
    title: 'Riverside Retreat',
    description: 'Charming apartment with panoramic river views',
    property_type: 'apartment',
    category: 'scenic',
    price_per_night: 7500,
    price_per_tour: null,
    location: 'Old Dhaka',
    address: 'Buriganga View',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 5,
    rating: 4.8,
    review_count: 92,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Balcony'],
    images: ['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    host_id: 'host6',
    title: 'Budget Friendly Studio',
    description: 'Affordable and comfortable studio for solo travelers',
    property_type: 'apartment',
    category: 'budget',
    price_per_night: 2000,
    price_per_tour: null,
    location: 'Mirpur',
    address: 'Mirpur DOHS',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    rating: 4.4,
    review_count: 145,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC'],
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const categories = [
  { id: 'all', label: 'All Apartments' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'budget', label: 'Budget Friendly' },
  { id: 'family', label: 'Family Friendly' },
  { id: 'modern', label: 'Modern' },
]

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      let filtered = [...mockApartments]

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (apt) =>
            apt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((apt) => apt.category === selectedCategory)
      }

      // Sort
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

      setApartments(filtered)
      setLoading(false)
    }, 300)
  }, [searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-24 md:pb-0">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 md:py-16 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="neu-icon-primary w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl">
              <Home className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E293B] mb-2 sm:mb-4">
              Find Your Perfect Apartment
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto px-2">
              Discover handpicked apartments across Bangladesh for your perfect stay
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="neu-xl p-1.5 sm:p-2 flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search apartments by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="flex-1 text-sm sm:text-base"
              />
              <Button variant="primary" className="w-full sm:w-auto">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Tabs & Sort */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Category tabs - horizontally scrollable on mobile */}
            <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-1.5 sm:gap-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${selectedCategory === category.id
                        ? 'neu-filter-active'
                        : 'neu-filter'
                      }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="neu-input px-3 sm:px-4 py-2.5 text-sm sm:text-base appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_12px_center] bg-no-repeat"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Results Count */}
          <p className="text-xs sm:text-sm text-[#64748B] mb-4 sm:mb-6">
            {loading ? 'Loading...' : `${apartments.length} apartments found`}
          </p>

          {/* Apartments Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="neu-card overflow-hidden">
                  <div className="skeleton h-44 sm:h-56" />
                  <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : apartments.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="neu-xl inline-block p-6 sm:p-8">
                <Home className="w-12 h-12 sm:w-16 sm:h-16 text-[#94A3B8] mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-[#1E293B] mb-2">
                  No apartments found
                </h3>
                <p className="text-sm sm:text-base text-[#64748B] mb-4">
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="primary"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-stretch">
              {apartments.map((apartment, index) => (
                <motion.div
                  key={apartment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card property={apartment} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

