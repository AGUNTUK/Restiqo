import { Filter, Download } from 'lucide-react'

interface EarningsTabProps {
    hostEarnings: any[]
    earningsFilter: 'all' | 'pending' | 'paid' | 'refunded'
    setEarningsFilter: (filter: 'all' | 'pending' | 'paid' | 'refunded') => void
    exportEarningsReport: () => void
    updatePayoutStatus: (hostId: string, status: 'paid' | 'refunded') => void
}

export function EarningsTab({
    hostEarnings,
    earningsFilter,
    setEarningsFilter,
    exportEarningsReport,
    updatePayoutStatus,
}: EarningsTabProps) {
    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="clay p-4">
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">
                        ৳{hostEarnings.reduce((sum, e) => sum + e.totalEarnings, 0).toLocaleString()}
                    </p>
                </div>
                <div className="clay p-4">
                    <p className="text-sm text-gray-600">Platform Fees</p>
                    <p className="text-2xl font-bold text-blue-600">
                        ৳{hostEarnings.reduce((sum, e) => sum + e.platformFee, 0).toLocaleString()}
                    </p>
                </div>
                <div className="clay p-4">
                    <p className="text-sm text-gray-600">Net Payouts</p>
                    <p className="text-2xl font-bold text-purple-600">
                        ৳{hostEarnings.reduce((sum, e) => sum + e.netPayout, 0).toLocaleString()}
                    </p>
                </div>
                <div className="clay p-4">
                    <p className="text-sm text-gray-600">Total Hosts</p>
                    <p className="text-2xl font-bold text-gray-900">{hostEarnings.length}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="clay p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'pending', label: 'Pending' },
                                { id: 'paid', label: 'Paid' },
                                { id: 'refunded', label: 'Refunded' },
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setEarningsFilter(filter.id as typeof earningsFilter)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${earningsFilter === filter.id
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={exportEarningsReport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Host Earnings List */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Host Earnings</h2>
                {hostEarnings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No earnings data available</p>
                ) : (
                    <div className="space-y-4">
                        {hostEarnings
                            .filter(e => earningsFilter === 'all' || e.payoutStatus === earningsFilter)
                            .map((earning) => (
                                <div key={earning.host.id} className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-lg font-medium text-blue-600">
                                                    {earning.host.full_name?.charAt(0) || earning.host.email.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{earning.host.full_name || 'No name'}</p>
                                                <p className="text-sm text-gray-600">{earning.host.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${earning.payoutStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                            earning.payoutStatus === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {earning.payoutStatus}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Earnings</p>
                                            <p className="text-lg font-bold text-green-600">৳{earning.totalEarnings.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Platform Fee (15%)</p>
                                            <p className="text-lg font-bold text-blue-600">৳{earning.platformFee.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Net Payout</p>
                                            <p className="text-lg font-bold text-purple-600">৳{earning.netPayout.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Completed Bookings</p>
                                            <p className="text-lg font-bold text-gray-900">{earning.completedBookings}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updatePayoutStatus(earning.host.id, 'paid')}
                                            className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                        >
                                            Mark as Paid
                                        </button>
                                        <button
                                            onClick={() => updatePayoutStatus(earning.host.id, 'refunded')}
                                            className="px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                                        >
                                            Mark as Refunded
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}
