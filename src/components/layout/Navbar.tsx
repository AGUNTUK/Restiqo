'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  User,
  LogOut,
  Heart,
  Calendar,
  Settings,
  Plus,
  LayoutDashboard,
  ChevronDown,
  Home,
  Shield,
  Building,
  Bell,
  MessageSquare,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useAuth } from '@/lib/auth'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()

  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isHost,
    isAdmin,
    isHostPending,
    signOut,
  } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      setIsScrolled(currentScrollY > 20)

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleLogout = async () => {
    await signOut()
    setIsProfileOpen(false)
    setIsMenuOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/apartments', label: 'Apartments' },
    { href: '/hotels', label: 'Hotels' },
    { href: '/tours', label: 'Tours' },
  ]

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isProfileOpen) {
        const target = e.target as HTMLElement
        if (!target.closest('.profile-dropdown')) {
          setIsProfileOpen(false)
        }
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isProfileOpen])

  const getDashboardLink = () => {
    if (isAdmin) return '/admin'
    if (isHost) return '/host'
    return '/dashboard'
  }

  const getRoleBadgeStyle = () => {
    if (isAdmin) return 'neu-badge bg-purple-500 text-white shadow-[3px_3px_6px_rgba(168,85,247,0.3),-3px_-3px_6px_rgba(255,255,255,0.8)]'
    if (isHost) return 'neu-badge bg-blue-500 text-white shadow-[3px_3px_6px_rgba(59,130,246,0.3),-3px_-3px_6px_rgba(255,255,255,0.8)]'
    if (isHostPending) return 'neu-badge bg-amber-500 text-white shadow-[3px_3px_6px_rgba(245,158,11,0.3),-3px_-3px_6px_rgba(255,255,255,0.8)]'
    return 'neu-badge-primary'
  }

  return (
    <nav
      className={`hidden md:block fixed top-0 left-0 right-0 z-50 w-full overflow-visible transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled
          ? 'bg-[#EEF2F6] shadow-[8px_8px_16px_rgba(0,0,0,0.08),-8px_-8px_16px_rgba(255,255,255,0.9)]'
          : 'bg-[#EEF2F6] shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)]'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex items-center justify-between h-16 sm:h-20 min-w-0">

          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="Restiqa Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${isActive(link.href)
                  ? 'neu-nav-item-active'
                  : 'neu-nav-item hover:shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)]'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {!isLoading && !isHost && !isAdmin && !isHostPending && (
              <Link href={isAuthenticated ? '/host/register' : '/auth/login?redirect=/host/register'}>
                <Button variant="outline" size="sm">
                  Become a Host
                </Button>
              </Link>
            )}

            {!isLoading && isAuthenticated && isHostPending && (
              <Link href="/host/pending">
                <Button variant="outline" size="sm">
                  Host Request Pending
                </Button>
              </Link>
            )}

            {isLoading ? (
              <div className="w-20 h-9 rounded-xl skeleton" />
            ) : isAuthenticated ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsProfileOpen(!isProfileOpen)
                  }}
                  aria-label="User menu"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl neu-button transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full neu-icon-primary flex items-center justify-center">
                      <User className="w-4 h-4" aria-hidden="true" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-[#1E293B] max-w-[100px] truncate">
                    {profile?.full_name || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 neu-dropdown overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-[#EEF2F6]">
                        <p className="font-medium text-[#1E293B] truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-[#64748B] truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleBadgeStyle()}`}>
                          {isAdmin ? 'Admin' : isHost ? 'Host' : isHostPending ? 'Host Pending' : 'Guest'}
                        </span>
                      </div>

                      <div className="py-2">
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setIsProfileOpen(false)}
                          className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                        >
                          <LayoutDashboard className="w-5 h-5 text-[#64748B]" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/dashboard?tab=bookings"
                          onClick={() => setIsProfileOpen(false)}
                          className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                        >
                          <Calendar className="w-5 h-5 text-[#64748B]" />
                          <span>My Bookings</span>
                        </Link>

                        <Link
                          href="/dashboard?tab=wishlist"
                          onClick={() => setIsProfileOpen(false)}
                          className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                        >
                          <Heart className="w-5 h-5 text-[#64748B]" />
                          <span>Wishlist</span>
                        </Link>

                        <Link
                          href="/dashboard?tab=inbox"
                          onClick={() => setIsProfileOpen(false)}
                          className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                        >
                          <MessageSquare className="w-5 h-5 text-[#64748B]" />
                          <span>Inbox</span>
                        </Link>

                        <Link
                          href="/dashboard?tab=notifications"
                          onClick={() => setIsProfileOpen(false)}
                          className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                        >
                          <Bell className="w-5 h-5 text-[#64748B]" />
                          <span>Notifications</span>
                        </Link>

                        {isHost && (
                          <Link
                            href="/host"
                            onClick={() => setIsProfileOpen(false)}
                            className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                          >
                            <Home className="w-5 h-5 text-[#64748B]" />
                            <span>Host Dashboard</span>
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                          >
                            <Shield className="w-5 h-5 text-[#64748B]" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        {isHost && (
                          <Link
                            href="/host/listings/new"
                            onClick={() => setIsProfileOpen(false)}
                            className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                          >
                            <Plus className="w-5 h-5 text-[#64748B]" />
                            <span>Add New Listing</span>
                          </Link>
                        )}

                        <Link
                          href="/dashboard?tab=settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="neu-dropdown-item flex items-center gap-3 px-4 py-2.5 text-[#1E293B] rounded-xl mx-2"
                        >
                          <Settings className="w-5 h-5 text-[#64748B]" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-500 rounded-xl w-full neu-button hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="md:hidden p-2.5 rounded-xl neu-button transition-all duration-200 flex-shrink-0 ml-2 focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[#1E293B]" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6 text-[#1E293B]" aria-hidden="true" />
            )}
          </button>

        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#EEF2F6] neu-dropdown mx-4 mb-4 overflow-hidden z-[60]"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-[#1E293B]">Dark Mode</span>
                <ThemeToggle />
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive(link.href)
                      ? 'neu-nav-item-active'
                      : 'text-[#1E293B] neu-button'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Auth Section */}
              <div className="pt-4">
                {isLoading ? (
                  <div className="h-10 rounded-xl skeleton" />
                ) : isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <p className="font-medium text-[#1E293B]">{profile?.full_name || 'User'}</p>
                      <p className="text-sm text-[#64748B]">{user?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleBadgeStyle()}`}>
                        {isAdmin ? 'Admin' : isHost ? 'Host' : isHostPending ? 'Host Pending' : 'Guest'}
                      </span>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[#1E293B] neu-button rounded-xl"
                    >
                      <LayoutDashboard className="w-5 h-5 text-[#64748B]" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=bookings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[#1E293B] neu-button rounded-xl"
                    >
                      <Calendar className="w-5 h-5 text-[#64748B]" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[#1E293B] neu-button rounded-xl"
                    >
                      <Heart className="w-5 h-5 text-[#64748B]" />
                      <span>Wishlist</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=inbox"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[#1E293B] neu-button rounded-xl"
                    >
                      <MessageSquare className="w-5 h-5 text-[#64748B]" />
                      <span>Inbox</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=notifications"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[#1E293B] neu-button rounded-xl"
                    >
                      <Bell className="w-5 h-5 text-[#64748B]" />
                      <span>Notifications</span>
                    </Link>

                    {isHost && (
                      <Link
                        href="/host"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[#1E293B] neu-button rounded-xl"
                      >
                        <Building className="w-5 h-5 text-[#64748B]" />
                        <span>Host Dashboard</span>
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[#1E293B] neu-button rounded-xl"
                      >
                        <Shield className="w-5 h-5 text-[#64748B]" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-500 neu-button rounded-xl w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {!isHost && !isAdmin && !isHostPending && (
                      <Link
                        href="/auth/login?redirect=/host/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button variant="outline" className="w-full">
                          Become a Host
                        </Button>
                      </Link>
                    )}
                    {isHostPending && (
                      <Link
                        href="/host/pending"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button variant="outline" className="w-full">
                          Host Request Pending
                        </Button>
                      </Link>
                    )}
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full"
                    >
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full"
                    >
                      <Button variant="primary" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

