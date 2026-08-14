/**
 * src/pages/checkout/Checkout.jsx
 *
 * Checkout — route: /checkout  (ProtectedRoute)
 *
 * Layout:
 *   Desktop  — [Customer info form]  |  [Order summary]
 *   Mobile   — Form → Summary (stacked)
 *
 * On submit:
 *   1. Validate form fields
 *   2. Disable button to prevent double-submit
 *   3. Call createOrder() → Firestore
 *   4. Clear cart
 *   5. Navigate to /order-confirmation/:orderId
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, ChevronRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useCartStore, { FREE_SHIPPING_THRESHOLD } from '../../store/cartStore'
import { createOrder } from '../../firebase/orders'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

// ─── Currency formatter ────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n)

// ─── Field-level error message ─────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null
  return <p className="text-xs text-red-500 mt-1 ml-1">{msg}</p>
}

// ─── Order summary ─────────────────────────────────────────────────────────
function CheckoutSummary({ items, subtotal, shipping, total }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-5">
        Order Summary
      </h2>

      {/* Line items */}
      <div className="space-y-4 mb-5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-3 items-start"
          >
            <div className="relative flex-shrink-0">
              {item.imageURL ? (
                <img
                  src={item.imageURL}
                  alt={item.title}
                  className="w-14 h-14 object-cover rounded-xl bg-gray-50"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                  🛍️
                </div>
              )}

              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 line-clamp-1">
                {item.title}
              </p>

              <p className="text-xs text-gray-400">
                {fmt(item.price)} × {item.quantity}
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
              {fmt(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">
            {fmt(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>

          {shipping === 0 ? (
            <span className="font-semibold text-emerald-600">
              Free
            </span>
          ) : (
            <span className="font-semibold text-gray-900">
              {fmt(shipping)}
            </span>
          )}
        </div>

        {shipping > 0 && (
          <p className="text-xs text-gray-400">
            Free shipping on orders over{' '}
            {fmt(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}

        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Reusable input component ──────────────────────────────────────────────
function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}

        {required && (
          <span className="text-red-500 ml-0.5">*</span>
        )}
      </label>

      {children}

      <FieldError msg={error} />
    </div>
  )
}

const inputClass =
  'w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all'

const errorInputClass =
  'w-full px-4 py-3 text-sm bg-red-50 border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all'

// ─── Validation ────────────────────────────────────────────────────────────
function validate(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Please enter your full name.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'Please enter a valid phone number.'
  } else if (
    !/^[+\d\s\-().]{7,20}$/.test(form.phone.trim())
  ) {
    errors.phone = 'Please enter a valid phone number.'
  }

  if (!form.address.trim()) {
    errors.address = 'Please enter your delivery address.'
  }

  if (!form.city.trim()) {
    errors.city = 'Please enter your city.'
  }

  if (!form.postalCode.trim()) {
    errors.postalCode = 'Please enter your postal code.'
  }

  return errors
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const {
    items,
    totalPrice,
    shippingCost,
    grandTotal,
    clearCart,
  } = useCartStore()

  const subtotal = totalPrice()
  const shipping = shippingCost()
  const total = grandTotal()

  const [form, setForm] = useState({
    name: user?.displayName ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // ────────────────────────────────────────────────────────────────────────
  // IMPORTANT:
  // Only redirect to /cart when the cart is empty AND we are NOT
  // currently submitting an order.
  //
  // Without !submitting:
  // clearCart() → items.length becomes 0 → this effect redirects to /cart
  // before the order-confirmation page can be displayed.
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!submitting && items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [items.length, navigate, submitting])

  // Keep name/email in sync if auth resolves after mount
  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: f.name || user?.displayName || '',
      email: user?.email ?? f.email,
    }))
  }, [user])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((f) => ({
      ...f,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((e) => ({
        ...e,
        [name]: '',
      }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Validate form
    const fieldErrors = validate(form)

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      toast.error('Please fix the errors before continuing.')
      return
    }

    // Prevent double submission
    setSubmitting(true)

    try {
      const orderData = {
        userId: user.uid,

        customerInfo: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          notes: form.notes.trim(),
        },

        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          imageURL: i.imageURL,
          quantity: i.quantity,
        })),

        subtotal,
        shipping,
        total,
      }

      // Create order in Firestore
      const orderId = await createOrder(orderData)

      // Clear local cart after successful order
      clearCart()

      // Go to order confirmation
      navigate(
        `/order-confirmation/${orderId}`,
        { replace: true }
      )
    } catch (err) {
      console.error('[Checkout]', err)

      toast.error(
        'Order could not be placed. Please try again.'
      )

      setSubmitting(false)
    }
  }

  // Brief render while redirecting
  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
          <Link
            to="/cart"
            className="hover:text-blue-600 transition-colors"
          >
            Cart
          </Link>

          <ChevronRight size={14} />

          <span className="text-gray-700 font-medium">
            Checkout
          </span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-7">
          Checkout
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Customer information form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5"
          >
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-4 mb-2">
              Delivery Information
            </h2>

            {/* Full Name */}
            <FormField
              label="Full Name"
              required
              error={errors.name}
            >
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={
                  errors.name
                    ? errorInputClass
                    : inputClass
                }
                autoComplete="name"
                disabled={submitting}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email Address"
              required
            >
              <input
                name="email"
                type="email"
                value={form.email}
                readOnly
                className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
                aria-label="Email address (from your account)"
              />

              <p className="text-xs text-gray-400 mt-1 ml-1">
                Linked to your UrbanMart account.
              </p>
            </FormField>

            {/* Phone */}
            <FormField
              label="Phone Number"
              required
              error={errors.phone}
            >
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={
                  errors.phone
                    ? errorInputClass
                    : inputClass
                }
                autoComplete="tel"
                disabled={submitting}
              />
            </FormField>

            {/* Address */}
            <FormField
              label="Delivery Address"
              required
              error={errors.address}
            >
              <input
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main Street, Apt 4B"
                className={
                  errors.address
                    ? errorInputClass
                    : inputClass
                }
                autoComplete="street-address"
                disabled={submitting}
              />
            </FormField>

            {/* City + Postal Code */}
            <div className="grid sm:grid-cols-2 gap-4">

              <FormField
                label="City"
                required
                error={errors.city}
              >
                <input
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className={
                    errors.city
                      ? errorInputClass
                      : inputClass
                  }
                  autoComplete="address-level2"
                  disabled={submitting}
                />
              </FormField>

              <FormField
                label="Postal Code"
                required
                error={errors.postalCode}
              >
                <input
                  name="postalCode"
                  type="text"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className={
                    errors.postalCode
                      ? errorInputClass
                      : inputClass
                  }
                  autoComplete="postal-code"
                  disabled={submitting}
                />
              </FormField>

            </div>

            {/* Notes */}
            <FormField label="Order Notes (optional)">
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Special delivery instructions, apartment access, etc."
                rows={3}
                className={`${inputClass} resize-none`}
                disabled={submitting}
              />
            </FormField>

            {/* Mobile order summary */}
            <div className="lg:hidden">
              <CheckoutSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base transition-all
                ${
                  submitting
                    ? 'bg-blue-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.98]'
                }`}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Placing order…
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Place Order — {fmt(total)}
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-400 mt-1">
              By placing your order you agree to our Terms of Service.
            </p>
          </form>

          {/* Desktop order summary */}
          <div className="hidden lg:block lg:w-96 flex-shrink-0">
            <div className="sticky top-24">
              <CheckoutSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
              />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}