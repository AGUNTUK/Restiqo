'use client'

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { 
  ref, 
  push, 
  set, 
  update, 
  remove, 
  onValue, 
  off, 
  serverTimestamp as rtdbServerTimestamp 
} from 'firebase/database'
import { getFirebaseFirestore, getFirebaseRealtimeDB } from './config'

// Types
export type UserRole = 'guest' | 'host' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type PropertyType = 'apartment' | 'hotel' | 'tour'

// Firestore database helper class
class FirestoreDB {
  private db = getFirebaseFirestore()

  // Users
  async getUser(userId: string) {
    const userDoc = await getDoc(doc(this.db, 'users', userId))
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null
  }

  async updateUser(userId: string, data: Partial<DocumentData>) {
    await updateDoc(doc(this.db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  // Properties
  async getProperties(filters: {
    propertyType?: PropertyType
    city?: string
    minPrice?: number
    maxPrice?: number
    guests?: number
    isApproved?: boolean
  } = {}, pageSize: number = 20, lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    const constraints: QueryConstraint[] = []

    if (filters.propertyType) {
      constraints.push(where('propertyType', '==', filters.propertyType))
    }
    if (filters.city) {
      constraints.push(where('city', '==', filters.city))
    }
    if (filters.isApproved !== undefined) {
      constraints.push(where('isApproved', '==', filters.isApproved))
    }
    if (filters.guests) {
      constraints.push(where('maxGuests', '>=', filters.guests))
    }

    constraints.push(orderBy('rating', 'desc'))
    constraints.push(firestoreLimit(pageSize))

    if (lastDoc) {
      constraints.push(startAfter(lastDoc))
    }

    const q = query(collection(this.db, 'properties'), ...constraints)
    const snapshot = await getDocs(q)

    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }))

    return {
      properties,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    }
  }

  async getProperty(propertyId: string) {
    const propertyDoc = await getDoc(doc(this.db, 'properties', propertyId))
    return propertyDoc.exists() ? { id: propertyDoc.id, ...propertyDoc.data() } : null
  }

  async createProperty(data: Partial<DocumentData>) {
    const docRef = await addDoc(collection(this.db, 'properties'), {
      ...data,
      rating: 0,
      reviewCount: 0,
      isAvailable: true,
      isApproved: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  async updateProperty(propertyId: string, data: Partial<DocumentData>) {
    await updateDoc(doc(this.db, 'properties', propertyId), {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  async deleteProperty(propertyId: string) {
    await deleteDoc(doc(this.db, 'properties', propertyId))
  }

  // Bookings
  async getBookings(userId: string, status?: BookingStatus) {
    const constraints: QueryConstraint[] = [
      where('guestId', '==', userId),
      orderBy('createdAt', 'desc')
    ]

    if (status) {
      constraints.push(where('status', '==', status))
    }

    const q = query(collection(this.db, 'bookings'), ...constraints)
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      checkIn: doc.data().checkIn?.toDate?.() || doc.data().checkIn,
      checkOut: doc.data().checkOut?.toDate?.() || doc.data().checkOut,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }))
  }

  async getBooking(bookingId: string) {
    const bookingDoc = await getDoc(doc(this.db, 'bookings', bookingId))
    return bookingDoc.exists() ? { id: bookingDoc.id, ...bookingDoc.data() } : null
  }

  async createBooking(data: Partial<DocumentData>) {
    const docRef = await addDoc(collection(this.db, 'bookings'), {
      ...data,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  async updateBooking(bookingId: string, data: Partial<DocumentData>) {
    await updateDoc(doc(this.db, 'bookings', bookingId), {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  async cancelBooking(bookingId: string) {
    await updateDoc(doc(this.db, 'bookings', bookingId), {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    })
  }

  // Reviews
  async getReviews(propertyId: string) {
    const q = query(
      collection(this.db, 'reviews'),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }))
  }

  async createReview(data: Partial<DocumentData>) {
    const docRef = await addDoc(collection(this.db, 'reviews'), {
      ...data,
      isApproved: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Update property rating
    const reviews: any[] = await this.getReviews(data.propertyId as string)
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0)
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0

    await this.updateProperty(data.propertyId as string, {
      rating: avgRating,
      reviewCount: reviews.length
    })

    return docRef.id
  }

  // Wishlist
  async getWishlist(userId: string) {
    const q = query(
      collection(this.db, 'wishlists'),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)

    // Get property details for each wishlist item
    const wishlist = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()
        const property = await this.getProperty(data.propertyId)
        return {
          id: doc.id,
          propertyId: data.propertyId,
          property,
          createdAt: data.createdAt?.toDate?.() || data.createdAt
        }
      })
    )

    return wishlist
  }

  async addToWishlist(userId: string, propertyId: string) {
    const docRef = await addDoc(collection(this.db, 'wishlists'), {
      userId,
      propertyId,
      createdAt: serverTimestamp()
    })
    return docRef.id
  }

  async removeFromWishlist(wishlistId: string) {
    await deleteDoc(doc(this.db, 'wishlists', wishlistId))
  }

  async isInWishlist(userId: string, propertyId: string) {
    const q = query(
      collection(this.db, 'wishlists'),
      where('userId', '==', userId),
      where('propertyId', '==', propertyId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs[0]?.id || null
  }

  // Search properties
  async searchProperties(searchQuery: string, filters: {
    propertyType?: PropertyType
    minPrice?: number
    maxPrice?: number
    guests?: number
  } = {}) {
    // For Firestore, we need to do a basic query and filter client-side
    // since full-text search requires additional setup
    const q = query(
      collection(this.db, 'properties'),
      where('isApproved', '==', true),
      where('isAvailable', '==', true),
      orderBy('rating', 'desc'),
      firestoreLimit(50)
    )

    const snapshot = await getDocs(q)
    
    let results: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Client-side filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    if (filters.propertyType) {
      results = results.filter(p => p.propertyType === filters.propertyType)
    }

    if (filters.minPrice) {
      results = results.filter(p => p.pricePerNight >= filters.minPrice!)
    }

    if (filters.maxPrice) {
      results = results.filter(p => p.pricePerNight <= filters.maxPrice!)
    }

    if (filters.guests) {
      results = results.filter(p => p.maxGuests >= filters.guests!)
    }

    return results
  }
}

// Realtime Database helper for chat and notifications
class RealtimeDB {
  private rtdb = getFirebaseRealtimeDB()

  // Chat messages
  async sendMessage(chatId: string, message: {
    senderId: string
    senderName: string
    senderAvatar?: string
    content: string
    type: 'text' | 'image' | 'system'
  }) {
    const messagesRef = ref(this.rtdb, `chats/${chatId}/messages`)
    const newMessageRef = push(messagesRef)
    await set(newMessageRef, {
      ...message,
      timestamp: rtdbServerTimestamp()
    })
    return newMessageRef.key
  }

  subscribeToChat(chatId: string, callback: (messages: any[]) => void) {
    const messagesRef = ref(this.rtdb, `chats/${chatId}/messages`)
    
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messages = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
          timestamp: value.timestamp // This will be a number from RTDB
        }))
        callback(messages.sort((a, b) => a.timestamp - b.timestamp))
      } else {
        callback([])
      }
    })

    return () => off(messagesRef)
  }

  // Notifications
  async createNotification(userId: string, notification: {
    type: string
    title: string
    body: string
    data?: Record<string, any>
  }) {
    const notificationsRef = ref(this.rtdb, `notifications/${userId}`)
    const newNotifRef = push(notificationsRef)
    await set(newNotifRef, {
      ...notification,
      read: false,
      timestamp: rtdbServerTimestamp()
    })
    return newNotifRef.key
  }

  subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    const notificationsRef = ref(this.rtdb, `notifications/${userId}`)
    
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const notifications = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
          timestamp: value.timestamp
        }))
        callback(notifications.sort((a, b) => b.timestamp - a.timestamp))
      } else {
        callback([])
      }
    })

    return () => off(notificationsRef)
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notifRef = ref(this.rtdb, `notifications/${userId}/${notificationId}`)
    await update(notifRef, { read: true })
  }

  // Online presence
  async setOnlineStatus(userId: string, status: 'online' | 'offline') {
    const statusRef = ref(this.rtdb, `presence/${userId}`)
    await set(statusRef, {
      status,
      lastSeen: rtdbServerTimestamp()
    })
  }

  subscribeToOnlineStatus(userId: string, callback: (status: string) => void) {
    const statusRef = ref(this.rtdb, `presence/${userId}`)
    
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val()
      callback(data?.status || 'offline')
    })

    return () => off(statusRef)
  }

  // Typing indicator
  async setTyping(chatId: string, userId: string, isTyping: boolean) {
    const typingRef = ref(this.rtdb, `typing/${chatId}/${userId}`)
    if (isTyping) {
      await set(typingRef, true)
    } else {
      await remove(typingRef)
    }
  }

  subscribeToTyping(chatId: string, callback: (typingUsers: string[]) => void) {
    const typingRef = ref(this.rtdb, `typing/${chatId}`)
    
    onValue(typingRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        callback(Object.keys(data))
      } else {
        callback([])
      }
    })

    return () => off(typingRef)
  }
}

// Singleton instances
let firestoreDB: FirestoreDB | null = null
let realtimeDB: RealtimeDB | null = null

export function getFirestoreDB(): FirestoreDB {
  if (!firestoreDB) {
    firestoreDB = new FirestoreDB()
  }
  return firestoreDB
}

export function getRealtimeDB(): RealtimeDB {
  if (!realtimeDB) {
    realtimeDB = new RealtimeDB()
  }
  return realtimeDB
}

export { FirestoreDB, RealtimeDB }
