import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Users,
    Building,
    Calendar,
    DollarSign,
    TrendingUp,
    Eye,
    Check,
    X
} from 'lucide-react'
import { AdminStats, BookingTrend, PopularCity, TopProperty } from '@/types/admin'
import { User, Property } from '@/types/database'

interface OverviewTabProps {
    stats: AdminStats
    bookingTrends: BookingTrend[]
    popularCities: PopularCity[]
    topProperties: TopProperty[]
    pendingProperties: Property[]
    pendingHostRequests: User[]
    recentUsers: User[]
    approveProperty: (id: string) => Promise<void>
    rejectProperty: (id: string) => Promise<void>
    approveHostRequest: (id: string) => Promise<void>
    rejectHostRequest: (id: string) => Promise<void>
}

export function OverviewTab({
    stats,
    bookingTrends,
    popularCities,
    topProperties,
    pendingProperties,
    pendingHostRequests,
    recentUsers,
    approveProperty,
    rejectProperty,
    approveHostRequest,
    rejectHostRequest
}: OverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="clay p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>+12.5%</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="clay p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>+5.2%</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="clay p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Properties</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalProperties.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>+8.1%</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Building className="w-6 h-6" />
                    </div>
                </div>

                <div className="clay p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>+15.3%</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Trends Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Booking Trends Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="clay p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends (Last 30 Days)</h3>
                    <div className="h-48 flex items-end gap-1">
                        {bookingTrends.slice(-14).map((trend, index) => {
                            const maxBookings = Math.max(...bookingTrends.map(t => t.bookings), 1)
                            const height = (trend.bookings / maxBookings) * 100
                            return (
                                <div key={trend.date} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-brand-primary/80 rounded-t hover:bg-brand-primary transition-colors"
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                        title={`${trend.date}: ${trend.bookings} bookings`}
                                    />
                                    <span className="text-[10px] text-gray-400 transform -rotate-45 origin-left whitespace-nowrap mt-1">
                                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Revenue Trends Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="clay p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends (Last 30 Days)</h3>
                    <div className="h-48 flex items-end gap-1">
                        {bookingTrends.slice(-14).map((trend) => {
                            const maxRevenue = Math.max(...bookingTrends.map(t => t.revenue), 1)
                            const height = (trend.revenue / maxRevenue) * 100
                            return (
                                <div key={trend.date} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-green-500/80 rounded-t hover:bg-green-500 transition-colors"
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                        title={`${trend.date}: ৳${trend.revenue}`}
                                    />
                                    <span className="text-[10px] text-gray-400 transform -rotate-45 origin-left whitespace-nowrap mt-1">
                                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Popular Cities & Top Properties */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Popular Cities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="clay p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Cities</h3>
                    {popularCities.length > 0 ? (
                        <div className="space-y-3">
                            {popularCities.map((city, index) => {
                                const maxCount = Math.max(...popularCities.map(c => c.count), 1)
                                const percentage = (city.count / maxCount) * 100
                                return (
                                    <div key={city.city}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{index + 1}. {city.city}</span>
                                            <span className="text-gray-500">{city.count} properties</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-primary to-purple-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No city data available</p>
                    )}
                </motion.div>

                {/* Top Properties */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="clay p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Properties</h3>
                    {topProperties.length > 0 ? (
                        <div className="space-y-3">
                            {topProperties.map((property, index) => (
                                <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                            index === 1 ? 'bg-gray-300 text-gray-700' :
                                                index === 2 ? 'bg-orange-300 text-orange-900' :
                                                    'bg-gray-200 text-gray-600'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-700 truncate max-w-[150px]">{property.title}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">৳{property.revenue.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">{property.bookings} bookings</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No property data available</p>
                    )}
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Pending Properties */}
                <div className="clay p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                            {pendingProperties.length} pending
                        </span>
                    </div>

                    {pendingProperties.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No pending approvals</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingProperties.slice(0, 5).map((property) => (
                                <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{property.title}</h3>
                                        <p className="text-sm text-gray-600">{property.location}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/property/${property.id}`}
                                            className="p-2 text-gray-600 hover:text-brand-primary transition-colors"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => approveProperty(property.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => rejectProperty(property.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Host Requests */}
                <div className="clay p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Host Applications</h2>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {pendingHostRequests.length} pending
                        </span>
                    </div>

                    {pendingHostRequests.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No host applications</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingHostRequests.slice(0, 5).map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">
                                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Requested {user.host_requested_at ? new Date(user.host_requested_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => approveHostRequest(user.id)}
                                            className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => rejectHostRequest(user.id)}
                                            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Users */}
                <div className="clay p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                    </div>

                    <div className="space-y-4">
                        {recentUsers.slice(0, 5).map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-brand-primary">
                                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                    user.role === 'host' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
