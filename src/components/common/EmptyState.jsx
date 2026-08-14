/**
 * src/components/common/EmptyState.jsx
 *
 * Reusable empty-state card.
 *
 * Props:
 *   icon       — React node (emoji or Lucide icon)
 *   title      — main heading
 *   message    — supporting text
 *   action     — optional { label, onClick } for a CTA button
 */

export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {icon && (
        <div className="text-5xl mb-4 select-none" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {message && (
        <p className="text-gray-400 text-sm max-w-xs mb-6">{message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
