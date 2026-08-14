// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration
//
// Values are loaded from the .env file via Vite's import.meta.env.
// To update them, edit .env in the project root (never hardcode keys here).
// See .env.example for the full list of required variables.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth }                         from 'firebase/auth'
import { getFirestore }                    from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Guard against double-initialisation during Vite hot-module reloads.
// getApps() returns existing app instances — reuse if already initialised.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Export the two services used throughout the app.
// Both are bound to the same `app` instance, so they share the same project.
export const auth = getAuth(app)
export const db   = getFirestore(app)

export default app
