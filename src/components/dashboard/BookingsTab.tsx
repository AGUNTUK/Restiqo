'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Calendar, MapPin, Users, Clock, X, Check, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { SupabaseDBService } from '@/lib/supabase/database'
import { Booking, Property } from '@/types/database'

interface BookingWithProperty extends Booking {
  property: Property
}

const statusColors = {
  pending: 'badge-warning',    /* amber bg + dark amber text ≥ 4.5:1 ✓ */
  confirmed: 'badge-success',  /* green bg + dark green text ≥ 5.5:1 ✓ */
  cancelled: 'badge-error',    /* red bg + dark red text ≥ 6.3:1 ✓ */
  completed: 'badge-info',     /* blue bg + dark blue text ≥ 5.9:1 ✓ */
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
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const loadBookings = useCallback(async () => {
    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const db = new SupabaseDBService()
      const rawBookings = await db.getBookings(user.id)

      const mappedBookings = await Promise.all(
        rawBookings.map(async (booking: any) => {
          const propertyId = booking.propertyId ?? booking.property_id
          if (!propertyId) return null

          const property = await db.getProperty(propertyId)
          if (!property) return null

          const mapped: BookingWithProperty = {
            id: booking.id,
            property_id: propertyId,
            guest_id: booking.guestId ?? booking.guest_id ?? user.id,
            check_in: booking.checkIn ?? booking.check_in ?? booking.checkInDate ?? booking.check_in_date,
            check_out: booking.checkOut ?? booking.check_out ?? booking.checkOutDate ?? booking.check_out_date,
            guests: booking.guests ?? 1,
            total_price: booking.totalPrice ?? booking.total_price ?? 0,
            status: booking.status ?? 'pending',
            payment_status: booking.paymentStatus ?? booking.payment_status ?? 'pending',
            special_requests: booking.specialRequests ?? booking.special_requests ?? null,
            created_at: booking.createdAt ?? booking.created_at ?? new Date().toISOString(),
            updated_at: booking.updatedAt ?? booking.updated_at ?? new Date().toISOString(),
            property: property as Property,
          }

          return mapped
        })
      )

      setBookings(mappedBookings.filter(Boolean) as BookingWithProperty[])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bookings'
      console.error('Error loading bookings:', message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user, loadBookings])

  const cancelBooking = async (bookingId: string) => {
    setCancelling(true)
    try {
      const db = new SupabaseDBService()
      await db.cancelBooking(bookingId)
      // Optimistic local update — no full reload needed
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking'
      console.error('Error cancelling booking:', message)
      setError(message)
    } finally {
      setCancelling(false)
      setConfirmCancelId(null)
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
      <div className="clay-card p-8 text-center border-white/40 shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        <p className="text-[#525f7a] mt-4">Loading your bookings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="clay-card p-8 text-center border-white/40 shadow-xl">
        <AlertTriangle className="w-12 h-12 text-[--color-warning] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#1E293B] mb-2">Could not load bookings</h3>
        <p className="text-[#525f7a] mb-6 text-sm">{error}</p>
        <button
          onClick={loadBookings}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cancel Confirmation Dialog */}
      {confirmCancelId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmCancelId(null)}
          />
          <div className="relative clay-card p-6 max-w-sm w-full border-white/40 shadow-2xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2 rounded-xl bg-red-100 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 id="cancel-dialog-title" className="font-semibold text-[#1E293B] text-base mb-1">
                  Cancel this booking?
                </h3>
                <p className="text-sm text-[#525f7a]">
                  This action cannot be undone. Any refund will follow the host&apos;s cancellation policy.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmCancelId(null)}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-semibold text-[#374151] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={() => cancelBooking(confirmCancelId)}
                disabled={cancelling}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'upcoming', 'past', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all min-h-[40px] ${
              filter === f
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-white text-[#374151] hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="clay-card p-8 text-center border-white/40 shadow-xl">
          <Calendar className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#1E293B] mb-2">No bookings found</h3>
          <p className="text-[#525f7a] mb-4">
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings.`}
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors font-semibold"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const StatusIcon = statusIcons[booking.status]
            
            return (
              <div key={booking.id} className="clay-card p-4 sm:p-6 border-white/40 shadow-lg hover:shadow-xl transition-shadow">
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
                          className="text-lg font-semibold text-[#1E293B] hover:text-brand-primary transition-colors"
                        >
                          {booking.property.title}
                        </Link>
                        <p className="text-sm text-[#525f7a] flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {booking.property.location}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${statusColors[booking.status]}`}>
                        <StatusIcon className="w-4 h-4" />
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-[#525f7a] font-medium">Check-in</p>
                        <p className="text-sm font-semibold text-[#1E293B]">
                          {new Date(booking.check_in).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#525f7a] font-medium">Check-out</p>
                        <p className="text-sm font-semibold text-[#1E293B]">
                          {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#525f7a] font-medium">Guests</p>
                        <p className="text-sm font-semibold text-[#1E293B] flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.guests}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#525f7a] font-medium">Total</p>
                        <p className="text-sm font-bold text-brand-primary">
                          ৳{booking.total_price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setConfirmCancelId(booking.id)}
                          aria-label={`Cancel booking for ${booking.property.title}`}
                          className="px-4 py-2 text-sm font-semibold badge-error rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}

                    {booking.status === 'completed' && (
                      <div className="mt-4">
                        <Link
                          href={`/property/${booking.property.id}?review=true`}
                          className="px-4 py-2 text-sm font-semibold text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors"
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
