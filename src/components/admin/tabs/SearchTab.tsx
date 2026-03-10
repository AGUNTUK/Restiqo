import { Search, Loader2, Download, Users, Building, Calendar, Star } from 'lucide-react'

interface SearchTabProps {
    searchQuery: string
    setSearchQuery: (q: string) => void
    searchFilters: {
        type: 'all' | 'users' | 'properties' | 'bookings'
        status: string
        city: string
        dateFrom: string
        dateTo: string
        minRating: number
        paymentStatus: string
    }
    setSearchFilters: (filters: any) => void
    isSearching: boolean
    exportFormat: 'csv' | 'excel'
    setExportFormat: (format: 'csv' | 'excel') => void
    searchResults: { users?: any[], properties?: any[], bookings?: any[] }
    performSearch: () => void
    exportResults: () => void
}

export function SearchTab({
    searchQuery, setSearchQuery,
    searchFilters, setSearchFilters,
    isSearching, exportFormat, setExportFormat,
    searchResults, performSearch, exportResults,
}: SearchTabProps) {
    return (
        <div className="space-y-6">
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-brand-primary" />
                    Advanced Search & Filter
                </h2>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search users, properties, bookings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        />
                    </div>
                    <button
                        onClick={performSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select value={searchFilters.type} onChange={(e) => setSearchFilters({ ...searchFilters, type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="all">All</option>
                            <option value="users">Users</option>
                            <option value="properties">Properties</option>
                            <option value="bookings">Bookings</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={searchFilters.status} onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" placeholder="Filter by city" value={searchFilters.city} onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                        <select value={searchFilters.minRating} onChange={(e) => setSearchFilters({ ...searchFilters, minRating: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value={0}>Any</option>
                            <option value={3}>3+ Stars</option>
                            <option value={4}>4+ Stars</option>
                            <option value={4.5}>4.5+ Stars</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                        <select value={searchFilters.paymentStatus} onChange={(e) => setSearchFilters({ ...searchFilters, paymentStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="all">All</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="csv">CSV</option>
                            <option value="excel">Excel</option>
                        </select>
                    </div>
                </div>
            </div>

            {(searchResults.users?.length || searchResults.properties?.length || searchResults.bookings?.length) ? (
                <>
                    <div className="flex justify-end">
                        <button onClick={exportResults} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Results
                        </button>
                    </div>
                    <div className="clay p-4">
                        <p className="text-gray-600">
                            Found {(searchResults.users?.length || 0) + (searchResults.properties?.length || 0) + (searchResults.bookings?.length || 0)} results
                        </p>
                    </div>
                    {searchResults.users && searchResults.users.length > 0 && (
                        <div className="clay p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Users ({searchResults.users.length})
                            </h3>
                            <div className="space-y-3">
                                {searchResults.users.map((user: any) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">{user.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{user.role}</span>
                                            <span className="text-sm text-gray-500">{user.created_at}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {searchResults.properties && searchResults.properties.length > 0 && (
                        <div className="clay p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-purple-600" />
                                Properties ({searchResults.properties.length})
                            </h3>
                            <div className="space-y-3">
                                {searchResults.properties.map((property: any) => (
                                    <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-900">{property.title}</p>
                                            <p className="text-sm text-gray-500">{property.city}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold text-gray-900">৳{property.price}/night</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm text-gray-600">{property.rating}</span>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{property.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {searchResults.bookings && searchResults.bookings.length > 0 && (
                        <div className="clay p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-600" />
                                Bookings ({searchResults.bookings.length})
                            </h3>
                            <div className="space-y-3">
                                {searchResults.bookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.property}</p>
                                            <p className="text-sm text-gray-500">Guest: {booking.guest}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold text-gray-900">৳{booking.total}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{booking.status}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${booking.payment_status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{booking.payment_status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : searchQuery && !isSearching ? (
                <div className="clay p-6 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
            ) : !searchQuery ? (
                <div className="clay p-6 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Enter a search term to find users, properties, or bookings</p>
                    <p className="text-sm text-gray-400">Use filters to narrow down your results</p>
                </div>
            ) : null}
        </div>
    )
}
