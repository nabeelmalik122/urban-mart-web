/**
 * src/components/common/Skeleton.jsx
 *
 * Generic pulsing skeleton block.
 * Pass className for width/height/border-radius to match the real content.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32 rounded" />
 *   <Skeleton className="h-48 w-full rounded-xl" />
 */

export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  )
}
