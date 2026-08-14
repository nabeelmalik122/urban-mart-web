/**
 * src/components/product/ProductCard.jsx
 *
 * Reusable product card used everywhere a product needs to be displayed:
 * Featured section, product grid, related products, search results.
 *
 * Props:
 *   product   — Firestore product object
 *   onAddToCart — optional callback (wired to cartStore in Phase 4)
 *
 * The card is intentionally self-contained:
 *   - handles broken images
 *   - shows stock status
 *   - shows star rating
 *   - links to /products/:id for the detail page
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Eye } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import toast from 'react-hot-toast'

// ─── Star rating display ──────────────────────────────────────────────────────
function StarRating({ rating, reviewCount }) {
  if (!rating) return null
  const full  = Math.floor(rating)
  const half  = rating - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} size={12} className="text-yellow-400 fill-yellow-400" />
        ))}
        {half && (
          <Star size={12} className="text-yellow-400 fill-yellow-200" />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} size={12} className="text-gray-200 fill-gray-200" />
        ))}
      </div>
      {reviewCount != null && (
        <span className="text-xs text-gray-400">({reviewCount})</span>
      )}
    </div>
  )
}

// ─── Stock badge ──────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  if (stock > 10) return null   // plenty in stock — don't clutter the card
  if (stock <= 0) return (
    <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
      Out of stock
    </span>
  )
  return (
    <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
      Only {stock} left
    </span>
  )
}

// ─── Category pill ────────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  electronics:  'Electronics',
  fashion:      'Fashion',
  'home-living':'Home & Living',
  beauty:       'Beauty',
  sports:       'Sports',
  accessories:  'Accessories',
}

// ─── Main card ────────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { addItem, items } = useCartStore()
  const [imgErr, setImgErr] = useState(false)
  const [adding, setAdding] = useState(false)

  const inStock = product.stock > 0
  // Check how many are already in the cart to enforce stock limit
  const cartItem   = items.find((i) => i.productId === product.id)
  const cartQty    = cartItem?.quantity ?? 0
  const atStockMax = cartQty >= product.stock

  function handleAddToCart(e) {
    e.preventDefault()
    if (!inStock || adding || atStockMax) {
      if (atStockMax) toast.error(`Only ${product.stock} available in stock.`, { id: `sl-${product.id}` })
      return
    }
    setAdding(true)
    addItem(product, 1)
    toast.success(`"${product.title}" added to cart!`, { duration: 2500 })
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      {/* ── Image ── */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-gray-50 flex-shrink-0">
        {!imgErr && product.imageURL ? (
          <img
            src={product.imageURL}
            alt={product.title}
            onError={() => setImgErr(true)}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-52 flex items-center justify-center text-4xl text-gray-300 bg-gray-50">
            🛍️
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
            Featured
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-white text-red-500 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-red-100">
              Out of stock
            </span>
          </div>
        )}

        {/* Quick view hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={12} />
            Quick view
          </span>
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <p className="text-xs text-blue-500 font-semibold mb-1.5">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </p>

        {/* Title */}
        <Link
          to={`/products/${product.id}`}
          className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug"
        >
          {product.title}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        {/* Stock badge */}
        <div className="mb-3">
          <StockBadge stock={product.stock} />
        </div>

        {/* Price + Add to cart */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-lg font-extrabold text-gray-900">
            ${product.price?.toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-all
              ${inStock
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
              ${adding ? 'scale-95' : ''}`}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart size={13} />
            {adding ? 'Added!' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
