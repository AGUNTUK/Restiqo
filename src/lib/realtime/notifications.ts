import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/realtime-js'

// ============================================
// Types
// ============================================

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

export interface Notification {
    id: string
    user_id: string
    type: NotificationType
    title: string
    message: string
    data?: Record<string, unknown>
    read: boolean
    created_at: string
}

export interface NotificationSubscription {
    channel: RealtimeChannel
    unsubscribe: () => void
}

// ============================================
// Notification Service
// ============================================

class NotificationService {
    private supabase: ReturnType<typeof createClient> | null = null
    private subscriptions: Map<string, NotificationSubscription> = new Map()

    initialize(supabaseClient: ReturnType<typeof createClient>) {
        this.supabase = supabaseClient
    }

    /**
     * Subscribe to real-time notifications for a user
     */
    subscribeToNotifications(
        userId: string,
        onNotification: (notification: Notification) => void,
        onError?: (error: Error) => void
    ): NotificationSubscription | null {
        if (!this.supabase) {
            console.warn('Supabase client not initialized')
            return null
        }

        // Check if already subscribed
        if (this.subscriptions.has(userId)) {
            return this.subscriptions.get(userId)!
        }

        const channel = this.supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const notification = payload.new as Notification
                    onNotification(notification)
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR' && onError) {
                    onError(new Error('Notification channel error'))
                }
            })

        const subscription: NotificationSubscription = {
            channel,
            unsubscribe: () => {
                this.supabase?.removeChannel(channel)
                this.subscriptions.delete(userId)
            },
        }

        this.subscriptions.set(userId, subscription)
        return subscription
    }

    /**
     * Subscribe to booking updates
     */
    subscribeToBookingUpdates(
        bookingId: string,
        onUpdate: (booking: Record<string, unknown>) => void,
        onError?: (error: Error) => void
    ): NotificationSubscription | null {
        if (!this.supabase) {
            return null
        }

        const channel = this.supabase
            .channel(`booking:${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${bookingId}`,
                },
                (payload) => {
                    onUpdate(payload.new as Record<string, unknown>)
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR' && onError) {
                    onError(new Error('Booking channel error'))
                }
            })

        return {
            channel,
            unsubscribe: () => {
                this.supabase?.removeChannel(channel)
            },
        }
    }

    /**
     * Subscribe to price drop alerts for wishlisted properties
     */
    subscribeToPriceDrops(
        userId: string,
        propertyIds: string[],
        onPriceDrop: (propertyId: string, oldPrice: number, newPrice: number) => void,
        onError?: (error: Error) => void
    ): NotificationSubscription | null {
        if (!this.supabase || propertyIds.length === 0) {
            return null
        }

        const channel = this.supabase
            .channel(`price-drops:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'properties',
                    filter: `id=in.(${propertyIds.join(',')})`,
                },
                (payload) => {
                    const oldRecord = payload.old as { price_per_night: number }
                    const newRecord = payload.new as { id: string; price_per_night: number }

                    if (newRecord.price_per_night < oldRecord.price_per_night) {
                        onPriceDrop(
                            newRecord.id,
                            oldRecord.price_per_night,
                            newRecord.price_per_night
                        )
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR' && onError) {
                    onError(new Error('Price drop channel error'))
                }
            })

        return {
            channel,
            unsubscribe: () => {
                this.supabase?.removeChannel(channel)
            },
        }
    }

    /**
     * Create a new notification
     */
    async createNotification(
        notification: Omit<Notification, 'id' | 'created_at' | 'read'>
    ): Promise<Notification | null> {
        if (!this.supabase) {
            return null
        }

        const { data, error } = await (this.supabase as any)
            .from('notifications')
            .insert({
                ...notification,
                read: false,
            })
            .select()
            .single()

        if (error) {
            console.error('Failed to create notification:', error)
            return null
        }

        return data
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<boolean> {
        if (!this.supabase) {
            return false
        }

        const { error } = await (this.supabase as any)
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)

        return !error
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<boolean> {
        if (!this.supabase) {
            return false
        }

        const { error } = await (this.supabase as any)
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false)

        return !error
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        if (!this.supabase) {
            return 0
        }

        const { count, error } = await this.supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false)

        if (error) {
            console.error('Failed to get unread count:', error)
            return 0
        }

        return count || 0
    }

    /**
     * Get notifications for a user
     */
    async getNotifications(
        userId: string,
        options?: {
            limit?: number
            offset?: number
            unreadOnly?: boolean
        }
    ): Promise<Notification[]> {
        if (!this.supabase) {
            return []
        }

        const { limit = 20, offset = 0, unreadOnly = false } = options || {}

        let query = this.supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (unreadOnly) {
            query = query.eq('read', false)
        }

        const { data, error } = await query

        if (error) {
            console.error('Failed to get notifications:', error)
            return []
        }

        return data || []
    }

    /**
     * Clean up all subscriptions
     */
    cleanup() {
        this.subscriptions.forEach((sub) => sub.unsubscribe())
        this.subscriptions.clear()
    }
}

// Export singleton instance
export const notificationService = new NotificationService()

// ============================================
// React Hook
// ============================================

import { useEffect, useState, useCallback } from 'react'
import { useSupabaseClient } from '@/lib/supabase/client'

export function useNotifications(userId: string | undefined) {
    const supabase = useSupabaseClient()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize
    useEffect(() => {
        if (!userId) return

        notificationService.initialize(supabase)

        // Load initial notifications
        const loadNotifications = async () => {
            setIsLoading(true)
            const [notifs, count] = await Promise.all([
                notificationService.getNotifications(userId),
                notificationService.getUnreadCount(userId),
            ])
            setNotifications(notifs)
            setUnreadCount(count)
            setIsLoading(false)
        }

        loadNotifications()

        // Subscribe to new notifications
        const subscription = notificationService.subscribeToNotifications(
            userId,
            (notification) => {
                setNotifications((prev) => [notification, ...prev])
                setUnreadCount((prev) => prev + 1)
            }
        )

        return () => {
            subscription?.unsubscribe()
        }
    }, [userId, supabase])

    const markAsRead = useCallback(async (notificationId: string) => {
        const success = await notificationService.markAsRead(notificationId)
        if (success) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
        }
        return success
    }, [])

    const markAllAsRead = useCallback(async () => {
        if (!userId) return false
        const success = await notificationService.markAllAsRead(userId)
        if (success) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadCount(0)
        }
        return success
    }, [userId])

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
    }
}

// ============================================
// Notification Helpers
// ============================================

export const notificationTemplates = {
    bookingConfirmed: (propertyTitle: string, checkIn: string): Partial<Notification> => ({
        type: 'booking_confirmed',
        title: 'Booking Confirmed! 🎉',
        message: `Your booking for "${propertyTitle}" starting ${checkIn} has been confirmed.`,
    }),

    bookingCancelled: (propertyTitle: string): Partial<Notification> => ({
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking for "${propertyTitle}" has been cancelled.`,
    }),

    bookingRequest: (guestName: string, propertyTitle: string): Partial<Notification> => ({
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${guestName} wants to book your property "${propertyTitle}".`,
    }),

    newMessage: (senderName: string): Partial<Notification> => ({
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message from ${senderName}.`,
    }),

    newReview: (guestName: string, propertyTitle: string, rating: number): Partial<Notification> => ({
        type: 'new_review',
        title: 'New Review',
        message: `${guestName} left a ${rating}-star review for "${propertyTitle}".`,
    }),

    paymentReceived: (amount: number, propertyTitle: string): Partial<Notification> => ({
        type: 'payment_received',
        title: 'Payment Received 💰',
        message: `Payment of ৳${amount.toLocaleString()} received for "${propertyTitle}".`,
    }),

    priceDrop: (propertyTitle: string, oldPrice: number, newPrice: number): Partial<Notification> => ({
        type: 'price_drop',
        title: 'Price Drop Alert! 📉',
        message: `"${propertyTitle}" dropped from ৳${oldPrice.toLocaleString()} to ৳${newPrice.toLocaleString()}!`,
    }),

    wishlistAvailable: (propertyTitle: string, dates: string): Partial<Notification> => ({
        type: 'wishlist_available',
        title: 'Wishlisted Property Available!',
        message: `"${propertyTitle}" is now available for ${dates}. Book now!`,
    }),

    hostApproved: (): Partial<Notification> => ({
        type: 'host_approved',
        title: 'Welcome, Host! 🏠',
        message: 'Your host application has been approved. Start listing your properties!',
    }),

    hostRejected: (reason?: string): Partial<Notification> => ({
        type: 'host_rejected',
        title: 'Host Application Update',
        message: `Your host application was not approved. ${reason || 'Please contact support for more information.'}`,
    }),
}
