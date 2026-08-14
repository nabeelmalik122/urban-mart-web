/**
 * src/pages/auth/Signup.jsx
 *
 * Signup page — glassmorphism card design.
 * Fields: Name, Email, Password, Confirm Password.
 * Also supports Google one-tap sign-up (same flow as login).
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signUpWithEmail, loginWithGoogle, getFriendlyAuthError } from '../../firebase/auth'
import './Auth.css'

// ─── SVG icons (same as Login, kept local to avoid a shared icon file in Phase 1) ─

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8H6.3C9.7 35.7 16.3 40 24 40v4z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C41.5 35.4 44 30.1 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" width="16" height="16" fill="white">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.8 43.5 246.8 103.4 181.7c39.5-43.2 97-68.7 152.1-68.7 57.1 0 99.3 37.9 167.1 37.9 65.3 0 115.5-38.9 172.9-38.9 32.6 0 108.2 10.3 164.9 75.1zm-170.8-127.5c-27.4 33.8-77.1 63.6-124.6 63.6-9.7 0-18.4-2.6-18.4-2.6s-.6-9.7-.6-19.4c0-49.5 32.6-106.8 75.1-134.3 27.4-18.4 77.7-33.2 112.8-34.5 1.9 9.7 3.2 19.4 3.2 28.5 0 49.6-21.4 112.8-47.5 98.7z"/>
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="16" height="16" fill="white">
      <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"/>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Signup() {
  const navigate = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [errors,   setErrors]   = useState({})
  const [submitting, setSubmitting] = useState(false)

  // ── Client-side validation ──────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!name.trim())                             e.name     = 'Full name is required.'
    if (!email.trim())                            e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email))         e.email    = 'Enter a valid email address.'
    if (!password)                                e.password = 'Password is required.'
    else if (password.length < 6)                 e.password = 'Password must be at least 6 characters.'
    if (!confirm)                                 e.confirm  = 'Please confirm your password.'
    else if (confirm !== password)                e.confirm  = 'Passwords do not match.'
    return e
  }

  // ── Email/password submit ───────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({})
    setSubmitting(true)
    try {
      await signUpWithEmail(name.trim(), email, password)
      toast.success('Account created! Welcome to UrbanMart 🎉')
      // New customers always go to home; they are never admin on first sign-up
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(getFriendlyAuthError(err.code))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Google sign-up / sign-in ────────────────────────────────────────────────
  async function handleGoogle() {
    setSubmitting(true)
    try {
      const cred = await loginWithGoogle()
      toast.success(`Welcome, ${cred.user.displayName ?? ''}! 🎉`)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(getFriendlyAuthError(err.code))
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Brand header */}
        <div className="auth-brand">
          <span className="auth-brand-icon">🛍️</span>
          <span className="auth-brand-name">UrbanMart</span>
        </div>

        <div className="heading">Create Account</div>

        {/* Sign-up form */}
        <form className="form" onSubmit={handleSubmit} noValidate>
          {/* Full name */}
          <div className="input-group">
            <input
              className={`input ${errors.name ? 'input-error' : ''}`}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={submitting}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="input-group">
            <input
              className={`input ${errors.email ? 'input-error' : ''}`}
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={submitting}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="input-group">
            <input
              className={`input ${errors.password ? 'input-error' : ''}`}
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div className="input-group">
            <input
              className={`input ${errors.confirm ? 'input-error' : ''}`}
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={submitting}
            />
            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Social sign-up */}
        <div className="social-account-container">
          <span className="title">Or sign up with</span>
          <div className="social-accounts">
            {/* Google — fully functional */}
            <button
              className="social-button google"
              type="button"
              onClick={handleGoogle}
              disabled={submitting}
              title="Sign up with Google"
              aria-label="Sign up with Google"
            >
              <GoogleIcon />
            </button>

            {/* Apple — visual only */}
            <button
              className="social-button apple disabled-social"
              type="button"
              disabled
              title="Apple sign-up coming soon"
              aria-label="Apple sign-up (coming soon)"
            >
              <AppleIcon />
            </button>

            {/* Twitter/X — visual only */}
            <button
              className="social-button twitter disabled-social"
              type="button"
              disabled
              title="Twitter sign-up coming soon"
              aria-label="Twitter sign-up (coming soon)"
            >
              <TwitterIcon />
            </button>
          </div>
        </div>

        {/* Switch to login */}
        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>

        <span className="agreement">
          <a href="#">User licence agreement</a>
        </span>
      </div>
    </div>
  )
}
