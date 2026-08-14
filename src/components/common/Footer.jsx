/**
 * src/components/common/Footer.jsx
 *
 * Site-wide footer — brand info, nav links, contact section, map embed.
 * No Firebase calls, no auth dependency.
 */

import { Link } from 'react-router-dom'
import { ShoppingBag, Mail, MessageCircle } from 'lucide-react'

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products',  to: '/products' },
    { label: 'Electronics',   to: '/products?category=electronics' },
    { label: 'Fashion',       to: '/products?category=fashion' },
    { label: 'Home & Living', to: '/products?category=home-living' },
    { label: 'Beauty',        to: '/products?category=beauty' },
  ],
  Company: [
    { label: 'About Us',  to: '/' },
    { label: 'Careers',   to: '/' },
    { label: 'Press',     to: '/' },
    { label: 'Blog',      to: '/' },
  ],
  Support: [
    { label: 'Help Centre',   to: '/' },
    { label: 'Shipping Info', to: '/' },
    { label: 'Returns',       to: '/' },
    { label: 'Track Order',   to: '/' },
    { label: 'Contact Us',    to: '/' },
  ],
}

// ─── Contact Us section ───────────────────────────────────────────────────────
function ContactSection() {
  return (
    <div className="lg:col-span-2">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        Contact Us
      </h3>

      <ul className="space-y-3 mb-5">
        {/* WhatsApp */}
        <li>
          <a
            href="https://wa.me/923079009095"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors group"
          >
            <MessageCircle
              size={15}
              className="text-green-500 flex-shrink-0 group-hover:text-green-400"
            />
            +92 307 9009095
          </a>
        </li>

        {/* Email */}
        <li>
          <a
            href="mailto:maliknabeelkhattak432@gmail.com"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
          >
            <Mail
              size={15}
              className="text-blue-400 flex-shrink-0 group-hover:text-blue-300"
            />
            maliknabeelkhattak432@gmail.com
          </a>
        </li>
      </ul>

      {/* Google Map embed — Armour Colony, Nowshera, Pakistan */}
      <div className="w-full rounded-xl overflow-hidden border border-gray-700">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6617.439219482503!2d71.97800778874283!3d33.97404564010499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ded36c42a9fe5f%3A0xebffbb0ce10e40f!2sArmour%20Colony%2C%20Nowshera%2C%20Pakistan!5e0!3m2!1sen!2s!4v1786741612401!5m2!1sen!2s"
          className="w-full h-52"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="UrbanMart location — Armour Colony, Nowshera, Pakistan"
        />
      </div>
    </div>
  )
}

// ─── Main Footer ──────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">

        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-lg font-extrabold text-white">UrbanMart</span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Your one destination for premium products across electronics, fashion,
            home essentials, and more. Quality you can trust, delivered fast.
          </p>
        </div>

        {/* Nav link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading} className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {heading}
            </h3>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact + Map — spans full width on mobile, 2 cols on large */}
        <div className="sm:col-span-2 lg:col-span-2">
          <ContactSection />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} UrbanMart. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-gray-300 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
