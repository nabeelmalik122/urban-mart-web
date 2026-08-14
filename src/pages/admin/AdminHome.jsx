/**
 * src/pages/admin/AdminHome.jsx
 *
 * Placeholder admin dashboard — Phase 1 only.
 * Full admin dashboard (product management, orders, analytics) comes in Phase 4.
 */

import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { logout } from '../../firebase/auth'
import useAuthStore from '../../store/authStore'

export default function AdminHome() {
  const navigate       = useNavigate()
  const { user, role } = useAuthStore()

  async function handleLogout() {
    try {
      await logout()
      toast.success('Signed out successfully.')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col">
      {/* Admin nav */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-orange-400" size={26} />
          <span className="text-xl font-extrabold text-white">
            ShopZone <span className="text-orange-400">Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-green-400" />
            <span className="text-sm text-slate-300 hidden sm:inline">
              {user?.email}
            </span>
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
              {role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Placeholder body */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-12 max-w-lg w-full">
          <div className="text-6xl mb-4">⚙️</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            You&apos;re logged in as an admin.
            <br />
            The full dashboard (product management, orders, analytics)
            arrives in <strong className="text-slate-300">Phase 4</strong>.
          </p>
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full border border-orange-500/30">
            🔒 Admin access verified
          </div>
        </div>
      </main>
    </div>
  )
}
