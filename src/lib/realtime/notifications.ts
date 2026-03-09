'use client'

import { useRealtimeNotifications, type Notification } from './chat'

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_request'
  | 'new_message'
  | 'new_review'
  | 'payment_received'
  | 'price_drop'
  | 'wishlist_available'
  | 'host_approved'
  | 'host_rejected'
  | 'system'

export interface NotificationSubscription {
  unsubscribe: () => void
}

class NotificationService {
  initialize() {}

  subscribeToNotifications(): NotificationSubscription {
    return { unsubscribe: () => {} }
  }

  subscribeToBookingUpdates(): NotificationSubscription {
    return { unsubscribe: () => {} }
  }

  subscribeToPriceDrops(): NotificationSubscription {
    return { unsubscribe: () => {} }
  }

  async createNotification(): Promise<Notification | null> {
    return null
  }

  async markAsRead(): Promise<boolean> {
    return false
  }

  async markAllAsRead(): Promise<boolean> {
    return false
  }

  async getUnreadCount(): Promise<number> {
    return 0
  }

  async getNotifications(): Promise<Notification[]> {
    return []
  }

  cleanup() {}
}

export const notificationService = new NotificationService()

export function useNotifications(userId: string | undefined) {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useRealtimeNotifications(
    userId || null
  )

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}

export const notificationTemplates = {
  bookingConfirmed: (propertyTitle: string, checkIn: string) => ({
    type: 'booking_confirmed' as NotificationType,
    title: 'Booking Confirmed!',
    message: `Your booking for "${propertyTitle}" starting ${checkIn} has been confirmed.`,
  }),
  bookingCancelled: (propertyTitle: string) => ({
    type: 'booking_cancelled' as NotificationType,
    title: 'Booking Cancelled',
    message: `Your booking for "${propertyTitle}" has been cancelled.`,
  }),
  bookingRequest: (guestName: string, propertyTitle: string) => ({
    type: 'booking_request' as NotificationType,
    title: 'New Booking Request',
    message: `${guestName} wants to book your property "${propertyTitle}".`,
  }),
  newMessage: (senderName: string) => ({
    type: 'new_message' as NotificationType,
    title: 'New Message',
    message: `You have a new message from ${senderName}.`,
  }),
  newReview: (guestName: string, propertyTitle: string, rating: number) => ({
    type: 'new_review' as NotificationType,
    title: 'New Review',
    message: `${guestName} left a ${rating}-star review for "${propertyTitle}".`,
  }),
  paymentReceived: (amount: number, propertyTitle: string) => ({
    type: 'payment_received' as NotificationType,
    title: 'Payment Received',
    message: `Payment of ${amount.toLocaleString()} received for "${propertyTitle}".`,
  }),
  priceDrop: (propertyTitle: string, oldPrice: number, newPrice: number) => ({
    type: 'price_drop' as NotificationType,
    title: 'Price Drop Alert',
    message: `"${propertyTitle}" dropped from ${oldPrice.toLocaleString()} to ${newPrice.toLocaleString()}.`,
  }),
  wishlistAvailable: (propertyTitle: string, dates: string) => ({
    type: 'wishlist_available' as NotificationType,
    title: 'Wishlisted Property Available',
    message: `"${propertyTitle}" is now available for ${dates}.`,
  }),
  hostApproved: () => ({
    type: 'host_approved' as NotificationType,
    title: 'Welcome, Host!',
    message: 'Your host application has been approved.',
  }),
  hostRejected: (reason?: string) => ({
    type: 'host_rejected' as NotificationType,
    title: 'Host Application Update',
    message: reason || 'Your host application was not approved.',
  }),
}
