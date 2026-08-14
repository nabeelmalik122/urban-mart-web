/**
 * src/components/admin/AdminSidebar.jsx
 *
 * Responsive sidebar for the admin dashboard.
 * Desktop: always-visible fixed sidebar.
 * Mobile: drawer controlled by `open` prop.
 */

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ShoppingCart,
  X,
  Store,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logout } from '../../firebase/auth'
import useAuthStore from '../../store/authStore'

const NAV_ITEMS = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products',  icon: Package,         label: 'Products' },
  { to: '/admin/orders',    icon: ShoppingCart,    label: 'Orders' },
  { to: '/admin/customers', icon: Users,           label: 'Customers' },
]

// ─── Single nav link ──────────────────────────────────────────────────────────
function SidebarLink({ to, icon: Icon, label, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'
        }`
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  )
}

// ─── Avatar initials fallback ─────────────────────────────────────────────────
function AdminAvatar({ user }) {
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? 'A').toUpperCase()

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt="Admin"
        className="w-9 h-9 rounded-full object-cover border-2 border-slate-600 flex-shrink-0"
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

// ─── Sidebar content (shared between desktop and mobile) ──────────────────────
function SidebarContent({ onLinkClick }) {
  const navigate    = useNavigate()
  const { user }    = useAuthStore()

  async function handleLogout() {
    try {
      await logout()
      toast.success('Signed out.')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Logout failed.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Brand ── */}
      <div className="px-4 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={15} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-tight">UrbanMart</p>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Main Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={onLinkClick} />
        ))}

        <div className="pt-4">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            System
          </p>
          <SidebarLink
            to="/admin/settings"
            icon={Settings}
            label="Settings"
            onClick={onLinkClick}
          />
        </div>
      </nav>

      {/* ── Footer: profile + actions ── */}
      <div className="px-3 py-4 border-t border-slate-700/60 space-y-1">
        {/* Back to store */}
        <NavLink
          to="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-700/60 hover:text-white transition-all"
        >
          <Store size={17} />
          Back to Store
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={17} />
          Sign Out
        </button>

        {/* Admin info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-slate-700/40 rounded-xl">
            <AdminAvatar user={user} />
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user.displayName ?? 'Admin'}
              </p>
              <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AdminSidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      {/* ── Desktop sidebar (always visible) ── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-slate-800 border-r border-slate-700/60 min-h-screen fixed top-0 left-0 z-30">
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          />
          {/* Drawer */}
          <div className="relative w-64 bg-slate-800 flex flex-col shadow-2xl">
            {/* Close button */}
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors z-10"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <SidebarContent onLinkClick={onMobileClose} />
          </div>
        </div>
      )}
    </>
  )
}
