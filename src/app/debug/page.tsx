'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [status, setStatus] = useState<string>('Checking...')
  const [envStatus, setEnvStatus] = useState<{
    apiKey: boolean
    authDomain: boolean
    projectId: boolean
  }>({ apiKey: false, authDomain: false, projectId: false })
  const [session, setSession] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const client = createClient()

    setEnvStatus({
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })

    const { data: sessionData, error: sessionError } = await client.auth.getSession()
    if (sessionError) {
      setStatus(`Session error: ${sessionError.message}`)
      return
    }

    setSession(sessionData.session)
    setStatus('Connected')
  }

  const testLogin = async () => {
    const client = createClient()
    const email = (document.getElementById('test-email') as HTMLInputElement)?.value
    const password = (document.getElementById('test-password') as HTMLInputElement)?.value

    if (!email || !password) {
      setTestResult({ error: 'Please enter email and password' })
      return
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })

    setTestResult({ data, error })
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Firebase Auth Debug</h1>

        <div className="clay p-6 space-y-4">
          <h2 className="text-lg font-semibold">Environment Variables</h2>
          <div className="space-y-2">
            <p>NEXT_PUBLIC_FIREBASE_API_KEY: {envStatus.apiKey ? 'Set' : 'Not set'}</p>
            <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {envStatus.authDomain ? 'Set' : 'Not set'}</p>
            <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {envStatus.projectId ? 'Set' : 'Not set'}</p>
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
            <li>Make sure the Firebase client env variables are present in `.env.local`</li>
            <li>Ensure Email/Password provider is enabled in Firebase Authentication</li>
            <li>Check Firestore security rules for `users` collection access</li>
            <li>Check browser console for Firebase SDK errors</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
