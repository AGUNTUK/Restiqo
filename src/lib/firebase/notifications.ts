'use client'

import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  PhoneAuthProvider,
  linkWithPhoneNumber,
  updatePhoneNumber
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseFirestore } from './config'

// Phone verification using Firebase Auth
export interface FirebasePhoneVerification {
  confirmationResult: ConfirmationResult | null
  verifier: RecaptchaVerifier | null
}

// Initialize reCAPTCHA verifier
export function initializeRecaptcha(containerId: string): RecaptchaVerifier {
  const auth = getFirebaseAuth()
  
  return new RecaptchaVerifier(auth, containerId, {
    size: 'visible',
    callback: (response: string) => {
      // reCAPTCHA solved, allow phone authentication
      console.log('Recaptcha solved:', response)
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve again.
      console.log('Recaptcha expired')
    }
  })
}

// Initialize invisible reCAPTCHA
export function initializeInvisibleRecaptcha(): RecaptchaVerifier {
  const auth = getFirebaseAuth()
  
  return new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
    callback: (response: string) => {
      console.log('Recaptcha solved:', response)
    }
  })
}

// Send phone verification code
export async function sendVerificationCode(
  phoneNumber: string, 
  verifier: RecaptchaVerifier
): Promise<{ confirmationResult: ConfirmationResult | null; error: string | null }> {
  try {
    const auth = getFirebaseAuth()
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier)
    return { confirmationResult, error: null }
  } catch (error: any) {
    console.error('Error sending verification code:', error)
    return { confirmationResult: null, error: error.message || 'Failed to send verification code' }
  }
}

// Verify the code
export async function verifyCode(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<{ user: any; error: string | null }> {
  try {
    const userCredential = await confirmationResult.confirm(code)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    console.error('Error verifying code:', error)
    return { user: null, error: error.message || 'Invalid verification code' }
  }
}

// Link phone number to existing account
export async function linkPhoneToAccount(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<{ confirmationResult: ConfirmationResult | null; error: string | null }> {
  try {
    const auth = getFirebaseAuth()
    
    if (!auth.currentUser) {
      return { confirmationResult: null, error: 'No user logged in' }
    }

    const confirmationResult = await linkWithPhoneNumber(auth.currentUser, phoneNumber, verifier)
    return { confirmationResult, error: null }
  } catch (error: any) {
    console.error('Error linking phone:', error)
    return { confirmationResult: null, error: error.message || 'Failed to link phone number' }
  }
}

// Update user's phone number after verification
export async function updateUserPhone(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<{ error: string | null }> {
  try {
    const userCredential = await confirmationResult.confirm(code)
    const phoneAuthCredential = PhoneAuthProvider.credential(
      confirmationResult.verificationId,
      code
    )
    
    if (userCredential.user) {
      await updatePhoneNumber(userCredential.user, phoneAuthCredential)
    }
    
    return { error: null }
  } catch (error: any) {
    console.error('Error updating phone:', error)
    return { error: error.message || 'Failed to update phone number' }
  }
}

// Save phone verification to Firestore
export async function savePhoneVerification(
  userId: string,
  phoneNumber: string,
  isVerified: boolean = false
): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return
  }
  const db = getFirebaseFirestore()
  
  await setDoc(doc(db, 'phoneVerifications', userId), {
    phoneNumber,
    isVerified,
    verifiedAt: isVerified ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })
}

// Check if phone is verified
export async function isPhoneVerified(userId: string): Promise<boolean> {
  const auth = getFirebaseAuth()
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return false
  }
  const db = getFirebaseFirestore()
  const docRef = doc(db, 'phoneVerifications', userId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return docSnap.data().isVerified || false
  }
  return false
}

// Email service for Firebase
export class FirebaseEmailService {
  private auth = getFirebaseAuth()

  // Send password reset email
  async sendPasswordReset(email: string): Promise<{ error: string | null }> {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth')
      await sendPasswordResetEmail(this.auth, email)
      return { error: null }
    } catch (error: any) {
      console.error('Error sending password reset:', error)
      return { error: error.message || 'Failed to send password reset email' }
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<{ error: string | null }> {
    try {
      if (!this.auth.currentUser) {
        return { error: 'No user logged in' }
      }
      
      const { sendEmailVerification } = await import('firebase/auth')
      await sendEmailVerification(this.auth.currentUser)
      return { error: null }
    } catch (error: any) {
      console.error('Error sending email verification:', error)
      return { error: error.message || 'Failed to send email verification' }
    }
  }
}

// Notification service using Firebase Cloud Messaging (FCM)
// Note: Requires additional setup in Firebase Console
export class FirebaseNotificationService {
  private messaging: any = null

  async requestPermission(): Promise<boolean> {
    try {
      const { getMessaging, getToken } = await import('firebase/messaging')
      
      if (!this.messaging) {
        this.messaging = getMessaging()
      }

      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        })
        
        // Save token to user document
        // Note: You'll need to get the current user ID from your auth context
        // await setDoc(doc(db, 'fcmTokens', userId), { token }, { merge: true })
        
        console.log('FCM Token:', token)
        return true
      }
      return false
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  async onForegroundMessage(callback: (payload: any) => void): Promise<void> {
    const { getMessaging, onMessage } = await import('firebase/messaging')
    
    if (!this.messaging) {
      this.messaging = getMessaging()
    }

    onMessage(this.messaging, callback)
  }
}

// Singleton instances
let emailServiceInstance: FirebaseEmailService | null = null
let notificationServiceInstance: FirebaseNotificationService | null = null

export function getFirebaseEmailService(): FirebaseEmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new FirebaseEmailService()
  }
  return emailServiceInstance
}

export function getFirebaseNotificationService(): FirebaseNotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new FirebaseNotificationService()
  }
  return notificationServiceInstance
}
