import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Restiqa',
  description: 'Restiqa Terms of Service - Rules and guidelines for using the Restiqa platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using Restiqa, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600">
              Restiqa is an online platform that connects travelers with hosts who have properties available for short-term rentals. We provide a marketplace for booking accommodations but are not a party to any rental agreement between guests and hosts.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Being at least 18 years of age to use our services</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Booking and Payments</h2>
            <p className="text-gray-600">
              When you book a property, you are entering into a direct agreement with the host. Restiqa facilitates this transaction but is not responsible for the performance of either party. Payments are processed securely through our platform.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Host Responsibilities</h2>
            <p className="text-gray-600 mb-4">Hosts agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide accurate property descriptions</li>
              <li>Maintain properties in safe and clean condition</li>
              <li>Honor confirmed bookings</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Guest Responsibilities</h2>
            <p className="text-gray-600 mb-4">Guests agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Treat host properties with respect</li>
              <li>Follow house rules and guidelines</li>
              <li>Pay for all charges as agreed</li>
              <li>Not engage in prohibited activities</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cancellation and Refunds</h2>
            <p className="text-gray-600">
              Cancellation policies vary by property. Please review the specific cancellation policy before booking. Refunds are processed according to the applicable policy.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600">
              Restiqa is not liable for any damages or losses arising from your use of the platform or any bookings made through the platform. Our liability is limited to the maximum extent permitted by law.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, please contact us at hr@restiqa.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
