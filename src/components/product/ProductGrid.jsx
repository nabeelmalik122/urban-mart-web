/**
 * src/components/product/ProductGrid.jsx
 *
 * Renders a responsive grid of ProductCards.
 * Handles loading (skeletons), empty state, and error state internally.
 *
 * Props:
 *   products  — array of product objects
 *   loading   — boolean
 *   error     — string | null
 *   onRetry   — () => void
 *   emptyIcon    — optional emoji string
 *   emptyTitle   — override empty-state heading
 *   emptyMessage — override empty-state body
 */

import ProductCard     from './ProductCard'
import ProductSkeleton from './ProductSkeleton'
import EmptyState      from '../common/EmptyState'
import ErrorState      from '../common/ErrorState'

const SKELETON_COUNT = 8

export default function ProductGrid({
  products = [],
  loading   = false,
  error     = null,
  onRetry,
  emptyIcon    = '🔍',
  emptyTitle   = 'No products found',
  emptyMessage = 'Try adjusting your search or filters.',
}) {
  if (error) {
    return <ErrorState message="Unable to load products. Please try again." onRetry={onRetry} />
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
