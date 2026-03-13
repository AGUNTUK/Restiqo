'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Users,
  Loader2,
  Search,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Booking, Property } from '@/types/database'
import toast from 'react-hot-toast'

interface BookingWithProperty extends Booking {
  property: Property
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function BookingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadBookings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        property:properties (*)
      `)
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } else {
      setBookings(data as BookingWithProperty[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/bookings')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user, loadBookings])

  const cancelBooking = async (bookingId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' } as never)
      .eq('id', bookingId)

    if (error) {
      toast.error('Failed to cancel booking')
    } else {
      toast.success('Booking cancelled successfully')
      loadBookings()
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const today = new Date()
    const checkIn = new Date(booking.check_in)
    
    // Apply status filter
    let matchesFilter = true
    switch (filter) {
      case 'upcoming':
        matchesFilter = booking.status !== 'cancelled' && checkIn >= today
        break
      case 'past':
        matchesFilter = booking.status !== 'cancelled' && checkIn < today
        break
      case 'cancelled':
        matchesFilter = booking.status === 'cancelled'
        break
    }

    // Apply search filter
    let matchesSearch = true
    if (searchQuery) {
      matchesSearch = booking.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      booking.property.location.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return matchesFilter && matchesSearch
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and track your reservations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {(['all', 'upcoming', 'past', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-8 text-center"
          >
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings.`}
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              Explore Properties
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="clay overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Property Image */}
                  <Link 
                    href={`/property/${booking.property.id}`}
                    className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0"
                  >
                    {booking.property.images?.[0] ? (
                      <Image
                        src={booking.property.images[0]}
                        alt={booking.property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </Link>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <Link 
                          href={`/property/${booking.property.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-brand-primary transition-colors"
                        >
                          {booking.property.title}
                        </Link>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {booking.property.location}
                        </p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${statusColors[booking.status]}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Check-in</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(booking.check_in).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Check-out</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(booking.check_out).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Guests</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.guests}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-sm font-bold text-brand-primary">
                          ৳{booking.total_price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/property/${booking.property.id}`}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Property
                      </Link>
                      
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {booking.status === 'completed' && (
                        <Link
                          href={`/property/${booking.property.id}?review=true`}
                          className="px-4 py-2 text-sm text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors"
                        >
                          Leave a Review
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

