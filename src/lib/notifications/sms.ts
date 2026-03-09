'use client'

import { createClient } from '@/lib/supabase/client'

export interface SMSVerification {
  id: string
  phoneNumber: string
  verificationCode: string
  purpose: string
  expiresAt: Date
  isVerified: boolean
  attempts: number
}

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a random session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// SMS message templates
const smsTemplates = {
  phone_verification: (code: string) => 
    `Your Restiqa verification code is: ${code}. This code expires in 10 minutes.`,
  
  booking_confirmation: (details: { propertyTitle: string; checkIn: string; checkOut: string }) =>
    `Restiqa: Your booking at ${details.propertyTitle} is confirmed! Check-in: ${details.checkIn}, Check-out: ${details.checkOut}`,
  
  booking_reminder: (details: { propertyTitle: string; checkIn: string }) =>
    `Restiqa Reminder: Your trip to ${details.propertyTitle} starts on ${details.checkIn}. Get ready!`,
  
  booking_cancelled: (details: { propertyTitle: string }) =>
    `Restiqa: Your booking at ${details.propertyTitle} has been cancelled.`,
  
  password_reset: (code: string) =>
    `Your Restiqa password reset code is: ${code}. This code expires in 10 minutes.`
}

export class SMSService {
  private dbClient: ReturnType<typeof createClient>
  
  constructor() {
    this.dbClient = createClient()
  }

  // Send SMS via Firebase function endpoint
  async sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Store SMS in database for logging
      const { error: logError } = await this.dbClient
        .from('sms_logs')
        .insert({
          phone_number: phoneNumber,
          message,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Error logging SMS:', logError)
      }

      // Call Firebase HTTP function (example: https://<region>-<project>.cloudfunctions.net)
      const functionsBaseUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL
      if (!functionsBaseUrl) {
        throw new Error('NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL is not configured')
      }
      const accessToken = (await this.dbClient.auth.getSession()).data.session?.access_token
      const response = await fetch(`${functionsBaseUrl.replace(/\/$/, '')}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          to: phoneNumber,
          message
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send SMS')
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending SMS:', error)
      return { success: false, error: String(error) }
    }
  }

  // Request phone verification
  async requestVerification(phoneNumber: string, purpose: string = 'phone_verification'): Promise<{ success: boolean; error?: string; sessionId?: string }> {
    try {
      // Validate phone number format
      const cleanedPhone = this.cleanPhoneNumber(phoneNumber)
      if (!this.isValidPhoneNumber(cleanedPhone)) {
        return { success: false, error: 'Invalid phone number format' }
      }

      // Check if there's a recent unexpired verification
      const { data: recentVerification } = await this.dbClient
        .from('sms_verifications')
        .select('*')
        .eq('phone_number', cleanedPhone)
        .eq('purpose', purpose)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentVerification) {
        // Rate limit - don't send another code yet
        const timeSinceLastSent = Date.now() - new Date(recentVerification.created_at).getTime()
        const cooldownPeriod = 60 * 1000 // 1 minute cooldown
        
        if (timeSinceLastSent < cooldownPeriod) {
          const waitTime = Math.ceil((cooldownPeriod - timeSinceLastSent) / 1000)
          return { success: false, error: `Please wait ${waitTime} seconds before requesting another code` }
        }
      }

      // Generate new verification code
      const code = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      const sessionId = generateSessionId()

      // Store verification in database
      const { error: insertError } = await this.dbClient
        .from('sms_verifications')
        .insert({
          phone_number: cleanedPhone,
          verification_code: code,
          purpose,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error storing verification:', insertError)
        return { success: false, error: 'Failed to create verification' }
      }

      // Send SMS with code
      const template = smsTemplates[purpose as keyof typeof smsTemplates]
      const message = template 
        ? (template as (code: string) => string)(code)
        : `Your Restiqa verification code is: ${code}. This code expires in 10 minutes.`

      const result = await this.sendSMS(cleanedPhone, message)
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to send SMS' }
      }

      return { success: true, sessionId }
    } catch (error) {
      console.error('Error requesting verification:', error)
      return { success: false, error: String(error) }
    }
  }

  // Verify code
  async verifyCode(phoneNumber: string, code: string, purpose: string = 'phone_verification'): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanedPhone = this.cleanPhoneNumber(phoneNumber)

      // Get the most recent unverified code
      const { data: verification, error: fetchError } = await this.dbClient
        .from('sms_verifications')
        .select('*')
        .eq('phone_number', cleanedPhone)
        .eq('purpose', purpose)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !verification) {
        return { success: false, error: 'Verification code not found or expired' }
      }

      // Check attempts
      if (verification.attempts >= 5) {
        return { success: false, error: 'Too many attempts. Please request a new code' }
      }

      // Increment attempts
      await this.dbClient
        .from('sms_verifications')
        .update({ attempts: verification.attempts + 1 })
        .eq('id', verification.id)

      // Verify code
      if (verification.verification_code !== code) {
        return { success: false, error: 'Invalid verification code' }
      }

      // Mark as verified
      await this.dbClient
        .from('sms_verifications')
        .update({ 
          is_verified: true, 
          verified_at: new Date().toISOString() 
        })
        .eq('id', verification.id)

      return { success: true }
    } catch (error) {
      console.error('Error verifying code:', error)
      return { success: false, error: String(error) }
    }
  }

  // Send booking notification
  async sendBookingNotification(phoneNumber: string, type: 'confirmation' | 'reminder' | 'cancelled', details: any): Promise<{ success: boolean; error?: string }> {
    const messageTemplates = {
      confirmation: smsTemplates.booking_confirmation(details),
      reminder: smsTemplates.booking_reminder(details),
      cancelled: smsTemplates.booking_cancelled(details)
    }

    return this.sendSMS(phoneNumber, messageTemplates[type])
  }

  // Clean phone number (remove spaces, dashes, etc.)
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '')
    
    // Add country code if not present (assuming Bangladesh +880)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = '+88' + cleaned.substring(1)
      } else if (cleaned.length === 10) {
        cleaned = '+88' + cleaned
      }
    }
    
    return cleaned
  }

  // Validate phone number format
  private isValidPhoneNumber(phone: string): boolean {
    // Bangladesh phone number validation
    const bdPhoneRegex = /^(\+88)?01[3-9]\d{9}$/
    return bdPhoneRegex.test(phone)
  }
}

// Singleton instance
let smsServiceInstance: SMSService | null = null

export function getSMSService(): SMSService {
  if (!smsServiceInstance) {
    smsServiceInstance = new SMSService()
  }
  return smsServiceInstance
}

// React hook for SMS verification
export function useSMSVerification() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const smsService = getSMSService()

  const requestCode = async (phoneNumber: string) => {
    setIsLoading(true)
    setError(null)
    
    const result = await smsService.requestVerification(phoneNumber)
    
    setIsLoading(false)
    if (!result.success) {
      setError(result.error || 'Failed to send code')
    }
    
    return result
  }

  const verifyCode = async (phoneNumber: string, code: string) => {
    setIsLoading(true)
    setError(null)
    
    const result = await smsService.verifyCode(phoneNumber, code)
    
    setIsLoading(false)
    if (result.success) {
      setIsVerified(true)
    } else {
      setError(result.error || 'Invalid code')
    }
    
    return result
  }

  return {
    isLoading,
    error,
    isVerified,
    requestCode,
    verifyCode
  }
}

// Import useState
import { useState } from 'react'
