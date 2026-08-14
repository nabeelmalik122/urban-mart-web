/**
 * src/store/authStore.js
 *
 * Zustand store for global authentication state.
 *
 * Shape:
 *   user      — Firebase User object (or null when signed out)
 *   role      — "customer" | "admin" | null
 *   isLoading — true while the initial onAuthStateChanged hasn't fired yet
 *               (prevents flash of wrong page on hard-refresh)
 *
 * The store is populated by the onAuthStateChanged listener wired up in
 * src/main.jsx — components should only READ from this store, not write to it.
 */

import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  user:      null,
  role:      null,
  isLoading: true,   // start true so the loader shows until Firebase responds

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Called by the onAuthStateChanged listener when auth state is known.
   * @param {import('firebase/auth').User | null} user
   * @param {string | null} role
   */
  setAuth: (user, role) => set({ user, role, isLoading: false }),

  /**
   * Resets auth state (called on logout or when Firebase returns null user).
   */
  clearAuth: () => set({ user: null, role: null, isLoading: false }),

  /**
   * Forces the loading spinner back on (called before auth operations).
   */
  setLoading: (value) => set({ isLoading: value }),
}))

export default useAuthStore
