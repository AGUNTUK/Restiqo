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
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { User, Property } from '@/types/database'
import toast from 'react-hot-toast'

interface AdminStats {
  totalUsers: number
  totalHosts: number
  totalProperties: number
  pendingApprovals: number
  totalBookings: number
  totalRevenue: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated, isAdmin } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHosts: 0,
    totalProperties: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [pendingProperties, setPendingProperties] = useState<Property[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'reviews'>('overview')

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
      // Load stats
      const [usersResult, hostsResult, propertiesResult, pendingResult, bookingsResult, earningsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'host'),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('host_earnings').select('amount'),
      ])

      const totalRevenue = (earningsResult.data || []).reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0)

      setStats({
        totalUsers: usersResult.count || 0,
        totalHosts: hostsResult.count || 0,
        totalProperties: propertiesResult.count || 0,
        pendingApprovals: pendingResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalRevenue,
      })

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
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Users</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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
            transition={{ delay: 0.2 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Properties</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Bookings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="clay p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-brand-primary" />
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'properties', label: 'Properties' },
            { id: 'users', label: 'Users' },
            { id: 'reviews', label: 'Reviews' },
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

          {activeTab === 'properties' && (
            <div className="clay p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Management</h2>
              <div className="space-y-4">
                {pendingProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
                        <p className="text-sm text-gray-600">{property.location}</p>
                        <p className="text-sm text-brand-primary font-medium">৳{property.price_per_night}/night</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/property/${property.id}`}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-brand-primary transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => approveProperty(property.id)}
                        className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectProperty(property.id)}
                        className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="clay p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
              <div className="space-y-4">
                {recentUsers.map((user) => (
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
                        <p className="text-xs text-gray-500">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="clay p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Moderation</h2>
              <p className="text-gray-500 text-center py-8">Review moderation features coming soon...</p>
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

