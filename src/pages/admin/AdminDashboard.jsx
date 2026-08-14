/**
 * src/pages/admin/AdminDashboard.jsx
 *
 * /admin — dashboard overview with live Firestore stats + recent orders.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, Users, DollarSign, Eye, RefreshCw } from 'lucide-react'
import { getAdminStats } from '../../firebase/admin'
import AdminStatCard from '../../components/admin/AdminStatCard'
import Skeleton      from '../../components/common/Skeleton'

const fmt  = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
const fmtN = (n) => new Intl.NumberFormat('en-US').format(n)

const STATUS_STYLES = {
  Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50  text-blue-700  border-blue-200',
  Shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  Delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:  'bg-gray-100 text-gray-600 border-gray-300',
}

function RecentOrderRow({ order }) {
  const shortId = order.id?.slice(-8).toUpperCase()
  const style   = STATUS_STYLES[order.status] ?? STATUS_STYLES.Pending

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="py-3.5 px-4 text-xs font-mono font-semibold text-gray-700">
        #{shortId}
      </td>
      <td className="py-3.5 px-4 text-sm text-gray-700">
        {order.customerInfo?.name ?? '—'}
      </td>
      <td className="py-3.5 px-4 text-xs text-gray-500">
        {order.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—'}
      </td>
      <td className="py-3.5 px-4 text-xs text-gray-500">
        {order.items?.length ?? 0} {order.items?.length === 1 ? 'item' : 'items'}
      </td>
      <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">
        {fmt(order.total ?? 0)}
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style}`}>
          {order.status}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <Link
          to={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-colors"
        >
          <Eye size={11} />
          View
        </Link>
      </td>
    </tr>
  )
}

function RecentOrderRowSkeleton() {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <Skeleton className="h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  function loadStats() {
    setLoading(true)
    setError(null)
    getAdminStats()
      .then(setStats)
      .catch((err) => {
        console.error('[AdminDashboard]', err)
        setError('Unable to load dashboard data.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadStats() }, [])

  return (
    <div className="space-y-6">
      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Package}
          iconBg="bg-blue-100" iconColor="text-blue-600"
          label="Total Products"
          value={loading ? '—' : fmtN(stats?.totalProducts ?? 0)}
          sub="Active catalog items"
          loading={loading}
        />
        <AdminStatCard
          icon={ShoppingCart}
          iconBg="bg-indigo-100" iconColor="text-indigo-600"
          label="Total Orders"
          value={loading ? '—' : fmtN(stats?.totalOrders ?? 0)}
          sub="All customer orders"
          loading={loading}
        />
        <AdminStatCard
          icon={Users}
          iconBg="bg-emerald-100" iconColor="text-emerald-600"
          label="Customers"
          value={loading ? '—' : fmtN(stats?.totalCustomers ?? 0)}
          sub="Registered accounts"
          loading={loading}
        />
        <AdminStatCard
          icon={DollarSign}
          iconBg="bg-orange-100" iconColor="text-orange-600"
          label="Total Sales"
          value={loading ? '—' : fmt(stats?.totalSales ?? 0)}
          sub="From all valid orders"
          loading={loading}
        />
      </div>

      {/* ── Recent orders table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={loadStats}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>

        {error ? (
          <div className="px-5 py-10 text-center text-sm text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <RecentOrderRowSkeleton key={i} />)
                  : stats?.recentOrders.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                          No orders yet.
                        </td>
                      </tr>
                    )
                    : stats.recentOrders.map((o) => <RecentOrderRow key={o.id} order={o} />)
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
