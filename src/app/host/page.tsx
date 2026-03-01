'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Loader2,
  Home,
  Building,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Property, Booking, HostEarning } from '@/types/database'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalProperties: number
  activeListings: number
  totalBookings: number
  pendingBookings: number
  totalEarnings: number
  averageRating: number
}

export default function HostDashboardPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading, isAuthenticated, isHost } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
  })
  const [properties, setProperties] = useState<Property[]>([])
  const [recentBookings, setRecentBookings] = useState<(Booking & { property: Property })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/host')
    } else if (!authLoading && isAuthenticated && !isHost) {
      router.push('/host/register')
    }
  }, [authLoading, isAuthenticated, isHost, router])

  useEffect(() => {
    if (user && isHost) {
      loadDashboardData()
    }
  }, [user, isHost])

  const loadDashboardData = async () => {
    if (!user) return

    const supabase = createClient()

    try {
      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError
      setProperties(propertiesData || [])

      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties (*)
        `)
        .in('property_id', (propertiesData || []).map((p: Property) => p.id))
        .order('created_at', { ascending: false })
        .limit(5)

      if (bookingsError) throw bookingsError
      setRecentBookings(bookingsData || [])

      // Load earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('host_earnings')
        .select('net_amount')
        .eq('host_id', user.id)

      if (earningsError) throw earningsError

      // Calculate stats
      const totalEarnings = (earningsData || []).reduce((sum: number, e: HostEarning) => sum + Number(e.net_amount), 0)
      const activeListings = (propertiesData || []).filter((p: Property) => p.is_available && p.is_approved).length
      const pendingBookings = (bookingsData || []).filter((b: Booking) => b.status === 'pending').length
      const avgRating = (propertiesData || []).reduce((sum: number, p: Property) => sum + p.rating, 0) / ((propertiesData || []).length || 1)

      setStats({
        totalProperties: propertiesData?.length || 0,
        activeListings,
        totalBookings: bookingsData?.length || 0,
        pendingBookings,
        totalEarnings,
        averageRating: avgRating,
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const togglePropertyAvailability = async (propertyId: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('properties')
      .update({ is_available: !currentStatus })
      .eq('id', propertyId)

    if (error) {
      toast.error('Failed to update property')
    } else {
      toast.success('Property updated successfully')
      loadDashboardData()
    }
  }

  if (authLoading || loading || !isHost) {
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
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
                <p className="text-2xl font-bold text-gray-900">৳{stats.totalEarnings.toLocaleString()}</p>
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
                  {properties.slice(0, 5).map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {property.images?.[0] ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
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
                              property.is_approved
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {property.is_approved ? 'Approved' : 'Pending Approval'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              property.is_available
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {property.is_available ? 'Active' : 'Inactive'}
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
                          onClick={() => togglePropertyAvailability(property.id, property.is_available)}
                          className={`p-2 rounded-lg transition-colors ${
                            property.is_available
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {property.is_available ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
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

              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {booking.property.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-4 h-4" />
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                      <p className="text-sm font-medium text-brand-primary mt-2">
                        ৳{booking.total_price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="clay p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  href="/host/listings"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Building className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Manage Listings</span>
                </Link>
                <Link
                  href="/host/bookings"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Booking Management</span>
                </Link>
                <Link
                  href="/host/earnings"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Earnings Overview</span>
                </Link>
                <Link
                  href="/host/calendar"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Availability Calendar</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

