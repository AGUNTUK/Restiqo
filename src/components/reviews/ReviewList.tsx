'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, Flag, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import Button from '@/components/ui/Button'

interface RatingBreakdown {
    cleanliness: number
    location: number
    value: number
    communication: number
    check_in: number
    accuracy: number
}

interface Review {
    id: string
    user_id: string
    user_name: string
    user_avatar?: string
    rating: number
    rating_breakdown?: RatingBreakdown
    comment: string
    photos?: string[]
    created_at: string
    host_response?: {
        content: string
        created_at: string
    }
    helpful_count?: number
    is_helpful?: boolean
}

interface ReviewListProps {
    reviews: Review[]
    averageRating: number
    totalReviews: number
    onMarkHelpful?: (reviewId: string) => void
    onReport?: (reviewId: string) => void
}

const ratingLabels: Record<keyof RatingBreakdown, string> = {
    cleanliness: 'Cleanliness',
    location: 'Location',
    value: 'Value',
    communication: 'Communication',
    check_in: 'Check-in',
    accuracy: 'Accuracy',
}

export default function ReviewList({
    reviews,
    averageRating,
    totalReviews,
    onMarkHelpful,
    onReport,
}: ReviewListProps) {
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
    const [showAll, setShowAll] = useState(false)
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

    // Calculate average ratings for each category
    const categoryAverages = reviews.reduce(
        (acc, review) => {
            if (review.rating_breakdown) {
                Object.entries(review.rating_breakdown).forEach(([key, value]) => {
                    acc[key as keyof RatingBreakdown] += value
                })
            }
            return acc
        },
        {
            cleanliness: 0,
            location: 0,
            value: 0,
            communication: 0,
            check_in: 0,
            accuracy: 0,
        } as RatingBreakdown
    )

    const reviewsWithBreakdown = reviews.filter((r) => r.rating_breakdown)
    Object.keys(categoryAverages).forEach((key) => {
        categoryAverages[key as keyof RatingBreakdown] = reviewsWithBreakdown.length
            ? categoryAverages[key as keyof RatingBreakdown] / reviewsWithBreakdown.length
            : 0
    })

    const toggleExpanded = (reviewId: string) => {
        setExpandedReviews((prev) => {
            const next = new Set(prev)
            if (next.has(reviewId)) {
                next.delete(reviewId)
            } else {
                next.add(reviewId)
            }
            return next
        })
    }

    const displayedReviews = showAll ? reviews : reviews.slice(0, 5)

    const StarRating = ({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) => {
        const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClass} ${star <= Math.round(value)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        )
    }

    const RatingBar = ({ label, value }: { label: string; value: number }) => (
        <div className="flex items-center gap-3">
            <span className="text-sm text-[#64748B] w-24">{label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 5) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full bg-amber-400 rounded-full"
                />
            </div>
            <span className="text-sm font-medium text-[#1E293B] w-8">{value.toFixed(1)}</span>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            <div className="neu-xl p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Overall Rating */}
                    <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-[#1E293B]">
                            {averageRating.toFixed(1)}
                        </div>
                        <div>
                            <StarRating value={averageRating} size="md" />
                            <p className="text-sm text-[#64748B] mt-1">
                                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {reviewsWithBreakdown.length > 0 && (
                        <div className="flex-1 space-y-2">
                            {Object.entries(categoryAverages).map(([key, value]) => (
                                <RatingBar
                                    key={key}
                                    label={ratingLabels[key as keyof RatingBreakdown]}
                                    value={value}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {displayedReviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="neu-card p-6"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {review.user_avatar ? (
                                        <Image
                                            src={review.user_avatar}
                                            alt={review.user_name}
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full neu-icon-primary flex items-center justify-center">
                                            <span className="text-lg font-semibold text-white">
                                                {review.user_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-[#1E293B]">{review.user_name}</h4>
                                        <p className="text-sm text-[#64748B]">
                                            {format(new Date(review.created_at), 'MMMM yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-[#1E293B]">{review.rating}</span>
                                </div>
                            </div>

                            {/* Comment */}
                            <p className="text-[#1E293B] mb-4">
                                {review.comment.length > 300 && !expandedReviews.has(review.id)
                                    ? `${review.comment.slice(0, 300)}...`
                                    : review.comment}
                            </p>

                            {/* Show More Button */}
                            {review.comment.length > 300 && (
                                <button
                                    onClick={() => toggleExpanded(review.id)}
                                    className="text-sm text-brand-primary hover:underline mb-4 flex items-center gap-1"
                                >
                                    {expandedReviews.has(review.id) ? 'Show less' : 'Read more'}
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${expandedReviews.has(review.id) ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>
                            )}

                            {/* Photos */}
                            {review.photos && review.photos.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {review.photos.map((photo, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedPhoto(photo)}
                                            className="relative w-20 h-20 rounded-xl overflow-hidden hover:scale-105 transition-transform"
                                        >
                                            <Image
                                                src={photo}
                                                alt={`Review photo ${idx + 1}`}
                                                fill
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Rating Breakdown */}
                            {review.rating_breakdown && expandedReviews.has(review.id) && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 p-3 bg-[#EEF2F6] rounded-xl">
                                    {Object.entries(review.rating_breakdown).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between text-sm">
                                            <span className="text-[#64748B]">
                                                {ratingLabels[key as keyof RatingBreakdown]}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="font-medium">{value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Host Response */}
                            {review.host_response && (
                                <div className="mt-4 p-4 bg-[#EEF2F6] rounded-xl">
                                    <h5 className="font-semibold text-[#1E293B] mb-2">Host Response</h5>
                                    <p className="text-sm text-[#64748B]">{review.host_response.content}</p>
                                    <p className="text-xs text-[#94A3B8] mt-2">
                                        {format(new Date(review.host_response.created_at), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E2E8F0]">
                                <button
                                    onClick={() => onMarkHelpful?.(review.id)}
                                    className={`flex items-center gap-1 text-sm transition-colors ${review.is_helpful
                                        ? 'text-brand-primary'
                                        : 'text-[#64748B] hover:text-brand-primary'
                                        }`}
                                >
                                    <ThumbsUp
                                        className={`w-4 h-4 ${review.is_helpful ? 'fill-brand-primary' : ''}`}
                                    />
                                    Helpful {review.helpful_count && review.helpful_count > 0 && `(${review.helpful_count})`}
                                </button>
                                <button
                                    onClick={() => onReport?.(review.id)}
                                    className="flex items-center gap-1 text-sm text-[#64748B] hover:text-red-500 transition-colors"
                                >
                                    <Flag className="w-4 h-4" />
                                    Report
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show More Reviews Button */}
            {reviews.length > 5 && (
                <div className="text-center">
                    <Button
                        variant="outline"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                    </Button>
                </div>
            )}

            {/* Photo Lightbox */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        ×
                    </button>
                    <div className="relative w-full h-[90vh] max-w-5xl">
                        <Image
                            src={selectedPhoto}
                            alt="Review photo"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

