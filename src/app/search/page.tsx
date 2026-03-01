'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  MapPin,
  Star,
  Heart,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Property } from '@/types/database'

// Mock properties data
const mockProperties: Property[] = [
  {
    id: '1',
    host_id: 'host1',
    title: 'Luxury Downtown Apartment',
    description: 'Modern apartment with stunning city views',
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
    description: 'Peaceful studio with beautiful lake views',
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
    title: 'Grand Palace Hotel',
    description: '5-star luxury hotel with world-class amenities',
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
    id: '4',
    host_id: 'host4',
    title: 'Sundarbans Adventure',
    description: 'Explore the world\'s largest mangrove forest',
    property_type: 'tour',
    category: 'adventure',
    price_per_night: 0,
    price_per_tour: 15000,
    location: 'Sundarbans',
    address: 'Sundarbans National Park',
    city: 'Khulna',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 12,
    rating: 4.9,
    review_count: 89,
    is_available: true,
    is_approved: true,
    amenities: ['Guide', 'Meals', 'Boat', 'Photography'],
    images: ['https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    host_id: 'host5',
    title: 'Seaside Resort',
    description: 'Beachfront resort with private beach access',
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
    id: '6',
    host_id: 'host6',
    title: 'Tea Garden Experience',
    description: 'Visit the beautiful tea gardens of Sylhet',
    property_type: 'tour',
    category: 'cultural',
    price_per_night: 0,
    price_per_tour: 8000,
    location: 'Sylhet',
    address: 'Sreemangal',
    city: 'Sylhet',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 20,
    rating: 4.7,
    review_count: 156,
    is_available: true,
    is_approved: true,
    amenities: ['Guide', 'Transport', 'Meals', 'Tea Tasting'],
    images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const priceRanges = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under ৳5,000', min: 0, max: 5000 },
  { label: '৳5,000 - ৳10,000', min: 5000, max: 10000 },
  { label: '৳10,000 - ৳20,000', min: 10000, max: 20000 },
  { label: 'Over ৳20,000', min: 20000, max: Infinity },
]

const amenities = [
  'WiFi', 'AC', 'Pool', 'Kitchen', 'Parking', 'Washer', 'TV', 'Gym', 'Spa', 'Restaurant'
]

function SearchContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || 'all',
    priceRange: 0,
    minRating: 0,
    amenities: [] as string[],
    sortBy: 'recommended',
  })

  useEffect(() => {
    // Simulate API call with filters
    setLoading(true)
    setTimeout(() => {
      let filtered = [...mockProperties]

      // Filter by location
      if (filters.location) {
        filtered = filtered.filter(
          (p) =>
            p.city.toLowerCase().includes(filters.location.toLowerCase()) ||
            p.location.toLowerCase().includes(filters.location.toLowerCase())
        )
      }

      // Filter by type
      if (filters.type !== 'all') {
        filtered = filtered.filter((p) => p.property_type === filters.type)
      }

      // Filter by price
      const priceRange = priceRanges[filters.priceRange]
      filtered = filtered.filter((p) => {
        const price = p.price_per_night || p.price_per_tour || 0
        return price >= priceRange.min && price <= priceRange.max
      })

      // Filter by rating
      if (filters.minRating > 0) {
        filtered = filtered.filter((p) => p.rating >= filters.minRating)
      }

      // Filter by amenities
      if (filters.amenities.length > 0) {
        filtered = filtered.filter((p) =>
          filters.amenities.every((a) => p.amenities.includes(a))
        )
      }

      // Sort
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (a.price_per_night || 0) - (b.price_per_night || 0))
          break
        case 'price-high':
          filtered.sort((a, b) => (b.price_per_night || 0) - (a.price_per_night || 0))
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        default:
          break
      }

      setProperties(filtered)
      setLoading(false)
    }, 500)
  }, [filters])

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      type: 'all',
      priceRange: 0,
      minRating: 0,
      amenities: [],
      sortBy: 'recommended',
    })
  }

  const activeFiltersCount =
    (filters.type !== 'all' ? 1 : 0) +
    (filters.priceRange > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    filters.amenities.length

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Header */}
        <div className="neu-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  leftIcon={<SlidersHorizontal className="w-5 h-5" />}
                  className="flex-1 sm:flex-initial"
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="neu-input px-3 sm:px-4 py-2 appearance-none cursor-pointer text-sm sm:text-base flex-1 sm:flex-initial"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="neu-input w-full px-4 py-2.5 appearance-none text-[#1E293B]"
                  >
                    <option value="all">All Types</option>
                    <option value="apartment">Apartments</option>
                    <option value="hotel">Hotels</option>
                    <option value="tour">Tours</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      setFilters({ ...filters, priceRange: parseInt(e.target.value) })
                    }
                    className="neu-input w-full px-4 py-2.5 appearance-none text-[#1E293B]"
                  >
                    {priceRanges.map((range, index) => (
                      <option key={index} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) =>
                      setFilters({ ...filters, minRating: parseFloat(e.target.value) })
                    }
                    className="neu-input w-full px-4 py-2.5 appearance-none text-[#1E293B]"
                  >
                    <option value="0">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="w-full"
                    disabled={activeFiltersCount === 0}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-4 sm:mt-6">
                <label className="block text-sm font-medium text-[#1E293B] mb-3">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all ${
                        filters.amenities.includes(amenity)
                          ? 'bg-brand-primary text-white'
                          : 'neu-badge text-[#64748B] hover:bg-gray-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-[#64748B]">
            {loading ? 'Searching...' : `${properties.length} properties found`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
        ) : properties.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="neu-xl inline-block p-6 sm:p-8">
              <Search className="w-12 sm:w-16 h-12 sm:h-16 text-[#94A3B8] mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-[#1E293B] mb-2">
                No properties found
              </h3>
              <p className="text-sm sm:text-base text-[#64748B] mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button variant="primary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="h-full"
              >
                <Card property={property} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

