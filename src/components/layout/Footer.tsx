"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Safety", href: "/safety" },
    { label: "Cancellation Options", href: "/cancellation" },
    { label: "COVID-19 Response", href: "/covid" },
  ],
  hosting: [
    { label: "Become a Host", href: "/host/register" },
    { label: "Host Resources", href: "/host/resources" },
    { label: "Community Forum", href: "/community" },
    { label: "Host Standards", href: "/host/standards" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/restiqo", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/restiqo", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/restiqo", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/restiqo", label: "YouTube" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-primary-darker to-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Logo
                width={130}
                height={40}
                className="h-10 w-auto brightness-0 invert"
                sizes="(max-width: 640px) 110px, (max-width: 1024px) 130px, 150px"
              />
              <span className="text-2xl font-light text-primary">BD</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              Discover Bangladesh's finest properties and tours. Book your perfect
              stay or adventure with trusted local hosts.
            </p>
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@restiqo.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+880 1234-567890</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hosting</h3>
            <ul className="space-y-2">
              {footerLinks.hosting.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-slate-400">
              © {currentYear} Restiqo BD. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>We accept:</span>
              <span className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-slate-800 rounded text-xs">bKash</span>
                <span className="px-2 py-1 bg-slate-800 rounded text-xs">Nagad</span>
                <span className="px-2 py-1 bg-slate-800 rounded text-xs">Visa</span>
                <span className="px-2 py-1 bg-slate-800 rounded text-xs">MC</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
