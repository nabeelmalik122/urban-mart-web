/**
 * src/components/admin/AdminTableSkeleton.jsx
 *
 * Skeleton placeholder that mimics a data table.
 * Props:
 *   rows  — number of skeleton rows (default 5)
 *   cols  — number of columns (default 5)
 */

import Skeleton from '../common/Skeleton'

export default function AdminTableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-hidden">
      {/* Header row */}
      <div className="grid gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 rounded w-3/4" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 px-4 py-4 border-b border-gray-100"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 rounded ${c === 0 ? 'w-full' : 'w-2/3'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
