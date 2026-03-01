'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

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

// Real-time chat hook
export function useRealtimeChat(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
    }
    setIsLoading(false)
  }, [conversationId, supabase])

  // Send a message
  const sendMessage = useCallback(async (content: string, senderId: string) => {
    if (!conversationId) return { error: 'No conversation selected' }

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })

    if (error) return { error: error.message }
    return { error: null }
  }, [conversationId, supabase])

  // Mark messages as read
  const markAsRead = useCallback(async (userId: string) => {
    if (!conversationId) return

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null)
  }, [conversationId, supabase])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return

    fetchMessages()

    // Subscribe to new messages
    const newChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: { new: Message }) => {
          const newMessage = payload.new as Message
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()

          setMessages((prev) => [
            ...prev,
            { ...newMessage, sender: sender || undefined },
          ])
        }
      )
      .subscribe()

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [conversationId, fetchMessages, supabase])

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    channel,
  }
}

// Real-time notifications hook
export function useRealtimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setNotifications(data)
      setUnreadCount(data.filter((n: Notification) => !n.read_at).length)
    }
    setIsLoading(false)
  }, [userId, supabase])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }, [supabase])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    }
  }, [userId, supabase])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return

    fetchNotifications()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Notification }) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
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

// Conversations list hook
export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    if (!userId) return

    // Get conversations where user is either guest or host
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        property:properties (
          id,
          title,
          images
        ),
        guest:users!conversations_guest_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        host:users!conversations_host_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .or(`guest_id.eq.${userId},host_id.eq.${userId}`)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setConversations(data)
    }
    setIsLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Create or get existing conversation
  const createConversation = useCallback(
    async (propertyId: string, hostId: string) => {
      if (!userId) return { error: 'Not authenticated' }

      // Check for existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('property_id', propertyId)
        .eq('guest_id', userId)
        .eq('host_id', hostId)
        .single()

      if (existing) {
        return { conversation: existing, error: null }
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          property_id: propertyId,
          guest_id: userId,
          host_id: hostId,
        })
        .select()
        .single()

      if (error) return { conversation: null, error: error.message }
      return { conversation: data, error: null }
    },
    [userId, supabase]
  )

  return {
    conversations,
    isLoading,
    createConversation,
    refreshConversations: fetchConversations,
  }
}

