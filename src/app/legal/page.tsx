import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Legal | Restiqa',
  description: 'Legal information and policies for Restiqa users.',
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Legal</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Welcome to the Legal section. Here you will find information about our legal policies and terms.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Legal Information</h2>
            <p className="text-gray-600 mb-4">
              Restiqa operates under the following legal entities and regulations:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Company: Restiqa Inc.</li>
              <li>• Registration Number: XX-XXXXXXX</li>
              <li>• Jurisdiction: United States</li>
              <li>• Industry: Travel & Hospitality</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Related Policies</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-blue-600 hover:underline">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
            <p className="text-gray-600">
              Any disputes arising from the use of our services will be resolved through binding arbitration in accordance with the laws of the United States.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Legal</h2>
            <p className="text-gray-600">
              For legal inquiries, please contact us at: hr@restiqa.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
