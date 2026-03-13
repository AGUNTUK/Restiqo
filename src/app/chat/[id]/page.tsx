'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ChatWindow from '@/components/ui/ChatWindow'
import { useAuth } from '@/lib/auth/AuthContext'

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [recipientName, setRecipientName] = useState<string>('Chat')

  const chatId = params.id as string

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [isAuthenticated, isLoading, router])

  // For demo, we'll use a placeholder name
  // In production, you'd fetch the recipient's name from the chat room
  useEffect(() => {
    if (chatId) {
      setRecipientName(`Chat ${chatId.slice(0, 8)}`)
    }
  }, [chatId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ChatWindow
          chatId={chatId}
          recipientName={recipientName}
        />
      </div>
    </div>
  )
}
