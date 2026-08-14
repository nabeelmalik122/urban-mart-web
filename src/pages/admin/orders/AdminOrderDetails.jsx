/**
 * src/pages/admin/orders/AdminOrderDetails.jsx
 * /admin/orders/:orderId — order detail + status update.
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAdminOrder, updateOrderStatus } from '../../../firebase/admin'
import Skeleton from '../../../components/common/Skeleton'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_STYLES = {
  Pending:    { pill: 'bg-yellow-50 text-yellow-700 border-yellow-200',    dot: 'bg-yellow-400' },
  Processing: { pill: 'bg-blue-50  text-blue-700  border-blue-200',        dot: 'bg-blue-500' },
  Shipped:    { pill: 'bg-purple-50 text-purple-700 border-purple-200',    dot: 'bg-purple-500' },
  Delivered:  { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Cancelled:  { pill: 'bg-gray-100 text-gray-600 border-gray-300',         dot: 'bg-gray-400' },
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-5">
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="h-8 w-48 rounded-xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-60 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  )
}

export default function AdminOrderDetails() {
  const { orderId } = useParams()
  const [order,      setOrder]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [newStatus,  setNewStatus]  = useState('')
  const [updating,   setUpdating]   = useState(false)

  function loadOrder() {
    setLoading(true); setError(null)
    getAdminOrder(orderId)
      .then((o) => {
        if (!o) { setError('Order not found.'); return }
        setOrder(o)
        setNewStatus(o.status)
      })
      .catch((err) => { console.error('[AdminOrderDetails]', err); setError('Unable to load order.') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadOrder() }, [orderId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusUpdate() {
    if (!newStatus || newStatus === order.status) return
    setUpdating(true)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrder((o) => ({ ...o, status: newStatus }))
      toast.success('Order status updated.')
    } catch (err) {
      console.error('[AdminOrderDetails status]', err)
      toast.error('Unable to update order status.')
      setNewStatus(order.status)
    } finally {
      setUpdating(false)
    }
  }

  const shortId  = orderId?.slice(-8).toUpperCase()
  const styleSet = STATUS_STYLES[order?.status] ?? STATUS_STYLES.Pending

  return (
    <div className="max-w-3xl">
      {loading ? <DetailSkeleton /> : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 text-sm mb-3">{error}</p>
          <button onClick={loadOrder} className="text-xs font-semibold text-blue-600 hover:underline">Try again</button>
        </div>
      ) : (
        <>
          <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-5">
            <ArrowLeft size={15} /> Back to Orders
          </Link>

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Order #{shortId}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {order.createdAt?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) ?? '—'}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${styleSet.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${styleSet.dot}`} />
              {order.status}
            </div>
          </div>

          {/* Status update panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Update Status</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updating}
                className="flex-1 py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
              >
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${updating || newStatus === order.status
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
              >
                {updating ? <><Loader2 size={14} className="animate-spin" />Updating…</> : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Items ({order.items?.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  {item.imageURL
                    ? <img src={item.imageURL} alt={item.title} className="w-12 h-12 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                    : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🛍️</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{fmt(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">{fmt(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : fmt(order.shipping)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total</span><span>{fmt(order.total)}</span></div>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Customer Information</h3>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ['Name',        order.customerInfo?.name],
                ['Email',       order.customerInfo?.email],
                ['Phone',       order.customerInfo?.phone],
                ['Address',     `${order.customerInfo?.address}, ${order.customerInfo?.city} ${order.customerInfo?.postalCode}`],
              ].map(([label, val]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                  <dd className="text-gray-800 font-medium">{val || '—'}</dd>
                </div>
              ))}
              {order.customerInfo?.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400 mb-0.5">Notes</dt>
                  <dd className="text-gray-800">{order.customerInfo.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </>
      )}
    </div>
  )
}
