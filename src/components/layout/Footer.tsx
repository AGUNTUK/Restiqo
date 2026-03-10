import Link from 'next/link'
import Image from 'next/image'
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    explore: [
      { label: 'Apartments', href: '/apartments' },
      { label: 'Hotels', href: '/hotels' },
      { label: 'Tours', href: '/tours' },
      { label: 'Experiences', href: '/experiences' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Help Center', href: '/help-center' },
      { label: 'Safety', href: '/safety' },
      { label: 'Cancellation', href: '/cancellation' },
      { label: 'COVID-19 Response', href: '/covid-19-response' },
      { label: 'Support', href: '/support' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Data Deletion', href: '/data-deletion' },
      { label: 'Legal', href: '/legal' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
  ]

  return (
    <footer className="bg-[#EEF2F6] pt-12 sm:pt-16 pb-32 md:pb-6">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="neu-panel p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="inline-block mb-4 sm:mb-6">
                <Image
                  src="/logo.png"
                  alt="Restiqa Logo"
                  width={120}
                  height={40}
                  className="h-8 sm:h-10 w-auto"
                />
              </Link>
              <p className="text-[#64748B] mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
                Discover amazing apartments, hotels, and tours. Your perfect stay
                and experience awaits you in Bangladesh and beyond.
              </p>

              {/* Contact Info */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-3 text-[#64748B] text-sm sm:text-base">
                  <div className="neu-icon w-8 h-8 flex-shrink-0">
                    <Mail className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span>hello@restiqa.com</span>
                </div>
                <div className="flex items-center space-x-3 text-[#64748B] text-sm sm:text-base">
                  <div className="neu-icon w-8 h-8 flex-shrink-0">
                    <Phone className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span>+880 1234-567890</span>
                </div>
                <div className="flex items-start space-x-3 text-[#64748B] text-sm sm:text-base">
                  <div className="neu-icon w-8 h-8 flex-shrink-0 mt-1">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                  </div>
                  <span>
                    Level 4, House 12, Road 14<br />
                    Block G, Niketan, Gulshan 1<br />
                    Dhaka 1212, Bangladesh
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3 sm:space-x-4 mt-4 sm:mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-icon w-9 h-9 sm:w-10 sm:h-10 hover:text-brand-primary transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Explore Links */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#1E293B]">Explore</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.explore.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#64748B] hover:text-brand-primary transition-colors text-sm sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#1E293B]">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#64748B] hover:text-brand-primary transition-colors text-sm sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#1E293B]">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#64748B] hover:text-brand-primary transition-colors text-sm sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#1E293B]">Legal</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[#64748B] hover:text-brand-primary transition-colors text-sm sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="neu-inset p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-[#1E293B]">
                  Subscribe to our newsletter
                </h3>
                <p className="text-[#64748B] text-sm sm:text-base">
                  Get the latest updates and offers directly in your inbox.
                </p>
              </div>
              <form className="flex w-full md:w-auto min-w-0 flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full min-w-0 sm:flex-1 md:w-64 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl neu-input text-[#1E293B] placeholder-[#94A3B8] text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="neu-button-primary w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#64748B] text-sm">
              © {currentYear} Restiqa. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-[#64748B] text-sm">
                Made with ❤️ in Bangladesh
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

