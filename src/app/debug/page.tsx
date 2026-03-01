'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [status, setStatus] = useState<string>('Checking...')
  const [envStatus, setEnvStatus] = useState<{ url: boolean; key: boolean }>({ url: false, key: false })
  const [session, setSession] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const supabase = createClient()
    
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setEnvStatus({ url: !!url, key: !!key })
    
    // Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      setStatus(`Session error: ${sessionError.message}`)
    } else {
      setSession(sessionData.session)
      setStatus('Connected')
    }
  }

  const testLogin = async () => {
    const supabase = createClient()
    const email = (document.getElementById('test-email') as HTMLInputElement)?.value
    const password = (document.getElementById('test-password') as HTMLInputElement)?.value
    
    if (!email || !password) {
      setTestResult({ error: 'Please enter email and password' })
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setTestResult({ data, error })
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Supabase Debug Page</h1>
        
        <div className="clay p-6 space-y-4">
          <h2 className="text-lg font-semibold">Environment Variables</h2>
          <div className="space-y-2">
            <p>NEXT_PUBLIC_SUPABASE_URL: {envStatus.url ? '✅ Set' : '❌ Not set'}</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.key ? '✅ Set' : '❌ Not set'}</p>
          </div>
        </div>

        <div className="clay p-6 space-y-4">
          <h2 className="text-lg font-semibold">Connection Status</h2>
          <p>{status}</p>
          {session && (
            <div className="mt-4">
              <p className="font-medium">Current Session:</p>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="clay p-6 space-y-4">
          <h2 className="text-lg font-semibold">Test Login</h2>
          <div className="space-y-4">
            <input
              id="test-email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              id="test-password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={testLogin}
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
            >
              Test Login
            </button>
          </div>
          {testResult && (
            <div className="mt-4">
              <p className="font-medium">Result:</p>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="clay p-6">
          <h2 className="text-lg font-semibold mb-4">Troubleshooting Tips</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Make sure you have created an account via Sign Up first</li>
            <li>Check if email confirmation is required in your Supabase project</li>
            <li>Verify your Supabase project has Email auth enabled</li>
            <li>Check the browser console for any errors</li>
            <li>Try disabling email confirmation in Supabase Dashboard → Authentication → Providers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

