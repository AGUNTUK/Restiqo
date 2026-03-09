'use client'

import { useState, useEffect } from 'react'
import { getChatService, ChatRoom } from '@/lib/firebase/chat'
import { useAuth } from '@/lib/firebase/auth'
import Link from 'next/link'

export default function ChatList() {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const chatService = getChatService()

  useEffect(() => {
    if (!user?.uid) return

    setIsLoading(true)
    const unsubscribe = chatService.subscribeToChatRooms(user.uid, (chats) => {
      setChatRooms(chats)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user?.uid, chatService])

  const formatTime = (timestamp: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getOtherParticipant = (participants: string[]) => {
    return participants.find(p => p !== user?.uid) || 'Unknown'
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500">Please sign in to view your messages</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (chatRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-gray-500">No conversations yet</p>
        <p className="text-sm text-gray-400">Start a conversation by booking a property!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>
      
      <div className="divide-y">
        {chatRooms.map((chat) => {
          const otherUserId = getOtherParticipant(chat.participants)
          
          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-lg">
                    {otherUserId.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online indicator - could be enhanced with real-time presence */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {otherUserId}
                  </h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              
              {/* Unread indicator */}
              {chat.lastMessage && chat.lastMessage.senderId !== user.uid && !chat.lastMessage.read && (
                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
