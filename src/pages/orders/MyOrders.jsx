/**
 * src/pages/orders/MyOrders.jsx
 *
 * Customer's order history — route: /orders  (ProtectedRoute)
 *
 * Queries: orders where userId == currentUser.uid, ordered by createdAt desc.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, ChevronRight } from 'lucide-react'
import useAuthStore  from '../../store/authStore'
import { getUserOrders } from '../../firebase/orders'
import Navbar       from '../../components/common/Navbar'
import Footer       from '../../components/common/Footer'
import Skeleton     from '../../components/common/Skeleton'
import ErrorState   from '../../components/common/ErrorState'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const STATUS_STYLES = {
  Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50  text-blue-700  border-blue-200',
  Shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  Delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:  'bg-gray-100 text-gray-600 border-gray-300',
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-40 rounded" />
      <Skeleton className="h-3 w-24 rounded" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  )
}

function OrderCard({ order }) {
  const shortId  = order.id?.slice(-8).toUpperCase()
  const itemCount = order.items?.length ?? 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
          <p className="font-bold text-gray-900 font-mono text-sm">#{shortId}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[order.status] ?? STATUS_STYLES.Pending}`}>
          {order.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
        <span>
          {order.createdAt
            ? order.createdAt.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })
            : '—'}
        </span>
        <span>·</span>
        <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900">{fmt(order.total)}</p>
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
        >
          View details
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}

export default function MyOrders() {
  const { user }     = useAuthStore()
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  function loadOrders() {
    if (!user) return
    setLoading(true)
    setError(null)
    getUserOrders(user.uid)
      .then(setOrders)
      .catch((err) => {
        console.error('[MyOrders]', err)
        setError('Unable to load your orders.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Package size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">Track and manage your purchases</p>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={loadOrders} />
        ) : loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-7">
              When you place an order, it will show up here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all hover:shadow-md"
            >
              <ShoppingBag size={16} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
