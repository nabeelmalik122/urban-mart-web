/**
 * src/components/admin/AdminHeader.jsx
 *
 * Top header bar for all admin pages.
 * Shows: hamburger (mobile), page title, breadcrumb, admin avatar.
 */

import { Menu, Bell, ShoppingBag } from 'lucide-react'
import useAuthStore from '../../store/authStore'

function AdminAvatar({ user }) {
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? 'A').toUpperCase()

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt="Admin"
        className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
      {initials}
    </div>
  )
}

/**
 * @param {{
 *   title       : string
 *   breadcrumb  : string[]   optional path segments
 *   onMenuClick : () => void
 * }} props
 */
export default function AdminHeader({ title, breadcrumb = [], onMenuClick }) {
  const { user } = useAuthStore()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Open sidebar"
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {/* Logo — mobile only (sidebar hidden) */}
      <div className="lg:hidden flex items-center gap-1.5">
        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
          <ShoppingBag size={12} className="text-white" />
        </div>
        <span className="text-sm font-extrabold text-gray-800">UrbanMart</span>
      </div>

      {/* Title + breadcrumb */}
      <div className="flex-1 min-w-0 hidden sm:block">
        {breadcrumb.length > 0 && (
          <p className="text-xs text-gray-400 leading-none mb-0.5">
            {breadcrumb.join(' / ')}
          </p>
        )}
        <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
      </div>
      {/* Mobile title */}
      <div className="flex-1 min-w-0 sm:hidden">
        <h1 className="text-sm font-bold text-gray-900 truncate">{title}</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification bell (UI only — Phase 4) */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {/* Admin avatar */}
        <AdminAvatar user={user} />
      </div>
    </header>
  )
}
