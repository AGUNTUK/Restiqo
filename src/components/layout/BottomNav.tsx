'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  Calendar,
  Heart,
  User,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/search',
      label: 'Explore',
      icon: Search,
    },
    {
      href: '/dashboard?tab=bookings',
      label: 'Bookings',
      icon: Calendar,
      requiresAuth: true,
    },
    {
      href: '/dashboard?tab=wishlist',
      label: 'Wishlist',
      icon: Heart,
      requiresAuth: true,
    },
    {
      href: isAuthenticated ? '/dashboard' : '/auth/login',
      label: isAuthenticated ? 'Profile' : 'Sign In',
      icon: User,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.includes('?tab=')) {
      const [path, tab] = href.split('?tab=')
      return pathname === path
    }
    return pathname.startsWith(href)
  }

  const handleClick = (href: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      router.push('/auth/login')
      return
    }
    router.push(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#EEF2F6]/95 backdrop-blur-md border-t border-white/50 shadow-[0_-8px_16px_rgba(0,0,0,0.08)]">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon

            return (
              <button
                key={item.href}
                onClick={() => handleClick(item.href, item.requiresAuth)}
                className={`relative flex flex-col items-center justify-center w-full h-full py-2 transition-all duration-200 ${
                  active ? 'text-brand-primary' : 'text-[#64748B]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-primary rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 mb-1 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Safe area padding for iOS devices */}
      <div className="h-safe-area-inset-bottom bg-[#EEF2F6]/95" />
    </nav>
  )
}

