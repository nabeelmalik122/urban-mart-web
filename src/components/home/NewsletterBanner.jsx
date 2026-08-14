/**
 * src/components/home/NewsletterBanner.jsx
 *
 * Inline newsletter sign-up banner — purely visual for Phase 2.
 * No backend subscription logic (that belongs to a later phase).
 * Shows a toast on submit as a placeholder interaction.
 */

import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterBanner() {
  const [email,       setEmail]       = useState('')
  const [subscribed,  setSubscribed]  = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address.')
      return
    }
    setSubscribed(true)
    toast.success("You're on the list! We'll be in touch soon.")
  }

  return (
    <section className="bg-white py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail size={22} className="text-blue-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
          Stay in the loop
        </h2>
        <p className="text-gray-500 text-sm mb-7 max-w-md mx-auto">
          Get early access to new arrivals, exclusive deals, and member-only
          discounts — straight to your inbox.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-5 py-3 rounded-full">
            ✅ You're subscribed — thanks!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-5 py-3 text-sm bg-gray-100 border border-transparent rounded-full focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
              required
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all hover:shadow-md hover:shadow-blue-600/25 active:scale-95"
            >
              Subscribe
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        <p className="text-xs text-gray-400 mt-4">
          No spam. Unsubscribe any time.
        </p>
      </div>
    </section>
  )
}
