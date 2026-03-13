'use client'

import { createClient } from '@/lib/supabase/client'

export interface EmailNotification {
  to: string
  subject: string
  html: string
  type: EmailType
}

export type EmailType = 
  | 'booking_confirmation'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'payment_received'
  | 'review_received'
  | 'host_booking_new'
  | 'password_reset'
  | 'email_verification'
  | 'welcome'

interface BookingEmailData {
  to?: string
  guestName: string
  propertyTitle: string
  location: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  bookingId: string
}

// Email templates
const emailTemplates = {
  booking_confirmation: (data: BookingEmailData) => ({
    subject: `Booking Confirmed - ${data.propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #666; }
          .value { color: #333; }
          .total { font-size: 24px; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.guestName},</p>
          <p>Great news! Your booking has been confirmed. Here are your trip details:</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Property</span>
              <span class="value">${data.propertyTitle}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location</span>
              <span class="value">${data.location}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check-in</span>
              <span class="value">${data.checkIn}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check-out</span>
              <span class="value">${data.checkOut}</span>
            </div>
            <div class="detail-row">
              <span class="label">Guests</span>
              <span class="value">${data.guests}</span>
            </div>
            <div class="detail-row">
              <span class="label">Booking ID</span>
              <span class="value">${data.bookingId.slice(0, 8)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Price</span>
              <span class="value total">$${data.totalPrice}</span>
            </div>
          </div>
          
          <p>We look forward to hosting you!</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  booking_cancelled: (data: BookingEmailData) => ({
    subject: `Booking Cancelled - ${data.propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${data.guestName},</p>
          <p>Your booking has been cancelled as requested.</p>
          
          <div class="booking-details">
            <p><strong>Property:</strong> ${data.propertyTitle}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Check-in:</strong> ${data.checkIn}</p>
            <p><strong>Check-out:</strong> ${data.checkOut}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId.slice(0, 8)}</p>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  booking_reminder: (data: BookingEmailData) => ({
    subject: `Upcoming Booking Reminder - ${data.propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Booking Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${data.guestName},</p>
          <p>This is a friendly reminder about your upcoming trip!</p>
          
          <div class="booking-details">
            <p><strong>Property:</strong> ${data.propertyTitle}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Check-in:</strong> ${data.checkIn}</p>
            <p><strong>Check-out:</strong> ${data.checkOut}</p>
          </div>
          
          <p>We look forward to hosting you!</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  payment_received: (data: BookingEmailData) => ({
    subject: `Payment Confirmed - ${data.propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 32px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Payment Received</h1>
        </div>
        <div class="content">
          <p>Hi ${data.guestName},</p>
          <p>We've received your payment. Your booking is now confirmed!</p>
          
          <p class="amount">$${data.totalPrice}</p>
          
          <div class="booking-details">
            <p><strong>Property:</strong> ${data.propertyTitle}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId.slice(0, 8)}</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  host_booking_new: (data: BookingEmailData) => ({
    subject: `New Booking Received - ${data.propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 New Booking!</h1>
        </div>
        <div class="content">
          <p>Hi Host,</p>
          <p>You have a new booking for your property!</p>
          
          <div class="booking-details">
            <p><strong>Property:</strong> ${data.propertyTitle}</p>
            <p><strong>Guest:</strong> ${data.guestName}</p>
            <p><strong>Check-in:</strong> ${data.checkIn}</p>
            <p><strong>Check-out:</strong> ${data.checkOut}</p>
            <p><strong>Guests:</strong> ${data.guests}</p>
            <p><strong>Earnings:</strong> $${data.totalPrice}</p>
          </div>
          
          <p>Log in to your host dashboard to manage this booking.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  password_reset: (data: { to: string; resetToken: string }) => ({
    subject: 'Reset Your Password - Restiqa',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Reset Password</h1>
        </div>
        <div class="content">
          <p>Hi,</p>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${data.resetToken}" class="button">
            Reset Password
          </a>
          
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  email_verification: (data: { to: string; verifyToken: string }) => ({
    subject: 'Verify Your Email - Restiqa',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📧 Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi,</p>
          <p>Welcome to Restiqa! Please verify your email address to get started:</p>
          
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${data.verifyToken}" class="button">
            Verify Email
          </a>
          
          <p>This link will expire in 24 hours.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcome: (data: { to: string; fullName: string }) => ({
    subject: 'Welcome to Restiqa!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .feature { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to Restiqa!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.fullName || 'there'},</p>
          <p>Welcome to Restiqa - your trusted booking platform! We're excited to have you on board.</p>
          
          <div class="features">
            <div class="feature">
              <h3>🏠</h3>
              <p>Find unique accommodations</p>
            </div>
            <div class="feature">
              <h3>✈️</h3>
              <p>Book amazing tours</p>
            </div>
            <div class="feature">
              <h3>💰</h3>
              <p>Save to wishlists</p>
            </div>
            <div class="feature">
              <h3>⭐</h3>
              <p>Share reviews</p>
            </div>
          </div>
          
          <p>Start exploring today!</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Restiqa - Your Trusted Booking Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

// Email service class
export class EmailService {
  private dbClient: ReturnType<typeof createClient>
  
  constructor() {
    this.dbClient = createClient()
  }

  // Send email via Firebase function endpoint
  async sendEmail(to: string, type: keyof typeof emailTemplates, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const template = emailTemplates[type]({ to, ...data })
      
      // Store email in database for logging
      const { error: dbError } = await this.dbClient
        .from('email_logs')
        .insert({
          to,
          subject: template.subject,
          type: type as any,
          status: 'pending',
          created_at: new Date().toISOString()
        } as any)

      if (dbError) {
        console.error('Error logging email:', dbError)
      }

      // Call Supabase Edge Function
      const { data: responseData, error: functionError } = await this.dbClient.functions.invoke('send-email', {
        body: {
          to,
          subject: template.subject,
          html: template.html
        }
      })

      if (functionError) {
        throw new Error(`Failed to send email: ${functionError.message}`)
      }



      // Update email log status
      if (!dbError) {
        await this.dbClient
          .from('email_logs')
          .update({ status: 'sent', sent_at: new Date().toISOString() } as never)
          .eq('to', to)
          .eq('type', type)
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error: String(error) }
    }
  }

  // Booking confirmation email
  async sendBookingConfirmation(booking: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(booking.to || 'user@example.com', 'booking_confirmation', booking)
  }

  // Booking cancellation email
  async sendBookingCancellation(booking: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(booking.to || 'user@example.com', 'booking_cancelled', booking)
  }

  // Booking reminder email
  async sendBookingReminder(booking: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(booking.to || 'user@example.com', 'booking_reminder', booking)
  }

  // Payment confirmation email
  async sendPaymentConfirmation(booking: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(booking.to || 'user@example.com', 'payment_received', booking)
  }

  // Host new booking notification
  async sendHostNewBooking(booking: BookingEmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(booking.to || 'host@example.com', 'host_booking_new', booking)
  }

  // Password reset email
  async sendPasswordReset(email: string, resetToken: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(email, 'password_reset', { resetToken })
  }

  // Email verification
  async sendEmailVerification(email: string, verifyToken: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(email, 'email_verification', { verifyToken })
  }

  // Welcome email
  async sendWelcomeEmail(email: string, fullName: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(email, 'welcome', { fullName })
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService()
  }
  return emailServiceInstance
}
