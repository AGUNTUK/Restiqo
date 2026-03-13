'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Loader2,
  Building,
  Calendar,
  DollarSign,
  Check,
  X,
  Plus,
  Edit,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { SupabaseDBService } from '@/lib/supabase/database'
import toast from 'react-hot-toast'

export default function HostDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated, isHost, isHostPending } = useAuth()
  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !isHost || !user?.id) return

    const db = new SupabaseDBService()
    setIsLoading(true)

    // Parallel fetch for host data
    Promise.all([
      db.getProperties({ hostId: user.id } as any).then((res: any) => res?.properties || res || []),
      // For now we get generic bookings. Ideally we query by properties' IDs.
      db.getBookings(user.id)
    ])
    .then(([hostProps, hostBookings]) => {
      setProperties(hostProps || [])
      setBookings(hostBookings || [])
      setStats({
          totalProperties: hostProps.length,
          activeListings: hostProps.filter((p: any) => p.isAvailable && p.isApproved).length,
          pendingBookings: hostBookings.filter((b: any) => b.status === 'pending').length,
          totalEarnings: hostBookings.filter((b: any) => b.status === 'completed').reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0)
      })
      setIsLoading(false)
    })
    .catch((err) => {
        console.error('Failed to load host data:', err)
        setIsLoading(false)
    })

  }, [isAuthenticated, isHost, user])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/host')
    } else if (!authLoading && isAuthenticated && !isHost) {
      router.push(isHostPending ? '/host/pending' : '/host/register')
    }
  }, [authLoading, isAuthenticated, isHost, isHostPending, router])

  const togglePropertyAvailability = async (propertyId: string, currentStatus: boolean) => {
    const db = new SupabaseDBService()
    
    try {
      await db.updateProperty(propertyId, { isAvailable: !currentStatus })
      toast.success('Property updated successfully')
    } catch {
      toast.error('Failed to update property')
    }
  }

  if (authLoading || isLoading || !isHost || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Host Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your properties and bookings
            </p>
          </div>
          <Link
            href="/host/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Listing
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="clay p-4 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="clay p-4 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeListings || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="clay p-4 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingBookings || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="clay p-4 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-primary/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${(stats?.totalEarnings || 0).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Properties List */}
          <div className="lg:col-span-2">
            <div className="clay p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">My Properties</h2>
                <Link
                  href="/host/listings"
                  className="text-sm text-brand-primary hover:underline"
                >
                  View All →
                </Link>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No properties yet</p>
                  <Link
                    href="/host/listings/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Property
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.slice(0, 5).map((property: any) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {property.images?.[0] ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{property.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              property.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {property.status === 'approved' ? 'Approved' : 'Pending Approval'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              property.isAvailable
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {property.isAvailable ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/host/listings/${property.id}`}
                          className="p-2 text-gray-600 hover:text-brand-primary transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => togglePropertyAvailability(property.id, property.isAvailable)}
                          className={`p-2 rounded-lg transition-colors ${
                            property.isAvailable
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {property.isAvailable ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div>
            <div className="clay p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <Link
                  href="/host/bookings"
                  className="text-sm text-brand-primary hover:underline"
                >
                  View All →
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {booking.propertyTitle || 'Property Booking'}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-brand-primary mt-1">
                        ${booking.pricing.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
