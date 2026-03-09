'use client'

import { useState, ChangeEvent } from 'react'
import Button from './Button'
import Input from './Input'

interface PhoneVerificationProps {
  onVerified?: (phoneNumber: string) => void
  onCancel?: () => void
}

export function PhoneVerification({ onVerified, onCancel }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  const requestCode = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { getSMSService } = await import('@/lib/notifications/sms')
      const smsService = getSMSService()
      const result = await smsService.requestVerification(phoneNumber)

      if (result.success) {
        setStep('verify')
        setCountdown(60)
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.error || 'Failed to send verification code')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { getSMSService } = await import('@/lib/notifications/sms')
      const smsService = getSMSService()
      const result = await smsService.verifyCode(phoneNumber, verificationCode)

      if (result.success) {
        onVerified?.(phoneNumber)
      } else {
        setError(result.error || 'Invalid verification code')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+8801XXXXXXXXX"
              value={phoneNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your phone number with country code (e.g., +880 for Bangladesh)
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={requestCode}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading}
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep('phone')
                setVerificationCode('')
                setError(null)
              }}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="flex-1"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>

          {countdown > 0 ? (
            <p className="text-sm text-gray-500 text-center">
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 block w-full text-center"
              onClick={requestCode}
              disabled={isLoading}
            >
              Resend verification code
            </button>
          )}
        </>
      )}
    </div>
  )
}
