/**
 * src/pages/dev/SeedPage.jsx
 *
 * DEV-ONLY seed page — route: /dev/seed
 * Accessible only when authenticated (wrapped in ProtectedRoute in App.jsx).
 *
 * IMPORTANT:
 *   • This page is NOT linked from any navigation menu.
 *   • Remove the /dev/seed route from App.jsx before deploying to production.
 *   • Seeding is idempotent: categories use setDoc with the slug as doc ID,
 *     products check for existing titles to prevent pure duplicates.
 *
 * Usage:
 *   1. Navigate to /dev/seed
 *   2. Click "Seed Categories" — waits for completion
 *   3. Click "Seed Products"   — waits for completion
 *   4. Navigate to / to see the storefront populated
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, Database } from 'lucide-react'
import { seedProduct, seedCategory, getAllProducts, getAllCategories } from '../../firebase/products'
import { SEED_PRODUCTS, SEED_CATEGORIES } from '../../utils/seedData'

// ─── Status types for each seed step ─────────────────────────────────────────
const STATUS = { IDLE: 'idle', RUNNING: 'running', DONE: 'done', ERROR: 'error' }

function StatusIcon({ status }) {
  if (status === STATUS.RUNNING) return <Loader2 size={16} className="text-blue-500 animate-spin" />
  if (status === STATUS.DONE)    return <CheckCircle size={16} className="text-emerald-500" />
  if (status === STATUS.ERROR)   return <AlertCircle size={16} className="text-red-500" />
  return <Database size={16} className="text-gray-400" />
}

export default function SeedPage() {
  const [catStatus,    setCatStatus]    = useState(STATUS.IDLE)
  const [prodStatus,   setProdStatus]   = useState(STATUS.IDLE)
  const [catLog,       setCatLog]       = useState([])
  const [prodLog,      setProdLog]      = useState([])

  // ── Seed categories ─────────────────────────────────────────────────────────
  async function handleSeedCategories() {
    setCatStatus(STATUS.RUNNING)
    setCatLog([])
    try {
      const existing = await getAllCategories()
      const existingSlugs = new Set(existing.map((c) => c.slug ?? c.id))
      const log = []

      for (const cat of SEED_CATEGORIES) {
        if (existingSlugs.has(cat.slug)) {
          log.push(`⏭  Skipped: "${cat.name}" (already exists)`)
        } else {
          await seedCategory(cat.slug, { name: cat.name, slug: cat.slug, imageURL: cat.imageURL })
          log.push(`✅ Created: "${cat.name}"`)
        }
      }

      setCatLog(log)
      setCatStatus(STATUS.DONE)
    } catch (err) {
      console.error('[SeedPage] categories', err)
      setCatLog([`❌ Error: ${err.message}`])
      setCatStatus(STATUS.ERROR)
    }
  }

  // ── Seed products ───────────────────────────────────────────────────────────
  async function handleSeedProducts() {
    setProdStatus(STATUS.RUNNING)
    setProdLog([])
    try {
      const existing = await getAllProducts()
      const existingTitles = new Set(existing.map((p) => p.title?.toLowerCase()))
      const log = []

      for (const prod of SEED_PRODUCTS) {
        if (existingTitles.has(prod.title.toLowerCase())) {
          log.push(`⏭  Skipped: "${prod.title}" (already exists)`)
        } else {
          await seedProduct(prod)
          log.push(`✅ Created: "${prod.title}"`)
        }
      }

      setProdLog(log)
      setProdStatus(STATUS.DONE)
    } catch (err) {
      console.error('[SeedPage] products', err)
      setProdLog([`❌ Error: ${err.message}`])
      setProdStatus(STATUS.ERROR)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <Database size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-gray-800">Dev Seed Tool</span>
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
            DEV ONLY
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-sm text-amber-800">
          <strong>⚠️ Development tool.</strong> This page writes sample data to your
          Firestore database. Remove the <code>/dev/seed</code> route from{' '}
          <code>App.jsx</code> before deploying to production.
        </div>

        <div className="space-y-6">

          {/* ── Seed categories card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StatusIcon status={catStatus} />
                <div>
                  <h2 className="font-bold text-gray-800">Seed Categories</h2>
                  <p className="text-xs text-gray-400">{SEED_CATEGORIES.length} categories</p>
                </div>
              </div>
              <button
                onClick={handleSeedCategories}
                disabled={catStatus === STATUS.RUNNING}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                  ${catStatus === STATUS.RUNNING
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {catStatus === STATUS.RUNNING ? 'Running…' : 'Run'}
              </button>
            </div>

            {catLog.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1 max-h-48 overflow-y-auto">
                {catLog.map((line, i) => (
                  <p key={i} className="text-xs font-mono text-gray-600">{line}</p>
                ))}
              </div>
            )}
          </div>

          {/* ── Seed products card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <StatusIcon status={prodStatus} />
                <div>
                  <h2 className="font-bold text-gray-800">Seed Products</h2>
                  <p className="text-xs text-gray-400">{SEED_PRODUCTS.length} products across 6 categories</p>
                </div>
              </div>
              <button
                onClick={handleSeedProducts}
                disabled={prodStatus === STATUS.RUNNING}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                  ${prodStatus === STATUS.RUNNING
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {prodStatus === STATUS.RUNNING ? 'Running…' : 'Run'}
              </button>
            </div>

            {prodLog.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1 max-h-64 overflow-y-auto">
                {prodLog.map((line, i) => (
                  <p key={i} className="text-xs font-mono text-gray-600">{line}</p>
                ))}
              </div>
            )}
          </div>

          {/* Done state */}
          {catStatus === STATUS.DONE && prodStatus === STATUS.DONE && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <p className="text-emerald-700 font-semibold mb-3">
                ✅ Firestore seeded successfully!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full transition-colors"
              >
                View storefront →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
