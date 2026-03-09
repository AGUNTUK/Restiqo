'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Camera, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface RatingBreakdown {
    cleanliness: number
    location: number
    value: number
    communication: number
    check_in: number
    accuracy: number
}

interface ReviewFormProps {
    propertyId: string
    bookingId: string
    onSubmit: (data: {
        rating: number
        rating_breakdown: RatingBreakdown
        comment: string
        photos: string[]
    }) => Promise<void>
    onCancel?: () => void
}

const ratingCategories: { key: keyof RatingBreakdown; label: string }[] = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'check_in', label: 'Check-in' },
    { key: 'communication', label: 'Communication' },
    { key: 'location', label: 'Location' },
    { key: 'value', label: 'Value' },
]

export default function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
    const [overallRating, setOverallRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>({
        cleanliness: 0,
        location: 0,
        value: 0,
        communication: 0,
        check_in: 0,
        accuracy: 0,
    })
    const [comment, setComment] = useState('')
    const [photos, setPhotos] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRatingBreakdownChange = (key: keyof RatingBreakdown, value: number) => {
        setRatingBreakdown((prev) => ({ ...prev, [key]: value }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        // Convert files to data URLs (in production, upload to storage)
        Array.from(files).forEach((file) => {
            if (photos.length >= 5) return

            const reader = new FileReader()
            reader.onload = (event) => {
                const result = event.target?.result as string
                setPhotos((prev) => [...prev.slice(0, 4), result])
            }
            reader.readAsDataURL(file)
        })
    }

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (overallRating === 0) {
            setError('Please provide an overall rating')
            return
        }

        if (comment.trim().length < 10) {
            setError('Please write at least 10 characters')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await onSubmit({
                rating: overallRating,
                rating_breakdown: ratingBreakdown,
                comment: comment.trim(),
                photos,
            })
        } catch {
            setError('Failed to submit review. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const StarRating = ({
        value,
        onChange,
        size = 'md',
        interactive = true
    }: {
        value: number
        onChange?: (value: number) => void
        size?: 'sm' | 'md' | 'lg'
        interactive?: boolean
    }) => {
        const sizes = {
            sm: 'w-4 h-4',
            md: 'w-6 h-6',
            lg: 'w-8 h-8',
        }

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => onChange?.(star)}
                        onMouseEnter={() => interactive && setHoveredRating(star)}
                        onMouseLeave={() => interactive && setHoveredRating(0)}
                        className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-transform hover:scale-110`}
                    >
                        <Star
                            className={`${sizes[size]} ${star <= (hoveredRating || value)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="neu-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E293B] mb-6">Write a Review</h3>

            {/* Overall Rating */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Overall Rating *
                </label>
                <div className="flex items-center gap-4">
                    <StarRating value={overallRating} onChange={setOverallRating} size="lg" />
                    <span className="text-lg font-semibold text-[#1E293B]">
                        {overallRating > 0 ? `${overallRating}.0` : '-'}
                    </span>
                </div>
            </div>

            {/* Rating Breakdown */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-[#1E293B] mb-3">
                    Rate Specific Aspects
                </label>
                <div className="space-y-3">
                    {ratingCategories.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-[#64748B]">{label}</span>
                            <StarRating
                                value={ratingBreakdown[key]}
                                onChange={(value) => handleRatingBreakdownChange(key, value)}
                                size="sm"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Your Review *
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this property..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl neu-input text-[#1E293B] placeholder-[#94A3B8] resize-none focus:outline-none"
                />
                <p className="mt-1 text-xs text-[#64748B]">
                    {comment.length}/2000 characters (minimum 10)
                </p>
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                    Add Photos (optional, max 5)
                </label>
                <div className="flex flex-wrap gap-3">
                    {photos.map((photo, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-20 h-20 rounded-xl overflow-hidden group"
                        >
                            <Image
                                src={photo}
                                alt={`Review photo ${index + 1}`}
                                fill
                                className="w-full h-full object-cover"
                                unoptimized
                            />
                            <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}

                    {photos.length < 5 && (
                        <label className="w-20 h-20 rounded-xl neu-button flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                multiple
                            />
                            <Camera className="w-6 h-6 text-[#64748B]" />
                            <span className="text-xs text-[#64748B] mt-1">Add</span>
                        </label>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm"
                >
                    {error}
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={overallRating === 0 || comment.trim().length < 10}
                >
                    Submit Review
                </Button>
            </div>
        </div>
    )
}
