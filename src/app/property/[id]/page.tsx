'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Heart,
  Share2,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import GoogleMap from '@/components/ui/GoogleMap'
import { Property } from '@/types/database'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth/AuthContext'
import { getFirestoreDB } from '@/lib/firebase/database'

// Mock property data
const mockProperty: Property = {
  id: '1',
  host_id: 'host1',
  title: 'Luxury Downtown Apartment',
  description: `Experience the best of Dhaka in this stunning luxury apartment located in the heart of Gulshan. 

This beautifully designed 3-bedroom apartment offers breathtaking city views and comes fully equipped with modern amenities. Perfect for families, business travelers, or anyone looking for a premium stay experience.

The apartment features:
- Spacious living area with floor-to-ceiling windows
- Modern kitchen with high-end appliances
- Master bedroom with en-suite bathroom
- High-speed WiFi throughout
- 24/7 security and concierge service
- Private parking space

Located just minutes away from top restaurants, shopping malls, and business districts. The perfect base for exploring Dhaka!`,
  property_type: 'apartment',
  category: 'luxury',
  price_per_night: 8500,
  price_per_tour: null,
  location: 'Gulshan',
  address: '123 Gulshan Avenue',
  city: 'Dhaka',
  country: 'Bangladesh',
  latitude: 23.7806,
  longitude: 90.4122,
  bedrooms: 3,
  bathrooms: 2,
  max_guests: 6,
  rating: 4.9,
  review_count: 128,
  is_available: true,
  is_approved: true,
  amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Washer', 'Pool', 'Gym', 'Security'],
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200',
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-5 h-5" />,
  AC: <Wind className="w-5 h-5" />,
  Kitchen: <Coffee className="w-5 h-5" />,
  Parking: <Car className="w-5 h-5" />,
  TV: <Tv className="w-5 h-5" />,
}

const reviews = [
  {
    id: '1',
    user: { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    rating: 5,
    comment: 'Amazing place! The apartment was exactly as described and the host was very responsive. Would definitely stay again!',
    date: '2024-01-15',
  },
  {
    id: '2',
    user: { name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    rating: 4,
    comment: 'Great location and beautiful views. The apartment was clean and well-maintained. Minor issue with hot water but was quickly resolved.',
    date: '2024-01-10',
  },
  {
    id: '3',
    user: { name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    rating: 5,
    comment: 'Perfect for our family trip! Kids loved the pool and the location was convenient for all our activities.',
    date: '2024-01-05',
  },
]

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperty(mockProperty)
      setLoading(false)
    }, 500)
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !property) return 0
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    return nights * property.price_per_night
  }

  const handleBooking = async () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (!user) {
      toast.error('Please log in to book this property')
      router.push('/auth/login')
      return
    }

    try {
      setIsBooking(true)
      const db = getFirestoreDB()
      const totalPrice = calculateTotal() + Math.round(calculateTotal() * 0.1)
      const newBookingId = await db.createBooking({
        propertyId: property?.id,
        guestId: user.id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        totalPrice: totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
      })

      // Initiate Payment directly
      try {
        const fullName = profile?.full_name || user.displayName || 'Guest User'
        const email = profile?.email || user.email || ''

        const response = await fetch('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            amount: totalPrice,
            booking_id: newBookingId,
          })
        })

        const data = await response.json()

        if (response.ok && data.payment_url) {
          toast.success('Booking created! Redirecting to payment...')
          window.location.href = data.payment_url
          return
        } else {
          console.error('Payment initialization failed:', data)
          toast.error('Payment initialization failed. Redirecting to checkout review...')
          router.push(`/checkout?bookingId=${newBookingId}`)
        }
      } catch (payError) {
        console.error('Error initiating payment:', payError)
        toast.error('Error starting payment. Redirecting to checkout review...')
        router.push(`/checkout?bookingId=${newBookingId}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking')
    } finally {
      setIsBooking(false)
    }
  }

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="skeleton h-96 rounded-2xl mb-8" />
          <div className="skeleton h-8 w-2/3 rounded-lg mb-4" />
          <div className="skeleton h-4 w-1/2 rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-4 rounded-lg" />
              <div className="skeleton h-4 rounded-lg" />
              <div className="skeleton h-4 w-3/4 rounded-lg" />
            </div>
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20">
      {/* Image Gallery */}
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${property.images[currentImageIndex]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
            />
          ))}
        </div>

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="p-2 sm:p-3 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'
                }`}
            />
          </button>
          <button className="p-2 sm:p-3 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="primary" className="mb-2">
                    {property.property_type}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 text-sm sm:text-base">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property.city}, {property.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{property.rating.toFixed(1)}</span>
                      <span>({property.review_count} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 sm:gap-6 py-3 sm:py-4 border-y border-gray-200 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <span>{property.max_guests} guests</span>
                </div>
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-500" />
                    <span>{property.bathrooms} bathrooms</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About this place</h2>
              <div className="text-gray-600 whitespace-pre-line">
                {property.description}
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                  >
                    {amenityIcons[amenity] || <Check className="w-5 h-5 text-brand-primary" />}
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reviews
                </h2>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{property.rating.toFixed(1)}</span>
                  <span className="text-gray-500">· {property.review_count} reviews</span>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="neu-card p-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Image
                        src={review.user.avatar}
                        alt={review.user.name}
                        width={48}
                        height={48}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                          <h4 className="font-medium text-[#1E293B]">{review.user.name}</h4>
                          <span className="text-xs sm:text-sm text-[#64748B]">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm sm:text-base text-[#64748B]">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="mt-6 w-full">
                Show all {property.review_count} reviews
              </Button>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-[#1E293B] mb-3 sm:mb-4">Location</h2>
              <div className="neu-card p-4">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-[#64748B]">{property.address}, {property.city}</span>
                </div>
                <GoogleMap
                  center={{ lat: property.latitude ?? 23.8103, lng: property.longitude ?? 90.4125 }}
                  zoom={14}
                  markers={property.latitude && property.longitude ? [
                    {
                      position: { lat: property.latitude, lng: property.longitude },
                      title: property.title,
                      info: property.address,
                    },
                  ] : []}
                  height="300px"
                />
              </div>
            </motion.div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="neu-xl p-4 sm:p-6 lg:sticky lg:top-24"
            >
              <div className="flex items-baseline justify-between mb-4 sm:mb-6">
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-[#1E293B]">
                    {formatPrice(property.price_per_night)}
                  </span>
                  <span className="text-[#64748B]"> / night</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-[#1E293B]">{property.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-1">
                      Check in
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, checkIn: e.target.value })
                      }
                      className="neu-input w-full px-3 py-2 text-sm text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] mb-1">
                      Check out
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, checkOut: e.target.value })
                      }
                      className="neu-input w-full px-3 py-2 text-sm text-[#1E293B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1">
                    Guests
                  </label>
                  <select
                    value={bookingData.guests}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, guests: parseInt(e.target.value) })
                    }
                    className="neu-input w-full px-3 py-2 text-sm appearance-none text-[#1E293B]"
                  >
                    {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {bookingData.checkIn && bookingData.checkOut && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>
                      {formatPrice(property.price_per_night)} x{' '}
                      {Math.ceil(
                        (new Date(bookingData.checkOut).getTime() -
                          new Date(bookingData.checkIn).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )}{' '}
                      nights
                    </span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Service fee</span>
                    <span>{formatPrice(Math.round(calculateTotal() * 0.1))}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal() + Math.round(calculateTotal() * 0.1))}</span>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowBookingModal(true)}
              >
                Reserve
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                You won't be charged yet
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Confirm Booking"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex gap-4 pb-4 border-b border-gray-200">
            <Image
              src={property.images[0]}
              alt={property.title}
              width={96}
              height={96}
              className="w-24 h-24 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{property.title}</h3>
              <p className="text-sm text-gray-500">{property.city}, {property.country}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{property.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Dates</span>
              <span className="font-medium">
                {bookingData.checkIn} &rarr; {bookingData.checkOut}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-medium">{bookingData.guests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(calculateTotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee</span>
              <span className="font-medium">
                {formatPrice(Math.round(calculateTotal() * 0.1))}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">
                {formatPrice(calculateTotal() + Math.round(calculateTotal() * 0.1))}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleBooking} disabled={isBooking}>
              {isBooking ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

