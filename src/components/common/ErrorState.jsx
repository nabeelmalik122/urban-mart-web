/**
 * src/components/common/ErrorState.jsx
 *
 * Shown when a Firestore fetch fails.
 * Never exposes raw Firebase error strings to the user.
 *
 * Props:
 *   message   — optional override message (default shown if omitted)
 *   onRetry   — optional retry callback; renders a Retry button if provided
 */

import { AlertCircle } from 'lucide-react'

export default function ErrorState({
  message = 'Unable to load content. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="text-red-400" size={28} />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Something went wrong
      </h3>
      <p className="text-gray-400 text-sm max-w-xs mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
