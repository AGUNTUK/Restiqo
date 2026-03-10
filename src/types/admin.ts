export interface AdminStats {
    totalUsers: number
    totalHosts: number
    totalGuests: number
    totalProperties: number
    approvedProperties: number
    pendingApprovals: number
    totalBookings: number
    pendingBookings: number
    confirmedBookings: number
    completedBookings: number
    cancelledBookings: number
    totalRevenue: number
    platformFee: number
    hostPayouts: number
}

export interface BookingTrend {
    date: string
    bookings: number
    revenue: number
}

export interface PopularCity {
    city: string
    count: number
}

export interface TopProperty {
    id: string
    title: string
    bookings: number
    revenue: number
}
