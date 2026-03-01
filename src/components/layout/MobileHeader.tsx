'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useRealtimeNotifications } from '@/lib/realtime'

export default function MobileHeader() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { unreadCount } = useRealtimeNotifications(user?.id || null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNotificationClick = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/dashboard?tab=notifications')}`)
      return
    }
    router.push('/dashboard?tab=notifications')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300 overflow-hidden ${
        isScrolled
          ? 'bg-[#EEF2F6]/95 backdrop-blur-lg shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
          : 'bg-[#EEF2F6]/80 backdrop-blur-sm'
      }`}
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        paddingTop: 'env(safe-area-inset-top, 0)',
      }}
    >
      <div
        className="flex items-center justify-between h-14 px-4"
        style={{
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center"
          >
            <Image
              src="/logo.png"
              alt="Restiqa"
              width={100}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </motion.div>
        </Link>

        {/* Right Side - Notification Bell */}
        <div className="flex items-center flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNotificationClick}
            className="relative p-2.5 rounded-xl transition-all duration-200"
            style={{
              background: 'var(--color-background)',
              boxShadow: isScrolled
                ? '3px 3px 6px rgba(0,0,0,0.05), -3px -3px 6px rgba(255,255,255,0.8)'
                : '2px 2px 4px rgba(0,0,0,0.03), -2px -2px 4px rgba(255,255,255,0.7)',
            }}
          >
            <Bell className="w-5 h-5 text-[#64748B]" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  )
}

