'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleCallback = async () => {
      const client = createClient()
      const redirect = searchParams.get('redirect') || '/dashboard'
      const code = searchParams.get('code')

      try {
        console.log('Auth callback initiated', { code, redirect })
        if (code) {
          console.log('Exchanging code for session...')
          const { error } = await client.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Exchange error:', error)
            throw error
          }
          console.log('Exchange successful')
        }

        // Wait a small moment to ensure auth state is settled across the app
        await new Promise(resolve => setTimeout(resolve, 500))

        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession()

        if (sessionError) {
          console.error('Get session error:', sessionError)
          throw sessionError
        }

        console.log('Session retrieved:', session ? 'Found' : 'Not Found', { user: session?.user?.id })

        if (session?.user) {
          setStatus('success')
          toast.success('Successfully signed in!')
          console.log('Redirecting to:', redirect)
          setTimeout(() => router.push(redirect), 500)
          return
        }

        setStatus('error')
        toast.error('Authentication session not found. Please sign in again.')
        setTimeout(() => router.push('/auth/login'), 1000)
      } catch (error: any) {
        console.error('Callback error:', error)
        setStatus('error')
        toast.error(error?.message || 'An unexpected error occurred')
        setTimeout(() => router.push('/auth/login'), 1500)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="clay-lg p-8 text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-brand-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
            <p className="text-gray-600">Please wait while we verify your authentication.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600">Redirecting you to login...</p>
          </>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="clay-lg p-8 text-center max-w-md w-full">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we verify your authentication.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
