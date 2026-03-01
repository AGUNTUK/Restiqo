import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center | Restiqa',
  description: 'Find answers to frequently asked questions and learn how to use Restiqa effectively.',
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Find answers to all your questions about using Restiqa.
          </p>

          <div className="space-y-8">
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">How do I create an account?</h3>
                  <p className="text-gray-600 mt-1">Click on Sign Up, enter your email address and create a password. You can also sign up using your Google or Facebook account.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">How do I search for properties?</h3>
                  <p className="text-gray-600 mt-1">Use the search bar on our homepage to enter your destination, dates, and number of guests. Browse through the available listings and filter by price, amenities, and more.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">How do I book a property?</h3>
                  <p className="text-gray-600 mt-1">Once you find a property you like, click on it to view details. Select your dates and click Request to Book. The host will review and confirm your booking.</p>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Hosts</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">How do I list my property?</h3>
                  <p className="text-gray-600 mt-1">Go to your dashboard and click on "Become a Host". Fill in your property details, add photos, set your price, and publish your listing.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">How do I set my availability?</h3>
                  <p className="text-gray-600 mt-1">In your listing manager, you can set your calendar to block dates or allow instant bookings.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">When do I get paid?</h3>
                  <p className="text-gray-600 mt-1">Payments are processed 24 hours after guest check-in. Funds are transferred to your bank account on a weekly basis.</p>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment & Refunds</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">What payment methods are accepted?</h3>
                  <p className="text-gray-600 mt-1">We accept all major credit cards, debit cards, and PayPal.</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">What is the cancellation policy?</h3>
                  <p className="text-gray-600 mt-1">Cancellation policies vary by listing. You can find the specific policy on each property page.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
