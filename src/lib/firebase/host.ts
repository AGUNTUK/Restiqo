'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { getFirebaseFirestore } from './config'
import { useAuth } from './auth'

export interface HostProperty {
  id: string
  ownerId: string
  title: string
  description: string
  propertyType: 'apartment' | 'house' | 'villa' | 'hotel' | 'resort' | 'guesthouse' | 'cottage' | 'other'
  location: {
    address: string
    city: string
    state?: string
    country: string
    zipCode?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  price: number
  currency: string
  images: string[]
  amenities: string[]
  bedrooms: number
  bathrooms: number
  maxGuests: number
  rating: number
  reviewCount: number
  isAvailable: boolean
  isFeatured: boolean
  status: 'pending' | 'approved' | 'rejected' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface HostBooking {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage?: string
  guestId: string
  guestName: string
  guestEmail: string
  checkIn: Date
  checkOut: Date
  totalNights: number
  guests: {
    adults: number
    children: number
    infants: number
  }
  pricing: {
    nightlyRate: number
    cleaningFee: number
    serviceFee: number
    taxes: number
    total: number
    currency: string
  }
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  createdAt: Date
  updatedAt: Date
}

export interface HostStats {
  totalProperties: number
  activeListings: number
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: number
  monthlyEarnings: number
  averageRating: number
  occupancyRate: number
}

export interface HostAnalytics {
  views: number
  searches: number
  conversionRate: number
  topProperties: {
    propertyId: string
    title: string
    views: number
    bookings: number
    earnings: number
  }[]
  earningsByMonth: {
    month: string
    amount: number
  }[]
}

class HostService {
  private db = getFirebaseFirestore()

  // Get all properties for a host
  async getHostProperties(hostId: string): Promise<HostProperty[]> {
    try {
      const propertiesRef = collection(this.db, 'properties')
      const q = query(
        propertiesRef,
        where('ownerId', '==', hostId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as HostProperty[]
    } catch (error) {
      console.error('Error fetching host properties:', error)
      return []
    }
  }

  // Subscribe to host properties
  subscribeToHostProperties(
    hostId: string,
    callback: (properties: HostProperty[]) => void
  ): () => void {
    const propertiesRef = collection(this.db, 'properties')
    const q = query(
      propertiesRef,
      where('ownerId', '==', hostId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as HostProperty[]
      
      callback(properties)
    })

    return unsubscribe
  }

  // Get bookings for host's properties
  async getHostBookings(hostId: string): Promise<HostBooking[]> {
    try {
      // First get host's properties
      const properties = await this.getHostProperties(hostId)
      const propertyIds = properties.map(p => p.id)

      if (propertyIds.length === 0) return []

      // Get bookings for these properties
      const bookingsRef = collection(this.db, 'bookings')
      const q = query(
        bookingsRef,
        where('propertyId', 'in', propertyIds),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        checkIn: doc.data().checkIn?.toDate() || new Date(),
        checkOut: doc.data().checkOut?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as HostBooking[]
    } catch (error) {
      console.error('Error fetching host bookings:', error)
      return []
    }
  }

  // Subscribe to host bookings
  subscribeToHostBookings(
    hostId: string,
    callback: (bookings: HostBooking[]) => void
  ): () => void {
    // This is a simplified version - in production you'd use Firestore compounds or Elastic Search
    const bookingsRef = collection(this.db, 'bookings')
    const q = query(
      bookingsRef,
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Get host's properties first
      const properties = await this.getHostProperties(hostId)
      const propertyIds = new Set(properties.map(p => p.id))

      const bookings = snapshot.docs
        .filter(doc => propertyIds.has(doc.data().propertyId))
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          checkIn: doc.data().checkIn?.toDate() || new Date(),
          checkOut: doc.data().checkOut?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as HostBooking[]
      
      callback(bookings)
    })

    return unsubscribe
  }

  // Calculate host statistics
  async getHostStats(hostId: string): Promise<HostStats> {
    try {
      const properties = await this.getHostProperties(hostId)
      const bookings = await this.getHostBookings(hostId)

      const activeListings = properties.filter(p => p.isAvailable && p.status === 'approved').length
      const pendingBookings = bookings.filter(b => b.status === 'pending').length
      const completedBookings = bookings.filter(b => b.status === 'completed').length
      const totalEarnings = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.pricing.total, 0)

      // Calculate monthly earnings
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyEarnings = bookings
        .filter(b => b.paymentStatus === 'paid' && b.createdAt >= monthStart)
        .reduce((sum, b) => sum + b.pricing.total, 0)

      // Calculate average rating
      const propertiesWithRating = properties.filter(p => p.rating > 0)
      const averageRating = propertiesWithRating.length > 0
        ? propertiesWithRating.reduce((sum, p) => sum + p.rating, 0) / propertiesWithRating.length
        : 0

      // Calculate occupancy rate
      const totalNightsAvailable = properties.length * 30 // Simplified
      const totalNightsBooked = bookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalNights, 0)
      const occupancyRate = totalNightsAvailable > 0 
        ? (totalNightsBooked / totalNightsAvailable) * 100 
        : 0

      return {
        totalProperties: properties.length,
        activeListings,
        totalBookings: bookings.length,
        pendingBookings,
        completedBookings,
        totalEarnings,
        monthlyEarnings,
        averageRating: Math.round(averageRating * 10) / 10,
        occupancyRate: Math.round(occupancyRate)
      }
    } catch (error) {
      console.error('Error calculating host stats:', error)
      return {
        totalProperties: 0,
        activeListings: 0,
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        averageRating: 0,
        occupancyRate: 0
      }
    }
  }

  // Update property status
  async updatePropertyStatus(propertyId: string, status: HostProperty['status']): Promise<void> {
    try {
      const propertyRef = doc(this.db, 'properties', propertyId)
      await updateDoc(propertyRef, {
        status,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating property status:', error)
      throw error
    }
  }

  // Delete property
  async deleteProperty(propertyId: string): Promise<void> {
    try {
      const propertyRef = doc(this.db, 'properties', propertyId)
      await deleteDoc(propertyRef)
    } catch (error) {
      console.error('Error deleting property:', error)
      throw error
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: HostBooking['status']): Promise<void> {
    try {
      const bookingRef = doc(this.db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating booking status:', error)
      throw error
    }
  }

  // Get recent bookings
  async getRecentBookings(hostId: string, count: number = 5): Promise<HostBooking[]> {
    try {
      const bookings = await this.getHostBookings(hostId)
      return bookings.slice(0, count)
    } catch (error) {
      console.error('Error fetching recent bookings:', error)
      return []
    }
  }

  // Get earnings by month for the past 12 months
  async getEarningsByMonth(hostId: string): Promise<{ month: string; amount: number }[]> {
    try {
      const bookings = await this.getHostBookings(hostId)
      const paidBookings = bookings.filter(b => b.paymentStatus === 'paid')

      const earningsByMonth: { [key: string]: number } = {}
      
      // Initialize last 12 months
      const now = new Date()
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        earningsByMonth[monthKey] = 0
      }

      // Sum earnings
      paidBookings.forEach(booking => {
        const monthKey = booking.createdAt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        if (earningsByMonth[monthKey] !== undefined) {
          earningsByMonth[monthKey] += booking.pricing.total
        }
      })

      return Object.entries(earningsByMonth).map(([month, amount]) => ({
        month,
        amount
      }))
    } catch (error) {
      console.error('Error calculating earnings by month:', error)
      return []
    }
  }
}

// Singleton instance
let hostServiceInstance: HostService | null = null

export function getHostService(): HostService {
  if (!hostServiceInstance) {
    hostServiceInstance = new HostService()
  }
  return hostServiceInstance
}

// React hook for host data
export function useHostData() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<HostProperty[]>([])
  const [bookings, setBookings] = useState<HostBooking[]>([])
  const [stats, setStats] = useState<HostStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hostService = getHostService()

  useEffect(() => {
    if (!user?.uid) return

    setIsLoading(true)

    // Subscribe to properties
    const unsubProperties = hostService.subscribeToHostProperties(
      user.uid,
      (props) => setProperties(props)
    )

    // Subscribe to bookings
    const unsubBookings = hostService.subscribeToHostBookings(
      user.uid,
      (bks) => setBookings(bks)
    )

    // Get stats
    hostService.getHostStats(user.uid).then((s) => {
      setStats(s)
      setIsLoading(false)
    })

    return () => {
      unsubProperties()
      unsubBookings()
    }
  }, [user?.uid, hostService])

  return {
    properties,
    bookings,
    stats,
    isLoading
  }
}
