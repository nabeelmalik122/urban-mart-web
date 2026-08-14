/**
 * src/pages/products/ProductsPage.jsx
 *
 * Full product listing page — route: /products
 *
 * Supports:
 *   ?q=search term        → search filter (client-side)
 *   ?category=slug        → category filter
 *   ?featured=true        → show only featured products
 *
 * Architecture:
 *   1. Load ALL products once from Firestore on mount (avoids per-keystroke reads)
 *   2. Load ALL categories once for the filter sidebar
 *   3. Apply search + category + sort client-side in a useMemo
 *   4. URL params kept in sync so links/bookmarks work
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import {
  getAllProducts,
  getAllCategories,
  filterProductsBySearch,
  sortProducts,
} from '../../firebase/products'
import Navbar          from '../../components/common/Navbar'
import Footer          from '../../components/common/Footer'
import ProductGrid     from '../../components/product/ProductGrid'
import ProductFilters  from '../../components/product/ProductFilters'

// ─── Search bar (debounced to avoid re-rendering on every keystroke) ──────────
function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products by name, category…"
        className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

// ─── Result count + active filter chips ──────────────────────────────────────
function ResultsMeta({ count, loading, searchTerm, activeCategory, categories, onClearSearch, onClearCategory }) {
  if (loading) return null
  const catLabel = categories.find((c) => c.slug === activeCategory)?.name

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-5">
      <span>
        <strong className="text-gray-900">{count}</strong>{' '}
        {count === 1 ? 'product' : 'products'} found
      </span>

      {searchTerm && (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          "{searchTerm}"
          <button onClick={onClearSearch} aria-label="Remove search filter">
            <X size={11} />
          </button>
        </span>
      )}

      {catLabel && (
        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {catLabel}
          <button onClick={onClearCategory} aria-label="Remove category filter">
            <X size={11} />
          </button>
        </span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── URL-driven state ────────────────────────────────────────────────────────
  const urlSearch   = searchParams.get('q')          ?? ''
  const urlCategory = searchParams.get('category')   ?? ''
  const urlFeatured = searchParams.get('featured')   === 'true'

  // ── Local state ─────────────────────────────────────────────────────────────
  const [searchInput,     setSearchInput]     = useState(urlSearch)
  const [activeCategory,  setActiveCategory]  = useState(urlCategory)
  const [activeSort,      setActiveSort]      = useState('featured')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // ── Data state ──────────────────────────────────────────────────────────────
  const [allProducts,  setAllProducts]  = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // ── Load data once ──────────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([getAllProducts(), getAllCategories()])
      .then(([prods, cats]) => {
        setAllProducts(prods)
        setCategories(cats)
      })
      .catch((err) => {
        console.error('[ProductsPage]', err)
        setError('Unable to load products.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Keep local state in sync when URL changes externally (e.g. navbar link)
  useEffect(() => {
    setSearchInput(urlSearch)
    setActiveCategory(urlCategory)
  }, [urlSearch, urlCategory])

  // ── Sync search input → URL (debounced 350ms) ───────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (searchInput) next.set('q', searchInput)
      else next.delete('q')
      setSearchParams(next, { replace: true })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync category → URL immediately ─────────────────────────────────────────
  function handleCategory(slug) {
    setActiveCategory(slug)
    const next = new URLSearchParams(searchParams)
    if (slug) next.set('category', slug)
    else next.delete('category')
    next.delete('featured')
    setSearchParams(next, { replace: true })
    setMobileFiltersOpen(false)
  }

  function handleClearSearch() {
    setSearchInput('')
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next, { replace: true })
  }

  function handleReset() {
    setSearchInput('')
    setActiveCategory('')
    setActiveSort('featured')
    setSearchParams({}, { replace: true })
  }

  // ── Filtered + sorted product list (client-side, derived) ───────────────────
  const displayedProducts = useMemo(() => {
    let list = allProducts

    // Featured filter (from URL)
    if (urlFeatured) list = list.filter((p) => p.featured)

    // Category filter
    if (activeCategory) list = list.filter((p) => p.category === activeCategory)

    // Search
    if (searchInput.trim()) list = filterProductsBySearch(list, searchInput)

    // Sort
    return sortProducts(list, activeSort)
  }, [allProducts, urlFeatured, activeCategory, searchInput, activeSort])

  // ── Page title derived from filters ─────────────────────────────────────────
  const pageTitle = urlFeatured
    ? 'Featured Deals'
    : activeCategory
      ? (categories.find((c) => c.slug === activeCategory)?.name ?? 'Products')
      : 'All Products'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* ── Page header ── */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
            {pageTitle}
          </h1>
          <p className="text-sm text-gray-500">
            {urlFeatured
              ? 'Hand-picked products with the best value.'
              : 'Browse our full catalog — filter, sort, and discover.'}
          </p>
        </div>

        {/* ── Search + mobile filter button ── */}
        <div className="flex gap-3 mb-6">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleClearSearch}
          />
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={16} />
            Filters
            {(activeCategory || activeSort !== 'featured') && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>
        </div>

        {/* ── Results meta ── */}
        <ResultsMeta
          count={displayedProducts.length}
          loading={loading}
          searchTerm={searchInput}
          activeCategory={activeCategory}
          categories={categories}
          onClearSearch={handleClearSearch}
          onClearCategory={() => handleCategory('')}
        />

        {/* ── Main layout: sidebar + grid ── */}
        <div className="flex gap-7">
          <ProductFilters
            categories={categories}
            activeCategory={activeCategory}
            activeSort={activeSort}
            onCategory={handleCategory}
            onSort={setActiveSort}
            onReset={handleReset}
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          <div className="flex-1 min-w-0">
            <ProductGrid
              products={displayedProducts}
              loading={loading}
              error={error}
              onRetry={loadData}
              emptyIcon="🔍"
              emptyTitle="No products found"
              emptyMessage={
                searchInput
                  ? `No results for "${searchInput}". Try different keywords.`
                  : 'No products in this category yet.'
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
