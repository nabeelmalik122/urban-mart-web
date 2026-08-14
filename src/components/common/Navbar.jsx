/**
 * src/components/common/Navbar.jsx
 *
 * Responsive site-wide navigation bar.
 *
 * Desktop layout:
 *   [Logo]  Home  Categories  Deals  [Search bar]  Account dropdown  Cart
 *
 * Mobile layout:
 *   [Logo]  [Search icon]  [Cart icon]  [Hamburger]
 *   → Slide-down drawer with full nav links + account info
 *
 * Auth state consumed from existing Zustand authStore — no new auth logic.
 */

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Tag,
  Home,
  Zap,
  Package,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore  from '../../store/authStore'
import useCartStore  from '../../store/cartStore'
import { logout }    from '../../firebase/auth'

// ─── Category nav items (drives the dropdown + mobile menu) ──────────────────
const NAV_CATEGORIES = [
  { label: 'Electronics',  slug: 'electronics' },
  { label: 'Fashion',      slug: 'fashion' },
  { label: 'Home & Living',slug: 'home-living' },
  { label: 'Beauty',       slug: 'beauty' },
  { label: 'Sports',       slug: 'sports' },
  { label: 'Accessories',  slug: 'accessories' },
]

// ─── Small search bar (desktop inline version) ────────────────────────────────
function DesktopSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/products?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden md:flex items-center flex-1 max-w-md mx-6"
    >
      <div className="relative w-full">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-full focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
        />
      </div>
    </form>
  )
}

// ─── Account dropdown (desktop) ───────────────────────────────────────────────
function AccountMenu({ user, role }) {
  const navigate    = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef     = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    setOpen(false)
    try {
      await logout()
      toast.success('Signed out.')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Logout failed. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link
          to="/login"
          className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          className="text-sm font-semibold px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          Join free
        </Link>
      </div>
    )
  }

  return (
    <div ref={menuRef} className="hidden md:block relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-2 py-1 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'Account'}
            className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {user.displayName?.split(' ')[0] ?? 'Account'}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          {/* User info header */}
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user.displayName ?? 'Customer'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            {role === 'admin' && (
              <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                Admin
              </span>
            )}
          </div>

          {role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Tag size={14} />
              Admin Dashboard
            </Link>
          )}

          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Package size={14} />
            My Orders
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Categories dropdown (desktop) ───────────────────────────────────────────
function CategoriesDropdown() {
  const [open, setOpen] = useState(false)
  const ref  = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors py-1"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Categories
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {cat.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <Link
              to="/products"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              All Products →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Cart icon button ─────────────────────────────────────────────────────────
function CartButton() {
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
      aria-label={`Cart, ${totalItems} items`}
    >
      <ShoppingCart size={20} className="text-gray-600" />
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, role } = useAuthStore()
  const navigate       = useNavigate()
  const location       = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState('')

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  function handleMobileSearch(e) {
    e.preventDefault()
    if (mobileSearch.trim()) {
      navigate(`/products?q=${encodeURIComponent(mobileSearch.trim())}`)
      setMobileOpen(false)
    }
  }

  async function handleMobileLogout() {
    setMobileOpen(false)
    try {
      await logout()
      toast.success('Signed out.')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="UrbanMart home"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              UrbanMart
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <nav className="hidden md:flex items-center gap-5 ml-4">
            <Link
              to="/"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home size={14} />
              Home
            </Link>
            <CategoriesDropdown />
            <Link
              to="/products?featured=true"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Zap size={14} />
              Deals
            </Link>
            {/* My Orders — only for authenticated users */}
            {user && (
              <Link
                to="/orders"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Package size={14} />
                My Orders
              </Link>
            )}
          </nav>

          {/* ── Desktop search (flex-grows to fill space) ── */}
          <DesktopSearch />

          {/* ── Desktop right-side actions ── */}
          <div className="hidden md:flex items-center gap-2 ml-auto flex-shrink-0">
            <AccountMenu user={user} role={role} />
            <CartButton />
          </div>

          {/* ── Mobile right-side actions ── */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <Link
              to="/products"
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-600" />
            </Link>
            <CartButton />
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? <X size={20} className="text-gray-600" />
                : <Menu size={20} className="text-gray-600" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white pb-4 shadow-lg">
          {/* Mobile search */}
          <form onSubmit={handleMobileSearch} className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="search"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-full focus:outline-none focus:bg-white border border-transparent focus:border-blue-400 transition-colors"
                autoFocus
              />
            </div>
          </form>

          {/* Mobile nav links */}
          <nav className="px-4 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Home size={16} className="text-gray-400" />
              Home
            </Link>
            <Link to="/products?featured=true" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Zap size={16} className="text-gray-400" />
              Deals
            </Link>

            {/* Category links */}
            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Categories
            </p>
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="block px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Mobile auth section */}
          <div className="px-4 mt-3 pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user.displayName ?? 'Customer'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <Tag size={16} />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Package size={16} className="text-gray-400" />
                  My Orders
                </Link>
                <button
                  onClick={handleMobileLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Join free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
