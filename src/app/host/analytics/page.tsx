'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Eye,
    Calendar,
    Star,
    Users,
    Home,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Filter,
} from 'lucide-react'
import {
    format,
    subDays,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    eachMonthOfInterval,
} from 'date-fns'
import Button from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'

// Types
interface AnalyticsData {
    overview: {
        totalRevenue: number
        revenueChange: number
        totalBookings: number
        bookingsChange: number
        totalViews: number
        viewsChange: number
        averageRating: number
        ratingChange: number
        occupancyRate: number
        occupancyChange: number
    }
    revenueData: { date: string; amount: number }[]
    bookingsData: { date: string; count: number }[]
    propertyPerformance: {
        id: string
        title: string
        views: number
        bookings: number
        revenue: number
        rating: number
        occupancyRate: number
    }[]
    guestDemographics: {
        country: string
        count: number
        percentage: number
    }[]
    reviewsSummary: {
        averageRating: number
        totalReviews: number
        ratingBreakdown: { rating: number; count: number }[]
        recentReviews: {
            id: string
            guestName: string
            rating: number
            comment: string
            date: string
        }[]
    }[]
}

type DateRange = '7d' | '30d' | '90d' | '12m'

export default function HostAnalyticsPage() {
    const { user, isHost } = useAuth()
    const [dateRange, setDateRange] = useState<DateRange>('30d')
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<AnalyticsData | null>(null)

    // Calculate date range
    const dateRangeConfig = useMemo(() => {
        const now = new Date()
        switch (dateRange) {
            case '7d':
                return { start: subDays(now, 7), end: now }
            case '30d':
                return { start: subDays(now, 30), end: now }
            case '90d':
                return { start: subDays(now, 90), end: now }
            case '12m':
                return { start: subMonths(now, 12), end: now }
            default:
                return { start: subDays(now, 30), end: now }
        }
    }, [dateRange])

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true)
            // In production, fetch from API
            // Simulated data for demo
            await new Promise((resolve) => setTimeout(resolve, 1000))

            setData({
                overview: {
                    totalRevenue: 125000,
                    revenueChange: 12.5,
                    totalBookings: 48,
                    bookingsChange: 8.3,
                    totalViews: 3240,
                    viewsChange: -2.1,
                    averageRating: 4.8,
                    ratingChange: 0.2,
                    occupancyRate: 72,
                    occupancyChange: 5.4,
                },
                revenueData: eachDayOfInterval({
                    start: dateRangeConfig.start,
                    end: dateRangeConfig.end,
                }).map((date) => ({
                    date: format(date, 'MMM d'),
                    amount: Math.floor(Math.random() * 10000) + 2000,
                })),
                bookingsData: eachDayOfInterval({
                    start: dateRangeConfig.start,
                    end: dateRangeConfig.end,
                }).map((date) => ({
                    date: format(date, 'MMM d'),
                    count: Math.floor(Math.random() * 5),
                })),
                propertyPerformance: [
                    {
                        id: '1',
                        title: 'Luxury Downtown Apartment',
                        views: 1240,
                        bookings: 18,
                        revenue: 52000,
                        rating: 4.9,
                        occupancyRate: 85,
                    },
                    {
                        id: '2',
                        title: 'Cozy Studio Near Lake',
                        views: 890,
                        bookings: 15,
                        revenue: 38000,
                        rating: 4.7,
                        occupancyRate: 72,
                    },
                    {
                        id: '3',
                        title: 'Spacious Family Home',
                        views: 650,
                        bookings: 10,
                        revenue: 28000,
                        rating: 4.8,
                        occupancyRate: 65,
                    },
                ],
                guestDemographics: [
                    { country: 'Bangladesh', count: 28, percentage: 58 },
                    { country: 'India', count: 8, percentage: 17 },
                    { country: 'USA', count: 5, percentage: 10 },
                    { country: 'UK', count: 4, percentage: 8 },
                    { country: 'Others', count: 3, percentage: 7 },
                ],
                reviewsSummary: [],
            })
            setIsLoading(false)
        }

        if (isHost) {
            fetchAnalytics()
        }
    }, [isHost, dateRangeConfig])

    if (!isHost) {
        return (
            <div className="min-h-screen pt-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="neu-xl p-8 text-center">
                        <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
                            Host Access Required
                        </h2>
                        <p className="text-[#64748B]">
                            You need to be a registered host to view analytics.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const StatCard = ({
        title,
        value,
        change,
        icon: Icon,
        format: formatType = 'number',
    }: {
        title: string
        value: number
        change: number
        icon: React.ElementType
        format?: 'number' | 'currency' | 'percent'
    }) => {
        const formattedValue =
            formatType === 'currency'
                ? `৳${value.toLocaleString()}`
                : formatType === 'percent'
                    ? `${value}%`
                    : value.toLocaleString()

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neu-card p-6"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-[#64748B] mb-1">{title}</p>
                        <p className="text-2xl font-bold text-[#1E293B]">{formattedValue}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl neu-icon-primary flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                    {change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span
                        className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                    >
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                    <span className="text-xs text-[#64748B]">vs last period</span>
                </div>
            </motion.div>
        )
    }

    const SimpleBarChart = ({
        data,
        valueKey,
        labelKey,
    }: {
        data: { [key: string]: string | number }[]
        valueKey: string
        labelKey: string
    }) => {
        const maxValue = Math.max(...data.map((d) => d[valueKey] as number))

        return (
            <div className="h-64 flex items-end gap-1 overflow-x-auto pb-2">
                {data.slice(-14).map((item, index) => {
                    const height = ((item[valueKey] as number) / maxValue) * 100
                    return (
                        <div
                            key={index}
                            className="flex-1 min-w-[30px] flex flex-col items-center gap-1"
                        >
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: index * 0.02 }}
                                className="w-full bg-brand-primary rounded-t-lg min-h-[4px]"
                            />
                            <span className="text-[10px] text-[#64748B] whitespace-nowrap">
                                {item[labelKey]}
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20 md:pt-24 pb-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
                            Analytics Dashboard
                        </h1>
                        <p className="text-[#64748B] mt-1">
                            Track your property performance and revenue
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date Range Selector */}
                        <div className="flex rounded-xl overflow-hidden neu-inset">
                            {(['7d', '30d', '90d', '12m'] as DateRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`px-3 py-2 text-sm font-medium transition-colors ${dateRange === range
                                            ? 'bg-brand-primary text-white'
                                            : 'text-[#64748B] hover:text-[#1E293B]'
                                        }`}
                                >
                                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '12 Months'}
                                </button>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                            Export
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="neu-card p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-8 bg-gray-200 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : data ? (
                    <>
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <StatCard
                                title="Total Revenue"
                                value={data.overview.totalRevenue}
                                change={data.overview.revenueChange}
                                icon={DollarSign}
                                format="currency"
                            />
                            <StatCard
                                title="Total Bookings"
                                value={data.overview.totalBookings}
                                change={data.overview.bookingsChange}
                                icon={Calendar}
                            />
                            <StatCard
                                title="Property Views"
                                value={data.overview.totalViews}
                                change={data.overview.viewsChange}
                                icon={Eye}
                            />
                            <StatCard
                                title="Average Rating"
                                value={data.overview.averageRating}
                                change={data.overview.ratingChange}
                                icon={Star}
                            />
                            <StatCard
                                title="Occupancy Rate"
                                value={data.overview.occupancyRate}
                                change={data.overview.occupancyChange}
                                icon={Home}
                                format="percent"
                            />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Revenue Chart */}
                            <div className="neu-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-[#1E293B]">Revenue</h3>
                                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span>+{data.overview.revenueChange}%</span>
                                    </div>
                                </div>
                                <SimpleBarChart
                                    data={data.revenueData}
                                    valueKey="amount"
                                    labelKey="date"
                                />
                            </div>

                            {/* Bookings Chart */}
                            <div className="neu-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-[#1E293B]">Bookings</h3>
                                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span>+{data.overview.bookingsChange}%</span>
                                    </div>
                                </div>
                                <SimpleBarChart
                                    data={data.bookingsData}
                                    valueKey="count"
                                    labelKey="date"
                                />
                            </div>
                        </div>

                        {/* Property Performance & Demographics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Property Performance */}
                            <div className="lg:col-span-2 neu-xl p-6">
                                <h3 className="text-lg font-semibold text-[#1E293B] mb-4">
                                    Property Performance
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-[#64748B] border-b border-[#E2E8F0]">
                                                <th className="pb-3 font-medium">Property</th>
                                                <th className="pb-3 font-medium text-right">Views</th>
                                                <th className="pb-3 font-medium text-right">Bookings</th>
                                                <th className="pb-3 font-medium text-right">Revenue</th>
                                                <th className="pb-3 font-medium text-right">Rating</th>
                                                <th className="pb-3 font-medium text-right">Occupancy</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.propertyPerformance.map((property) => (
                                                <tr
                                                    key={property.id}
                                                    className="border-b border-[#E2E8F0] last:border-0"
                                                >
                                                    <td className="py-4">
                                                        <span className="font-medium text-[#1E293B]">
                                                            {property.title}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right text-[#64748B]">
                                                        {property.views.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-right text-[#64748B]">
                                                        {property.bookings}
                                                    </td>
                                                    <td className="py-4 text-right font-medium text-[#1E293B]">
                                                        ৳{property.revenue.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                            <span className="font-medium">{property.rating}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-brand-primary rounded-full"
                                                                    style={{ width: `${property.occupancyRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-[#64748B]">
                                                                {property.occupancyRate}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Guest Demographics */}
                            <div className="neu-xl p-6">
                                <h3 className="text-lg font-semibold text-[#1E293B] mb-4">
                                    Guest Demographics
                                </h3>
                                <div className="space-y-4">
                                    {data.guestDemographics.map((item, index) => (
                                        <div key={item.country}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-[#1E293B]">{item.country}</span>
                                                <span className="text-sm text-[#64748B]">
                                                    {item.percentage}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.percentage}%` }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="h-full bg-brand-accent rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    )
}
