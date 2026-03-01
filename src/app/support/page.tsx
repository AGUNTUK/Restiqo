import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support | Restiqa',
  description: 'Get help and support from Restiqa. We are here to assist you with any questions or issues.',
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Support</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Welcome to Restiqa Support. We are here to help you with any questions or issues you may have.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you need assistance, please reach out to our support team:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>Email: support@restiqa.com</li>
              <li>Phone: 1-800-RESTIQA</li>
              <li>Hours: 24/7</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">How do I book a property?</h3>
                <p className="text-gray-600 mt-1">Search for your desired location, select a property, and follow the booking instructions.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">How do I cancel my booking?</h3>
                <p className="text-gray-600 mt-1">Go to your bookings and select the booking you wish to cancel.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">How do I become a host?</h3>
                <p className="text-gray-600 mt-1">Register as a host through your dashboard and list your property.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
