'use client'

import { motion } from 'framer-motion'
import { Check, Clock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HostPendingPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-brand-background-light to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <div className="clay-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for applying to become a host on Restiqa. Your application has been received and is currently under review.
          </p>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">What happens next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Application Review</p>
                  <p className="text-sm text-gray-600">Our team will review your application within 2-3 business days</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verification</p>
                  <p className="text-sm text-gray-600">We may contact you for additional verification if needed</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Approval</p>
                  <p className="text-sm text-gray-600">Once approved, you can start listing your properties</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 mb-6">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800 text-left">
              Review typically takes 2-3 business days. You'll receive an email notification once your application is approved.
            </p>
          </div>

          {/* Contact */}
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <Mail className="w-4 h-4" />
            <span className="text-sm">
              Questions? Contact us at{' '}
              <a href="mailto:hosts@restiqa.com" className="text-brand-primary hover:underline">
                hosts@restiqa.com
              </a>
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">
                Go to Homepage
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

