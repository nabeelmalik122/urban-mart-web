/**
 * src/App.jsx
 *
 * Root component — React Router setup.
 *
 * ── Auth routes ──────────────────────────────────────────────────────────────
 *   /login    → Login          (PublicOnlyRoute — redirects away if authed)
 *   /signup   → Signup         (PublicOnlyRoute — redirects away if authed)
 *
 * ── Public storefront routes (no auth required) ──────────────────────────────
 *   /                        → Home storefront
 *   /products                → Product listing
 *   /products/:productId     → Product detail
 *
 * ── Auth-required routes ─────────────────────────────────────────────────────
 *   /cart                    → CartPage    (ProtectedRoute)
 *   /checkout                → Checkout    (ProtectedRoute)
 *   /order-confirmation/:id  → OrderConfirmation (ProtectedRoute)
 *   /orders                  → MyOrders   (ProtectedRoute)
 *   /orders/:orderId         → OrderDetails (ProtectedRoute)
 *
 * ── Admin-only routes ────────────────────────────────────────────────────────
 *   /admin                        → AdminDashboard  (AdminRoute)
 *   /admin/products               → AdminProducts   (AdminRoute)
 *   /admin/products/new           → AdminProductForm
 *   /admin/products/:id/edit      → AdminProductForm
 *   /admin/orders                 → AdminOrders     (AdminRoute)
 *   /admin/orders/:orderId        → AdminOrderDetails
 *   /admin/customers              → AdminCustomers  (AdminRoute)
 *   /admin/settings               → AdminSettings   (AdminRoute)
 *
 * ── Catch-all ────────────────────────────────────────────────────────────────
 *   *  → /login
 *
 * WHY storefront routes are public:
 *   Browsing, searching, and reading product details does not require an
 *   account. Authentication is only required for transactional actions
 *   (checkout, orders, profile) which will be gated individually in later
 *   phases. The Navbar already handles the auth-aware UX (shows "Sign in"
 *   vs account menu) without a route-level guard.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import useAuthStore        from './store/authStore'
import Loader              from './components/common/Loader'
import ProtectedRoute      from './routes/ProtectedRoute'
import AdminRoute          from './routes/AdminRoute'
import PublicRoute         from './routes/PublicRoute'

// ── Phase 1 pages (untouched) ─────────────────────────────────────────────────
import Login     from './pages/auth/Login'
import Signup    from './pages/auth/Signup'

// ── Phase 2 pages ─────────────────────────────────────────────────────────────
import Home              from './pages/home/Home'
import ProductsPage      from './pages/products/ProductsPage'
import ProductDetailPage from './pages/products/ProductDetailPage'

// ── Phase 3 pages ─────────────────────────────────────────────────────────────
import CartPage           from './pages/cart/CartPage'
import Checkout           from './pages/checkout/Checkout'
import OrderConfirmation  from './pages/orders/OrderConfirmation'
import MyOrders           from './pages/orders/MyOrders'
import OrderDetails       from './pages/orders/OrderDetails'

// ── Phase 4 — Admin Dashboard ─────────────────────────────────────────────────
import AdminLayout        from './pages/admin/AdminLayout'
import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminProducts      from './pages/admin/products/AdminProducts'
import AdminProductForm   from './pages/admin/products/AdminProductForm'
import AdminOrders        from './pages/admin/orders/AdminOrders'
import AdminOrderDetails  from './pages/admin/orders/AdminOrderDetails'
import AdminCustomers     from './pages/admin/customers/AdminCustomers'
import AdminSettings      from './pages/admin/AdminSettings'

/**
 * Prevents already-authenticated users from seeing /login or /signup.
 * If Firebase is still resolving, render nothing — the Loader overlay
 * covers the screen so there is no flash of the wrong page.
 * Unchanged from Phase 1.
 */
function PublicOnlyRoute({ children }) {
  const { user, role, isLoading } = useAuthStore()
  if (isLoading) return null
  if (user) return <Navigate to={role === 'admin' ? '/admin' : '/'} replace />
  return children
}

export default function App() {
  const { isLoading } = useAuthStore()

  return (
    <BrowserRouter>
      {/*
       * Full-screen book-flip splash — shown while Firebase resolves the
       * initial auth state. Once isLoading flips to false the overlay
       * fades out and the page underneath is already rendered and ready.
       * Public storefront pages render immediately under this overlay
       * so there is no redirect-to-login flash for unauthenticated users.
       */}
      <Loader isLoading={isLoading} />

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* ── Auth pages (redirect away if already logged in) ─────────── */}
        <Route
          path="/login"
          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}
        />
        <Route
          path="/signup"
          element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>}
        />

        {/* ── Public storefront (no auth required) ────────────────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/"                    element={<Home />} />
          <Route path="/products"            element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
        </Route>

        {/* ── Auth-required routes ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          {/* ── Phase 3: Cart, Checkout, Orders ── */}
          <Route path="/cart"                           element={<CartPage />} />
          <Route path="/checkout"                       element={<Checkout />} />
          <Route path="/order-confirmation/:orderId"    element={<OrderConfirmation />} />
          <Route path="/orders"                         element={<MyOrders />} />
          <Route path="/orders/:orderId"                element={<OrderDetails />} />
        </Route>

        {/* ── Admin-only routes (AdminRoute + AdminLayout shell) ──────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"                          element={<AdminDashboard />} />
            <Route path="/admin/products"                 element={<AdminProducts />} />
            <Route path="/admin/products/new"             element={<AdminProductForm />} />
            <Route path="/admin/products/:productId/edit" element={<AdminProductForm />} />
            <Route path="/admin/orders"                   element={<AdminOrders />} />
            <Route path="/admin/orders/:orderId"          element={<AdminOrderDetails />} />
            <Route path="/admin/customers"                element={<AdminCustomers />} />
            <Route path="/admin/settings"                 element={<AdminSettings />} />
          </Route>
        </Route>

        {/* ── Catch-all ────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
