/**
 * src/pages/admin/orders/AdminOrders.jsx
 * /admin/orders — all orders table with search + status filter.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, X } from 'lucide-react'
import { getAdminOrders } from '../../../firebase/admin'
import AdminTableSkeleton from '../../../components/admin/AdminTableSkeleton'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const ALL_STATUSES = ['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_STYLES = {
  Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50  text-blue-700  border-blue-200',
  Shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  Delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:  'bg-gray-100 text-gray-600 border-gray-300',
}

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')

  function loadOrders() {
    setLoading(true); setError(null)
    getAdminOrders()
      .then((o) => { setOrders(o); setFiltered(o) })
      .catch((err) => { console.error('[AdminOrders]', err); setError('Unable to load orders.') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadOrders() }, [])

  useEffect(() => {
    let list = orders
    if (status) list = list.filter((o) => o.status === status)
    if (search.trim()) {
      const t = search.trim().toLowerCase()
      list = list.filter((o) =>
        o.id?.toLowerCase().includes(t) ||
        o.customerInfo?.name?.toLowerCase().includes(t) ||
        o.customerInfo?.email?.toLowerCase().includes(t),
      )
    }
    setFiltered(list)
  }, [search, status, orders])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">Manage and fulfil customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer, email…"
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="py-2.5 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer">
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="px-5 py-16 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={loadOrders} className="text-xs font-semibold text-blue-600 hover:underline">Try again</button>
          </div>
        ) : loading ? (
          <AdminTableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-600 font-semibold mb-1">No orders found</p>
            <p className="text-gray-400 text-sm">{search || status ? 'Try adjusting your filters.' : 'Orders will appear here when customers place them.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order ID', 'Customer', 'Email', 'Date', 'Items', 'Total', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const shortId = o.id?.slice(-8).toUpperCase()
                  const style   = STATUS_STYLES[o.status] ?? STATUS_STYLES.Pending
                  return (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-mono font-semibold text-gray-700">#{shortId}</td>
                      <td className="py-3.5 px-4 text-sm text-gray-700">{o.customerInfo?.name ?? '—'}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 max-w-[140px] truncate">{o.customerInfo?.email ?? '—'}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        {o.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{o.items?.length ?? 0} items</td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">{fmt(o.total ?? 0)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style}`}>{o.status}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link to={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-colors">
                          <Eye size={11} /> View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {orders.length} orders
          </div>
        )}
      </div>
    </div>
  )
}
