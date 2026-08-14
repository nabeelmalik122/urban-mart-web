/**
 * src/routes/PublicRoute.jsx
 *
 * A pass-through route wrapper for pages that are publicly accessible
 * regardless of authentication state.
 *
 * Behaviour:
 *   - While Firebase auth is still resolving  → render the page immediately
 *     (no redirect, no blank screen — the Navbar gracefully shows "Sign in"
 *      until the auth state settles)
 *   - Unauthenticated user → render the page
 *   - Authenticated user   → render the page (they just also see their account
 *     info in the Navbar)
 *
 * Used for:
 *   /                     (homepage)
 *   /products             (product listing)
 *   /products/:productId  (product detail)
 *
 * NOT used for pages that require an account (checkout, orders, profile, admin).
 */

import { Outlet } from 'react-router-dom'

export default function PublicRoute() {
  // No guard — render whatever nested route was matched.
  return <Outlet />
}
