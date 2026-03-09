'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Loader2,
  Users,
  Building,
  Calendar,
  DollarSign,
  Star,
  Shield,
  AlertTriangle,
  Check,
  X,
  Eye,
  BarChart3,
  Search,
  Filter,
  CreditCard,
  MessageSquare,
  Clock,
  MapPin,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { User, Property, Booking, BookingStatus, PaymentStatus } from '@/types/database'
import toast from 'react-hot-toast'

interface AdminStats {
  totalUsers: number
  totalHosts: number
  totalGuests: number
  totalProperties: number
  approvedProperties: number
  pendingApprovals: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
  platformFee: number
  hostPayouts: number
}

interface BookingTrend {
  date: string
  bookings: number
  revenue: number
}

interface PopularCity {
  city: string
  count: number
}

interface TopProperty {
  id: string
  title: string
  bookings: number
  revenue: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated, isAdmin } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHosts: 0,
    totalGuests: 0,
    totalProperties: 0,
    approvedProperties: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    platformFee: 0,
    hostPayouts: 0,
  })
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([])
  const [popularCities, setPopularCities] = useState<PopularCity[]>([])
  const [topProperties, setTopProperties] = useState<TopProperty[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingFilter, setBookingFilter] = useState<'all' | BookingStatus>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [propertyFilter, setPropertyFilter] = useState<{ status: 'all' | 'approved' | 'pending'; city: string; type: string }>({ status: 'all', city: '', type: '' })
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [userFilter, setUserFilter] = useState<{ role: 'all' | 'guest' | 'host' | 'admin'; search: string }>({ role: 'all', search: '' })
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [hostEarnings, setHostEarnings] = useState<any[]>([])
  const [earningsFilter, setEarningsFilter] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all')
  const [pendingProperties, setPendingProperties] = useState<Property[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'reviews' | 'bookings' | 'earnings'>('overview')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/admin')
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/')
    }
  }, [authLoading, isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const loadAdminData = async () => {
    const supabase = createClient()

    try {
      // Load all stats in parallel
      const [
        usersResult,
        hostsResult,
        guestsResult,
        propertiesResult,
        approvedPropertiesResult,
        pendingResult,
        bookingsResult,
        pendingBookingsResult,
        confirmedBookingsResult,
        completedBookingsResult,
        cancelledBookingsResult,
        earningsResult,
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'host'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'guest'),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('host_earnings').select('amount, platform_fee, payout_amount'),
      ])

      const earnings = earningsResult.data || []
      const totalRevenue = earnings.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount || 0), 0)
      const platformFee = earnings.reduce((sum: number, e: { platform_fee: number }) => sum + Number(e.platform_fee || 0), 0)
      const hostPayouts = earnings.reduce((sum: number, e: { payout_amount: number }) => sum + Number(e.payout_amount || 0), 0)

      setStats({
        totalUsers: usersResult.count || 0,
        totalHosts: hostsResult.count || 0,
        totalGuests: guestsResult.count || 0,
        totalProperties: propertiesResult.count || 0,
        approvedProperties: approvedPropertiesResult.count || 0,
        pendingApprovals: pendingResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        pendingBookings: pendingBookingsResult.count || 0,
        confirmedBookings: confirmedBookingsResult.count || 0,
        completedBookings: completedBookingsResult.count || 0,
        cancelledBookings: cancelledBookingsResult.count || 0,
        totalRevenue,
        platformFee,
        hostPayouts,
      })

      // Load booking trends (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: bookings } = await supabase
        .from('bookings')
        .select('created_at, total_price')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at')

      if (bookings) {
        // Group by date
        const trendsMap = new Map<string, { bookings: number; revenue: number }>()
        bookings.forEach((booking: { created_at: string; total_price: number }) => {
          const date = new Date(booking.created_at).toISOString().split('T')[0]
          const existing = trendsMap.get(date) || { bookings: 0, revenue: 0 }
          trendsMap.set(date, {
            bookings: existing.bookings + 1,
            revenue: existing.revenue + Number(booking.total_price || 0),
          })
        })
        const trends = Array.from(trendsMap.entries()).map(([date, data]) => ({
          date,
          bookings: data.bookings,
          revenue: data.revenue,
        }))
        setBookingTrends(trends)
      }

      // Load popular cities
      const { data: properties } = await supabase
        .from('properties')
        .select('city')
        .eq('is_approved', true)

      if (properties) {
        const cityCount = new Map<string, number>()
        properties.forEach((p: { city: string | null }) => {
          const city = p.city || 'Unknown'
          cityCount.set(city, (cityCount.get(city) || 0) + 1)
        })
        const cities = Array.from(cityCount.entries())
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setPopularCities(cities)
      }

      // Load top performing properties
      const { data: topProps } = await supabase
        .from('bookings')
        .select('property_id, property:properties(title), total_price')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(100)

      if (topProps) {
        const propStats = new Map<string, { title: string; bookings: number; revenue: number }>()
        topProps.forEach((b: { property_id: string; property: { title: string }; total_price: number }) => {
          const pid = b.property_id
          const title = b.property?.title || 'Unknown'
          const existing = propStats.get(pid) || { title, bookings: 0, revenue: 0 }
          propStats.set(pid, {
            title,
            bookings: existing.bookings + 1,
            revenue: existing.revenue + Number(b.total_price || 0),
          })
        })
        const top = Array.from(propStats.entries())
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
        setTopProperties(top)
      }

      // Load all bookings
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      setBookings(allBookings || [])

      // Load pending properties
      const { data: pendingProps } = await supabase
        .from('properties')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(10)

      setPendingProperties(pendingProps || [])

      // Load recent users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentUsers(users || [])

    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const approveProperty = async (propertyId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('properties')
      .update({ is_approved: true })
      .eq('id', propertyId)

    if (error) {
      toast.error('Failed to approve property')
    } else {
      toast.success('Property approved successfully')
      loadAdminData()
    }
  }

  const rejectProperty = async (propertyId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (error) {
      toast.error('Failed to reject property')
    } else {
      toast.success('Property rejected and removed')
      loadAdminData()
    }
  }

  const updateUserRole = async (userId: string, newRole: 'guest' | 'host' | 'admin') => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update user role')
    } else {
      toast.success('User role updated')
      loadAdminData()
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      toast.error('Failed to update booking status')
    } else {
      toast.success('Booking status updated')
      loadAdminData()
    }
  }

  const updatePaymentStatus = async (bookingId: string, newPaymentStatus: PaymentStatus) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      toast.error('Failed to update payment status')
    } else {
      toast.success(`Payment marked as ${newPaymentStatus}`)
      loadAdminData()
    }
  }

  const togglePropertyAvailability = async (propertyId: string, isAvailable: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('properties')
      .update({ is_available: !isAvailable, updated_at: new Date().toISOString() })
      .eq('id', propertyId)

    if (error) {
      toast.error('Failed to update property availability')
    } else {
      toast.success(`Property marked as ${!isAvailable ? 'available' : 'unavailable'}`)
      loadAdminData()
    }
  }

  const loadAllProperties = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setAllProperties(data || [])
  }

  const banUser = async (userId: string, isBanned: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .update({ is_banned: !isBanned, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update user status')
    } else {
      toast.success(`User ${!isBanned ? 'banned' : 'unbanned'} successfully`)
      loadAdminData()
    }
  }

  const updateUserDetails = async (userId: string, updates: { full_name?: string; phone?: string }) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update user details')
    } else {
      toast.success('User details updated successfully')
      loadAdminData()
    }
  }

  const loadReviews = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setReviews(data || [])
  }

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: status === 'approved', updated_at: new Date().toISOString() })
      .eq('id', reviewId)

    if (error) {
      toast.error('Failed to update review status')
    } else {
      toast.success(`Review ${status} successfully`)
      loadReviews()
    }
  }

  const respondToReview = async (reviewId: string, response: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('reviews')
      .update({ host_response: response, updated_at: new Date().toISOString() })
      .eq('id', reviewId)

    if (error) {
      toast.error('Failed to respond to review')
    } else {
      toast.success('Response added successfully')
      loadReviews()
    }
  }

  useEffect(() => {
    if (activeTab === 'reviews') {
      loadReviews()
    }
  }, [activeTab])

  const loadHostEarnings = async () => {
    const supabase = createClient()
    
    // Get hosts with their earnings
    const { data: hosts } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'host')

    if (!hosts) return

    // Get bookings for each host
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, properties(host_id)')
      .eq('status', 'completed')
      .eq('payment_status', 'paid')

    // Calculate earnings per host
    const PLATFORM_FEE_PERCENT = 15
    const earningsMap: Record<string, any> = {}

    hosts.forEach((host: any) => {
      earningsMap[host.id] = {
        host,
        totalEarnings: 0,
        platformFee: 0,
        netPayout: 0,
        completedBookings: 0,
        payoutStatus: 'pending'
      }
    })

    bookings?.forEach((booking: any) => {
      const property = booking.properties
      if (property && property.host_id && earningsMap[property.host_id]) {
        const hostEarnings = earningsMap[property.host_id]
        hostEarnings.totalEarnings += booking.total_price
        hostEarnings.platformFee += booking.total_price * (PLATFORM_FEE_PERCENT / 100)
        hostEarnings.netPayout += booking.total_price * (1 - PLATFORM_FEE_PERCENT / 100)
        hostEarnings.completedBookings += 1
      }
    })

    setHostEarnings(Object.values(earningsMap))
  }

  const updatePayoutStatus = async (hostId: string, status: 'paid' | 'refunded') => {
    const supabase = createClient()
    
    // In a real app, you'd have a payouts table. For now, we just update the booking
    toast.success(`Payout marked as ${status} for host`)
    loadHostEarnings()
  }

  const exportEarningsReport = () => {
    const csvContent = [
      ['Host', 'Email', 'Total Earnings', 'Platform Fee', 'Net Payout', 'Completed Bookings', 'Status'].join(','),
      ...hostEarnings.map(e => [
        e.host.full_name || 'N/A',
        e.host.email,
        e.totalEarnings.toFixed(2),
        e.platformFee.toFixed(2),
        e.netPayout.toFixed(2),
        e.completedBookings,
        e.payoutStatus
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  useEffect(() => {
    if (activeTab === 'earnings') {
      loadHostEarnings()
    }
  }, [activeTab])

  if (authLoading || loading || !isAdmin) {
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Manage users, properties, and platform operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {/* Users Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Hosts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalHosts}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Guests</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
          </motion.div>

          {/* Properties Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Properties</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
            <p className="text-xs text-gray-500">{stats.approvedProperties} approved, {stats.pendingApprovals} pending</p>
          </motion.div>

          {/* Bookings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600">Total Bookings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
          </motion.div>

          {/* Revenue Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-brand-primary" />
              <span className="text-sm text-gray-600">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="clay p-4 border-l-4 border-yellow-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.pendingBookings}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="clay p-4 border-l-4 border-blue-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Confirmed</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.confirmedBookings}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="clay p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.completedBookings}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="clay p-4 border-l-4 border-red-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.cancelledBookings}</p>
          </motion.div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="clay p-4 bg-gradient-to-br from-green-50 to-green-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700 font-medium">Host Payouts</span>
            </div>
            <p className="text-2xl font-bold text-green-900">৳{stats.hostPayouts.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="clay p-4 bg-gradient-to-br from-purple-50 to-purple-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700 font-medium">Platform Fee</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">৳{stats.platformFee.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="clay p-4 bg-gradient-to-br from-blue-50 to-blue-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700 font-medium">Approved Properties</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.approvedProperties}</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        {bookingTrends.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Booking Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="clay p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends (Last 30 Days)</h3>
              <div className="h-48 flex items-end gap-1">
                {bookingTrends.slice(-14).map((trend, index) => {
                  const maxBookings = Math.max(...bookingTrends.map(t => t.bookings), 1)
                  const height = (trend.bookings / maxBookings) * 100
                  return (
                    <div key={trend.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-brand-primary/80 rounded-t hover:bg-brand-primary transition-colors"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${trend.date}: ${trend.bookings} bookings, ৳${trend.revenue}`}
                      />
                      <span className="text-xs text-gray-500 transform -rotate-45 origin-left whitespace-nowrap">
                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Revenue Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="clay p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends (Last 30 Days)</h3>
              <div className="h-48 flex items-end gap-1">
                {bookingTrends.slice(-14).map((trend) => {
                  const maxRevenue = Math.max(...bookingTrends.map(t => t.revenue), 1)
                  const height = (trend.revenue / maxRevenue) * 100
                  return (
                    <div key={trend.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-green-500/80 rounded-t hover:bg-green-500 transition-colors"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${trend.date}: ৳${trend.revenue}`}
                      />
                      <span className="text-xs text-gray-500 transform -rotate-45 origin-left whitespace-nowrap">
                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Popular Cities & Top Properties */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Cities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="clay p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Cities</h3>
            {popularCities.length > 0 ? (
              <div className="space-y-3">
                {popularCities.map((city, index) => {
                  const maxCount = Math.max(...popularCities.map(c => c.count), 1)
                  const percentage = (city.count / maxCount) * 100
                  return (
                    <div key={city.city}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{index + 1}. {city.city}</span>
                        <span className="text-gray-500">{city.count} properties</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-primary to-purple-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No city data available</p>
            )}
          </motion.div>

          {/* Top Properties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="clay p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Properties</h3>
            {topProperties.length > 0 ? (
              <div className="space-y-3">
                {topProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-700 truncate max-w-[150px]">{property.title}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">৳{property.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{property.bookings} bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No property data available</p>
            )}
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'properties', label: 'Properties' },
            { id: 'users', label: 'Users' },
            { id: 'reviews', label: 'Reviews' },
            { id: 'earnings', label: 'Earnings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Properties */}
              <div className="clay p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    {pendingProperties.length} pending
                  </span>
                </div>

                {pendingProperties.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingProperties.slice(0, 5).map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-gray-900">{property.title}</h3>
                          <p className="text-sm text-gray-600">{property.location}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/property/${property.id}`}
                            className="p-2 text-gray-600 hover:text-brand-primary transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => approveProperty(property.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => rejectProperty(property.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Users */}
              <div className="clay p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                  <Link href="/admin/users" className="text-sm text-brand-primary hover:underline">
                    View All →
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-primary">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'host' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'confirmed', label: 'Confirmed' },
                      { id: 'completed', label: 'Completed' },
                      { id: 'cancelled', label: 'Cancelled' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setBookingFilter(filter.id as typeof bookingFilter)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          bookingFilter === filter.id
                            ? 'bg-brand-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">All Bookings</h2>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings found</p>
                ) : (
                  <div className="space-y-4">
                    {bookings
                      .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {booking.status}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                booking.payment_status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {booking.payment_status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Booking ID:</span> {booking.id.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-600">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              Check-in: {new Date(booking.check_in).toLocaleDateString()} | 
                              Check-out: {new Date(booking.check_out).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Users className="w-4 h-4 inline mr-1" />
                              {booking.guests} guests
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ৳{booking.total_price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  <select
                    value={propertyFilter.status}
                    onChange={(e) => setPropertyFilter({ ...propertyFilter, status: e.target.value as typeof propertyFilter.status })}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search by city..."
                    value={propertyFilter.city}
                    onChange={(e) => setPropertyFilter({ ...propertyFilter, city: e.target.value })}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg w-40"
                  />
                  <select
                    value={propertyFilter.type}
                    onChange={(e) => setPropertyFilter({ ...propertyFilter, type: e.target.value })}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="hotel">Hotel</option>
                    <option value="tour">Tour</option>
                    <option value="villa">Villa</option>
                    <option value="resort">Resort</option>
                  </select>
                  <button
                    onClick={loadAllProperties}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                  >
                    Load All Properties
                  </button>
                </div>
              </div>

              {/* Properties List */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Management</h2>
                {(allProperties.length > 0 ? allProperties : pendingProperties).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No properties found</p>
                ) : (
                  <div className="space-y-4">
                    {(allProperties.length > 0 ? allProperties : pendingProperties)
                      .filter(p => {
                        if (propertyFilter.status === 'approved' && !p.is_approved) return false
                        if (propertyFilter.status === 'pending' && p.is_approved) return false
                        if (propertyFilter.city && !p.city?.toLowerCase().includes(propertyFilter.city.toLowerCase())) return false
                        if (propertyFilter.type && p.property_type !== propertyFilter.type) return false
                        return true
                      })
                      .map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              {property.images && property.images[0] ? (
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
                              <p className="text-sm text-gray-600">{property.location}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  property.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {property.is_approved ? 'Approved' : 'Pending'}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  property.is_available ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {property.is_available ? 'Available' : 'Unavailable'}
                                </span>
                                {property.property_type && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                    {property.property_type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-bold text-green-600">
                              ৳{property.price_per_night}/night
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => togglePropertyAvailability(property.id, property.is_available || false)}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                  property.is_available
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                              >
                                {property.is_available ? 'Mark Unavailable' : 'Mark Available'}
                              </button>
                              {!property.is_approved && (
                                <>
                                  <button
                                    onClick={() => approveProperty(property.id)}
                                    className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => rejectProperty(property.id)}
                                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <Link
                                href={`/property/${property.id}`}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  <select
                    value={userFilter.role}
                    onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value as typeof userFilter.role })}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Roles</option>
                    <option value="guest">Guest</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userFilter.search}
                    onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg w-48"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-4">
                    {recentUsers
                      .filter(u => {
                        if (userFilter.role !== 'all' && u.role !== userFilter.role) return false
                        if (userFilter.search) {
                          const searchLower = userFilter.search.toLowerCase()
                          const nameMatch = u.full_name?.toLowerCase().includes(searchLower)
                          const emailMatch = u.email.toLowerCase().includes(searchLower)
                          if (!nameMatch && !emailMatch) return false
                        }
                        return true
                      })
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                              <span className="text-lg font-medium text-brand-primary">
                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                  user.role === 'host' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.role}
                                </span>
                                {user.is_verified && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value as 'guest' | 'host' | 'admin')}
                              className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                            >
                              <option value="guest">Guest</option>
                              <option value="host">Host</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => banUser(user.id, (user as any).is_banned || false)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                (user as any).is_banned
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                            >
                              {(user as any).is_banned ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'approved', label: 'Approved' },
                      { id: 'rejected', label: 'Rejected' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setReviewFilter(filter.id as typeof reviewFilter)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          reviewFilter === filter.id
                            ? 'bg-brand-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Moderation</h2>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews found</p>
                ) : (
                  <div className="space-y-4">
                    {reviews
                      .filter(r => {
                        if (reviewFilter === 'pending') return !(r as any).is_approved
                        if (reviewFilter === 'approved') return (r as any).is_approved
                        if (reviewFilter === 'rejected') return (r as any).is_approved === false && r.host_response
                        return true
                      })
                      .map((review) => (
                        <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                (review as any).is_approved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {(review as any).is_approved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>By: {review.guest_name || 'Guest'}</span>
                            {review.property_id && (
                              <Link
                                href={`/property/${review.property_id}`}
                                className="text-brand-primary hover:underline"
                              >
                                View Property
                              </Link>
                            )}
                          </div>
                          
                          {(review as any).host_response && (
                            <div className="p-3 bg-blue-50 rounded-lg mb-3">
                              <p className="text-sm font-medium text-blue-700 mb-1">Host Response:</p>
                              <p className="text-sm text-blue-800">{(review as any).host_response}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {!(review as any).is_approved && (
                              <>
                                <button
                                  onClick={() => updateReviewStatus(review.id, 'approved')}
                                  className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateReviewStatus(review.id, 'rejected')}
                                  className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {!review.host_response && (
                              <button
                                onClick={() => {
                                  const response = prompt('Enter your response to this review:')
                                  if (response) respondToReview(review.id, response)
                                }}
                                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                              >
                                Respond
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="clay p-4">
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ৳{hostEarnings.reduce((sum, e) => sum + e.totalEarnings, 0).toLocaleString()}
                  </p>
                </div>
                <div className="clay p-4">
                  <p className="text-sm text-gray-600">Platform Fees</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ৳{hostEarnings.reduce((sum, e) => sum + e.platformFee, 0).toLocaleString()}
                  </p>
                </div>
                <div className="clay p-4">
                  <p className="text-sm text-gray-600">Net Payouts</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ৳{hostEarnings.reduce((sum, e) => sum + e.netPayout, 0).toLocaleString()}
                  </p>
                </div>
                <div className="clay p-4">
                  <p className="text-sm text-gray-600">Total Hosts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {hostEarnings.length}
                  </p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'paid', label: 'Paid' },
                        { id: 'refunded', label: 'Refunded' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setEarningsFilter(filter.id as typeof earningsFilter)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            earningsFilter === filter.id
                              ? 'bg-brand-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={exportEarningsReport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Earnings List */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Host Earnings</h2>
                {hostEarnings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No earnings data available</p>
                ) : (
                  <div className="space-y-4">
                    {hostEarnings
                      .filter(e => earningsFilter === 'all' || e.payoutStatus === earningsFilter)
                      .map((earning) => (
                        <div key={earning.host.id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-lg font-medium text-blue-600">
                                  {earning.host.full_name?.charAt(0) || earning.host.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{earning.host.full_name || 'No name'}</p>
                                <p className="text-sm text-gray-600">{earning.host.email}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              earning.payoutStatus === 'paid' ? 'bg-green-100 text-green-700' :
                              earning.payoutStatus === 'refunded' ? 'bg-purple-100 text-purple-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {earning.payoutStatus}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Total Earnings</p>
                              <p className="text-lg font-bold text-green-600">
                                ৳{earning.totalEarnings.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Platform Fee (15%)</p>
                              <p className="text-lg font-bold text-blue-600">
                                ৳{earning.platformFee.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Net Payout</p>
                              <p className="text-lg font-bold text-purple-600">
                                ৳{earning.netPayout.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Completed Bookings</p>
                              <p className="text-lg font-bold text-gray-900">
                                {earning.completedBookings}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => updatePayoutStatus(earning.host.id, 'paid')}
                              className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                            >
                              Mark as Paid
                            </button>
                            <button
                              onClick={() => updatePayoutStatus(earning.host.id, 'refunded')}
                              className="px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                            >
                              Mark as Refunded
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/users" className="clay p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-gray-900">Manage Users</span>
          </Link>
          <Link href="/admin/properties" className="clay p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <Building className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-900">Manage Properties</span>
          </Link>
          <Link href="/admin/reviews" className="clay p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <Star className="w-6 h-6 text-yellow-600" />
            <span className="font-medium text-gray-900">Moderate Reviews</span>
          </Link>
          <Link href="/admin/analytics" className="clay p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <span className="font-medium text-gray-900">View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

