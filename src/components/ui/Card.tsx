'use client'

import { motion } from 'framer-motion'
import { Heart, Star, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/database'

interface CardProps {
  property: Property
  onWishlistToggle?: (propertyId: string) => void
  isWishlisted?: boolean
  variant?: 'default' | 'compact' | 'horizontal' | 'clay'
}

export default function Card({ property, onWishlistToggle, isWishlisted = false, variant = 'default' }: CardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const primaryImage = property.images?.[0] || '/placeholder-property.jpg'

  // Horizontal variant for mobile lists
  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="clay-card group overflow-hidden"
      >
        <Link href={`/property/${property.id}`} className="flex gap-3 p-3">
          {/* Image - Fixed size */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-2xl">
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Rating overlay */}
            <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-lg border border-white/20">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{property.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-grow min-w-0 py-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                {property.title}
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onWishlistToggle?.(property.id)
                }}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className="p-1.5 -m-1.5 rounded-full touch-feedback"
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#64748B]'}`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1 text-[#64748B] mb-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{property.city}, {property.country}</span>
            </div>

            <p className="text-xs text-[#64748B] line-clamp-2 mb-2 hidden sm:block">
              {property.description}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div>
                <span className="text-sm sm:text-base font-bold text-[#1E293B]">
                  {formatPrice(property.price_per_night)}
                </span>
                <span className="text-xs text-[#64748B]">
                  {property.property_type === 'tour' ? '/person' : '/night'}
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-1 bg-brand-primary/10 text-brand-primary font-bold rounded-lg uppercase tracking-wider border border-brand-primary/20">
                {property.property_type}
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Compact variant for smaller cards
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="neu-card group h-full"
      >
        <Link href={`/property/${property.id}`} className="flex flex-col h-full">
          <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0 rounded-t-2xl sm:rounded-t-3xl">
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <button
              onClick={(e) => {
                e.preventDefault()
                onWishlistToggle?.(property.id)
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#64748B]'}`}
              />
            </button>
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">{property.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <div className="flex items-center gap-1 text-[#64748B] mb-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{property.city}</span>
            </div>
            <h3 className="text-sm font-semibold text-[#1E293B] line-clamp-1 group-hover:text-brand-primary transition-colors mb-2">
              {property.title}
            </h3>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <span className="text-sm font-bold text-[#1E293B]">
                  {formatPrice(property.price_per_night)}
                </span>
                <span className="text-xs text-[#64748B]">/night</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Default variant - Full card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`${variant === 'clay' ? 'clay-card' : 'neu-card'} group h-full overflow-hidden`}
    >
      <Link href={`/property/${property.id}`} className="flex flex-col h-full">
        {/* Image Container - Responsive Height */}
        <div className="relative h-44 sm:h-52 md:h-56 overflow-hidden flex-shrink-0 rounded-t-2xl sm:rounded-t-3xl">
          <Image
            src={primaryImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 text-brand-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg">
              {property.property_type}
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              onWishlistToggle?.(property.id)
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 sm:p-2.5 rounded-full transition-all duration-200 neu-icon hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#64748B]'}`}
              aria-hidden="true"
            />
          </button>

          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/20 shadow-xl">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {property.rating.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {property.review_count} REVIEWS
              </span>
            </div>
          </div>
        </div>

        {/* Content - Flex column with auto margin for footer */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
          {/* Location */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[#64748B] mb-1 sm:mb-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{property.city}, {property.country}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#1E293B] mb-1 sm:mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
            {property.title}
          </h3>

          {/* Description - Limited to 2 lines */}
          <p className="text-xs sm:text-sm text-[#64748B] mb-2 sm:mb-4 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
            {property.description}
          </p>

          {/* Amenities - Fixed height container */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4 min-h-[24px] sm:min-h-[28px]">
            {property.amenities?.slice(0, 2).map((amenity, index) => (
              <span
                key={index}
                className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 neu-badge text-[#64748B] whitespace-nowrap"
              >
                {amenity}
              </span>
            ))}
            {property.amenities && property.amenities.length > 2 && (
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 neu-badge text-[#64748B] whitespace-nowrap">
                +{property.amenities.length - 2}
              </span>
            )}
          </div>

          {/* Spacer to push price section to bottom */}
          <div className="flex-grow"></div>

          {/* Price and CTA - Anchored to bottom */}
          <div className="flex items-center justify-between pt-2 sm:pt-4 mt-auto">
            <div>
              <span className="text-base sm:text-lg md:text-xl font-bold text-[#1E293B]">
                {formatPrice(property.price_per_night)}
              </span>
              <span className="text-xs sm:text-sm text-[#64748B]">
                {property.property_type === 'tour' ? '/person' : '/night'}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-[#64748B]">
              {property.property_type !== 'tour' && (
                <>
                  <span>{property.bedrooms} beds</span>
                  <span className="text-[#94A3B8]">•</span>
                  <span>{property.max_guests} guests</span>
                </>
              )}
              {property.property_type === 'tour' && (
                <span>{property.max_guests} max</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

