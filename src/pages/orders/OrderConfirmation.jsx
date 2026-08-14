/**
 * src/pages/orders/OrderConfirmation.jsx
 *
 * Shown after a successful order — route: /order-confirmation/:orderId
 * (ProtectedRoute)
 *
 * Fetches the order from Firestore and displays a confirmation summary.
 * Verifies order.userId === currentUser.uid before rendering.
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ShoppingBag } from 'lucide-react'
import useAuthStore  from '../../store/authStore'
import { getOrderById } from '../../firebase/orders'
import Navbar   from '../../components/common/Navbar'
import Footer   from '../../components/common/Footer'
import Skeleton from '../../components/common/Skeleton'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const STATUS_STYLES = {
  Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  Delivered:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled:  'bg-gray-100 text-gray-600 border-gray-300',
}

function ConfirmationSkeleton() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-4">
      <Skeleton className="h-16 w-16 rounded-full mx-auto" />
      <Skeleton className="h-8 w-48 rounded-xl mx-auto" />
      <Skeleton className="h-4 w-64 rounded mx-auto" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}

export default function OrderConfirmation() {
  const { orderId }  = useParams()
  const { user }     = useAuthStore()
  const [order,  setOrder]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [unauth,  setUnauth]  = useState(false)

  useEffect(() => {
    if (!orderId || !user) return
    getOrderById(orderId)
      .then((o) => {
        if (!o || o.userId !== user.uid) { setUnauth(true); return }
        setOrder(o)
      })
      .catch(() => setUnauth(true))
      .finally(() => setLoading(false))
  }, [orderId, user])

  // Short display ID — last 8 chars of Firestore doc ID
  const shortId = orderId?.slice(-8).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-start justify-center py-12 px-4">
        {loading ? (
          <ConfirmationSkeleton />
        ) : unauth || !order ? (
          <div className="max-w-md text-center py-16">
            <p className="text-5xl mb-4">🚫</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Order not found</h2>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't find that order. It may belong to a different account.
            </p>
            <Link
              to="/orders"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:bg-blue-700 transition-colors"
            >
              View my orders
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-xl">
            {/* Success header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                Order placed successfully!
              </h1>
              <p className="text-gray-500 text-sm">
                Thank you, {order.customerInfo.name.split(' ')[0]}. We'll get right on it.
              </p>
            </div>

            {/* Order info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
              {/* Order meta */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                  <p className="font-bold text-gray-900 font-mono text-sm">#{shortId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date</p>
                  <p className="text-sm font-medium text-gray-700">
                    {order.createdAt
                      ? order.createdAt.toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status] ?? STATUS_STYLES.Pending}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total</p>
                  <p className="text-sm font-bold text-gray-900">{fmt(order.total)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.imageURL ? (
                      <img
                        src={item.imageURL}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        🛍️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × {fmt(item.price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {fmt(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{fmt(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : fmt(order.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span>{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Delivering to
              </p>
              <p className="text-sm font-medium text-gray-800">{order.customerInfo.name}</p>
              <p className="text-sm text-gray-600">
                {order.customerInfo.address}, {order.customerInfo.city} {order.customerInfo.postalCode}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/orders"
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-2xl transition-colors text-sm"
              >
                <Package size={16} />
                View My Orders
              </Link>
              <Link
                to="/products"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors text-sm"
              >
                <ShoppingBag size={16} />
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
