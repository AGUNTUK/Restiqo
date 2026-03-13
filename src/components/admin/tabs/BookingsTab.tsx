import { Filter, MapPin, Users, CreditCard } from 'lucide-react'
import { Booking, BookingStatus } from '@/types/database'
import toast from 'react-hot-toast'

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
                                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-300 ${bookingFilter === filter.id
                                    ? 'bg-[#d67f00] text-white shadow-md shadow-orange-500/20 active:scale-[0.95]'
                                    : 'bg-white/50 dark:bg-slate-800/50 text-gray-500 hover:bg-white dark:hover:bg-slate-800 border border-white/20 dark:border-slate-700/30 hover:text-brand-primary'
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
                                <div key={booking.id} className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-lg font-bold border ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                        'bg-rose-100 text-rose-700 border-rose-200'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-lg font-bold border ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                                                booking.payment_status === 'refunded' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
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
                                            {(booking.status === 'confirmed' || (booking.status as string) === 'paid' || booking.payment_status === 'paid') && booking.status !== 'cancelled' && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to refund this booking?')) {
                                                            try {
                                                                const { createClient } = await import('@/lib/supabase/client');
                                                                const supabase = createClient();
                                                                
                                                                toast.loading('Processing refund...');
                                                                
                                                                const { data, error } = await supabase.functions.invoke('refund-payment', {
                                                                    body: { booking_id: booking.id }
                                                                });

                                                                if (error) throw error;
                                                                
                                                                toast.dismiss();
                                                                toast.success('Refund processed successfully!');
                                                                window.location.reload(); // Refresh to show new status
                                                            } catch (err: any) {
                                                                toast.dismiss();
                                                                toast.error(err.message || 'Failed to process refund');
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                                                >
                                                    Refund
                                                </button>
                                            )}
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
