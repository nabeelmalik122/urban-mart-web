/**
 * src/components/home/FeaturedProducts.jsx
 *
 * Fetches products where featured == true and renders them in a grid.
 * Shows skeletons while loading, EmptyState if none found, ErrorState on failure.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getFeaturedProducts } from '../../firebase/products'
import ProductCard     from '../product/ProductCard'
import ProductSkeleton from '../product/ProductSkeleton'
import EmptyState      from '../common/EmptyState'
import ErrorState      from '../common/ErrorState'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  function loadProducts() {
    setLoading(true)
    setError(null)
    getFeaturedProducts()
      .then(setProducts)
      .catch((err) => {
        console.error('[FeaturedProducts]', err)
        setError('Unable to load featured products.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadProducts() }, [])

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Hand-picked for you
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products?featured=true"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* States */}
        {error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="✨"
            title="No featured products yet"
            message="Check back soon — we're curating the best picks for you."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Mobile view-all link */}
        <div className="sm:hidden mt-6 text-center">
          <Link
            to="/products?featured=true"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600"
          >
            View all featured products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
