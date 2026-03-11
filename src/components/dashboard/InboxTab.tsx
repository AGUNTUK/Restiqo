'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth'
import { useConversations, useRealtimeChat, type Conversation } from '@/lib/realtime'

function formatConversationTime(dateString: string | null, fallback: string) {
  const targetDate = new Date(dateString || fallback)
  const now = new Date()
  const sameDay = targetDate.toDateString() === now.toDateString()

  if (sameDay) {
    return targetDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getConversationPeer(conversation: Conversation, userId: string | undefined) {
  if (!userId) return null
  const isGuest = conversation.guest_id === userId
  return isGuest ? conversation.host : conversation.guest
}

export default function InboxTab() {
  const { user } = useAuth()
  const {
    conversations,
    isLoading: conversationsLoading,
    refreshConversations,
  } = useConversations(user?.id || null)
  const [userSelectedConversationId, setUserSelectedConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConversationId = useMemo(() => {
    if (conversations.length === 0) return null

    const selectedConversationStillExists = conversations.some(
      (conversation) => conversation.id === userSelectedConversationId
    )
    if (userSelectedConversationId && selectedConversationStillExists) {
      return userSelectedConversationId
    }

    return conversations[0].id
  }, [conversations, userSelectedConversationId])

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  )

  const { messages, isLoading: messagesLoading, sendMessage, markAsRead } = useRealtimeChat(
    selectedConversationId
  )

  useEffect(() => {
    if (user?.id && selectedConversationId) {
      markAsRead(user.id)
    }
  }, [user?.id, selectedConversationId, markAsRead, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || !selectedConversationId || isSending) return

    setIsSending(true)
    const { error } = await sendMessage(newMessage.trim(), user.id)
    if (error) {
      toast.error(error)
    } else {
      setNewMessage('')
      refreshConversations()
    }
    setIsSending(false)
  }

  const handleMessageInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  if (conversationsLoading) {
    return (
      <div className="clay-card p-8 text-center border-white/40 shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        <p className="text-gray-600 mt-4">Loading inbox...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[560px]">
      <div className="clay-card p-3 sm:p-4 xl:col-span-1 flex flex-col border-white/40 shadow-xl">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Conversations</h3>

        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 mb-2">No messages yet</p>
            <p className="text-xs text-gray-500">
              Start by booking a property and contacting the host.
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto">
            {conversations.map((conversation) => {
              const peer = getConversationPeer(conversation, user?.id)
              const preview = conversation.last_message || 'Start the conversation'
              const timestamp = formatConversationTime(
                conversation.last_message_at,
                conversation.updated_at
              )
              const isActive = selectedConversationId === conversation.id

              return (
                <button
                  key={conversation.id}
                  onClick={() => setUserSelectedConversationId(conversation.id)}
                  className={`w-full p-3 rounded-xl text-left transition-colors ${
                    isActive ? 'bg-brand-primary/10 border border-brand-primary/30' : 'neu-button'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1E293B] truncate">
                        {peer?.full_name || 'Guest'}
                      </p>
                      {conversation.property?.title && (
                        <p className="text-xs text-brand-primary truncate">
                          {conversation.property.title}
                        </p>
                      )}
                      <p className="text-xs text-[#64748B] truncate mt-1">{preview}</p>
                    </div>
                    <span className="text-[11px] text-[#94A3B8] shrink-0">{timestamp}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="clay-card p-0 xl:col-span-2 flex flex-col min-h-[560px] overflow-hidden border-white/40 shadow-xl">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <h4 className="text-base font-semibold text-gray-900 mb-1">Select a conversation</h4>
            <p className="text-sm text-gray-500">Choose a chat from the left to view messages.</p>
          </div>
        ) : (
          <>
            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-[#F8FAFC]">
              <p className="text-sm font-semibold text-gray-900">
                {getConversationPeer(selectedConversation, user?.id)?.full_name || 'Conversation'}
              </p>
              {selectedConversation.property?.id && (
                <Link
                  href={`/property/${selectedConversation.property.id}`}
                  className="text-xs text-brand-primary hover:underline"
                >
                  {selectedConversation.property.title}
                </Link>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 bg-white">
              {messagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-gray-600">No messages yet</p>
                  <p className="text-xs text-gray-500 mt-1">Send the first message below.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-brand-primary text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p
                            className={`text-[11px] mt-1 ${
                              isOwn ? 'text-white/75' : 'text-gray-400'
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={handleMessageInputKeyDown}
                  placeholder="Type a message..."
                  className="clay-input flex-1 px-4 py-2 font-medium"
                  disabled={isSending}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="clay-button px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

