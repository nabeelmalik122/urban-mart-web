/**
 * src/main.jsx
 *
 * Application entry point.
 *
 * Responsibilities:
 *  1. Mount the React tree.
 *  2. Subscribe to Firebase onAuthStateChanged ONCE at the app root.
 *     When the auth state resolves, fetch the user's Firestore role and
 *     update the Zustand authStore — this is the single source of truth
 *     for authentication state throughout the entire app.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { onAuthStateChanged } from 'firebase/auth'

import './index.css'
import { auth } from './firebase/config'
import { getUserRole } from './firebase/auth'
import useAuthStore from './store/authStore'
import App from './App'

// ── Bootstrap the auth listener before rendering ──────────────────────────────
//
// We start the listener here so that by the time React renders <App />,
// the store's isLoading flag will flip to false as soon as Firebase responds.
// This is what drives the Loader fade-out.

const { setAuth, clearAuth } = useAuthStore.getState()

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      // Fetch role from Firestore; defaults to "customer" if doc not found
      const role = await getUserRole(firebaseUser.uid)
      setAuth(firebaseUser, role)
    } catch {
      // If Firestore read fails, still allow the user in as a customer
      setAuth(firebaseUser, 'customer')
    }
  } else {
    // User is signed out
    clearAuth()
  }
})

// ── Mount ─────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
