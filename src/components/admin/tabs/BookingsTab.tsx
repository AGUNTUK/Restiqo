import { Filter, MapPin, Users, CreditCard } from 'lucide-react'
import { Booking, BookingStatus } from '@/types/database'

interface BookingsTabProps {
    bookings: Booking[]
    bookingFilter: 'all' | BookingStatus
    setBookingFilter: (filter: 'all' | BookingStatus) => void
    setSelectedBooking: (booking: Booking) => void
}

export function BookingsTab({
    bookings,
    bookingFilter,
    setBookingFilter,
    setSelectedBooking,
}: BookingsTabProps) {
    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'confirmed', label: 'Confirmed' },
                            { id: 'completed', label: 'Completed' },
                            { id: 'cancelled', label: 'Cancelled' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setBookingFilter(filter.id as typeof bookingFilter)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${bookingFilter === filter.id
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">All Bookings</h2>
                {bookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No bookings found</p>
                ) : (
                    <div className="space-y-4">
                        {bookings
                            .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                            .map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                booking.payment_status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {booking.payment_status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Booking ID:</span> {booking.id.slice(0, 8)}...
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Check-in: {new Date(booking.check_in).toLocaleDateString()} |
                                            Check-out: {new Date(booking.check_out).toLocaleDateString()}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-sm text-gray-600">
                                                <Users className="w-4 h-4 inline mr-1" />
                                                {booking.guests} guests
                                            </p>
                                            {(booking as any).invoice_id && (
                                                <p className="text-sm text-gray-600">
                                                    <CreditCard className="w-4 h-4 inline mr-1" />
                                                    Invoice: {(booking as any).invoice_id}
                                                </p>
                                            )}
                                            {(booking as any).payment_method && (
                                                <p className="text-sm text-gray-600">
                                                    Method: <span className="uppercase">{(booking as any).payment_method}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">
                                            ৳{booking.total_price.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}
