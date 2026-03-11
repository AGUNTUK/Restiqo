'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Heart,
  Calendar,
  Plus,
  MessageCircle,
  User,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface NavItem {
  id: string
  href: string
  label: string
  icon: React.ElementType
  requiresAuth?: boolean
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isHost } = useAuth()
  const [pressedItem, setPressedItem] = useState<string | null>(null)

  // Define navigation items
  const leftNavItems: NavItem[] = [
    {
      id: 'home',
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'wishlist',
      href: '/dashboard?tab=wishlist',
      label: 'Wishlist',
      icon: Heart,
      requiresAuth: true,
    },
  ]

  const rightNavItems: NavItem[] = [
    {
      id: 'inbox',
      href: '/dashboard?tab=inbox',
      label: 'Inbox',
      icon: MessageCircle,
      requiresAuth: true,
    },
    {
      id: 'profile',
      href: isAuthenticated ? '/dashboard' : '/auth/login',
      label: 'Profile',
      icon: User,
    },
  ]

  // Role-based center button configuration
  const centerButton = isHost
    ? {
      id: 'create',
      href: '/host/listings/new',
      label: 'Create',
      icon: Plus,
    }
    : {
      id: 'bookings',
      href: '/dashboard?tab=bookings',
      label: 'Bookings',
      icon: Calendar,
    }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'

    if (href.includes('?tab=')) {
      const [path, tabQuery] = href.split('?tab=')
      const targetTab = tabQuery || ''
      return pathname === path && searchParams.get('tab') === targetTab
    }

    if (href === '/dashboard') {
      return pathname === '/dashboard' && !searchParams.get('tab')
    }

    return pathname.startsWith(href)
  }

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(item.href)}`)
      return
    }
    router.push(item.href)
  }

  const handleCenterClick = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(centerButton.href)}`)
      return
    }
    router.push(centerButton.href)
  }

  // Ripple animation variants
  const rippleVariants = {
    initial: { scale: 0, opacity: 0.5 },
    animate: { scale: 2.5, opacity: 0 },
    exit: { scale: 0, opacity: 0 },
  }

  // Nav item animation variants
  const navItemVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.9 },
    hover: { scale: 1.05 },
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      {/* Main Navigation Container */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
          left: '8px',
          right: '8px',
          width: 'auto',
          maxWidth: '480px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="relative flex w-full items-center justify-between h-16 mx-auto"
          style={{
            background: 'rgba(238, 242, 246, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '999px',
            padding: '10px 4px',
            boxShadow: `
              6px 6px 12px rgba(0,0,0,0.08),
              -6px -6px 12px rgba(255,255,255,0.9),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
            boxSizing: 'border-box',
            overflow: 'visible',
          }}
        >
          {/* Left Navigation Items */}
          {leftNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isPressed = pressedItem === item.id

            return (
              <motion.button
                key={item.id}
                variants={navItemVariants}
                initial="initial"
                whileTap="tap"
                whileHover="hover"
                onClick={() => handleNavClick(item)}
                onTouchStart={() => setPressedItem(item.id)}
                onTouchEnd={() => setPressedItem(null)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center h-full flex-1 min-w-0 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-lg"
              >
                {/* Ripple Effect */}
                <AnimatePresence>
                  {isPressed && (
                    <motion.div
                      variants={rippleVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.4 }}
                      className="absolute w-8 h-8 rounded-full bg-brand-primary/20"
                    />
                  )}
                </AnimatePresence>

                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute top-0 w-6 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-all duration-200 ${active
                    ? 'text-brand-primary stroke-[2.5]'
                    : 'text-[#64748B] stroke-2'
                    }`}
                />

                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${active ? 'text-brand-primary' : 'text-[#94A3B8]'
                    }`}
                >
                  {item.label}
                </span>
              </motion.button>
            )
          })}

          {/* Center Floating Button */}
          <motion.button
            onClick={handleCenterClick}
            whileTap={{ scale: 0.9 }}
            aria-label={centerButton.label}
            className="relative z-10 flex flex-col items-center justify-center flex-shrink-0 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-full pb-1"
            style={{ margin: '0 6px', marginTop: '-24px' }}
          >
            {/* Glow Effect */}
            <motion.div
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-12 h-12 rounded-full"
              style={{
                background: isHost
                  ? 'radial-gradient(circle, rgba(136, 197, 28, 0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(252, 153, 5, 0.3) 0%, transparent 70%)',
              }}
            />

            {/* Button Container */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: isHost
                  ? 'linear-gradient(135deg, #88C51C 0%, #6da315 100%)'
                  : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                boxShadow: isHost
                  ? '0 6px 20px rgba(136, 197, 28, 0.4), 0 2px 6px rgba(136, 197, 28, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  : '0 6px 20px rgba(252, 153, 5, 0.4), 0 2px 6px rgba(252, 153, 5, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                border: '3px solid rgba(238, 242, 246, 0.95)',
              }}
            >
              {/* Inner highlight */}
              <div
                className="absolute inset-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                }}
              />

              {/* Icon */}
              {isHost ? (
                <Plus className="w-5 h-5 text-white stroke-[2.5]" />
              ) : (
                <Calendar className="w-4 h-4 text-white stroke-[2.5]" />
              )}
            </motion.div>

            {/* Label below button */}
            <span
              className="absolute -bottom-5 text-[10px] font-medium whitespace-nowrap"
              style={{ color: isHost ? '#6da315' : 'var(--color-primary-dark)' }}
            >
              {isHost ? 'Create' : 'Bookings'}
            </span>
          </motion.button>

          {/* Right Navigation Items */}
          {rightNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const isPressed = pressedItem === item.id

            return (
              <motion.button
                key={item.id}
                variants={navItemVariants}
                initial="initial"
                whileTap="tap"
                whileHover="hover"
                onClick={() => handleNavClick(item)}
                onTouchStart={() => setPressedItem(item.id)}
                onTouchEnd={() => setPressedItem(null)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center h-full flex-1 min-w-0 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-lg"
              >
                {/* Ripple Effect */}
                <AnimatePresence>
                  {isPressed && (
                    <motion.div
                      variants={rippleVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.4 }}
                      className="absolute w-8 h-8 rounded-full bg-brand-primary/20"
                    />
                  )}
                </AnimatePresence>

                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute top-0 w-6 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-all duration-200 ${active
                    ? 'text-brand-primary stroke-[2.5]'
                    : 'text-[#64748B] stroke-2'
                    }`}
                />

                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${active ? 'text-brand-primary' : 'text-[#94A3B8]'
                    }`}
                >
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </nav>
  )
}


