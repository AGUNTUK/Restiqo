'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  Calendar,
  CheckCheck,
  CreditCard,
  Loader2,
  MessageSquare,
  Star,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useRealtimeNotifications, type Notification } from '@/lib/realtime'

type NotificationFilter = 'all' | 'unread'

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'message':
      return <MessageSquare className="w-5 h-5 text-blue-500" />
    case 'booking':
      return <Calendar className="w-5 h-5 text-brand-primary" />
    case 'review':
      return <Star className="w-5 h-5 text-yellow-500" />
    case 'payment':
      return <CreditCard className="w-5 h-5 text-green-500" />
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />
  }
}

function getNotificationTarget(notification: Notification) {
  const data = notification.data as Record<string, unknown> | null
  const propertyId = typeof data?.property_id === 'string' ? data.property_id : null

  if (notification.type === 'message') return '/dashboard?tab=inbox'
  if (propertyId) return `/property/${propertyId}`
  return '/dashboard'
}

export default function NotificationsTab() {
  const { user } = useAuth()
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useRealtimeNotifications(
    user?.id || null
  )
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.read_at)
    }
    return notifications
  }, [notifications, filter])

  return (
    <div className="space-y-4">
      <div className="clay p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B]">Notifications</h3>
          <p className="text-sm text-[#64748B]">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === 'all' ? 'bg-brand-primary text-white' : 'neu-button text-[#64748B]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === 'unread' ? 'bg-brand-primary text-white' : 'neu-button text-[#64748B]'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm neu-button text-[#64748B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="clay p-2 sm:p-3">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
            <p className="text-sm text-gray-600 mt-3">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const target = getNotificationTarget(notification)
              return (
                <div
                  key={notification.id}
                  className={`rounded-xl p-3 sm:p-4 border transition-colors ${
                    notification.read_at
                      ? 'border-transparent bg-white'
                      : 'border-brand-primary/30 bg-brand-primary/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1E293B]">{notification.title}</p>
                      <p className="text-sm text-[#64748B] mt-0.5">{notification.message}</p>
                      <p className="text-xs text-[#94A3B8] mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {!notification.read_at && <span className="w-2.5 h-2.5 rounded-full bg-brand-primary mt-2" />}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    {!notification.read_at && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-brand-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <Link href={target} className="text-xs text-[#64748B] hover:text-[#1E293B] hover:underline">
                      Open
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

