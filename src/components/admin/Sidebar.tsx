'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Calendar,
    Building,
    Users as UsersIcon,
    Star,
    DollarSign,
    Clock,
    MessageSquare,
    BarChart3,
    ScrollText,
    Bell,
    Search,
    Settings,
    PlusCircle,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
    activeTab: string
    setActiveTab: (tab: any) => void
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Logs', icon: ScrollText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'extras', label: 'Extras', icon: PlusCircle },
]

export function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) {
    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 250 }}
            className="fixed left-0 top-0 h-screen bg-white border-r border-gray-100 z-50 flex flex-col shadow-sm"
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold">
                                R
                            </div>
                            <span className="font-bold text-gray-900 text-xl tracking-tight">Restiqa</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-brand-primary'} />
                            {!isCollapsed && (
                                <span className="font-medium text-sm whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-50">
                <Link
                    href="/"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group
                        ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-medium text-sm">Exit Admin</span>}
                </Link>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #eee;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #ddd;
                }
            `}</style>
        </motion.aside>
    )
}
