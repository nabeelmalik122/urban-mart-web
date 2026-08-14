/**
 * src/pages/orders/OrderDetails.jsx
 *
 * Single order detail — route: /orders/:orderId  (ProtectedRoute)
 *
 * Security: verifies order.userId === currentUser.uid before rendering.
 * Uses onSnapshot for a live listener so admin status changes reflect
 * instantly without a manual refresh.  Listener is unsubscribed on unmount.
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, Package, ShieldAlert } from 'lucide-react'
import useAuthStore  from '../../store/authStore'
import { db } from '../../firebase/config'
import Navbar    from '../../components/common/Navbar'
import Footer    from '../../components/common/Footer'
import Skeleton  from '../../components/common/Skeleton'
import ErrorState from '../../components/common/ErrorState'

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const STATUS_STYLES = {
  Pending:    { pill: 'bg-yellow-50 text-yellow-700 border-yellow-200',   dot: 'bg-yellow-400' },
  Processing: { pill: 'bg-blue-50  text-blue-700  border-blue-200',       dot: 'bg-blue-500' },
  Shipped:    { pill: 'bg-purple-50 text-purple-700 border-purple-200',   dot: 'bg-purple-500' },
  Delivered:  { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',dot: 'bg-emerald-500' },
  Cancelled:  { pill: 'bg-gray-100 text-gray-600 border-gray-300',        dot: 'bg-gray-400' },
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="h-8 w-48 rounded-xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-60 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  )
}

export default function OrderDetails() {
  const { orderId }  = useParams()
  const { user }     = useAuthStore()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [unauth,  setUnauth]  = useState(false)

  useEffect(() => {
    if (!orderId || !user) return

    setLoading(true)
    setError(null)
    setUnauth(false)

    // ── Live listener — updates automatically when admin changes status ──────
    const unsub = onSnapshot(
      doc(db, 'orders', orderId),
      (snap) => {
        setLoading(false)
        if (!snap.exists()) { setUnauth(true); return }

        const data = snap.data()
        // ── Security check ───────────────────────────────────────────────
        if (data.userId !== user.uid) { setUnauth(true); return }

        setOrder({
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ?? null,
        })
      },
      (err) => {
        console.error('[OrderDetails]', err)
        setLoading(false)
        // PERMISSION_DENIED from Firestore means the user doesn't own this order
        if (err.code === 'permission-denied') {
          setUnauth(true)
        } else {
          setError('Unable to load order details.')
        }
      },
    )

    // Unsubscribe the listener when component unmounts or orderId/user changes
    return () => unsub()
  }, [orderId, user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const shortId = orderId?.slice(-8).toUpperCase()
  const styleSet = STATUS_STYLES[order?.status] ?? STATUS_STYLES.Pending

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {loading ? (
          <DetailSkeleton />
        ) : unauth ? (
          /* ── Unauthorized state — never expose data ── */
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Order not found</h2>
            <p className="text-gray-500 text-sm mb-6">
              This order doesn't exist or doesn't belong to your account.
            </p>
            <Link
              to="/orders"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full text-sm hover:bg-blue-700 transition-colors"
            >
              View my orders
            </Link>
          </div>
        ) : error ? (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <ErrorState message={error} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            {/* Back link */}
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
            >
              <ArrowLeft size={15} />
              Back to My Orders
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">
                  Order #{shortId}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Placed on{' '}
                  {order.createdAt?.toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  }) ?? '—'}
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${styleSet.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${styleSet.dot}`} />
                {order.status}
              </div>
            </div>

            {/* ── Products ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package size={16} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-800">
                  Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    {item.imageURL ? (
                      <img
                        src={item.imageURL}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        🛍️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmt(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                      {fmt(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{fmt(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : fmt(order.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* ── Delivery info ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-5">
              <h2 className="text-sm font-bold text-gray-800 mb-3">Delivery Information</h2>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-gray-400 mb-0.5">Name</dt>
                  <dd className="text-gray-800 font-medium">{order.customerInfo.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400 mb-0.5">Phone</dt>
                  <dd className="text-gray-800 font-medium">{order.customerInfo.phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400 mb-0.5">Address</dt>
                  <dd className="text-gray-800 font-medium">
                    {order.customerInfo.address},{' '}
                    {order.customerInfo.city}{' '}
                    {order.customerInfo.postalCode}
                  </dd>
                </div>
                {order.customerInfo.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-gray-400 mb-0.5">Notes</dt>
                    <dd className="text-gray-800">{order.customerInfo.notes}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* ── Actions ── */}
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to all orders
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
