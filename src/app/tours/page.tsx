'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Compass, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Property } from '@/types/database'

// Mock tours data
const mockTours: Property[] = [
  {
    id: '1',
    host_id: 'host1',
    title: 'Sundarbans Adventure',
    description: 'Explore the world\'s largest mangrove forest and spot Royal Bengal Tigers',
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
    id: '2',
    host_id: 'host2',
    title: 'Tea Garden Experience',
    description: 'Visit the beautiful tea gardens of Sylhet and learn about tea production',
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
  {
    id: '3',
    host_id: 'host3',
    title: 'River Cruise Dhaka',
    description: 'Scenic river cruise along the Buriganga with traditional Bengali cuisine',
    property_type: 'tour',
    category: 'leisure',
    price_per_night: 0,
    price_per_tour: 5000,
    location: 'Buriganga River',
    address: 'Sadarghat Terminal',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 30,
    rating: 4.5,
    review_count: 234,
    is_available: true,
    is_approved: true,
    amenities: ['Meals', 'Music', 'Photography'],
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    host_id: 'host4',
    title: 'Hill Trekking Adventure',
    description: 'Trek through the beautiful hills of Chittagong Hill Tracts',
    property_type: 'tour',
    category: 'adventure',
    price_per_night: 0,
    price_per_tour: 12000,
    location: 'Rangamati',
    address: 'Hill Tracts',
    city: 'Rangamati',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 15,
    rating: 4.8,
    review_count: 78,
    is_available: true,
    is_approved: true,
    amenities: ['Guide', 'Camping', 'Meals', 'Equipment'],
    images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    host_id: 'host5',
    title: 'Old Dhaka Heritage Walk',
    description: 'Explore the historic streets and architecture of Old Dhaka',
    property_type: 'tour',
    category: 'cultural',
    price_per_night: 0,
    price_per_tour: 2500,
    location: 'Old Dhaka',
    address: 'Lalbagh Fort',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 25,
    rating: 4.6,
    review_count: 312,
    is_available: true,
    is_approved: true,
    amenities: ['Guide', 'Snacks', 'Photography'],
    images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    host_id: 'host6',
    title: 'Beach Camping Experience',
    description: 'Overnight camping on the pristine beaches of Kuakata',
    property_type: 'tour',
    category: 'adventure',
    price_per_night: 0,
    price_per_tour: 10000,
    location: 'Kuakata',
    address: 'Kuakata Beach',
    city: 'Patuakhali',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 20,
    rating: 4.7,
    review_count: 145,
    is_available: true,
    is_approved: true,
    amenities: ['Camping', 'Meals', 'Bonfire', 'Stargazing'],
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const categories = [
  { id: 'all', label: 'All Tours' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'leisure', label: 'Leisure' },
]

export default function ToursPage() {
  const [tours, setTours] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      let filtered = [...mockTours]

      if (searchQuery) {
        filtered = filtered.filter(
          (tour) =>
            tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tour.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tour.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter((tour) => tour.category === selectedCategory)
      }

      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (a.price_per_tour || 0) - (b.price_per_tour || 0))
          break
        case 'price-high':
          filtered.sort((a, b) => (b.price_per_tour || 0) - (a.price_per_tour || 0))
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        default:
          break
      }

      setTours(filtered)
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
            <div className="neu-icon w-16 h-16 mx-auto mb-4 rounded-2xl" style={{ background: 'var(--color-secondary)', boxShadow: '4px 4px 8px rgba(33,136,119,0.25), -4px -4px 8px rgba(255,255,255,0.8)' }}>
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-4">
              Unforgettable Tours & Experiences
            </h1>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Discover the beauty of Bangladesh with our curated tours and adventures
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="neu-xl p-2 flex gap-2">
              <Input
                placeholder="Search tours by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="flex-1"
              />
              <Button variant="primary">Search</Button>
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
                      ? 'neu-filter-active text-brand-secondary'
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
            {loading ? 'Loading...' : `${tours.length} tours found`}
          </p>

          {/* Tours Grid */}
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
          ) : tours.length === 0 ? (
            <div className="text-center py-16">
              <div className="neu-xl inline-block p-8">
                <Compass className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
                  No tours found
                </h3>
                <p className="text-[#64748B] mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {tours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card property={tour} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

