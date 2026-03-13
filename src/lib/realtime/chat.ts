'use client'

import { useEffect, useState, useCallback } from 'react'
import { getChatService } from '@/lib/supabase/chat'
import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

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

function mapMessage(msg: any): Message {
  return {
    id: msg.id,
    conversation_id: msg.chatId,
    sender_id: msg.senderId,
    content: msg.content,
    read_at: msg.read ? new Date(msg.timestamp).toISOString() : null,
    created_at: new Date(msg.timestamp).toISOString(),
    sender: {
      id: msg.senderId,
      full_name: msg.senderName || null,
      avatar_url: msg.senderAvatar || null,
    },
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
  }, [conversationId])

  const markAsRead = useCallback(async (userId: string) => {
    if (!conversationId) return
    await chatService.markAsRead(conversationId, userId)
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const unsubscribe = chatService.subscribeToMessages(conversationId, (nextMessages) => {
      setMessages(nextMessages.map((m: any) => mapMessage(m)))
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [conversationId])

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    channel: null,
  }
}

export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setConversations([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [userId])
        .order('updated_at', { ascending: false })

    if (!error && chats) {
        // Here we'd map to Conversation. We need user info.
        // For a full implementation, we should JOIN with users table or fetch profiles here.
        // To keep this simple and matching previous mock data structure:
        const mapped: Conversation[] = chats.map(chat => {
            const participants = (chat as any).participants as string[]
            const guestId = participants[0] || userId
            const hostId = participants[1] || userId

            return {
                id: (chat as any).id,
                property_id: null,
                guest_id: guestId,
                host_id: hostId,
                last_message: null, // Would require joining last message
                last_message_at: null,
                created_at: (chat as any).created_at,
                updated_at: (chat as any).updated_at,
                guest: { id: guestId, full_name: guestId, avatar_url: null },
                host: { id: hostId, full_name: hostId, avatar_url: null },
            }
        })
        setConversations(mapped)
    }
    setIsLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    fetchConversations()

    if (!userId) return

    const channel = supabase
      .channel('public:chats')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'chats', filter: `participants=cs.{${userId}}` }, 
          () => {
             fetchConversations()
          }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchConversations, supabase])

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

// Notifications will need a `notifications` table in Supabase.
// For now, this is a basic shell using the Supabase client.
export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
      if (!userId) return

      setIsLoading(true)
      const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

      if (!error && data) {
          setNotifications(data as Notification[])
          setUnreadCount(data.filter((n: any) => !n.read_at).length)
      }
      setIsLoading(false)
  }, [userId, supabase])

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return

    await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() } as never)
        .eq('id', notificationId)

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [userId, supabase])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() } as never)
        .eq('user_id', userId)
        .is('read_at', null)

    setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
    setUnreadCount(0)
  }, [userId, supabase])

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    fetchNotifications()

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
          () => {
             fetchNotifications()
          }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchNotifications, supabase])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}
