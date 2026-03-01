'use client'

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
    children: ReactNode
    onRefresh: () => Promise<void>
    disabled?: boolean
    pullDistance?: number
    className?: string
}

export function PullToRefresh({
    children,
    onRefresh,
    disabled = false,
    pullDistance = 80,
    className = '',
}: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const startY = useRef(0)
    const isPulling = useRef(false)

    const y = useMotionValue(0)
    const rotate = useTransform(y, [0, pullDistance], [0, 360])
    const scale = useTransform(y, [0, pullDistance], [0.5, 1])
    const opacity = useTransform(y, [0, pullDistance], [0, 1])

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (disabled || isRefreshing) return

            const container = containerRef.current
            if (!container || container.scrollTop > 0) return

            startY.current = e.touches[0].clientY
            isPulling.current = true
        },
        [disabled, isRefreshing]
    )

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isPulling.current || disabled || isRefreshing) return

            const currentY = e.touches[0].clientY
            const diff = currentY - startY.current

            if (diff > 0) {
                // Apply resistance
                const resistance = 0.5
                const newY = Math.min(diff * resistance, pullDistance * 1.5)
                y.set(newY)
            }
        },
        [disabled, isRefreshing, pullDistance, y]
    )

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current || disabled || isRefreshing) return

        isPulling.current = false
        const currentY = y.get()

        if (currentY >= pullDistance) {
            // Trigger refresh
            animate(y, pullDistance * 0.5)
            setIsRefreshing(true)

            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
                animate(y, 0)
            }
        } else {
            // Reset
            animate(y, 0)
        }
    }, [disabled, isRefreshing, pullDistance, y, onRefresh])

    // Reset on unmount
    useEffect(() => {
        return () => {
            y.set(0)
        }
    }, [y])

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Refresh Indicator */}
            <motion.div
                style={{
                    y: useTransform(y, (v) => v - 40),
                    opacity,
                }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
            >
                <motion.div
                    style={{ rotate: isRefreshing ? undefined : rotate, scale }}
                    className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center"
                    animate={isRefreshing ? { rotate: 360 } : undefined}
                    transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : undefined}
                >
                    <RefreshCw className="w-4 h-4 text-white" />
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div style={{ y }}>{children}</motion.div>
        </div>
    )
}

// ============================================
// Swipe Gesture Components
// ============================================

interface SwipeableProps {
    children: ReactNode
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    threshold?: number
    className?: string
}

export function Swipeable({
    children,
    onSwipeLeft,
    onSwipeRight,
    threshold = 100,
    className = '',
}: SwipeableProps) {
    const startX = useRef(0)
    const startY = useRef(0)
    const isSwiping = useRef(false)

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
        startY.current = e.touches[0].clientY
        isSwiping.current = true
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isSwiping.current) return
        isSwiping.current = false

        const endX = e.changedTouches[0].clientX
        const endY = e.changedTouches[0].clientY
        const diffX = endX - startX.current
        const diffY = endY - startY.current

        // Only trigger if horizontal swipe is dominant
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                onSwipeRight?.()
            } else {
                onSwipeLeft?.()
            }
        }
    }

    return (
        <div
            className={className}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {children}
        </div>
    )
}

// ============================================
// Swipeable Card (for wishlist, etc.)
// ============================================

interface SwipeableCardProps {
    children: ReactNode
    onAction?: () => void
    actionIcon?: ReactNode
    actionColor?: string
    actionLabel?: string
    threshold?: number
    className?: string
}

export function SwipeableCard({
    children,
    onAction,
    actionIcon,
    actionColor = 'bg-red-500',
    actionLabel = 'Delete',
    threshold = 100,
    className = '',
}: SwipeableCardProps) {
    const x = useMotionValue(0)
    const [isRevealed, setIsRevealed] = useState(false)
    const startX = useRef(0)

    const backgroundOpacity = useTransform(x, [-threshold * 2, 0], [1, 0])
    const contentX = useTransform(x, (v) => v)

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        const currentX = e.touches[0].clientX
        const diff = currentX - startX.current

        // Only allow left swipe
        if (diff < 0) {
            x.set(Math.max(diff, -threshold * 2))
        }
    }

    const handleTouchEnd = () => {
        const currentX = x.get()

        if (currentX < -threshold) {
            // Reveal action
            animate(x, -threshold * 1.5)
            setIsRevealed(true)
        } else {
            // Reset
            animate(x, 0)
            setIsRevealed(false)
        }
    }

    const handleAction = () => {
        onAction?.()
        animate(x, 0)
        setIsRevealed(false)
    }

    const handleCancel = () => {
        animate(x, 0)
        setIsRevealed(false)
    }

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            {/* Background Action */}
            <motion.div
                style={{ opacity: backgroundOpacity }}
                className={`absolute inset-y-0 right-0 ${actionColor} flex items-center justify-center px-6`}
            >
                <button
                    onClick={handleAction}
                    className="flex flex-col items-center text-white"
                >
                    {actionIcon}
                    <span className="text-xs mt-1">{actionLabel}</span>
                </button>
            </motion.div>

            {/* Content */}
            <motion.div
                style={{ x: contentX }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative bg-[#EEF2F6]"
            >
                {children}
            </motion.div>

            {/* Cancel overlay when revealed */}
            {isRevealed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20"
                    onClick={handleCancel}
                />
            )}
        </div>
    )
}

// ============================================
// Swipeable Image Gallery
// ============================================

interface SwipeableGalleryProps {
    images: string[]
    alt: string
    className?: string
}

export function SwipeableGallery({
    images,
    alt,
    className = '',
}: SwipeableGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const x = useMotionValue(0)
    const startX = useRef(0)

    const handleDragStart = () => {
        startX.current = x.get()
    }

    const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
        const diff = info.offset.x

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1)
            } else if (diff < 0 && currentIndex < images.length - 1) {
                setCurrentIndex((prev) => prev + 1)
            }
        }
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <motion.div
                className="flex"
                animate={{ x: `-${currentIndex * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {images.map((image, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                        <img
                            src={image}
                            alt={`${alt} - ${index + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                    </div>
                ))}
            </motion.div>

            {/* Dots indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white w-4'
                                : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Counter */}
            <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    )
}

// ============================================
// Haptic Feedback Hook
// ============================================

export function useHapticFeedback() {
    const triggerHaptic = useCallback(
        (type: 'light' | 'medium' | 'heavy' = 'light') => {
            if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
                const patterns = {
                    light: [10],
                    medium: [20],
                    heavy: [30],
                }
                navigator.vibrate(patterns[type])
            }
        },
        []
    )

    return triggerHaptic
}
