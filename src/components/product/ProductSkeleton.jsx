/**
 * src/components/product/ProductSkeleton.jsx
 *
 * Skeleton placeholder that matches the ProductCard layout exactly.
 * Used in FeaturedProducts, ProductGrid, and any other place that shows cards.
 */

import Skeleton from '../common/Skeleton'

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image area */}
      <Skeleton className="w-full h-52" />

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Category pill */}
        <Skeleton className="h-4 w-20 rounded-full" />
        {/* Title */}
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        {/* Rating row */}
        <Skeleton className="h-3 w-28 rounded" />
        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}
