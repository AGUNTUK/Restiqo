'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Loader2,
  Home,
  Check,
  Star,
  Shield,
  DollarSign,
  Users,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

const benefits = [
  {
    icon: DollarSign,
    title: 'Earn Money',
    description: 'Set your own prices and earn money from your properties',
  },
  {
    icon: Calendar,
    title: 'Flexible Schedule',
    description: 'Control your availability and manage bookings on your terms',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Protected transactions with automatic payout processing',
  },
  {
    icon: Users,
    title: 'Reach Guests',
    description: 'Connect with travelers from around the world',
  },
]

const steps = [
  {
    step: 1,
    title: 'Create Your Listing',
    description: 'Add photos, details, and set your price',
  },
  {
    step: 2,
    title: 'Get Approved',
    description: 'Our team reviews your listing within 24 hours',
  },
  {
    step: 3,
    title: 'Start Hosting',
    description: 'Accept bookings and start earning',
  },
]

export default function BecomeHostPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    isLoading: authLoading,
    isHost,
    isHostPending,
    becomeHost,
  } = useAuth()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/host/register')
    } else if (!authLoading && isHost) {
      router.push('/host')
    } else if (!authLoading && isHostPending) {
      router.push('/host/pending')
    }
  }, [authLoading, isAuthenticated, isHost, isHostPending, router])

  const handleBecomeHost = async () => {
    if (!agreed) {
      toast.error('Please agree to the host terms')
      return
    }

    setLoading(true)
    
    const { error } = await becomeHost()
    
    if (error) {
      toast.error(error)
    } else {
      toast.success('Application submitted. We will review it shortly.')
      router.push('/host/pending')
    }
    
    setLoading(false)
  }

  if (authLoading || !isAuthenticated || isHost || isHostPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-full mb-6">
            <Home className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Become a Host on Restiqa
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of hosts earning money by sharing their properties with travelers from around the world.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Why Host with Us?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="clay p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 rounded-xl mb-4">
                  <benefit.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {steps.map((step, index) => (
              <div key={step.step} className="flex-1 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden sm:block w-5 h-5 text-gray-300 flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="clay-lg p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Start Hosting?
            </h2>
            <p className="text-gray-600">
              Upgrade your account to a host and start listing your properties today.
            </p>
          </div>

          {/* Terms Agreement */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/host-terms" className="text-brand-primary hover:underline">
                  Host Terms of Service
                </Link>{' '}
                and understand the{' '}
                <Link href="/host-guidelines" className="text-brand-primary hover:underline">
                  Host Guidelines
                </Link>
                . I confirm that I will provide accurate information and maintain my properties to a high standard.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBecomeHost}
              disabled={loading || !agreed}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Become a Host
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Trusted by 10,000+ Hosts</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-primary" />
                <span>Low 10% Service Fee</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

