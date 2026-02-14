'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Search, MapPin, Star, Heart, Filter, SlidersHorizontal,
  Wifi, Car, Coffee, Utensils, Dumbbell, Waves, Sparkles,
  ChevronDown, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useToast } from '@/hooks/use-toast'

interface Hotel {
  id: string
  name: string
  description: string
  city: string
  location: string
  pricePerNight: number
  rating: number
  reviewCount: number
  images: string[]
  amenities: string[]
  starRating: number
  roomTypes: string[]
  featured: boolean
  verified: boolean
}

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Breakfast': Coffee,
  'Restaurant': Utensils,
  'Gym': Dumbbell,
  'Pool': Waves,
  'Spa': Sparkles,
}

const bangladeshCities = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Cox\'s Bazar', 'Rajshahi', 
  'Khulna', 'Rangamati', 'Bandarban', 'Sreemangal', 'Bogra'
]

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('rating')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [starFilter, setStarFilter] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels')
      if (response.ok) {
        const data = await response.json()
        setHotels(data)
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (hotelId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: hotelId, itemType: 'HOTEL' })
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Hotel added to favorites',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Please login to add favorites',
        variant: 'destructive'
      })
    }
  }

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = !selectedCity || hotel.city === selectedCity
    const matchesPrice = hotel.pricePerNight >= priceRange[0] && hotel.pricePerNight <= priceRange[1]
    const matchesRating = hotel.rating >= minRating
    const matchesAmenities = selectedAmenities.length === 0 || 
                            selectedAmenities.every(a => hotel.amenities.includes(a))
    const matchesStars = starFilter.length === 0 || starFilter.includes(hotel.starRating)
    
    return matchesSearch && matchesCity && matchesPrice && matchesRating && matchesAmenities && matchesStars
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'price-low':
        return a.pricePerNight - b.pricePerNight
      case 'price-high':
        return b.pricePerNight - a.pricePerNight
      case 'reviews':
        return b.reviewCount - a.reviewCount
      default:
        return 0
    }
  })

  const allAmenities = [...new Set(hotels.flatMap(h => h.amenities))]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Hotel in Bangladesh
            </h1>
            <p className="text-xl text-white/90">
              Discover premium hotels, resorts, and accommodations across the country
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search hotels, cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-gray-800"
                  />
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="h-12 px-4 rounded-lg border border-gray-200 text-gray-800"
                >
                  <option value="">All Cities</option>
                  {bangladeshCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <Button className="h-12 px-8 bg-primary hover:bg-primary-dark">
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Star Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Star Rating</h4>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3, 2, 1].map(star => (
                      <Button
                        key={star}
                        variant={starFilter.includes(star) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setStarFilter(prev => 
                            prev.includes(star) 
                              ? prev.filter(s => s !== star)
                              : [...prev, star]
                          )
                        }}
                        className="flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {star}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range (BDT/night)</h4>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-24"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-24"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="flex gap-2">
                    {[4.5, 4, 3.5, 3].map(rating => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMinRating(rating)}
                      >
                        {rating}+
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Amenities Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {allAmenities.map(amenity => {
                      const Icon = amenityIcons[amenity] || Wifi
                      return (
                        <Button
                          key={amenity}
                          variant={selectedAmenities.includes(amenity) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedAmenities(prev =>
                              prev.includes(amenity)
                                ? prev.filter(a => a !== amenity)
                                : [...prev, amenity]
                            )
                          }}
                          className="flex items-center gap-1"
                        >
                          <Icon className="w-3 h-3" />
                          {amenity}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPriceRange([0, 50000])
                    setMinRating(0)
                    setSelectedAmenities([])
                    setStarFilter([])
                    setSelectedCity('')
                    setSearchQuery('')
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hotels Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <p className="text-gray-600">
                  <span className="font-semibold">{filteredHotels.length}</span> hotels found
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="rating">Rating</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>

            {/* Hotels List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-80 rounded-xl" />
                ))}
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No hotels found matching your criteria</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCity('')
                    setPriceRange([0, 50000])
                    setMinRating(0)
                    setSelectedAmenities([])
                    setStarFilter([])
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/hotels/${hotel.id}`}>
                      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="relative h-56">
                          <Image
                            src={hotel.images[0] || '/placeholder-hotel.jpg'}
                            alt={hotel.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            {hotel.featured && (
                              <Badge className="bg-amber-500">Featured</Badge>
                            )}
                            {hotel.verified && (
                              <Badge className="bg-green-500">Verified</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full"
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite(hotel.id)
                            }}
                          >
                            <Heart className="w-5 h-5" />
                          </Button>
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                            {[...Array(hotel.starRating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {hotel.name}
                              </h3>
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                {hotel.city}, {hotel.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                              <span className="text-gray-500 text-sm">({hotel.reviewCount})</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {hotel.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {hotel.amenities.slice(0, 4).map(amenity => {
                              const Icon = amenityIcons[amenity] || Wifi
                              return (
                                <div key={amenity} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  <Icon className="w-3 h-3" />
                                  {amenity}
                                </div>
                              )
                            })}
                            {hotel.amenities.length > 4 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                +{hotel.amenities.length - 4} more
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <span className="text-2xl font-bold text-primary">
                                ৳{hotel.pricePerNight.toLocaleString()}
                              </span>
                              <span className="text-gray-500 text-sm"> / night</span>
                            </div>
                            <Button size="sm">View Details</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
