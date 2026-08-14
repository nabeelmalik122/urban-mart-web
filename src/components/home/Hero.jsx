/**
 * src/components/home/Hero.jsx
 *
 * Homepage hero section — full-width, responsive, original ShopZone identity.
 * No Firebase calls. Pure presentational component.
 */

import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react'

const TRUST_BADGES = [
  { icon: Truck,        label: 'Free shipping over $50' },
  { icon: ShieldCheck,  label: 'Secure payments' },
  { icon: RefreshCw,    label: '30-day returns' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Decorative background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: copy ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              New arrivals every week
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 break-words">
              Everything You Need.{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                One Better Place
              </span>{' '}
              to Shop.
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Discover thousands of premium products — from the latest electronics
              to everyday essentials — all curated, quality-checked, and delivered
              fast.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Shop Now
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/products?featured=true"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Deals
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
                  <Icon size={15} className="text-blue-400 flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: product showcase mosaic ── */}
          <div className="hidden lg:block relative">
            {/* Main large card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80"
                alt="Featured product"
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold">Smart Watch Series X</p>
                <p className="text-blue-300 text-sm">Starting from $249</p>
              </div>
            </div>

            {/* Two smaller cards below */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-black/30">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
                  alt="Headphones"
                  className="w-full h-36 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl shadow-black/30">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
                  alt="Sneakers"
                  className="w-full h-36 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Floating trust pill — replacing the fake stat with an honest statement */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-lg">
                🛍️
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Trusted by shoppers</p>
                <p className="text-sm font-bold text-gray-800">across Pakistan</p>
              </div>
            </div>

            {/* Floating rating pill */}
            <div className="absolute -bottom-4 left-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2">
              <span className="text-yellow-400 text-sm">★★★★★</span>
              <div>
                <p className="text-xs text-gray-400">Avg. rating</p>
                <p className="text-sm font-bold text-gray-800">4.8 / 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave transition */}
      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  )
}
