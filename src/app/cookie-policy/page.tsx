import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Restiqa',
  description: 'Restiqa Cookie Policy - How we use cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-600">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Essential cookies - Required for the website to function</li>
              <li>Analytical cookies - Help us understand how visitors use our site</li>
              <li>Functional cookies - Enable enhanced functionality and personalization</li>
              <li>Marketing cookies - Used to deliver relevant advertisements</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Session Cookies</h3>
                <p className="text-gray-600 mt-1">These are temporary cookies that are deleted when you close your browser.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Persistent Cookies</h3>
                <p className="text-gray-600 mt-1">These remain on your device for a set period or until you delete them.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Third-Party Cookies</h3>
                <p className="text-gray-600 mt-1">These are set by third-party services we use, such as analytics and advertising partners.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
            <p className="text-gray-600 mb-4">You can control and/or delete cookies as you wish. You can:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Delete all cookies already on your computer</li>
              <li>Set your browser to block cookies</li>
              <li>Configure browser settings to notify you when you receive a cookie</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Please note that if you block cookies, some features of our website may not function properly.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Categories</h2>
            <table className="w-full text-left text-gray-600">
              <thead>
                <tr className="border-b">
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Purpose</th>
                  <th className="pb-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Essential</td>
                  <td className="py-2">Website functionality</td>
                  <td className="py-2">Session</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Analytics</td>
                  <td className="py-2">Website usage statistics</td>
                  <td className="py-2">Persistent</td>
                </tr>
                <tr>
                  <td className="py-2">Marketing</td>
                  <td className="py-2">Targeted advertising</td>
                  <td className="py-2">Persistent</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about our Cookie Policy, please contact us at info@restiqa.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
