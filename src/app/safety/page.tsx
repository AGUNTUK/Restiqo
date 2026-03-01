import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety | Restiqa',
  description: 'Learn about safety measures and practices at Restiqa to ensure a secure experience for all users.',
}

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Safety</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Your safety is our top priority. We have implemented various measures to ensure a secure experience for all users.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Verification</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ All hosts must verify their identity</li>
              <li>✓ Properties are inspected for safety compliance</li>
              <li>✓ Regular quality checks are performed</li>
              <li>✓ Guest reviews provide transparency</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Secure Payments</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ All payments are processed securely</li>
              <li>✓ Your financial information is encrypted</li>
              <li>✓ Payment protection for guests and hosts</li>
              <li>✓ Secure checkout process</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">24/7 Support</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Round-the-clock customer support</li>
              <li>✓ Emergency contact available</li>
              <li>✓ Quick response to safety concerns</li>
              <li>✓ Direct communication with hosts</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Safety Tips for Guests</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Read reviews from previous guests before booking</li>
              <li>Communicate through our platform</li>
              <li>Check the property details and amenities</li>
              <li>Know the cancellation policy</li>
              <li>Report any safety concerns immediately</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
