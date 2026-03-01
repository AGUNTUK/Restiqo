'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Calendar, MapPin, Users, Clock, X, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Booking, Property } from '@/types/database'

interface BookingWithProperty extends Booking {
  property: Property
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}

const statusIcons = {
  pending: Clock,
  confirmed: Check,
  cancelled: X,
  completed: Check,
}

export default function BookingsTab() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')

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
    } else {
      setBookings(data as BookingWithProperty[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user, loadBookings])

  const cancelBooking = async (bookingId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      console.error('Error cancelling booking:', error)
    } else {
      loadBookings()
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const today = new Date()
    const checkIn = new Date(booking.check_in)
    
    switch (filter) {
      case 'upcoming':
        return booking.status !== 'cancelled' && checkIn >= today
      case 'past':
        return booking.status !== 'cancelled' && checkIn < today
      case 'cancelled':
        return booking.status === 'cancelled'
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="clay p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        <p className="text-gray-600 mt-4">Loading your bookings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'upcoming', 'past', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-brand-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="clay p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings.`}
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const StatusIcon = statusIcons[booking.status]
            
            return (
              <div key={booking.id} className="clay p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Property Image */}
                  <Link 
                    href={`/property/${booking.property.id}`}
                    className="relative w-full sm:w-48 h-32 sm:h-auto rounded-xl overflow-hidden flex-shrink-0"
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
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link 
                          href={`/property/${booking.property.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-brand-primary transition-colors"
                        >
                          {booking.property.title}
                        </Link>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {booking.property.location}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusColors[booking.status]}`}>
                        <StatusIcon className="w-4 h-4" />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(booking.check_in).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Guests</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.guests}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-bold text-brand-primary">
                          ৳{booking.total_price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}

                    {booking.status === 'completed' && (
                      <div className="mt-4">
                        <Link
                          href={`/property/${booking.property.id}?review=true`}
                          className="px-4 py-2 text-sm text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors"
                        >
                          Leave a Review
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

