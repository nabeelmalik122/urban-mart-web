/**
 * src/components/home/PromoSection.jsx
 *
 * Promotional split-banner section between Featured Products and the footer CTA.
 * Pure presentational — no Firestore calls.
 */

import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'

const PROMO_TILES = [
  {
    key:        'deals',
    bg:         'from-blue-600 to-indigo-700',
    badge:      'Limited time',
    heading:    'Deals of the Week',
    sub:        'Up to 40% off on selected electronics & accessories.',
    cta:        'Grab the deals',
    to:         '/products?featured=true',
    emoji:      '⚡',
  },
  {
    key:        'new',
    bg:         'from-emerald-500 to-teal-600',
    badge:      'Just landed',
    heading:    'New Arrivals',
    sub:        'Fresh picks across fashion, beauty, and home — refreshed weekly.',
    cta:        'Shop new arrivals',
    to:         '/products',
    emoji:      '🆕',
  },
]

export default function PromoSection() {
  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 gap-5">
          {PROMO_TILES.map((tile) => (
            <div
              key={tile.key}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tile.bg} p-8 flex flex-col justify-between min-h-[200px]`}
            >
              {/* Decorative circle */}
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute -right-2 -bottom-10 w-56 h-56 rounded-full bg-white/5"
              />

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-white/80" />
                  <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    {tile.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">
                  {tile.emoji} {tile.heading}
                </h3>
                <p className="text-white/75 text-sm max-w-xs leading-relaxed">
                  {tile.sub}
                </p>
              </div>

              <Link
                to={tile.to}
                className="relative mt-6 self-start inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {tile.cta} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
