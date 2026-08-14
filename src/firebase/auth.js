/**
 * src/firebase/auth.js
 *
 * All Firebase Authentication + Firestore user-document operations live here.
 * Components should import from this file — never call Firebase directly in JSX.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './config'

// ─── Google provider (reused across calls) ───────────────────────────────────
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Reads a user's role from Firestore.
 * Returns "customer" as a safe default if the document doesn't exist yet.
 *
 * @param {string} uid
 * @returns {Promise<string>} role
 */
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return 'customer'
  return snap.data().role ?? 'customer'
}

/**
 * Creates (or safely skips if already exists) the Firestore user document.
 * IMPORTANT: role is always set to "customer" here — admins are promoted
 * manually via the Firestore console, never through client code.
 *
 * @param {{ uid, name, email, photoURL }} param0
 */
async function ensureUserDocument({ uid, name, email, photoURL }) {
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      name:      name      ?? '',
      email:     email     ?? '',
      photoURL:  photoURL  ?? '',
      role:      'customer',   // ← never "admin" — set manually in console
      createdAt: serverTimestamp(),
    })
  }
}

// ─── Auth operations ─────────────────────────────────────────────────────────

/**
 * Sign up a new user with email + password.
 * Creates the Firestore document and sets the display name on the Auth profile.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signUpWithEmail(name, email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)

  // Persist display name on the Firebase Auth profile
  await updateProfile(credential.user, { displayName: name })

  // Create matching Firestore document
  await ensureUserDocument({
    uid:      credential.user.uid,
    name,
    email:    credential.user.email,
    photoURL: credential.user.photoURL ?? '',
  })

  return credential
}

/**
 * Sign in an existing user with email + password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Sign in (or sign up on first visit) with Google popup.
 * Automatically creates a Firestore document for first-time users.
 *
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider)

  await ensureUserDocument({
    uid:      credential.user.uid,
    name:     credential.user.displayName ?? '',
    email:    credential.user.email       ?? '',
    photoURL: credential.user.photoURL    ?? '',
  })

  return credential
}

/**
 * Sign out the currently authenticated user.
 */
export async function logout() {
  return signOut(auth)
}

// ─── Firebase error code → human-friendly message ────────────────────────────

/**
 * Maps Firebase Auth error codes to plain-English messages.
 * Falls back to a generic message for unknown codes.
 *
 * @param {string} code  e.g. "auth/wrong-password"
 * @returns {string}
 */
export function getFriendlyAuthError(code) {
  const map = {
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/too-many-requests':       'Too many failed attempts. Please try again later.',
    'auth/network-request-failed':  'Network error. Check your connection and retry.',
    'auth/popup-closed-by-user':    'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Another sign-in is already in progress.',
    'auth/invalid-credential':      'Invalid credentials. Please check and try again.',
    'auth/user-disabled':           'This account has been disabled. Contact support.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}
