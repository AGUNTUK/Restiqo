import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cancellation Policy | Restiqa',
  description: 'Learn about Restiqa\'s cancellation policy and how to cancel your booking.',
}

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cancellation Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            We understand that plans can change. Our flexible cancellation policies are designed to accommodate your needs.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancellation Options</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Flexible</h3>
                <p className="text-gray-600 mt-1">Full refund if cancelled up to 24 hours before check-in. No refund if cancelled less than 24 hours before check-in.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Moderate</h3>
                <p className="text-gray-600 mt-1">Full refund if cancelled up to 5 days before check-in. 50% refund if cancelled 2-4 days before check-in. No refund if cancelled less than 2 days before check-in.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Strict</h3>
                <p className="text-gray-600 mt-1">Full refund if cancelled up to 7 days before check-in. 50% refund if cancelled 3-6 days before check-in. No refund if cancelled less than 3 days before check-in.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Cancel</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to your Bookings in your dashboard</li>
              <li>Find the booking you wish to cancel</li>
              <li>Click on "Cancel Booking"</li>
              <li>Select your reason for cancellation</li>
              <li>Confirm the cancellation</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Timeline</h2>
            <p className="text-gray-600">
              Refunds are processed within 5-10 business days. The time it takes for the refund to appear in your account depends on your payment provider.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Special Circumstances</h2>
            <p className="text-gray-600">
              If you need to cancel due to emergencies or special circumstances, please contact our support team. We will review your case and may offer special accommodation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
