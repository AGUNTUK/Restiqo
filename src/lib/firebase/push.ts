'use client'

import { useEffect, useState, useCallback } from 'react'
import { getToken, onMessage, Messaging } from 'firebase/messaging'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config'

// Notification types
export interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, string>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default'

export interface NotificationPermission {
  granted: boolean
  status: NotificationPermissionStatus
}

class FirebasePushNotifications {
  private messaging: Messaging | null = null

  async initialize() {
    if (this.messaging) return

    try {
      const app = getFirebaseApp()
      const { getMessaging } = await import('firebase/messaging')
      this.messaging = getMessaging(app)
    } catch (error) {
      console.error('Error initializing Firebase Messaging:', error)
    }
  }

  // Check if notifications are permitted
  async checkPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, status: 'denied' }
    }

    const permission = await Notification.requestPermission()
    return {
      granted: permission === 'granted',
      status: permission as NotificationPermissionStatus
    }
  }

  // Get FCM token
  async getFCMToken(): Promise<string | null> {
    if (!this.messaging) {
      await this.initialize()
    }

    if (!this.messaging) {
      console.error('Messaging not initialized')
      return null
    }

    try {
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      if (!vapidKey) {
        console.error('VAPID key not configured')
        return null
      }

      const token = await getToken(this.messaging, { vapidKey })
      return token
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }

  // Save token to Firestore
  async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      const auth = getFirebaseAuth()
      if (!auth.currentUser || auth.currentUser.uid !== userId) {
        return
      }
      const db = getFirebaseFirestore()
      const tokenRef = doc(db, 'fcmTokens', userId)
      
      await setDoc(tokenRef, {
        token,
        updatedAt: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving FCM token:', error)
    }
  }

  // Get token from Firestore
  async getTokenFromFirestore(userId: string): Promise<string | null> {
    try {
      const auth = getFirebaseAuth()
      if (!auth.currentUser || auth.currentUser.uid !== userId) {
        return null
      }
      const db = getFirebaseFirestore()
      const tokenRef = doc(db, 'fcmTokens', userId)
      const tokenDoc = await getDoc(tokenRef)
      
      if (tokenDoc.exists()) {
        return tokenDoc.data().token
      }
      return null
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }

  // Show local notification
  showNotification(notification: PushNotification): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/logo.png',
        badge: notification.badge || '/logo.png',
        tag: notification.tag || 'restiqa-notification',
        data: notification.data
      }

      const n = new Notification(notification.title, options)
      
      n.onclick = () => {
        window.focus()
        n.close()
        
        // Handle notification click
        if (notification.data?.click_action) {
          window.location.href = notification.data.click_action
        }
      }
    }
  }

  // Handle foreground messages
  onForegroundMessage(callback: (payload: any) => void): void {
    if (!this.messaging) {
      this.initialize()
    }

    if (this.messaging) {
      onMessage(this.messaging, (payload) => {
        callback(payload)
      })
    }
  }
}

// Singleton instance
let pushNotificationsInstance: FirebasePushNotifications | null = null

export function getPushNotifications(): FirebasePushNotifications {
  if (!pushNotificationsInstance) {
    pushNotificationsInstance = new FirebasePushNotifications()
  }
  return pushNotificationsInstance
}

// React hook for push notifications
export function usePushNotifications(userId?: string) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const push = getPushNotifications()
        
        // Check permission
        const perm = await push.checkPermission()
        setPermission(perm)

        if (!perm.granted) {
          setIsLoading(false)
          return
        }

        // Get token
        const fcmToken = await push.getFCMToken()
        
        if (fcmToken) {
          setToken(fcmToken)
          
          // Save token to Firestore if userId provided
          if (userId) {
            await push.saveTokenToFirestore(userId, fcmToken)
          }
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [userId])

  const requestPermission = useCallback(async () => {
    try {
      const push = getPushNotifications()
      const perm = await push.checkPermission()
      setPermission(perm)

      if (perm.granted) {
        const fcmToken = await push.getFCMToken()
        setToken(fcmToken)
        
        if (fcmToken && userId) {
          await push.saveTokenToFirestore(userId, fcmToken)
        }
      }

      return perm
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return { granted: false, status: 'default' }
    }
  }, [userId])

  const showLocalNotification = useCallback((notification: PushNotification) => {
    const push = getPushNotifications()
    push.showNotification(notification)
  }, [])

  return {
    permission,
    token,
    isLoading,
    requestPermission,
    showLocalNotification
  }
}
