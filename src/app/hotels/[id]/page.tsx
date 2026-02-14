'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Star, MapPin, Heart, Share2, Wifi, Car, Coffee, Utensils, 
  Dumbbell, Waves, Sparkles, Phone, Mail, ChevronLeft, ChevronRight,
  Calendar, Users, Check, X, Clock, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, calculateNights } from '@/lib/utils'

interface Hotel {
  id: string
  name: string
  description: string
  city: string
  location: string
  address: string
  pricePerNight: number
  rating: number
  reviewCount: number
  images: string[]
  amenities: string[]
  starRating: number
  roomTypes: string[]
  featured: boolean
  verified: boolean
  host: {
    id: string
    name: string
    email: string
    phone: string
    vendorType: string
  }
  reviews: Array<{
    id: string
    rating: number
    title: string
    comment: string
    createdAt: string
    user: { name: string }
    response?: string
  }>
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

export default function HotelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [rooms, setRooms] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchHotel()
  }, [params.id])

  const fetchHotel = async () => {
    try {
      const response = await fetch(`/api/hotels/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setHotel(data)
      }
    } catch (error) {
      console.error('Error fetching hotel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: 'Error',
        description: 'Please select check-in and check-out dates',
        variant: 'destructive'
      })
      return
    }

    setBookingLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel?.id,
          checkIn,
          checkOut,
          guests,
          rooms,
          type: 'HOTEL'
        })
      })

      if (response.ok) {
        const booking = await response.json()
        toast({
          title: 'Booking Confirmed!',
          description: 'Your hotel booking has been confirmed.',
        })
        router.push(`/bookings/${booking.id}`)
      } else {
        const error = await response.json()
        toast({
          title: 'Booking Failed',
          description: error.message || 'Failed to create booking',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setBookingLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: hotel?.id, itemType: 'HOTEL' })
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

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0
  const totalPrice = hotel ? hotel.pricePerNight * nights * rooms : 0
  const serviceFee = totalPrice * 0.1
  const grandTotal = totalPrice + serviceFee

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="skeleton h-96 rounded-xl mb-8" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel Not Found</h1>
          <Link href="/hotels">
            <Button>Browse Hotels</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Image Gallery */}
      <section className="relative">
        <div className="container mx-auto px-4 py-4">
          <Link href="/hotels" className="inline-flex items-center text-gray-600 hover:text-primary mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Hotels
          </Link>
        </div>
        
        <div className="relative h-[50vh] md:h-[60vh] bg-gray-100">
          <Image
            src={hotel.images[currentImageIndex] || '/placeholder-hotel.jpg'}
            alt={hotel.name}
            fill
            className="object-cover"
          />
          
          {/* Navigation Arrows */}
          {hotel.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? hotel.images.length - 1 : prev - 1)}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                onClick={() => setCurrentImageIndex(prev => prev === hotel.images.length - 1 ? 0 : prev + 1)}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {hotel.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {hotel.featured && (
              <Badge className="bg-amber-500">Featured</Badge>
            )}
            {hotel.verified && (
              <Badge className="bg-green-500">Verified</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 hover:bg-white rounded-full"
              onClick={toggleFavorite}
            >
              <Heart className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 hover:bg-white rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(hotel.starRating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  {hotel.address}, {hotel.city}
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-lg">{hotel.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">{hotel.reviewCount} reviews</span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">About This Hotel</h2>
                <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map(amenity => {
                    const Icon = amenityIcons[amenity] || Wifi
                    return (
                      <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                        <span>{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Room Types */}
              {hotel.roomTypes && hotel.roomTypes.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Room Types</h2>
                  <div className="flex flex-wrap gap-2">
                    {hotel.roomTypes.map(room => (
                      <Badge key={room} variant="outline" className="text-sm py-1 px-3">
                        {room}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                {hotel.reviews && hotel.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {hotel.reviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{review.user.name}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium mb-1">{review.title}</h4>
                          <p className="text-gray-600">{review.comment}</p>
                          {review.response && (
                            <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/20">
                              <p className="text-sm text-gray-500 mb-1">Response from hotel:</p>
                              <p className="text-gray-600">{review.response}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-4"
            >
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-primary">
                        ৳{hotel.pricePerNight.toLocaleString()}
                      </span>
                      <span className="text-gray-500"> / night</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Check In</label>
                        <Input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Check Out</label>
                        <Input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Guests</label>
                        <Input
                          type="number"
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          min={1}
                          max={10}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Rooms</label>
                        <Input
                          type="number"
                          value={rooms}
                          onChange={(e) => setRooms(Number(e.target.value))}
                          min={1}
                          max={5}
                        />
                      </div>
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="space-y-2 mb-4 py-4 border-t border-b">
                      <div className="flex justify-between text-gray-600">
                        <span>৳{hotel.pricePerNight.toLocaleString()} x {nights} nights x {rooms} rooms</span>
                        <span>৳{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Service fee</span>
                        <span>৳{serviceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>৳{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 text-lg"
                    onClick={handleBooking}
                    disabled={bookingLoading || !checkIn || !checkOut}
                  >
                    {bookingLoading ? 'Processing...' : 'Book Now'}
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    Secure booking - Free cancellation
                  </div>
                </CardContent>
              </Card>

              {/* Contact Host */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Contact Hotel</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {hotel.host.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {hotel.host.email}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
