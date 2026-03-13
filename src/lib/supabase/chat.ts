import { createClient } from './client'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'system'
  timestamp: number
  read?: boolean
}

export interface ChatRoom {
  id: string
  participants: string[]
  updatedAt: number
  lastMessage?: ChatMessage | null
}

export interface TypingStatus {
  isTyping: boolean
  userId: string
  userName: string
}

export class SupabaseChatService {
  private supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = createClient()
  }

  // Subscribe to chat rooms for a user
  subscribeToChatRooms(
    userId: string,
    callback: (chatRooms: ChatRoom[]) => void
  ): () => void {
    
    // Initial fetch
    this.supabase
        .from('chats')
        .select('*')
        .contains('participants', [userId])
        .order('updated_at', { ascending: false })
        .then(({ data }) => {
            if (data) {
                const mapped: ChatRoom[] = data.map((chat: any) => ({
                    id: chat.id,
                    participants: chat.participants,
                    updatedAt: new Date(chat.updated_at).getTime(),
                    lastMessage: null // We might need to join this for a full feature
                }))
                callback(mapped)
            } else {
                callback([])
            }
        })

    // Realtime subscription
    const channel = this.supabase
      .channel(`chats:${userId}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'chats', filter: `participants=cs.{${userId}}` }, 
          () => {
            this.supabase
                .from('chats')
                .select('*')
                .contains('participants', [userId])
                .order('updated_at', { ascending: false })
                .then(({ data }) => {
                    if (data) {
                        const mapped: ChatRoom[] = data.map((chat: any) => ({
                            id: chat.id,
                            participants: chat.participants,
                            updatedAt: new Date(chat.updated_at).getTime(),
                            lastMessage: null
                        }))
                        callback(mapped)
                    }
                })
      })
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }



  // Create or get a chat room between two users
  async getOrCreateChatRoom(userId1: string, userId2: string): Promise<string> {
    // Note: This requires a `chats` table in Supabase
    // that has an array of `participants` (uuid[])

    // Try finding existing chat
    const { data: existingChats, error: searchError } = await this.supabase
      .from('chats')
      .select('id, participants')
      .contains('participants', [userId1, userId2])
      
      if (searchError && (searchError as any).code !== '42P01') {
        // Ignore "relation does not exist" error during migration setup
        console.error('Error finding chat:', searchError)
    }

    if (existingChats && existingChats.length > 0) {
        // Double check exact match
        const exactMatch = existingChats.find((chat: any) => 
            chat.participants.length === 2 && 
            chat.participants.includes(userId1) && 
            chat.participants.includes(userId2)
        )
        if (exactMatch) return (exactMatch as any).id
    }

    // Create new chat
    const { data: newChat, error: insertError } = await this.supabase
        .from('chats')
        .insert({
            participants: [userId1, userId2]
        } as any)
        .select('id')
        .single()
        
    if (insertError) throw insertError
    return (newChat as any).id
  }

  // Send a message
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    content: string,
    senderAvatar?: string,
    type: 'text' | 'image' | 'system' = 'text'
  ): Promise<string> {
    const { data, error } = await this.supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: senderId,
            sender_name: senderName,
            sender_avatar: senderAvatar,
            content,
            message_type: type,
            read: false
        } as any)
        .select('id')
        .single()

    if (error) throw error

    // Update chat timestamp
    await this.supabase
        .from('chats')
        // @ts-ignore
        .update({ updated_at: new Date().toISOString() } as any)
        .eq('id', chatId)

    return (data as any).id
  }

  // Subscribe to chat messages
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    
    // Initial fetch
    this.supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
            if (data) {
                const mapped = data.map(this.mapMessage)
                callback(mapped)
            } else {
                callback([])
            }
        })

    // Realtime subscription
    const channel = this.supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, 
          (payload) => {
            // Re-fetch all messages to ensure order is correct, 
            // alternatively update local state but re-fetch is safer for simple implementation
            this.supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true })
                .then(({ data }) => {
                    if (data) callback(data.map(this.mapMessage))
                })
      })
      .subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  // Set typing status (Using Supabase Presence)
  async setTyping(chatId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    const channel = this.supabase.channel(`typing:${chatId}`)
    
    if (isTyping) {
        await channel.track({
            user_id: userId,
            user_name: userName,
            typing: true
        })
    } else {
        await channel.untrack()
    }
  }

  // Subscribe to typing status
  subscribeToTyping(
    chatId: string,
    excludeUserId: string,
    callback: (typingUsers: TypingStatus[]) => void
  ): () => void {
    const channel = this.supabase.channel(`typing:${chatId}`)

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const typingUsers: TypingStatus[] = []
      
      for (const id in state) {
          const presences = state[id] as any[]
          for (const presence of presences) {
              if (presence.typing && presence.user_id !== excludeUserId) {
                  typingUsers.push({
                      isTyping: true,
                      userId: presence.user_id,
                      userName: presence.user_name
                  })
              }
          }
      }
      callback(typingUsers)
    }).subscribe()

    return () => {
      this.supabase.removeChannel(channel)
    }
  }

  // Mark messages as read
  async markAsRead(chatId: string, userId: string): Promise<void> {
    await this.supabase
        .from('messages')
        // @ts-ignore
        .update({ read: true } as any)
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .eq('read', false)
  }

  // Get unread message count
  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    const { count, error } = await this.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .eq('read', false)
        
    if (error) return 0
    return count || 0
  }

  private mapMessage(dbMsg: any): ChatMessage {
    return {
        id: dbMsg.id,
        chatId: dbMsg.chat_id,
        senderId: dbMsg.sender_id,
        senderName: dbMsg.sender_name,
        senderAvatar: dbMsg.sender_avatar,
        content: dbMsg.content,
        type: dbMsg.message_type as any,
        timestamp: new Date(dbMsg.created_at).getTime(),
        read: dbMsg.read
    }
  }
}

let chatServiceInstance: SupabaseChatService | null = null

export function getChatService(): SupabaseChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new SupabaseChatService()
  }
  return chatServiceInstance
}
