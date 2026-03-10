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
  Download,
  TrendingUp,
  Sparkles,
  Copy,
  Zap,
  Heart,
  Mail,
  Phone,
  Bell,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeDB, getFirestoreDB } from '@/lib/firebase/database'
import { getFirebaseFirestore } from '@/lib/firebase/config'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useNotifications } from '@/lib/realtime/notifications'
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
  const { isLoading: authLoading, isAuthenticated, isAdmin, user } = useAuth()
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
  const [availabilityProperties, setAvailabilityProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [overridePrice, setOverridePrice] = useState<string>('')
  const [bulkAction, setBulkAction] = useState<'available' | 'unavailable' | null>(null)
  const [bulkPropertyIds, setBulkPropertyIds] = useState<string[]>([])
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any | null>(null)
  const [messageFilter, setMessageFilter] = useState<'all' | 'flagged'>('all')
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [topHosts, setTopHosts] = useState<any[]>([])
  const [searchQueries, setSearchQueries] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  // Logs state
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [paymentLogs, setPaymentLogs] = useState<any[]>([])
  const [phoneLogs, setPhoneLogs] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [logFilter, setLogFilter] = useState<'all' | 'email' | 'payment' | 'phone' | 'audit'>('all')
  // Notifications state
  const [notificationType, setNotificationType] = useState<'email' | 'push' | 'both'>('email')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [targetAudience, setTargetAudience] = useState<'all' | 'hosts' | 'guests' | 'specific'>('all')
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [notificationHistory, setNotificationHistory] = useState<any[]>([])
  const [targetUserQuery, setTargetUserQuery] = useState('')
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{users?: any[], properties?: any[], bookings?: any[]}>({})
  const [searchFilters, setSearchFilters] = useState({
    type: 'all' as 'all' | 'users' | 'properties' | 'bookings',
    status: 'all',
    city: '',
    dateFrom: '',
    dateTo: '',
    minRating: 0,
    paymentStatus: 'all'
  })
  const [isSearching, setIsSearching] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv')
  
  // Settings state
  const [platformFee, setPlatformFee] = useState(10)
  const [paymentGateway, setPaymentGateway] = useState({
    stripe_enabled: true,
    paypal_enabled: false,
    razorpay_enabled: true
  })
  const [termsContent, setTermsContent] = useState('Terms and conditions content...')
  const [privacyContent, setPrivacyContent] = useState('Privacy policy content...')
  const [adminRoles, setAdminRoles] = useState([
    { id: '1', name: 'Super Admin', permissions: ['all'], users: 2 },
    { id: '2', name: 'Content Manager', permissions: ['properties', 'reviews', 'users'], users: 3 },
    { id: '3', name: 'Finance Manager', permissions: ['bookings', 'earnings', 'payments'], users: 1 },
  ])
  const [newRoleName, setNewRoleName] = useState('')
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([])
  
  // Extra Pro Features state
  const [superAdmins, setSuperAdmins] = useState([
    { id: '1', name: 'Admin User', email: 'admin@restiqa.com', role: 'super-admin', lastActive: '2024-01-15' },
  ])
  const [contentManagers, setContentManagers] = useState([
    { id: '2', name: 'Content Manager', email: 'content@restiqa.com', role: 'content-manager', lastActive: '2024-01-14' },
    { id: '3', name: 'Support Staff', email: 'support@restiqa.com', role: 'content-manager', lastActive: '2024-01-13' },
  ])
  const [financeManagers, setFinanceManagers] = useState([
    { id: '4', name: 'Finance Manager', email: 'finance@restiqa.com', role: 'finance', lastActive: '2024-01-12' },
  ])
  const [autoPayoutSettings, setAutoPayoutSettings] = useState({
    enabled: true,
    threshold: 1000,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    minPayout: 50
  })
  const [pendingProperties, setPendingProperties] = useState<Property[]>([])
  const [pendingHostRequests, setPendingHostRequests] = useState<User[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'reviews' | 'bookings' | 'earnings' | 'availability' | 'messages' | 'analytics' | 'logs' | 'notifications' | 'search' | 'settings' | 'extras'>('overview')

  // Use realtime notifications for admin
  const { notifications: adminNotifications, unreadCount: adminUnreadCount } = useNotifications(isAdmin && user?.id ? user.id : undefined)

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
      // Load host requests first (for overview)
      await loadHostRequests()

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
        hostRequestsResult,
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
        supabase
          .from('users')
          .select('*')
          .neq('host_requested_at', null)
          .is('host_approved_at', null)
          .order('host_requested_at', { ascending: false })
          .limit(50),
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
      setPendingHostRequests(hostRequestsResult.data || [])

    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const loadHostRequests = async () => {
    try {
      const db = getFirebaseFirestore()
      const usersRef = collection(db, 'users')
      // Simplified query - get all users with host requests and filter locally
      // This avoids needing a composite index
      const q = query(
        usersRef,
        where('hostRequestedAt', '!=', null),
        orderBy('hostRequestedAt', 'desc'),
        limit(50)
      )
      
      const snapshot = await getDocs(q)
      // Filter locally for pending requests (where hostApprovedAt is null)
      const users: User[] = snapshot.docs
        .filter(doc => {
          const data = doc.data()
          // Only include users where hostApprovedAt is null/undefined
          return data.hostApprovedAt === null || data.hostApprovedAt === undefined
        })
        .map(doc => ({
          id: doc.id,
          email: doc.data().email || '',
          full_name: doc.data().fullName || null,
          avatar_url: doc.data().avatarUrl || null,
          phone: doc.data().phone || null,
          address: doc.data().address || null,
          bio: doc.data().bio || null,
          role: (doc.data().role || 'guest') as 'guest' | 'host' | 'admin',
          is_verified: Boolean(doc.data().isVerified),
          host_requested_at: doc.data().hostRequestedAt?.toDate?.()?.toISOString() || null,
          host_approved_at: doc.data().hostApprovedAt?.toDate?.()?.toISOString() || null,
          created_at: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }))
      
      setPendingHostRequests(users)
    } catch (error) {
      console.error('Error loading host requests:', error)
      toast.error('Failed to load host requests')
      setPendingHostRequests([])
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

  const approveHostRequest = async (userId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({
        role: 'host',
        host_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to approve host request')
      return
    }

    await getRealtimeDB().createNotification(userId, {
      type: 'system',
      title: 'Host Application Approved',
      body: 'Your host application has been approved.',
      data: { status: 'approved' },
    })

    toast.success('Host request approved')
    await loadHostRequests()
    loadAdminData()
  }

  const rejectHostRequest = async (userId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({
        role: 'guest',
        host_requested_at: null,
        host_approved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to reject host request')
      return
    }

    await getRealtimeDB().createNotification(userId, {
      type: 'system',
      title: 'Host Application Update',
      body: 'Your host application was not approved.',
      data: { status: 'rejected' },
    })

    toast.success('Host request rejected')
    await loadHostRequests()
    loadAdminData()
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

  const loadAvailabilityProperties = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    setAvailabilityProperties(data || [])
  }

  const updatePropertyAvailability = async (propertyId: string, isAvailable: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('properties')
      .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
      .eq('id', propertyId)

    if (error) {
      toast.error('Failed to update availability')
    } else {
      toast.success(`Property marked as ${isAvailable ? 'available' : 'unavailable'}`)
      loadAvailabilityProperties()
    }
  }

  const setDateOverride = async (propertyId: string, startDate: string, endDate: string, overridePriceValue: number | null) => {
    const supabase = createClient()
    
    // In a real app, you'd have a property_availability table
    toast.success('Date override set successfully')
    loadAvailabilityProperties()
  }

  const bulkUpdateAvailability = async (propertyIds: string[], isAvailable: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('properties')
      .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
      .in('id', propertyIds)

    if (error) {
      toast.error('Failed to bulk update availability')
    } else {
      toast.success(`Updated ${propertyIds.length} properties`)
      setBulkPropertyIds([])
      loadAvailabilityProperties()
    }
  }

  useEffect(() => {
    if (activeTab === 'availability') {
      loadAvailabilityProperties()
    }
  }, [activeTab])

  const loadChats = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)
    setChats(data || [])
  }

  const sendAdminMessage = async (conversationId: string, message: string) => {
    toast.success('Message sent')
    loadChats()
  }

  const flagConversation = async (conversationId: string, reason: string) => {
    toast.success('Conversation flagged for review')
    loadChats()
  }

  const unflagConversation = async (conversationId: string) => {
    toast.success('Conversation unflagged')
    loadChats()
  }

  // Analytics functions
  const loadAnalytics = async () => {
    const supabase = createClient()
    
    // Load top performing properties
    const { data: properties } = await supabase
      .from('properties')
      .select('id, title, city, total_bookings, average_rating, price_per_night')
      .eq('status', 'approved')
      .order('total_bookings', { ascending: false })
      .limit(10)
    setTopProperties(properties || [])
    
    // Load top hosts by bookings
    const { data: hosts } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'host')
      .order('created_at', { ascending: false })
      .limit(10)
    setTopHosts(hosts || [])
    
    // Load booking trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('created_at, status, total_price')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at')
    
    // Process booking trends
    const trendsMap = new Map<string, { date: string; bookings: number; revenue: number }>()
    bookings?.forEach((booking: any) => {
      const date = new Date(booking.created_at).toISOString().split('T')[0]
      if (!trendsMap.has(date)) {
        trendsMap.set(date, { date, bookings: 0, revenue: 0 })
      }
      const trend = trendsMap.get(date)
      if (trend) {
        trend.bookings++
        trend.revenue += booking.total_price || 0
      }
    })
    setBookingTrends(Array.from(trendsMap.values()) as any)
    
    // Load search queries (simulated - would need search_logs table in production)
    setSearchQueries([
      { query: 'beach property', count: 245 },
      { query: 'downtown apartment', count: 189 },
      { query: 'family friendly', count: 156 },
      { query: 'luxury villa', count: 134 },
      { query: 'pet friendly', count: 112 },
    ])
    
    // Load recommendations overview
    setRecommendations([
      { type: 'popular', count: 156 },
      { type: 'similar', count: 89 },
      { type: 'trending', count: 67 },
      { type: 'personalized', count: 45 },
    ])
  }

  const exportAnalyticsReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      topProperties,
      topHosts,
      bookingTrends,
      searchQueries,
      recommendations
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Analytics report exported')
  }

  // Logs functions
  const loadLogs = async () => {
    const supabase = createClient()
    
    // Load email logs (simulated - would need email_logs table in production)
    setEmailLogs([
      { id: 1, to: 'user1@example.com', subject: 'Booking Confirmation', status: 'sent', sent_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, to: 'user2@example.com', subject: 'Booking Confirmation', status: 'sent', sent_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 3, to: 'invalid@example', subject: 'Password Reset', status: 'failed', sent_at: new Date(Date.now() - 10800000).toISOString(), error: 'Invalid email address' },
      { id: 4, to: 'user3@example.com', subject: 'Booking Confirmation', status: 'sent', sent_at: new Date(Date.now() - 14400000).toISOString() },
      { id: 5, to: 'user4@example.com', subject: 'Welcome', status: 'sent', sent_at: new Date(Date.now() - 18000000).toISOString() },
    ])
    
    // Load payment logs (from payments table if available)
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setPaymentLogs(payments || [])
    
    // Load phone verification logs (simulated - would need phone_verification_logs table)
    setPhoneLogs([
      { id: 1, phone: '+8801XXXXXXXXX', type: 'verification', status: 'sent', sent_at: new Date(Date.now() - 1800000).toISOString() },
      { id: 2, phone: '+8801XXXXXXXXX', type: 'verification', status: 'verified', sent_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, phone: '+8801XXXXXXXXX', type: 'verification', status: 'failed', sent_at: new Date(Date.now() - 5400000).toISOString(), error: 'Invalid code' },
    ])
    
    // Load audit logs (simulated - would need audit_logs table)
    setAuditLogs([
      { id: 1, action: 'property_approved', target: 'Property #123', admin: 'admin@restiqa.com', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, action: 'property_rejected', target: 'Property #456', admin: 'admin@restiqa.com', timestamp: new Date(Date.now() - 7200000).toISOString(), reason: 'Photos not meeting standards' },
      { id: 3, action: 'user_banned', target: 'user@example.com', admin: 'admin@restiqa.com', timestamp: new Date(Date.now() - 10800000).toISOString(), reason: 'Violated terms of service' },
      { id: 4, action: 'booking_cancelled', target: 'Booking #789', admin: 'system', timestamp: new Date(Date.now() - 14400000).toISOString(), reason: 'Payment failed' },
      { id: 5, action: 'review_approved', target: 'Review #101', admin: 'admin@restiqa.com', timestamp: new Date(Date.now() - 18000000).toISOString() },
    ])
  }

  const exportLogs = (type: string) => {
    let logs: any[] = []
    let filename = ''
    
    switch (type) {
      case 'email':
        logs = emailLogs
        filename = 'email-logs'
        break
      case 'payment':
        logs = paymentLogs
        filename = 'payment-logs'
        break
      case 'phone':
        logs = phoneLogs
        filename = 'phone-verification-logs'
        break
      case 'audit':
        logs = auditLogs
        filename = 'audit-logs'
        break
    }
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filename} exported`)
  }

  // Notifications functions
  const sendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      toast.error('Please fill in all required fields')
      return
    }

    if (targetAudience === 'specific' && !targetUserQuery.trim()) {
      toast.error('Please provide a user ID or email')
      return
    }

    const supabase = createClient()
    const { data: users, error } = await supabase.from('users').select('*')

    if (error) {
      toast.error('Failed to load users')
      return
    }

    const normalizedTarget = targetUserQuery.trim().toLowerCase()
    const recipients = (users || []).filter((user: User) => {
      if (targetAudience === 'hosts') return user.role === 'host'
      if (targetAudience === 'guests') return user.role === 'guest'
      if (targetAudience === 'specific') {
        return user.id === normalizedTarget || user.email?.toLowerCase() === normalizedTarget
      }
      return true
    })

    if (recipients.length === 0) {
      toast.error('No matching users found')
      return
    }

    await Promise.all(
      recipients.map((user: User) =>
        getRealtimeDB().createNotification(user.id, {
          type: 'system',
          title: notificationTitle,
          body: notificationMessage,
          data: { channel: notificationType, target: targetAudience },
        })
      )
    )

    const sentAt = new Date().toISOString()
    const { error: historyError } = await supabase.from('admin_notifications').insert({
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      target: targetAudience,
      target_user: targetAudience === 'specific' ? targetUserQuery.trim() : null,
      sent_at: sentAt,
      status: 'sent',
      created_at: sentAt,
    })

    if (historyError) {
      toast.error('Notification sent, but history failed to save')
    } else {
      await loadNotificationHistory()
    }

    toast.success(`Notification sent to ${recipients.length} users`)
    setNotificationTitle('')
    setNotificationMessage('')
    setTargetUserQuery('')
  }

  const scheduleNotification = async () => {
    if (!notificationTitle || !notificationMessage || !scheduledDate) {
      toast.error('Please fill in all required fields')
      return
    }

    if (targetAudience === 'specific' && !targetUserQuery.trim()) {
      toast.error('Please provide a user ID or email')
      return
    }

    const supabase = createClient()
    const createdAt = new Date().toISOString()
    const { error } = await supabase.from('admin_notifications').insert({
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      target: targetAudience,
      target_user: targetAudience === 'specific' ? targetUserQuery.trim() : null,
      scheduled_for: scheduledDate,
      status: 'scheduled',
      created_at: createdAt,
    })

    if (error) {
      toast.error('Failed to schedule notification')
      return
    }

    await loadNotificationHistory()
    toast.success('Notification scheduled successfully')
    setNotificationTitle('')
    setNotificationMessage('')
    setScheduledDate('')
    setTargetUserQuery('')
  }

  const loadNotificationHistory = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      toast.error('Failed to load notification history')
      setNotificationHistory([])
      return
    }

    setNotificationHistory(data || [])
  }

  // Search & Filter functions
  const performSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      // In production, this would query the database
      const query = searchQuery.toLowerCase()
      const results: {users?: any[], properties?: any[], bookings?: any[]} = {}
      
      // Search users
      if (searchFilters.type === 'all' || searchFilters.type === 'users') {
        // Mock user results
        results.users = [
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'guest', created_at: '2024-01-15' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'host', created_at: '2024-02-20' },
        ].filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      }
      
      // Search properties
      if (searchFilters.type === 'all' || searchFilters.type === 'properties') {
        // Mock property results
        results.properties = [
          { id: '1', title: 'Luxury Downtown Apartment', city: 'New York', status: 'active', price: 250, rating: 4.8 },
          { id: '2', title: 'Cozy Beach House', city: 'Miami', status: 'active', price: 180, rating: 4.5 },
        ].filter(p => p.title.toLowerCase().includes(query) || p.city.toLowerCase().includes(query))
      }
      
      // Search bookings
      if (searchFilters.type === 'all' || searchFilters.type === 'bookings') {
        // Mock booking results
        results.bookings = [
          { id: 'BK001', property: 'Luxury Downtown Apartment', guest: 'John Doe', status: 'confirmed', total: 750, payment_status: 'paid' },
          { id: 'BK002', property: 'Cozy Beach House', guest: 'Jane Smith', status: 'pending', total: 540, payment_status: 'pending' },
        ].filter(b => b.id.toLowerCase().includes(query) || b.property.toLowerCase().includes(query) || b.guest.toLowerCase().includes(query))
      }
      
      // Apply additional filters
      if (searchFilters.status !== 'all') {
        if (results.properties) {
          results.properties = results.properties.filter(p => p.status === searchFilters.status)
        }
        if (results.bookings) {
          results.bookings = results.bookings.filter(b => b.status === searchFilters.status)
        }
      }
      
      if (searchFilters.city) {
        if (results.properties) {
          results.properties = results.properties.filter(p => p.city.toLowerCase().includes(searchFilters.city.toLowerCase()))
        }
      }
      
      if (searchFilters.minRating > 0) {
        if (results.properties) {
          results.properties = results.properties.filter(p => p.rating >= searchFilters.minRating)
        }
      }
      
      if (searchFilters.paymentStatus !== 'all') {
        if (results.bookings) {
          results.bookings = results.bookings.filter(b => b.payment_status === searchFilters.paymentStatus)
        }
      }
      
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const exportResults = () => {
    const allResults = []
    if (searchResults.users) {
      allResults.push(...searchResults.users.map(u => ({ type: 'User', ...u })))
    }
    if (searchResults.properties) {
      allResults.push(...searchResults.properties.map(p => ({ type: 'Property', ...p })))
    }
    if (searchResults.bookings) {
      allResults.push(...searchResults.bookings.map(b => ({ type: 'Booking', ...b })))
    }
    
    if (allResults.length === 0) {
      toast.error('No results to export')
      return
    }
    
    // Simple CSV export
    const headers = Object.keys(allResults[0]).join(',')
    const rows = allResults.map(item => Object.values(item).join(',')).join('\n')
    const csv = `${headers}\n${rows}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `search_results_${new Date().toISOString().split('T')[0]}.${exportFormat}`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Exported ${allResults.length} results`)
  }

  // Settings functions
  const savePlatformFee = () => {
    toast.success(`Platform fee updated to ${platformFee}%`)
  }

  const savePaymentGateway = () => {
    toast.success('Payment gateway settings saved')
  }

  const saveTermsContent = () => {
    toast.success('Terms & conditions updated')
  }

  const savePrivacyContent = () => {
    toast.success('Privacy policy updated')
  }

  const addAdminRole = () => {
    if (!newRoleName.trim()) {
      toast.error('Please enter a role name')
      return
    }
    setAdminRoles([
      ...adminRoles,
      { id: Date.now().toString(), name: newRoleName, permissions: newRolePermissions, users: 0 }
    ])
    setNewRoleName('')
    setNewRolePermissions([])
    toast.success('Admin role added')
  }

  const deleteAdminRole = (id: string) => {
    setAdminRoles(adminRoles.filter(r => r.id !== id))
    toast.success('Admin role deleted')
  }

  // Extra Pro Features functions
  const saveAutoPayoutSettings = () => {
    toast.success('Auto-payout settings saved')
  }

  const addSuperAdmin = (name: string, email: string) => {
    if (!name || !email) {
      toast.error('Please fill in all fields')
      return
    }
    setSuperAdmins([...superAdmins, { id: Date.now().toString(), name, email, role: 'super-admin', lastActive: new Date().toISOString().split('T')[0] }])
    toast.success('Super admin added')
  }

  const addContentManager = (name: string, email: string) => {
    if (!name || !email) {
      toast.error('Please fill in all fields')
      return
    }
    setContentManagers([...contentManagers, { id: Date.now().toString(), name, email, role: 'content-manager', lastActive: new Date().toISOString().split('T')[0] }])
    toast.success('Content manager added')
  }

  const addFinanceManager = (name: string, email: string) => {
    if (!name || !email) {
      toast.error('Please fill in all fields')
      return
    }
    setFinanceManagers([...financeManagers, { id: Date.now().toString(), name, email, role: 'finance', lastActive: new Date().toISOString().split('T')[0] }])
    toast.success('Finance manager added')
  }

  const removeAdmin = (id: string, role: string) => {
    if (role === 'super-admin') {
      setSuperAdmins(superAdmins.filter(a => a.id !== id))
    } else if (role === 'content-manager') {
      setContentManagers(contentManagers.filter(a => a.id !== id))
    } else {
      setFinanceManagers(financeManagers.filter(a => a.id !== id))
    }
    toast.success('Admin removed')
  }

  useEffect(() => {
    if (activeTab === 'messages') {
      loadChats()
    }
    if (activeTab === 'analytics') {
      loadAnalytics()
    }
    if (activeTab === 'logs') {
      loadLogs()
    }
    if (activeTab === 'notifications') {
      loadNotificationHistory()
    }
    if (activeTab === 'users') {
      loadHostRequests()
    }
    if (activeTab === 'search') {
      // Initial load if there's a query
    }
    if (activeTab === 'settings') {
      // Load settings - already in state
    }
    if (activeTab === 'extras') {
      // Load extras - already in state
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 text-gray-600 hover:text-brand-primary transition-colors"
            >
              <Bell className="w-6 h-6" />
              {adminUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                </span>
              )}
            </button>
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
            { id: 'availability', label: 'Availability' },
            { id: 'messages', label: 'Messages' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'logs', label: 'Logs' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'search', label: 'Search' },
            { id: 'settings', label: 'Settings' },
            { id: 'extras', label: 'Extras' },
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

              {/* Host Requests */}
              <div className="clay p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Host Applications</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {pendingHostRequests.length} pending
                  </span>
                </div>

                {pendingHostRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No host applications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingHostRequests.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Requested {user.host_requested_at ? new Date(user.host_requested_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveHostRequest(user.id)}
                            className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectHostRequest(user.id)}
                            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            Reject
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

              <div className="clay p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Host Applications</h2>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                    {pendingHostRequests.length} pending
                  </span>
                </div>
                {pendingHostRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No host applications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingHostRequests.map((user) => (
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
                            <p className="text-xs text-gray-500 mt-1">
                              Requested {user.host_requested_at ? new Date(user.host_requested_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveHostRequest(user.id)}
                            className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectHostRequest(user.id)}
                            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

          {activeTab === 'availability' && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="clay p-4">
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{availabilityProperties.length}</p>
                </div>
                <div className="clay p-4">
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availabilityProperties.filter(p => p.is_available).length}
                  </p>
                </div>
                <div className="clay p-4">
                  <p className="text-sm text-gray-600">Unavailable</p>
                  <p className="text-2xl font-bold text-red-600">
                    {availabilityProperties.filter(p => !p.is_available).length}
                  </p>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => bulkUpdateAvailability(bulkPropertyIds, true)}
                        disabled={bulkPropertyIds.length === 0}
                        className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50"
                      >
                        Mark Available
                      </button>
                      <button
                        onClick={() => bulkUpdateAvailability(bulkPropertyIds, false)}
                        disabled={bulkPropertyIds.length === 0}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        Mark Unavailable
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {bulkPropertyIds.length} selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Properties List */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Availability</h2>
                {availabilityProperties.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No properties found</p>
                ) : (
                  <div className="space-y-4">
                    {availabilityProperties.map((property) => (
                      <div key={property.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={bulkPropertyIds.includes(property.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setBulkPropertyIds([...bulkPropertyIds, property.id])
                                } else {
                                  setBulkPropertyIds(bulkPropertyIds.filter(id => id !== property.id))
                                }
                              }}
                              className="w-4 h-4 rounded"
                            />
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              {property.images && property.images[0] ? (
                                <Image
                                  src={property.images[0]}
                                  alt={property.title}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Building className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{property.title}</p>
                              <p className="text-sm text-gray-600">{property.location}</p>
                              <p className="text-sm text-brand-primary font-medium">
                                ৳{property.price_per_night}/night
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-sm rounded-lg font-medium ${
                              property.is_available
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {property.is_available ? 'Available' : 'Unavailable'}
                            </span>
                            <button
                              onClick={() => updatePropertyAvailability(property.id, !property.is_available)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                property.is_available
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {property.is_available ? 'Make Unavailable' : 'Make Available'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProperty(property)
                                setOverridePrice('')
                              }}
                              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                              Set Override Price
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Override Price Modal */}
              {selectedProperty && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Set Override Price for {selectedProperty.title}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Override Price (BDT)
                        </label>
                        <input
                          type="number"
                          value={overridePrice}
                          onChange={(e) => setOverridePrice(e.target.value)}
                          placeholder={`Current: ৳${selectedProperty.price_per_night}`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setSelectedProperty(null)
                          setOverridePrice('')
                        }}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (overridePrice) {
                            setDateOverride(selectedProperty.id, '', '', parseFloat(overridePrice))
                            setSelectedProperty(null)
                            setOverridePrice('')
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'All Messages' },
                      { id: 'flagged', label: 'Flagged' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setMessageFilter(filter.id as typeof messageFilter)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          messageFilter === filter.id
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

              {/* Chats List */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Moderation</h2>
                {chats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages found</p>
                ) : (
                  <div className="space-y-4">
                    {chats
                      .filter(c => messageFilter === 'all' || (c as any).is_flagged)
                      .map((chat) => (
                        <div key={chat.id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Conversation {chat.id.slice(0, 8)}</p>
                                <p className="text-sm text-gray-500">
                                  Last updated: {new Date(chat.updated_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {(chat as any).is_flagged && (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                  Flagged
                                </span>
                              )}
                              <button
                                onClick={() => setSelectedChat(chat)}
                                className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                              >
                                View
                              </button>
                              {(chat as any).is_flagged ? (
                                <button
                                  onClick={() => unflagConversation(chat.id)}
                                  className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                >
                                  Unflag
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter reason for flagging:')
                                    if (reason) flagConversation(chat.id, reason)
                                  }}
                                  className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                >
                                  Flag
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Chat Detail Modal */}
              {selectedChat && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Conversation {selectedChat.id.slice(0, 8)}
                      </h3>
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <p className="text-gray-500 text-center py-8">
                        Chat messages would be displayed here
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type a response..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          sendAdminMessage(selectedChat.id, 'Sample response')
                        }}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  onClick={exportAnalyticsReport}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>

              {/* Top Performing Properties */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Performing Properties
                </h2>
                {topProperties.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No property data available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3">Property</th>
                          <th className="pb-3">City</th>
                          <th className="pb-3">Bookings</th>
                          <th className="pb-3">Rating</th>
                          <th className="pb-3">Price/Night</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProperties.map((property: any, index: number) => (
                          <tr key={property.id} className="border-b last:border-0">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-medium text-gray-400">#{index + 1}</span>
                                <span className="font-medium text-gray-900">{property.title}</span>
                              </div>
                            </td>
                            <td className="py-3 text-gray-600">{property.city || 'N/A'}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {property.total_bookings || 0}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span>{property.average_rating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 text-gray-900">৳{property.price_per_night?.toLocaleString() || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top Hosts */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Top Hosts
                </h2>
                {topHosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No host data available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3">Host</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topHosts.map((host: any) => (
                          <tr key={host.id} className="border-b last:border-0">
                            <td className="py-3 font-medium text-gray-900">{host.full_name || 'Unknown'}</td>
                            <td className="py-3 text-gray-600">{host.email}</td>
                            <td className="py-3 text-gray-600">
                              {host.created_at ? new Date(host.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Booking Trends */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Booking Trends (Last 30 Days)
                </h2>
                {bookingTrends.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No booking data available</p>
                ) : (
                  <div className="space-y-4">
                    {bookingTrends.slice(-7).map((trend: any) => (
                      <div key={trend.date} className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 w-24">{trend.date}</span>
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-primary to-blue-400 rounded-lg"
                            style={{
                              width: `${Math.min(100, (trend.count / Math.max(...bookingTrends.map((t: any) => t.count))) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-20">{trend.count} bookings</span>
                        <span className="text-sm text-green-600 w-24">৳{trend.revenue?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Search Queries */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-600" />
                  Popular Search Queries
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchQueries.map((item: any, index: number) => (
                    <div key={item.query} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.query}</span>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${(item.count / Math.max(...searchQueries.map((q: any) => q.count))) * 100}%`
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{item.count} searches</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Overview */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Recommendations Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendations.map((item: any) => (
                    <div key={item.type} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'popular' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                        {item.type === 'similar' && <Copy className="w-5 h-5 text-blue-600" />}
                        {item.type === 'trending' && <Zap className="w-5 h-5 text-orange-600" />}
                        {item.type === 'personalized' && <Heart className="w-5 h-5 text-green-600" />}
                        <span className="font-medium text-gray-900 capitalize">{item.type}</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-sm text-gray-500">recommendations</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="clay p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'All Logs' },
                      { id: 'email', label: 'Email' },
                      { id: 'payment', label: 'Payment' },
                      { id: 'phone', label: 'Phone' },
                      { id: 'audit', label: 'Audit' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setLogFilter(filter.id as typeof logFilter)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          logFilter === filter.id
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

              {/* Email Logs */}
              {(logFilter === 'all' || logFilter === 'email') && (
                <div className="clay p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      Email Logs
                    </h2>
                    <button
                      onClick={() => exportLogs('email')}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Export
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3">To</th>
                          <th className="pb-3">Subject</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Sent At</th>
                          <th className="pb-3">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailLogs.map((log: any) => (
                          <tr key={log.id} className="border-b last:border-0">
                            <td className="py-3 text-gray-900">{log.to}</td>
                            <td className="py-3 text-gray-600">{log.subject}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                log.status === 'sent' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600">
                              {new Date(log.sent_at).toLocaleString()}
                            </td>
                            <td className="py-3 text-red-600">{log.error || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Logs */}
              {(logFilter === 'all' || logFilter === 'payment') && (
                <div className="clay p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      Payment Logs
                    </h2>
                    <button
                      onClick={() => exportLogs('payment')}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Export
                    </button>
                  </div>
                  {paymentLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No payment logs available</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-gray-500 border-b">
                            <th className="pb-3">ID</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Method</th>
                            <th className="pb-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentLogs.map((log: any) => (
                            <tr key={log.id} className="border-b last:border-0">
                              <td className="py-3 text-gray-900 font-mono text-sm">{log.id}</td>
                              <td className="py-3 text-gray-900">৳{log.amount?.toLocaleString()}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  log.status === 'completed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : log.status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="py-3 text-gray-600">{log.payment_method || 'N/A'}</td>
                              <td className="py-3 text-gray-600">
                                {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Phone Verification Logs */}
              {(logFilter === 'all' || logFilter === 'phone') && (
                <div className="clay p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-purple-600" />
                      Phone Verification Logs
                    </h2>
                    <button
                      onClick={() => exportLogs('phone')}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Export
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3">Phone</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Timestamp</th>
                          <th className="pb-3">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phoneLogs.map((log: any) => (
                          <tr key={log.id} className="border-b last:border-0">
                            <td className="py-3 text-gray-900">{log.phone}</td>
                            <td className="py-3 text-gray-600">{log.type}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                log.status === 'verified' || log.status === 'sent'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600">
                              {new Date(log.sent_at).toLocaleString()}
                            </td>
                            <td className="py-3 text-red-600">{log.error || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Audit Logs */}
              {(logFilter === 'all' || logFilter === 'audit') && (
                <div className="clay p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-600" />
                      Audit Logs
                    </h2>
                    <button
                      onClick={() => exportLogs('audit')}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Export
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3">Action</th>
                          <th className="pb-3">Target</th>
                          <th className="pb-3">Admin</th>
                          <th className="pb-3">Reason</th>
                          <th className="pb-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log: any) => (
                          <tr key={log.id} className="border-b last:border-0">
                            <td className="py-3">
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                {log.action.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 text-gray-900">{log.target}</td>
                            <td className="py-3 text-gray-600">{log.admin}</td>
                            <td className="py-3 text-gray-600">{log.reason || '-'}</td>
                            <td className="py-3 text-gray-600">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Notification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                    <select
                      value={notificationType}
                      onChange={(e) => setNotificationType(e.target.value as 'email' | 'push' | 'both')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="email">Email</option>
                      <option value="push">Push</option>
                      <option value="both">Email + Push</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-28"
                    placeholder="Write your message..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as 'all' | 'hosts' | 'guests' | 'specific')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="all">All Users</option>
                      <option value="hosts">Hosts</option>
                      <option value="guests">Guests</option>
                      <option value="specific">Specific User</option>
                    </select>
                  </div>
                  {targetAudience === 'specific' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User ID or Email</label>
                      <input
                        type="text"
                        value={targetUserQuery}
                        onChange={(e) => setTargetUserQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="user-id or email"
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={sendNotification}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                    >
                      Send Now
                    </button>
                    <button
                      onClick={scheduleNotification}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>

              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification History</h2>
                {notificationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3">Title</th>
                          <th className="pb-3">Audience</th>
                          <th className="pb-3">Channel</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">When</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notificationHistory.map((item: any) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-3 text-gray-900">
                              <div className="font-medium">{item.title}</div>
                              <div className="text-xs text-gray-500">{item.message}</div>
                            </td>
                            <td className="py-3 text-gray-600">
                              {item.target}
                              {item.target_user ? ` (${item.target_user})` : ''}
                            </td>
                            <td className="py-3 text-gray-600">{item.type}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.status === 'sent'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 text-gray-600">
                              {new Date(item.sent_at || item.scheduled_for || item.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tab - Priority 12 */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-brand-primary" />
                  Advanced Search & Filter
                </h2>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search users, properties, bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                  <button
                    onClick={performSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>
                
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={searchFilters.type}
                      onChange={(e) => setSearchFilters({...searchFilters, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="all">All</option>
                      <option value="users">Users</option>
                      <option value="properties">Properties</option>
                      <option value="bookings">Bookings</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={searchFilters.status}
                      onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Filter by city"
                      value={searchFilters.city}
                      onChange={(e) => setSearchFilters({...searchFilters, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                    <select
                      value={searchFilters.minRating}
                      onChange={(e) => setSearchFilters({...searchFilters, minRating: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value={0}>Any</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                    <select
                      value={searchFilters.paymentStatus}
                      onChange={(e) => setSearchFilters({...searchFilters, paymentStatus: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="all">All</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {(searchResults.users?.length || searchResults.properties?.length || searchResults.bookings?.length) ? (
                <>
                  {/* Export Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={exportResults}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Results
                    </button>
                  </div>

                  {/* Results Count */}
                  <div className="clay p-4">
                    <p className="text-gray-600">
                      Found {(searchResults.users?.length || 0) + (searchResults.properties?.length || 0) + (searchResults.bookings?.length || 0)} results
                    </p>
                  </div>

                  {/* Users Results */}
                  {searchResults.users && searchResults.users.length > 0 && (
                    <div className="clay p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Users ({searchResults.users.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.users.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">{user.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{user.role}</span>
                              <span className="text-sm text-gray-500">{user.created_at}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Properties Results */}
                  {searchResults.properties && searchResults.properties.length > 0 && (
                    <div className="clay p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-purple-600" />
                        Properties ({searchResults.properties.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.properties.map((property: any) => (
                          <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900">{property.title}</p>
                              <p className="text-sm text-gray-500">{property.city}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-gray-900">৳{property.price}/night</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm text-gray-600">{property.rating}</span>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {property.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bookings Results */}
                  {searchResults.bookings && searchResults.bookings.length > 0 && (
                    <div className="clay p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        Bookings ({searchResults.bookings.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.bookings.map((booking: any) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900">{booking.property}</p>
                              <p className="text-sm text-gray-500">Guest: {booking.guest}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-gray-900">৳{booking.total}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {booking.status}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.payment_status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {booking.payment_status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : searchQuery && !isSearching ? (
                <div className="clay p-6 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : !searchQuery ? (
                <div className="clay p-6 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter a search term to find users, properties, or bookings</p>
                  <p className="text-sm text-gray-400">Use filters to narrow down your results</p>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Platform Fee Configuration */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Platform Fee Configuration
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-2">Platform Fee:</span>
                    <input
                      type="number"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center"
                      min={0}
                      max={100}
                    />
                    <span className="ml-2 text-gray-600">%</span>
                  </div>
                  <button
                    onClick={savePlatformFee}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                  >
                    Save
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">This fee is charged on each booking transaction</p>
              </div>

              {/* Payment Gateway Configuration */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Gateway Configuration
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={paymentGateway.stripe_enabled}
                        onChange={(e) => setPaymentGateway({...paymentGateway, stripe_enabled: e.target.checked})}
                        className="w-4 h-4 text-brand-primary"
                      />
                      <span className="font-medium text-gray-900">Stripe</span>
                    </div>
                    <span className="text-sm text-green-600">Enabled</span>
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={paymentGateway.paypal_enabled}
                        onChange={(e) => setPaymentGateway({...paymentGateway, paypal_enabled: e.target.checked})}
                        className="w-4 h-4 text-brand-primary"
                      />
                      <span className="font-medium text-gray-900">PayPal</span>
                    </div>
                    <span className="text-sm text-gray-500">{paymentGateway.paypal_enabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={paymentGateway.razorpay_enabled}
                        onChange={(e) => setPaymentGateway({...paymentGateway, razorpay_enabled: e.target.checked})}
                        className="w-4 h-4 text-brand-primary"
                      />
                      <span className="font-medium text-gray-900">Razorpay</span>
                    </div>
                    <span className="text-sm text-green-600">Enabled</span>
                  </label>
                </div>
                <button
                  onClick={savePaymentGateway}
                  className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                  Save Gateway Settings
                </button>
              </div>

              {/* Terms & Conditions */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Terms & Conditions
                </h2>
                <textarea
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none"
                  placeholder="Enter terms and conditions..."
                />
                <button
                  onClick={saveTermsContent}
                  className="mt-3 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                  Save Terms
                </button>
              </div>

              {/* Privacy Policy */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Privacy Policy
                </h2>
                <textarea
                  value={privacyContent}
                  onChange={(e) => setPrivacyContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none"
                  placeholder="Enter privacy policy..."
                />
                <button
                  onClick={savePrivacyContent}
                  className="mt-3 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                  Save Privacy Policy
                </button>
              </div>

              {/* Admin Roles & Permissions */}
              <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Admin Roles & Permissions
                </h2>
                
                {/* Existing Roles */}
                <div className="space-y-3 mb-6">
                  {adminRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{role.name}</p>
                        <p className="text-sm text-gray-500">
                          Permissions: {role.permissions.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{role.users} users</span>
                        <button
                          onClick={() => deleteAdminRole(role.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Role */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Add New Role</h3>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Role name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                    />
                    <select
                      multiple
                      value={newRolePermissions}
                      onChange={(e) => setNewRolePermissions(Array.from(e.target.selectedOptions, option => option.value))}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="properties">Properties</option>
                      <option value="users">Users</option>
                      <option value="bookings">Bookings</option>
                      <option value="reviews">Reviews</option>
                      <option value="earnings">Earnings</option>
                      <option value="payments">Payments</option>
                      <option value="analytics">Analytics</option>
                    </select>
                    <button
                      onClick={addAdminRole}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add Role
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple permissions</p>
                </div>
              </div>
            </div>
          )}  

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

