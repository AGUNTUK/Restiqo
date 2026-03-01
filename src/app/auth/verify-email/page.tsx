'use client'

import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 pt-28 sm:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="clay-lg p-6 sm:p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-brand-primary" />
          </div>

          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-6">
            We've sent you a verification link. Please check your email and click the link to verify your account.
          </p>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">What to do:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Check your email inbox</li>
              <li>Click the verification link in the email</li>
              <li>You will be redirected to complete your registration</li>
            </ol>
          </div>

          {/* Tips */}
          <div className="text-sm text-gray-500 mb-6">
            <p>Did not receive the email?</p>
            <ul className="mt-2 space-y-1">
              <li>• Check your spam folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes and try again</li>
            </ul>
          </div>

          {/* Back to login */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-brand-primary font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

