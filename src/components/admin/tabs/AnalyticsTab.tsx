import { Download, TrendingUp, BarChart3, Search, Sparkles, Copy, Zap, Heart, Star, Users } from 'lucide-react'
import { BookingTrend, TopProperty } from '@/types/admin'

interface AnalyticsTabProps {
    topProperties: TopProperty[]
    topHosts: any[]
    bookingTrends: BookingTrend[]
    searchQueries: any[]
    recommendations: any[]
    exportAnalyticsReport: () => void
}

export function AnalyticsTab({
    topProperties,
    topHosts,
    bookingTrends,
    searchQueries,
    recommendations,
    exportAnalyticsReport,
}: AnalyticsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={exportAnalyticsReport}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export Report
                </button>
            </div>

            {/* Top Performing Properties */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Top Performing Properties
                </h2>
                {topProperties.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No property data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-3">Property</th>
                                    <th className="pb-3">City</th>
                                    <th className="pb-3">Bookings</th>
                                    <th className="pb-3">Rating</th>
                                    <th className="pb-3">Price/Night</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProperties.map((property: any, index: number) => (
                                    <tr key={property.id} className="border-b last:border-0">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-medium text-gray-400">#{index + 1}</span>
                                                <span className="font-medium text-gray-900">{property.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-600">{property.city || 'N/A'}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{property.total_bookings || 0}</span>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span>{property.average_rating?.toFixed(1) || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-900">৳{property.price_per_night?.toLocaleString() || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Top Hosts */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Top Hosts
                </h2>
                {topHosts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No host data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-3">Host</th>
                                    <th className="pb-3">Email</th>
                                    <th className="pb-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topHosts.map((host: any) => (
                                    <tr key={host.id} className="border-b last:border-0">
                                        <td className="py-3 font-medium text-gray-900">{host.full_name || 'Unknown'}</td>
                                        <td className="py-3 text-gray-600">{host.email}</td>
                                        <td className="py-3 text-gray-600">{host.created_at ? new Date(host.created_at).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Booking Trends */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Booking Trends (Last 30 Days)
                </h2>
                {bookingTrends.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No booking data available</p>
                ) : (
                    <div className="space-y-4">
                        {bookingTrends.slice(-7).map((trend: any) => (
                            <div key={trend.date} className="flex items-center gap-4">
                                <span className="text-sm text-gray-500 w-24">{trend.date}</span>
                                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-primary to-blue-400 rounded-lg"
                                        style={{ width: `${Math.min(100, (trend.count / Math.max(...bookingTrends.map((t: any) => t.count))) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-20">{trend.count} bookings</span>
                                <span className="text-sm text-green-600 w-24">৳{trend.revenue?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recommendations Overview */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Recommendations Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendations.map((item: any) => (
                        <div key={item.type} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                {item.type === 'popular' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                                {item.type === 'similar' && <Copy className="w-5 h-5 text-blue-600" />}
                                {item.type === 'trending' && <Zap className="w-5 h-5 text-orange-600" />}
                                {item.type === 'personalized' && <Heart className="w-5 h-5 text-green-600" />}
                                <span className="font-medium text-gray-900 capitalize">{item.type}</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                            <p className="text-sm text-gray-500">recommendations</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
