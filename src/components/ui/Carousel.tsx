'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps<T> {
    items: T[]
    renderItem: (item: T, index: number) => ReactNode
    itemWidth?: string
    gap?: string
    showArrows?: boolean
    showDots?: boolean
    autoPlay?: boolean
    autoPlayInterval?: number
    className?: string
}

export default function Carousel<T extends { id: string | number }>({
    items,
    renderItem,
    itemWidth = 'w-[280px] sm:w-[320px] lg:w-[350px]',
    gap = 'gap-4 sm:gap-6',
    showArrows = true,
    showDots = true,
    autoPlay = false,
    autoPlayInterval = 5000,
    className = '',
}: CarouselProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const checkScrollButtons = useCallback(() => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

            // Calculate current index based on scroll position
            const itemWidth = containerRef.current.querySelector('[data-carousel-item]')?.clientWidth || 0
            if (itemWidth > 0) {
                const index = Math.round(scrollLeft / (itemWidth + 16)) // 16 is gap
                setCurrentIndex(Math.min(index, items.length - 1))
            }
        }
    }, [items.length])

    useEffect(() => {
        checkScrollButtons()
        window.addEventListener('resize', checkScrollButtons)
        return () => window.removeEventListener('resize', checkScrollButtons)
    }, [checkScrollButtons])

    // Auto-play functionality
    const scroll = useCallback((direction: 'left' | 'right') => {
        if (containerRef.current) {
            const itemElement = containerRef.current.querySelector('[data-carousel-item]') as HTMLElement
            const itemWidth = itemElement?.clientWidth || 320
            const gapSize = 24 // gap-6 = 1.5rem = 24px
            const scrollAmount = itemWidth + gapSize

            const newScrollLeft = direction === 'left'
                ? containerRef.current.scrollLeft - scrollAmount
                : containerRef.current.scrollLeft + scrollAmount

            containerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            })
        }
    }, [])

    useEffect(() => {
        if (!autoPlay || isDragging) return

        const interval = setInterval(() => {
            if (containerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
                const maxScroll = scrollWidth - clientWidth

                if (scrollLeft >= maxScroll - 10) {
                    // Reset to start
                    containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
                } else {
                    scroll('right')
                }
            }
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [autoPlay, autoPlayInterval, isDragging, scroll])

    const scrollToIndex = (index: number) => {
        if (containerRef.current) {
            const itemElement = containerRef.current.querySelector('[data-carousel-item]') as HTMLElement
            const itemWidth = itemElement?.clientWidth || 320
            const gapSize = 24

            containerRef.current.scrollTo({
                left: index * (itemWidth + gapSize),
                behavior: 'smooth'
            })
        }
    }

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - containerRef.current.offsetLeft)
        setScrollLeft(containerRef.current.scrollLeft)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return
        e.preventDefault()
        const x = e.pageX - containerRef.current.offsetLeft
        const walk = (x - startX) * 1.5 // Scroll speed multiplier
        containerRef.current.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    return (
        <div className={`relative ${className}`}>
            {/* Navigation Arrows */}
            {showArrows && (
                <>
                    <AnimatePresence>
                        {canScrollLeft && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => scroll('left')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-clay-lg flex items-center justify-center hover:bg-white transition-colors -ml-2 sm:-ml-6"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E293B]" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {canScrollRight && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => scroll('right')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-clay-lg flex items-center justify-center hover:bg-white transition-colors -mr-2 sm:-mr-6"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E293B]" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Carousel Container */}
            <div
                ref={containerRef}
                onScroll={checkScrollButtons}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`
          flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing
          scroll-smooth pb-4 -mx-4 px-4
          ${gap}
        `}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        data-carousel-item
                        className={`flex-shrink-0 ${itemWidth}`}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>

            {/* Dot Indicators */}
            {showDots && items.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                    ? 'w-6 sm:w-8 h-2 bg-brand-primary'
                                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
