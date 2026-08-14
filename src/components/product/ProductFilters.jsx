/**
 * src/components/product/ProductFilters.jsx
 *
 * Sidebar + mobile sheet filter panel for the /products page.
 *
 * Props:
 *   categories      — array of { id, name, slug } from Firestore
 *   activeCategory  — currently selected category slug ('' = all)
 *   activeSort      — currently selected sort key
 *   onCategory      — (slug) => void
 *   onSort          — (sortKey) => void
 *   onReset         — () => void
 *   mobileOpen      — boolean (controls mobile sheet visibility)
 *   onMobileClose   — () => void
 */

import { X, SlidersHorizontal } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc',   label: 'Name: A → Z' },
  { value: 'name_desc',  label: 'Name: Z → A' },
]

function FilterContent({ categories, activeCategory, activeSort, onCategory, onSort, onReset }) {
  const hasFilter = activeCategory !== '' || activeSort !== 'featured'

  return (
    <div className="space-y-6">
      {/* Reset */}
      {hasFilter && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
          ✕ Clear all filters
        </button>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Sort by
        </h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSort(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors
                ${activeSort === opt.value
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Category
        </h3>
        <div className="space-y-1">
          {/* All products */}
          <button
            onClick={() => onCategory('')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors
              ${activeCategory === ''
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id ?? cat.slug}
              onClick={() => onCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors
                ${activeCategory === cat.slug
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductFilters({
  categories,
  activeCategory,
  activeSort,
  onCategory,
  onSort,
  onReset,
  mobileOpen,
  onMobileClose,
}) {
  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-52 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-800">Filters</h2>
          </div>
          <FilterContent
            categories={categories}
            activeCategory={activeCategory}
            activeSort={activeSort}
            onCategory={onCategory}
            onSort={onSort}
            onReset={onReset}
          />
        </div>
      </aside>

      {/* ── Mobile overlay sheet ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
            aria-label="Close filters"
          />
          {/* Sheet */}
          <div className="relative ml-auto w-72 h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-800">Filters</h2>
              </div>
              <button
                onClick={onMobileClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent
                categories={categories}
                activeCategory={activeCategory}
                activeSort={activeSort}
                onCategory={onCategory}
                onSort={onSort}
                onReset={onReset}
              />
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={onMobileClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
