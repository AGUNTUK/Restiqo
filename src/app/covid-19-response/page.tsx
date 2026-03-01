import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'COVID-19 Response | Restiqa',
  description: 'Learn about Restiqa\'s response to COVID-19 and the safety measures we have in place.',
}

export default function Covid19ResponsePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">COVID-19 Response</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            The health and safety of our community is our top priority. Here is how we are responding to COVID-19.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enhanced Cleaning Standards</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ All hosts must follow enhanced cleaning protocols</li>
              <li>✓ Properties are cleaned and disinfected between guests</li>
              <li>✓ Use of EPA-approved disinfectants</li>
              <li>✓ Focus on high-touch surfaces</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Flexibility for Bookings</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Flexible cancellation policies remain in place</li>
              <li>✓ Free cancellation for COVID-19 related reasons</li>
              <li>✓ Extensions on credits and vouchers</li>
              <li>✓ Support for extended stays if needed</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Guest and Host Safety</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Social distancing guidelines in place</li>
              <li>✓ Contactless check-in options available</li>
              <li>✓ Masks and sanitizers recommended</li>
              <li>✓ Health screening questions for guests</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Support for Affected Users</h2>
            <p className="text-gray-600">
              If you or your host have been affected by COVID-19, please contact our support team. We are here to help and will work with you to find the best solution.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Latest Updates</h2>
            <p className="text-gray-600">
              We continue to monitor the situation and update our policies as needed. Please check this page for the latest information on our safety measures and booking policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
