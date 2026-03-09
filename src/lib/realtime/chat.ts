'use client'

import { useEffect, useState, useCallback } from 'react'
import { onValue, ref } from 'firebase/database'
import { getFirebaseRealtimeDB } from '@/lib/firebase/config'
import { getChatService } from '@/lib/firebase/chat'
import { getRealtimeDB } from '@/lib/firebase/database'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
  sender?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface Conversation {
  id: string
  property_id: string | null
  guest_id: string
  host_id: string
  last_message: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
  property?: {
    id: string
    title: string
    images: string[]
  }
  guest?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  host?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface Notification {
  id: string
  user_id: string
  type: 'booking' | 'message' | 'review' | 'system' | 'payment'
  title: string
  message: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

function toIso(value: unknown): string {
  if (typeof value === 'number') return new Date(value).toISOString()
  if (typeof value === 'string') {
    const asNumber = Number(value)
    if (!Number.isNaN(asNumber)) return new Date(asNumber).toISOString()
    return new Date(value).toISOString()
  }
  return new Date().toISOString()
}

function mapMessage(conversationId: string, message: any): Message {
  return {
    id: message.id,
    conversation_id: conversationId,
    sender_id: message.senderId,
    content: message.content,
    read_at: message.read ? toIso(message.timestamp) : null,
    created_at: toIso(message.timestamp),
    sender: {
      id: message.senderId,
      full_name: message.senderName || null,
      avatar_url: message.senderAvatar || null,
    },
  }
}

function mapNotification(userId: string, notification: any): Notification {
  const typeMap: Record<string, Notification['type']> = {
    booking: 'booking',
    message: 'message',
    review: 'review',
    payment: 'payment',
    system: 'system',
  }

  return {
    id: notification.id,
    user_id: userId,
    type: typeMap[notification.type] || 'system',
    title: notification.title || 'Notification',
    message: notification.body || notification.message || '',
    data: (notification.data as Record<string, unknown>) || null,
    read_at: notification.read ? toIso(notification.timestamp) : null,
    created_at: toIso(notification.timestamp),
  }
}

export function useRealtimeChat(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const chatService = getChatService()

  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!conversationId) return { error: 'No conversation selected' }

    try {
      await chatService.sendMessage(conversationId, senderId, 'User', content)
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to send message' }
    }
  }, [conversationId, chatService])

  const markAsRead = useCallback(async (userId: string) => {
    if (!conversationId) return
    await chatService.markAsRead(conversationId, userId)
  }, [conversationId, chatService])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const unsubscribe = chatService.subscribeToMessages(conversationId, (nextMessages) => {
      setMessages(nextMessages.map((m: any) => mapMessage(conversationId, m)))
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [conversationId, chatService])

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    channel: null,
  }
}

export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return

    await getRealtimeDB().markNotificationRead(userId, notificationId)

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [userId])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    const unread = notifications.filter((item) => !item.read_at)
    await Promise.all(unread.map((item) => getRealtimeDB().markNotificationRead(userId, item.id)))

    setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
    setUnreadCount(0)
  }, [notifications, userId])

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const unsubscribe = getRealtimeDB().subscribeToNotifications(userId, (items: any[]) => {
      const mapped = items.map((item) => mapNotification(userId, item))
      setNotifications(mapped)
      setUnreadCount(mapped.filter((item) => !item.read_at).length)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}

export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setConversations([])
      setIsLoading(false)
      return
    }

    const db = getFirebaseRealtimeDB()
    const chatsRef = ref(db, 'chats')

    const snapshotPromise = new Promise<any>((resolve) => {
      onValue(chatsRef, (snapshot) => resolve(snapshot.val() || {}), { onlyOnce: true })
    })

    const data = await snapshotPromise

    const mapped: Conversation[] = Object.entries(data)
      .map(([id, raw]: [string, any]) => {
        const participants: string[] = Array.isArray(raw.participants) ? raw.participants : []
        if (!participants.includes(userId)) return null

        const guestId = participants[0] || userId
        const hostId = participants[1] || userId

        return {
          id,
          property_id: null,
          guest_id: guestId,
          host_id: hostId,
          last_message: raw.lastMessage?.content || null,
          last_message_at: raw.lastMessage?.timestamp ? toIso(raw.lastMessage.timestamp) : null,
          created_at: toIso(raw.createdAt),
          updated_at: toIso(raw.updatedAt),
          guest: {
            id: guestId,
            full_name: guestId,
            avatar_url: null,
          },
          host: {
            id: hostId,
            full_name: hostId,
            avatar_url: null,
          },
        }
      })
      .filter(Boolean) as Conversation[]

    mapped.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    setConversations(mapped)
    setIsLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setConversations([])
      setIsLoading(false)
      return
    }

    const db = getFirebaseRealtimeDB()
    const chatsRef = ref(db, 'chats')

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val() || {}
      const mapped: Conversation[] = Object.entries(data)
        .map(([id, raw]: [string, any]) => {
          const participants: string[] = Array.isArray(raw.participants) ? raw.participants : []
          if (!participants.includes(userId)) return null

          const guestId = participants[0] || userId
          const hostId = participants[1] || userId

          return {
            id,
            property_id: null,
            guest_id: guestId,
            host_id: hostId,
            last_message: raw.lastMessage?.content || null,
            last_message_at: raw.lastMessage?.timestamp ? toIso(raw.lastMessage.timestamp) : null,
            created_at: toIso(raw.createdAt),
            updated_at: toIso(raw.updatedAt),
            guest: {
              id: guestId,
              full_name: guestId,
              avatar_url: null,
            },
            host: {
              id: hostId,
              full_name: hostId,
              avatar_url: null,
            },
          }
        })
        .filter(Boolean) as Conversation[]

      mapped.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      setConversations(mapped)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const createConversation = useCallback(async (propertyId: string, hostId: string) => {
    if (!userId) return { conversation: null, error: 'Not authenticated' }

    try {
      const chatId = await getChatService().getOrCreateChatRoom(userId, hostId)
      const conversation: Conversation = {
        id: chatId,
        property_id: propertyId,
        guest_id: userId,
        host_id: hostId,
        last_message: null,
        last_message_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        guest: { id: userId, full_name: userId, avatar_url: null },
        host: { id: hostId, full_name: hostId, avatar_url: null },
      }

      return { conversation, error: null }
    } catch (error) {
      return {
        conversation: null,
        error: error instanceof Error ? error.message : 'Failed to create conversation',
      }
    }
  }, [userId])

  return {
    conversations,
    isLoading,
    createConversation,
    refreshConversations: fetchConversations,
  }
}
