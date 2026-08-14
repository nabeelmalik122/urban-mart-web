/**
 * src/pages/cart/CartPage.jsx
 *
 * Shopping cart — route: /cart  (ProtectedRoute)
 *
 * Layout:
 *   Desktop  — [Items list]  |  [Order summary + CTA]
 *   Mobile   — Items → Summary → Checkout button (stacked)
 */

import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react'
import useCartStore, { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '../../store/cartStore'
import Navbar  from '../../components/common/Navbar'
import Footer  from '../../components/common/Footer'

// ─── Currency formatter ────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

// ─── Single cart line item ─────────────────────────────────────────────────
function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, updateQty, removeItem } = useCartStore()

  const lineTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link to={`/products/${item.productId}`} className="flex-shrink-0">
        {item.imageURL ? (
          <img
            src={item.imageURL}
            alt={item.title}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-50"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-3xl bg-gray-100 rounded-xl">
            🛍️
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-blue-500 font-semibold mb-0.5 capitalize">
          {item.category}
        </p>
        <Link
          to={`/products/${item.productId}`}
          className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
        >
          {item.title}
        </Link>
        <p className="text-sm font-bold text-gray-900 mt-1">{fmt(item.price)}</p>

        {/* Qty controls + remove */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => decreaseQuantity(item.productId)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-40"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-9 text-center text-sm font-semibold text-gray-800 select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => increaseQuantity(item.productId)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-40"
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{fmt(lineTotal)}</span>
            <button
              onClick={() => removeItem(item.productId)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              aria-label={`Remove ${item.title}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Order summary sidebar ─────────────────────────────────────────────────
function OrderSummary({ subtotal, shipping, total, onCheckout }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
      <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

      <div className="space-y-3 text-sm mb-5">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          {shipping === 0 ? (
            <span className="font-semibold text-emerald-600">Free</span>
          ) : (
            <span className="font-semibold text-gray-900">{fmt(shipping)}</span>
          )}
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-400">
            Add {fmt(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
          </p>
        )}
        <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.98]"
      >
        Proceed to Checkout
        <ArrowRight size={16} />
      </button>

      <Link
        to="/products"
        className="block text-center text-sm text-gray-400 hover:text-blue-600 transition-colors mt-4"
      >
        ← Continue shopping
      </Link>
    </div>
  )
}

// ─── Empty cart state ──────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
        <ShoppingCart size={32} className="text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 text-sm max-w-xs mb-7">
        Discover products and add something you love.
      </p>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all hover:shadow-md"
      >
        <ShoppingBag size={16} />
        Continue Shopping
      </Link>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function CartPage() {
  const navigate = useNavigate()
  const { items, totalPrice, shippingCost, grandTotal, clearCart } = useCartStore()

  const subtotal = totalPrice()
  const shipping = shippingCost()
  const total    = grandTotal()

  function handleCheckout() {
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Shopping Cart
            {items.length > 0 && (
              <span className="ml-2 text-base font-medium text-gray-400">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="flex flex-col lg:flex-row gap-7">
            {/* ── Items list ── */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            {/* ── Summary sidebar ── */}
            <div className="lg:w-80 flex-shrink-0">
              <OrderSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
