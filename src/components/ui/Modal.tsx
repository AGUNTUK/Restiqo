'use client'

import { Fragment, ReactNode, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  variant?: 'default' | 'bottomSheet' | 'fullscreen'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  variant = 'default',
}: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] md:max-w-[90vw]',
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // Bottom Sheet variant for mobile
  if (variant === 'bottomSheet') {
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              role="button"
              tabIndex={-1}
              aria-label="Close modal"
            />

            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
            >
              <div className="bg-[#EEF2F6] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-[#94A3B8] rounded-full" />
                </div>

                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E2E8F0]">
                    {title && (
                      <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-[#1E293B]">
                        {title}
                      </h2>
                    )}
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2 rounded-xl neu-button transition-all duration-200 hover:scale-105 ml-auto focus-visible:ring-2 focus-visible:ring-brand-primary"
                      >
                        <X className="w-5 h-5 text-[#64748B]" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {children}
                </div>

                {/* Safe area padding for iOS */}
                <div className="h-[env(safe-area-inset-bottom,0px)]" />
              </div>
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>
    )
  }

  // Fullscreen variant for mobile
  if (variant === 'fullscreen') {
    return (
      <AnimatePresence>
        {isOpen && (
          <Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#EEF2F6] z-50 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[#EEF2F6] border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between px-4 py-3">
                  {title && (
                    <h2 id="modal-title" className="text-lg font-semibold text-[#1E293B]">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      aria-label="Close modal"
                      className="p-2 rounded-xl neu-button transition-all duration-200 hover:scale-105 ml-auto"
                    >
                      <X className="w-5 h-5 text-[#64748B]" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto h-[calc(100vh-60px)] pb-[env(safe-area-inset-bottom,0px)]">
                {children}
              </div>
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>
    )
  }

  // Default modal variant
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
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="fixed inset-0 bg-[#EEF2F6]/80 backdrop-blur-sm z-50"
            role="button"
            tabIndex={-1}
            aria-label="Close modal"
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`w-full ${sizes[size]} neu-modal relative my-4 sm:my-8 max-h-[90vh] overflow-y-auto`}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="sticky top-0 bg-[#EEF2F6] z-10 flex items-center justify-between p-4 sm:p-6 border-b border-[#E2E8F0]/50">
                  {title && (
                    <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-[#1E293B]">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      aria-label="Close modal"
                      className="p-2 sm:p-2.5 rounded-xl neu-button transition-all duration-200 hover:scale-105 ml-auto focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4 sm:p-6">{children}</div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}

