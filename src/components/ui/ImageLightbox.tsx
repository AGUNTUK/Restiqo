'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'
import Image from 'next/image'

interface ImageLightboxProps {
    images: string[]
    currentIndex: number
    isOpen: boolean
    onClose: () => void
    alt?: string
}

export default function ImageLightbox({
    images,
    currentIndex: initialIndex,
    isOpen,
    onClose,
    alt = 'Image',
}: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)

    // Reset state when lightbox opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex)
            setZoom(1)
            setPosition({ x: 0, y: 0 })
        }
    }, [isOpen, initialIndex])

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Keyboard navigation
    const navigatePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        setZoom(1)
        setPosition({ x: 0, y: 0 })
    }, [images.length])

    const navigateNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        setZoom(1)
        setPosition({ x: 0, y: 0 })
    }, [images.length])

    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev + 0.5, 3))
    }, [])

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => {
            const newZoom = Math.max(prev - 0.5, 1)
            if (newZoom === 1) {
                setPosition({ x: 0, y: 0 })
            }
            return newZoom
        })
    }, [])

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case 'Escape':
                    onClose()
                    break
                case 'ArrowLeft':
                    navigatePrev()
                    break
                case 'ArrowRight':
                    navigateNext()
                    break
                case '+':
                case '=':
                    handleZoomIn()
                    break
                case '-':
                    handleZoomOut()
                    break
            }
        },
        [isOpen, onClose, navigatePrev, navigateNext, handleZoomIn, handleZoomOut]
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    const handleDownload = async () => {
        const image = images[currentIndex]
        try {
            const response = await fetch(image)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `image-${currentIndex + 1}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to download image:', error)
        }
    }

    const handleDragStart = () => {
        if (zoom > 1) {
            setIsDragging(true)
        }
    }

    const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || zoom === 1) return

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

        setPosition((prev) => ({
            x: prev.x + (clientX - (prev.x || clientX)) * 0.1,
            y: prev.y + (clientY - (prev.y || clientY)) * 0.1,
        }))
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/95 z-50"
                    />

                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed top-4 right-4 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X className="w-6 h-6 text-white" />
                    </motion.button>

                    {/* Controls */}
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom === 1}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-white text-sm min-w-[3rem] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={zoom === 3}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-5 h-5 text-white" />
                        </button>
                        <div className="w-px h-6 bg-white/20 mx-2" />
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Download image"
                        >
                            <Download className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onClick={navigatePrev}
                                className="fixed left-4 top-1/2 -translate-y-1/2 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onClick={navigateNext}
                                className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </motion.button>
                        </>
                    )}

                    {/* Main Image */}
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-8"
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDrag}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDrag}
                        onTouchEnd={handleDragEnd}
                    >
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: 1,
                                scale: zoom,
                                x: position.x,
                                y: position.y,
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative max-w-full max-h-full"
                            style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
                        >
                            <Image
                                src={images[currentIndex]}
                                alt={`${alt} - ${currentIndex + 1}`}
                                width={1200}
                                height={800}
                                className="max-h-[85vh] w-auto h-auto object-contain"
                                priority
                            />
                        </motion.div>
                    </div>

                    {/* Image Counter */}
                    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]">
                        <div className="px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[60]">
                            <div className="flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm max-w-[90vw] overflow-x-auto">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentIndex(index)
                                            setZoom(1)
                                            setPosition({ x: 0, y: 0 })
                                        }}
                                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${index === currentIndex
                                                ? 'ring-2 ring-brand-primary scale-110'
                                                : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </Fragment>
            )}
        </AnimatePresence>
    )
}

// Hook for using lightbox
export function useLightbox(images: string[]) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const openLightbox = (index: number = 0) => {
        setCurrentIndex(index)
        setIsOpen(true)
    }

    const closeLightbox = () => {
        setIsOpen(false)
    }

    return {
        isOpen,
        currentIndex,
        openLightbox,
        closeLightbox,
        lightboxProps: {
            images,
            currentIndex,
            isOpen,
            onClose: closeLightbox,
        },
    }
}
