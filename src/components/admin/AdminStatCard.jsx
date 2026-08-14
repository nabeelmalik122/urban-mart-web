/**
 * src/components/admin/AdminStatCard.jsx
 *
 * Dashboard overview statistic card.
 *
 * Props:
 *   icon       — Lucide icon component
 *   iconBg     — Tailwind bg class for icon circle  e.g. "bg-blue-100"
 *   iconColor  — Tailwind text class                e.g. "text-blue-600"
 *   label      — card heading
 *   value      — main displayed number/string
 *   sub        — optional supporting text
 *   loading    — show skeleton if true
 */

import Skeleton from '../common/Skeleton'

export default function AdminStatCard({
  icon: Icon,
  iconBg    = 'bg-blue-100',
  iconColor = 'text-blue-600',
  label,
  value,
  sub,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-7 w-16 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
        <Icon size={20} className={iconColor} />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-gray-900 mb-1">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
