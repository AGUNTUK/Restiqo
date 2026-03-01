'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Heart,
  MapPin,
  Star,
  Trash2,
  Loader2,
  Search,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Wishlist, Property } from '@/types/database'
import toast from 'react-hot-toast'

interface WishlistWithProperty extends Wishlist {
  property: Property
}

export default function WishlistPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadWishlist = useCallback(async () => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        property:properties (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading wishlist:', error)
      toast.error('Failed to load wishlist')
    } else {
      setWishlist(data as WishlistWithProperty[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/wishlist')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      loadWishlist()
    }
  }, [user, loadWishlist])

  const removeFromWishlist = async (wishlistId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId)

    if (error) {
      toast.error('Failed to remove from wishlist')
    } else {
      setWishlist(wishlist.filter(item => item.id !== wishlistId))
      toast.success('Removed from wishlist')
    }
  }

  const filteredWishlist = wishlist.filter(item => {
    if (!searchQuery) return true
    return item.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.property.location.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-1">Properties you've saved for later</p>
        </div>

        {/* Search */}
        {wishlist.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
            />
          </div>
        )}

        {/* Wishlist Grid */}
        {filteredWishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay p-8 text-center"
          >
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No results found' : 'Your wishlist is empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Save properties you love by clicking the heart icon on any listing.'}
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
            >
              Explore Properties
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="clay overflow-hidden group"
              >
                {/* Property Image */}
                <Link 
                  href={`/property/${item.property.id}`}
                  className="relative block aspect-[4/3] overflow-hidden"
                >
                  {item.property.images?.[0] ? (
                    <Image
                      src={item.property.images[0]}
                      alt={item.property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      removeFromWishlist(item.id)
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                  {/* Property Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full capitalize">
                      {item.property.property_type}
                    </span>
                  </div>
                </Link>

                {/* Property Info */}
                <div className="p-4">
                  <Link 
                    href={`/property/${item.property.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-brand-primary transition-colors line-clamp-1"
                  >
                    {item.property.title}
                  </Link>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {item.property.location}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{item.property.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({item.property.review_count})</span>
                    </div>
                    <p className="text-lg font-bold text-brand-primary">
                      ৳{item.property.price_per_night.toLocaleString()}
                      <span className="text-xs font-normal text-gray-500">/night</span>
                    </p>
                  </div>

                  {/* Quick Book Button */}
                  <Link
                    href={`/property/${item.property.id}?book=true`}
                    className="mt-4 w-full py-2 text-center text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors block"
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

