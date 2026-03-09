'use client'

import { useRef, useCallback, useEffect, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface VirtualizedListProps<T> {
    items: T[]
    itemHeight: number
    containerHeight: number | string
    renderItem: (item: T, index: number) => ReactNode
    onLoadMore?: () => void
    hasMore?: boolean
    isLoading?: boolean
    emptyMessage?: string
    className?: string
    overscan?: number
}

export default function VirtualizedList<T>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    onLoadMore,
    hasMore = false,
    isLoading = false,
    emptyMessage = 'No items to display',
    className = '',
    overscan = 5,
}: VirtualizedListProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [containerHeightPx, setContainerHeightPx] = useState(0)

    // Calculate container height
    useEffect(() => {
        if (typeof containerHeight === 'number') {
            setContainerHeightPx(containerHeight)
            return
        }

        const updateHeight = () => {
            if (containerRef.current) {
                setContainerHeightPx(containerRef.current.clientHeight)
            }
        }

        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => window.removeEventListener('resize', updateHeight)
    }, [containerHeight])

    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeightPx) / itemHeight) + overscan
    )

    // Handle scroll
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement
            setScrollTop(target.scrollTop)

            // Infinite loading
            if (
                onLoadMore &&
                hasMore &&
                !isLoading &&
                target.scrollHeight - target.scrollTop - target.clientHeight < itemHeight * 5
            ) {
                onLoadMore()
            }
        },
        [onLoadMore, hasMore, isLoading, itemHeight]
    )

    // Empty state
    if (items.length === 0 && !isLoading) {
        return (
            <div className={`flex items-center justify-center h-64 ${className}`}>
                <p className="text-[#64748B]">{emptyMessage}</p>
            </div>
        )
    }

    const totalHeight = items.length * itemHeight
    const visibleItems = items.slice(startIndex, endIndex)

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: startIndex * itemHeight,
                        left: 0,
                        right: 0,
                    }}
                >
                    {visibleItems.map((item, index) => (
                        <motion.div
                            key={startIndex + index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.02, 0.3) }}
                            style={{ height: itemHeight }}
                        >
                            {renderItem(item, startIndex + index)}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Loading indicator */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-4"
                    >
                        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Grid variant for property cards
interface VirtualizedGridProps<T> {
    items: T[]
    itemWidth: number
    itemHeight: number
    containerWidth?: number
    containerHeight: number | string
    gap?: number
    renderItem: (item: T, index: number) => ReactNode
    onLoadMore?: () => void
    hasMore?: boolean
    isLoading?: boolean
    emptyMessage?: string
    className?: string
}

export function VirtualizedGrid<T>({
    items,
    itemWidth,
    itemHeight,
    containerWidth,
    containerHeight,
    gap = 16,
    renderItem,
    onLoadMore,
    hasMore = false,
    isLoading = false,
    emptyMessage = 'No items to display',
    className = '',
}: VirtualizedGridProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null)

    // Handle scroll for infinite loading
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.target as HTMLDivElement
            const scrollBottom =
                target.scrollHeight - target.scrollTop - target.clientHeight

            if (onLoadMore && hasMore && !isLoading && scrollBottom < 200) {
                onLoadMore()
            }
        },
        [onLoadMore, hasMore, isLoading]
    )

    if (items.length === 0 && !isLoading) {
        return (
            <div className={`flex items-center justify-center h-64 ${className}`}>
                <p className="text-[#64748B]">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={`overflow-auto ${className}`}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div
                style={{
                    width: containerWidth ? `${containerWidth}px` : '100%',
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(${itemWidth}px, 1fr))`,
                    gap: `${gap}px`,
                }}
            >
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Math.min(index * 0.02, 0.5) }}
                        style={{ minHeight: itemHeight }}
                    >
                        {renderItem(item, index)}
                    </motion.div>
                ))}
            </div>

            {/* Loading indicator */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-8"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
