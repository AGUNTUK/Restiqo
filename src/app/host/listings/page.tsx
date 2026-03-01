'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Loader2,
  Plus,
  Building,
  MapPin,
  Star,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  MoreVertical,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Property } from '@/types/database'
import toast from 'react-hot-toast'

export default function HostListingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, isHost } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')

  const loadProperties = useCallback(async () => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading properties:', error)
      toast.error('Failed to load properties')
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/host/listings')
    } else if (!authLoading && isAuthenticated && !isHost) {
      router.push('/host/register')
    }
  }, [authLoading, isAuthenticated, isHost, router])

  useEffect(() => {
    if (user && isHost) {
      loadProperties()
    }
  }, [user, isHost, loadProperties])

  const toggleAvailability = async (propertyId: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('properties')
      .update({ is_available: !currentStatus })
      .eq('id', propertyId)

    if (error) {
      toast.error('Failed to update property')
    } else {
      toast.success(`Property ${!currentStatus ? 'activated' : 'deactivated'}`)
      loadProperties()
    }
  }

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    const supabase = createClient()
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (error) {
      toast.error('Failed to delete property')
    } else {
      toast.success('Property deleted successfully')
      loadProperties()
    }
  }

  const filteredProperties = properties.filter(property => {
    switch (filter) {
      case 'active':
        return property.is_available && property.is_approved
      case 'pending':
        return !property.is_approved
      case 'inactive':
        return !property.is_available
      default:
        return true
    }
  })

  if (authLoading || loading || !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">Manage your properties and listings</p>
          </div>
          <Link
            href="/host/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Listing
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {(['all', 'active', 'pending', 'inactive'] as const).map((f) => (
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
              {f === 'all' && ` (${properties.length})`}
              {f === 'active' && ` (${properties.filter(p => p.is_available && p.is_approved).length})`}
              {f === 'pending' && ` (${properties.filter(p => !p.is_approved).length})`}
              {f === 'inactive' && ` (${properties.filter(p => !p.is_available).length})`}
            </button>
          ))}
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-8 text-center"
          >
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Start by adding your first property to the platform.'
                : `You don't have any ${filter} listings.`}
            </p>
            <Link
              href="/host/listings/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Property
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="clay overflow-hidden group"
              >
                {/* Property Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {property.images?.[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Building className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {!property.is_approved && (
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                        Pending Approval
                      </span>
                    )}
                    {property.is_approved && !property.is_available && (
                      <span className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                    {property.is_approved && property.is_available && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/property/${property.id}`}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </Link>
                    <Link
                      href={`/host/listings/${property.id}`}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-700" />
                    </Link>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{property.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({property.review_count})</span>
                    </div>
                    <p className="text-lg font-bold text-brand-primary">
                      ৳{property.price_per_night.toLocaleString()}
                      <span className="text-xs font-normal text-gray-500">/night</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/host/listings/${property.id}`}
                      className="flex-1 py-2 text-center text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleAvailability(property.id, property.is_available)}
                      className={`p-2 rounded-lg transition-colors ${
                        property.is_available
                          ? 'text-green-600 bg-green-50 hover:bg-green-100'
                          : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                      }`}
                      title={property.is_available ? 'Deactivate' : 'Activate'}
                    >
                      {property.is_available ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteProperty(property.id)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
