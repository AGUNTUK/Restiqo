'use client'

import { useEffect, useState, useCallback } from 'react'
import { ref, push, onValue, off, set, serverTimestamp, query, orderByChild, equalTo, child } from 'firebase/database'
import { getFirebaseRealtimeDB } from './config'

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
  lastMessage?: ChatMessage
  updatedAt: number
}

export interface TypingStatus {
  isTyping: boolean
  userId: string
  userName: string
}

class FirebaseChatService {
  private db = getFirebaseRealtimeDB()

  // Create or get a chat room between two users
  async getOrCreateChatRoom(userId1: string, userId2: string): Promise<string> {
    try {
      // Check if chat exists
      const chatsRef = ref(this.db, 'chats')
      const chatsQuery = query(
        ref(this.db, 'chats'),
        orderByChild('participants'),
        equalTo(JSON.stringify([userId1, userId2].sort()))
      )

      return new Promise((resolve) => {
        onValue(chatsQuery, (snapshot) => {
          const data = snapshot.val()
          
          if (data) {
            // Chat exists, return the ID
            const chatId = Object.keys(data)[0]
            resolve(chatId)
          } else {
            // Create new chat
            const newChatRef = push(chatsRef)
            const chatId = newChatRef.key!
            
            set(newChatRef, {
              participants: [userId1, userId2].sort(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }).then(() => resolve(chatId))
          }
        }, { onlyOnce: true })
      })
    } catch (error) {
      console.error('Error getting/creating chat room:', error)
      throw error
    }
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
    try {
      const messagesRef = ref(this.db, `chats/${chatId}/messages`)
      const newMessageRef = push(messagesRef)
      const messageId = newMessageRef.key!

      await set(newMessageRef, {
        chatId,
        senderId,
        senderName,
        senderAvatar,
        content,
        type,
        timestamp: serverTimestamp(),
        read: false
      })

      // Update chat's last message and timestamp
      const chatRef = ref(this.db, `chats/${chatId}`)
      await set(child(chatRef, 'lastMessage'), {
        content,
        senderId,
        timestamp: serverTimestamp()
      })
      await set(child(chatRef, 'updatedAt'), serverTimestamp())

      return messageId
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Subscribe to chat messages
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const messagesRef = ref(this.db, `chats/${chatId}/messages`)
    const messagesQuery = query(messagesRef, orderByChild('timestamp'))

    onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val()
      
      if (data) {
        const messages: ChatMessage[] = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
          timestamp: typeof value.timestamp === 'number' ? value.timestamp : Date.now()
        }))
        
        // Sort by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp)
        callback(messages)
      } else {
        callback([])
      }
    })

    // Return unsubscribe function
    return () => off(messagesRef)
  }

  // Subscribe to user's chat rooms
  subscribeToChatRooms(
    userId: string,
    callback: (chats: ChatRoom[]) => void
  ): () => void {
    const userChatsRef = ref(this.db, 'userChats')
    const userChatsQuery = query(
      ref(this.db, 'userChats'),
      orderByChild('participants'),
      equalTo(userId)
    )

    onValue(userChatsQuery, async (snapshot) => {
      const data = snapshot.val()
      
      if (data) {
        const chatIds = Object.values(data).map((chat: any) => chat.chatId)
        
        // Get chat details for each
        const chatPromises = chatIds.map(async (chatId: string) => {
          const chatRef = ref(this.db, `chats/${chatId}`)
          
          return new Promise((resolve) => {
            onValue(chatRef, (chatSnapshot) => {
              if (chatSnapshot.exists()) {
                resolve({
                  id: chatId,
                  ...chatSnapshot.val()
                })
              } else {
                resolve(null)
              }
            }, { onlyOnce: true })
          })
        })

        const chats = await Promise.all(chatPromises)
        const validChats = chats.filter(Boolean).sort((a: any, b: any) => 
          (b.updatedAt || 0) - (a.updatedAt || 0)
        )
        
        callback(validChats as ChatRoom[])
      } else {
        callback([])
      }
    })

    return () => off(userChatsRef)
  }

  // Set typing status
  async setTyping(chatId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = ref(this.db, `typing/${chatId}/${userId}`)
      
      if (isTyping) {
        await set(typingRef, {
          userId,
          userName,
          timestamp: serverTimestamp()
        })
        
        // Auto-remove typing status after 3 seconds
        setTimeout(() => {
          set(typingRef, null)
        }, 3000)
      } else {
        await set(typingRef, null)
      }
    } catch (error) {
      console.error('Error setting typing status:', error)
    }
  }

  // Subscribe to typing status
  subscribeToTyping(
    chatId: string,
    excludeUserId: string,
    callback: (typingUsers: TypingStatus[]) => void
  ): () => void {
    const typingRef = ref(this.db, `typing/${chatId}`)

    onValue(typingRef, (snapshot) => {
      const data = snapshot.val()
      
      if (data) {
        const typingUsers = Object.entries(data)
          .filter(([key]) => key !== excludeUserId)
          .map(([key, value]: [string, any]) => ({
            isTyping: true,
            userId: key,
            userName: value.userName
          }))
        
        callback(typingUsers)
      } else {
        callback([])
      }
    })

    return () => off(typingRef)
  }

  // Mark messages as read
  async markAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const messagesRef = ref(this.db, `chats/${chatId}/messages`)
      
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val()
        
        if (data) {
          Object.entries(data).forEach(async ([id, message]: [string, any]) => {
            if (message.senderId !== userId && !message.read) {
              const messageRef = ref(this.db, `chats/${chatId}/messages/${id}/read`)
              await set(messageRef, true)
            }
          })
        }
      }, { onlyOnce: true })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Get unread message count
  getUnreadCount(chatId: string, userId: string): Promise<number> {
    return new Promise((resolve) => {
      const messagesRef = ref(this.db, `chats/${chatId}/messages`)
      
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val()
        
        if (data) {
          const unreadCount = Object.values(data).filter(
            (message: any) => message.senderId !== userId && !message.read
          ).length
          resolve(unreadCount)
        } else {
          resolve(0)
        }
      }, { onlyOnce: true })
    })
  }
}

// Singleton instance
let chatServiceInstance: FirebaseChatService | null = null

export function getChatService(): FirebaseChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new FirebaseChatService()
  }
  return chatServiceInstance
}

// React hook for chat
export function useChat(chatId: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const chatService = getChatService()

  // Subscribe to messages
  useEffect(() => {
    if (!chatId) return

    setIsLoading(true)
    const unsubscribe = chatService.subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs)
      setIsLoading(false)
      
      // Mark as read
      chatService.markAsRead(chatId, userId)
    })

    return () => unsubscribe()
  }, [chatId, userId, chatService])

  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'image' | 'system' = 'text'
  ) => {
    if (!chatId || !content.trim()) return
    
    await chatService.sendMessage(chatId, userId, 'User', content, undefined, type)
  }, [chatId, userId, chatService])

  return {
    messages,
    isLoading,
    sendMessage
  }
}

// React hook for typing status
export function useTypingStatus(chatId: string, currentUserId: string, currentUserName: string) {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([])
  const chatService = getChatService()

  useEffect(() => {
    if (!chatId) return

    const unsubscribe = chatService.subscribeToTyping(
      chatId,
      currentUserId,
      (users) => setTypingUsers(users)
    )

    return () => unsubscribe()
  }, [chatId, currentUserId, chatService])

  const setTyping = useCallback(async (isTyping: boolean) => {
    await chatService.setTyping(chatId, currentUserId, currentUserName, isTyping)
  }, [chatId, currentUserId, currentUserName, chatService])

  return {
    typingUsers,
    setTyping
  }
}
