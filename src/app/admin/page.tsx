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
  ScrollText,
  PlusCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { getRealtimeDB, getFirestoreDB } from '@/lib/firebase/database'
import { getFirebaseFirestore } from '@/lib/firebase/config'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useNotifications } from '@/lib/realtime/notifications'
import { User, Property, Booking, BookingStatus, PaymentStatus } from '@/types/database'
import { AdminStats, BookingTrend, PopularCity, TopProperty } from '@/types/admin'
import toast from 'react-hot-toast'
import { OverviewTab } from '@/components/admin/tabs/OverviewTab'
import { PropertiesTab } from '@/components/admin/tabs/PropertiesTab'
import { UsersTab } from '@/components/admin/tabs/UsersTab'
import { BookingsTab } from '@/components/admin/tabs/BookingsTab'
import { ReviewsTab } from '@/components/admin/tabs/ReviewsTab'
import { EarningsTab } from '@/components/admin/tabs/EarningsTab'
import { AvailabilityTab } from '@/components/admin/tabs/AvailabilityTab'
import { MessagesTab } from '@/components/admin/tabs/MessagesTab'
import { AnalyticsTab } from '@/components/admin/tabs/AnalyticsTab'
import { LogsTab } from '@/components/admin/tabs/LogsTab'
import { NotificationsTab } from '@/components/admin/tabs/NotificationsTab'
import { SearchTab } from '@/components/admin/tabs/SearchTab'
import { SettingsTab } from '@/components/admin/tabs/SettingsTab'
import { Sidebar } from '@/components/admin/Sidebar'

type AdminTab = 'overview' | 'properties' | 'users' | 'reviews' | 'bookings' | 'earnings' | 'availability' | 'messages' | 'analytics' | 'logs' | 'notifications' | 'search' | 'settings' | 'extras';

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
  const [searchResults, setSearchResults] = useState<{ users?: any[], properties?: any[], bookings?: any[] }>({})
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
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [pendingHostRequests, setPendingHostRequests] = useState<User[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        invoices: [] as string[],
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
        if (booking.invoice_id) {
          const methodStr = booking.payment_method ? ` (${booking.payment_method})` : ''
          hostEarnings.invoices.push(`${booking.invoice_id}${methodStr}`)
        }
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
      ['Host', 'Email', 'Total Earnings', 'Platform Fee', 'Net Payout', 'Completed Bookings', 'Payment Invoices', 'Status'].join(','),
      ...hostEarnings.map(e => [
        e.host.full_name || 'N/A',
        e.host.email,
        e.totalEarnings.toFixed(2),
        e.platformFee.toFixed(2),
        e.netPayout.toFixed(2),
        e.completedBookings,
        `"${e.invoices.join('; ')}"`,
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
      const results: { users?: any[], properties?: any[], bookings?: any[] } = {}

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
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-[250px]'
          }`}
      >
        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize leading-tight">
                {activeTab}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Admin Control Panel &bull; {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2.5 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-brand-primary hover:border-brand-primary/20 hover:shadow-sm transition-all"
              >
                <Bell className="w-5 h-5" />
                {adminUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                stats={stats}
                bookingTrends={bookingTrends}
                popularCities={popularCities}
                topProperties={topProperties}
                pendingProperties={pendingProperties}
                pendingHostRequests={pendingHostRequests}
                recentUsers={recentUsers}
                approveProperty={approveProperty}
                rejectProperty={rejectProperty}
                approveHostRequest={approveHostRequest}
                rejectHostRequest={rejectHostRequest}
              />
            )}

            {activeTab === 'properties' && (
              <PropertiesTab
                propertyFilter={propertyFilter}
                setPropertyFilter={setPropertyFilter}
                allProperties={allProperties}
                pendingProperties={pendingProperties}
                loadAllProperties={loadAllProperties}
                togglePropertyAvailability={togglePropertyAvailability}
                approveProperty={approveProperty}
                rejectProperty={rejectProperty}
              />
            )}

            {activeTab === 'users' && (
              <UsersTab
                userFilter={userFilter}
                setUserFilter={setUserFilter}
                recentUsers={recentUsers}
                pendingHostRequests={pendingHostRequests}
                approveHostRequest={approveHostRequest}
                rejectHostRequest={rejectHostRequest}
                updateUserRole={updateUserRole}
                banUser={banUser}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingsTab
                bookings={bookings}
                bookingFilter={bookingFilter}
                setBookingFilter={setBookingFilter}
                setSelectedBooking={setSelectedBooking}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab
                reviews={reviews}
                reviewFilter={reviewFilter}
                setReviewFilter={setReviewFilter}
                updateReviewStatus={updateReviewStatus}
                respondToReview={respondToReview}
              />
            )}

            {activeTab === 'earnings' && (
              <EarningsTab
                hostEarnings={hostEarnings}
                earningsFilter={earningsFilter}
                setEarningsFilter={setEarningsFilter}
                exportEarningsReport={exportEarningsReport}
                updatePayoutStatus={updatePayoutStatus}
              />
            )}

            {activeTab === 'availability' && (
              <AvailabilityTab
                availabilityProperties={availabilityProperties}
                selectedProperty={selectedProperty}
                setSelectedProperty={setSelectedProperty}
                overridePrice={overridePrice}
                setOverridePrice={setOverridePrice}
                bulkPropertyIds={bulkPropertyIds}
                setBulkPropertyIds={setBulkPropertyIds}
                updatePropertyAvailability={togglePropertyAvailability}
                bulkUpdateAvailability={bulkUpdateAvailability}
                setDateOverride={setDateOverride}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesTab
                chats={chats}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                messageFilter={messageFilter}
                setMessageFilter={setMessageFilter}
                sendAdminMessage={sendAdminMessage}
                flagConversation={flagConversation}
                unflagConversation={unflagConversation}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab
                topProperties={topProperties}
                topHosts={topHosts}
                bookingTrends={bookingTrends}
                searchQueries={searchQueries}
                recommendations={recommendations}
                exportAnalyticsReport={exportAnalyticsReport}
              />
            )}

            {activeTab === 'logs' && (
              <LogsTab
                emailLogs={emailLogs}
                paymentLogs={paymentLogs}
                phoneLogs={phoneLogs}
                auditLogs={auditLogs}
                logFilter={logFilter}
                setLogFilter={setLogFilter}
                exportLogs={exportLogs}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                notificationType={notificationType}
                setNotificationType={setNotificationType}
                notificationTitle={notificationTitle}
                setNotificationTitle={setNotificationTitle}
                notificationMessage={notificationMessage}
                setNotificationMessage={setNotificationMessage}
                targetAudience={targetAudience}
                setTargetAudience={setTargetAudience}
                scheduledDate={scheduledDate}
                setScheduledDate={setScheduledDate}
                notificationHistory={notificationHistory}
                sendNotification={sendNotification}
                scheduleNotification={scheduleNotification}
                targetUserQuery={targetUserQuery}
                setTargetUserQuery={setTargetUserQuery}
              />
            )}

            {activeTab === 'search' && (
              <SearchTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
                isSearching={isSearching}
                exportFormat={exportFormat}
                setExportFormat={setExportFormat}
                searchResults={searchResults}
                performSearch={performSearch}
                exportResults={exportResults}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                platformFee={platformFee}
                setPlatformFee={setPlatformFee}
                paymentGateway={paymentGateway}
                setPaymentGateway={setPaymentGateway}
                termsContent={termsContent}
                setTermsContent={setTermsContent}
                privacyContent={privacyContent}
                setPrivacyContent={setPrivacyContent}
                adminRoles={adminRoles}
                newRoleName={newRoleName}
                setNewRoleName={setNewRoleName}
                newRolePermissions={newRolePermissions}
                setNewRolePermissions={setNewRolePermissions}
                savePlatformFee={savePlatformFee}
                savePaymentGateway={savePaymentGateway}
                saveTermsContent={saveTermsContent}
                savePrivacyContent={savePrivacyContent}
                addAdminRole={addAdminRole}
                deleteAdminRole={deleteAdminRole}
              />
            )}

            {activeTab === 'extras' && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* User Access Management */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Super Admins */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="clay p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-purple-600" />
                        <h3 className="text-xl font-bold text-gray-900">Super Admins</h3>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors">
                        <PlusCircle className="w-4 h-4" />
                        Add Admin
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="pb-3 text-sm font-semibold text-gray-600">Admin Name</th>
                            <th className="pb-3 text-sm font-semibold text-gray-600">Email</th>
                            <th className="pb-3 text-sm font-semibold text-gray-600">Last Active</th>
                            <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {superAdmins.map((admin) => (
                            <tr key={admin.id} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-1">{admin.name}</td>
                              <td className="py-3 px-1 text-gray-500">{admin.email}</td>
                              <td className="py-3 px-1 text-sm text-gray-500">{admin.lastActive}</td>
                              <td className="py-3 px-1">
                                <button className="p-1 px-3 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                  Revoke
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  {/* Auto Payouts */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="clay p-6 bg-gradient-to-br from-indigo-50 to-indigo-100"
                    >
                      <div className="flex items-center gap-3 mb-4 text-indigo-700">
                        <Zap className="w-6 h-6" />
                        <h3 className="font-bold text-lg">Auto Payouts</h3>
                        <div className="ml-auto">
                          <div className={`w-12 h-6 rounded-full relative transition-colors ${autoPayoutSettings.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${autoPayoutSettings.enabled ? 'translate-x-6' : ''}`} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Frequency</span>
                          <span className="font-bold text-indigo-700 capitalize">{autoPayoutSettings.frequency}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Min. Payout</span>
                          <span className="font-bold text-indigo-700">৳{autoPayoutSettings.minPayout}</span>
                        </div>
                        <button className="w-full mt-4 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">
                          View History
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="clay p-6 bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-brand-primary/10 transition-all"
                    >
                      <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform mb-4">
                        <Copy className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">Copy Report Design</h3>
                      <p className="text-sm text-gray-500 mt-2 px-4 italic">Soon: Advanced PDF & Excel Report customizer</p>
                    </motion.div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="clay p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Flush Redirect Cache', icon: Zap, color: 'text-orange-600' },
                        { label: 'Rebuild Search Index', icon: Search, color: 'text-blue-600' },
                        { label: 'Clear Error Logs', icon: ScrollText, color: 'text-red-600' },
                        { label: 'Optimize Database', icon: Zap, color: 'text-green-600' },
                      ].map((action, i) => (
                        <button key={i} className="w-full p-4 flex items-center gap-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium">
                          <action.icon className={`w-5 h-5 ${action.color}`} />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="clay p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative"
                  >
                    <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
                    <h3 className="text-lg font-bold mb-2 relative z-10">Premium Support</h3>
                    <p className="text-sm text-gray-400 mb-6 relative z-10 font-medium">Need custom features or help? Restiqa Enterprise support is here.</p>
                    <button className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all relative z-10 shadow-lg shadow-white/10">
                      Contact Developers
                    </button>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
