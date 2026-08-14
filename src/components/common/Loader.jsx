/**
 * src/components/common/Loader.jsx
 *
 * Full-screen splash loader with a book-flip animation.
 * Shown while Firebase resolves the initial auth state.
 * Fades out once `isLoading` becomes false.
 */

import './Loader.css'

// The page SVG path — same shape reused for all 6 "pages"
const PAGE_PATH =
  'M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 ' +
  'C0,4.92486775 4.92486775,0 11,0 L90,0 Z ' +
  'M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 ' +
  'C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 ' +
  'L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 ' +
  'C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z ' +
  'M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 ' +
  'C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 ' +
  'L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 ' +
  'C74,58.1192881 72.8807119,57 71.5,57 Z ' +
  'M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 ' +
  'C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 ' +
  'L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 ' +
  'C74,34.1192881 72.8807119,33 71.5,33 Z'

// Single page SVG element
function PageSVG() {
  return (
    <svg fill="currentColor" viewBox="0 0 90 120" aria-hidden="true">
      <path d={PAGE_PATH} />
    </svg>
  )
}

/**
 * @param {{ isLoading: boolean }} props
 */
export default function Loader({ isLoading }) {
  return (
    /*
     * Fixed overlay covers the entire viewport.
     * The `hidden` class triggers the CSS fade-out transition.
     * pointer-events:none when hidden so the app underneath is interactive.
     */
    <div
      className={`loader-overlay fixed inset-0 flex flex-col items-center justify-center bg-white z-50 ${
        isLoading ? '' : 'hidden'
      }`}
      aria-hidden={!isLoading}
      role="status"
      aria-label="Loading application"
    >
      {/* Book-flip widget */}
      <div className="loader">
        <div>
          <ul>
            {/* 6 pages — CSS targets nth-child to stagger the flip animation */}
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <PageSVG />
              </li>
            ))}
          </ul>
        </div>
        <span>Loading</span>
      </div>
    </div>
  )
}
