'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Heart, MapPin, Star, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Wishlist, Property } from '@/types/database'

interface WishlistWithProperty extends Wishlist {
  property: Property
}

export default function WishlistTab() {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistWithProperty[]>([])
  const [loading, setLoading] = useState(true)

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
    } else {
      setWishlist(data as WishlistWithProperty[])
    }
    setLoading(false)
  }, [user])

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
      console.error('Error removing from wishlist:', error)
    } else {
      setWishlist(wishlist.filter(item => item.id !== wishlistId))
    }
  }

  if (loading) {
    return (
      <div className="clay-card p-8 text-center border-white/40 shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        <p className="text-gray-600 mt-4">Loading your wishlist...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {wishlist.length === 0 ? (
        <div className="clay-card p-8 text-center border-white/40 shadow-xl">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-4">
            Save properties you love by clicking the heart icon.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="clay-card overflow-hidden group border-white/40 shadow-lg hover:shadow-xl transition-all">
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
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    removeFromWishlist(item.id)
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
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
                  </div>
                  <p className="text-lg font-bold text-brand-primary">
                    ৳{item.property.price_per_night.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">/night</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

