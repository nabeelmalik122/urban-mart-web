/**
 * src/routes/AdminRoute.jsx
 *
 * Wraps any route that requires the user to be authenticated AND have
 * role === "admin".
 *
 * - While auth state is loading       → show nothing (Loader handles UI)
 * - Not authenticated                 → redirect to /login
 * - Authenticated but not admin       → redirect to / (customer home)
 * - Admin                             → render children
 */

import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function AdminRoute() {
  const { user, role, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!user)             return <Navigate to="/login" replace />
  if (role !== 'admin')  return <Navigate to="/"      replace />

  return <Outlet />
}
