/**
 * src/routes/ProtectedRoute.jsx
 *
 * Wraps any route that requires the user to be authenticated.
 * - While auth state is still loading  → show nothing (Loader handles the UI)
 * - Not authenticated                  → redirect to /login
 * - Authenticated                      → render children
 */

import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()

  // Auth state not yet resolved — let the root Loader handle the splash screen
  if (isLoading) return null

  // Not signed in → bounce to login, preserving the intended destination
  if (!user) return <Navigate to="/login" replace />

  // Authenticated — render the nested route
  return <Outlet />
}
