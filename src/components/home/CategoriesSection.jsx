/**
 * src/components/home/CategoriesSection.jsx
 *
 * Fetches categories from Firestore and renders a responsive tile grid.
 * Shows skeletons while loading, graceful fallback if Firestore is empty.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCategories } from '../../firebase/products'
import Skeleton from '../common/Skeleton'

// Emoji fallbacks per slug so tiles still look good before images load
const CATEGORY_EMOJI = {
  electronics:  '📱',
  fashion:      '👗',
  'home-living':'🏠',
  beauty:       '💄',
  sports:       '⚽',
  accessories:  '👜',
}

// Static fallback tiles shown when Firestore has no categories yet
const FALLBACK_CATEGORIES = [
  { id: 'electronics',  name: 'Electronics',   slug: 'electronics',   imageURL: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80' },
  { id: 'fashion',      name: 'Fashion',        slug: 'fashion',       imageURL: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80' },
  { id: 'home-living',  name: 'Home & Living',  slug: 'home-living',   imageURL: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
  { id: 'beauty',       name: 'Beauty',         slug: 'beauty',        imageURL: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80' },
  { id: 'sports',       name: 'Sports',         slug: 'sports',        imageURL: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80' },
  { id: 'accessories',  name: 'Accessories',    slug: 'accessories',   imageURL: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80' },
]

function CategoryTile({ category }) {
  const [imgErr, setImgErr] = useState(false)
  const emoji = CATEGORY_EMOJI[category.slug] ?? '🛒'

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-gray-100 aspect-square flex flex-col items-center justify-end shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Background image */}
      {!imgErr && category.imageURL ? (
        <img
          src={category.imageURL}
          alt={category.name}
          onError={() => setImgErr(true)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-4xl">
          {emoji}
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Label */}
      <div className="relative pb-4 text-center">
        <p className="text-white font-semibold text-sm drop-shadow-sm px-2 leading-tight">
          {category.name}
        </p>
      </div>
    </Link>
  )
}

function CategorySkeletons() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-2xl" />
      ))}
    </>
  )
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    let cancelled = false
    getAllCategories()
      .then((data) => {
        if (cancelled) return
        // If Firestore has no categories yet, show fallback tiles
        setCategories(data.length > 0 ? data : FALLBACK_CATEGORIES)
      })
      .catch((err) => {
        console.error('[CategoriesSection]', err)
        if (!cancelled) setCategories(FALLBACK_CATEGORIES)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Browse by
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? <CategorySkeletons />
            : categories.map((cat) => (
                <CategoryTile key={cat.id ?? cat.slug} category={cat} />
              ))
          }
        </div>
      </div>
    </section>
  )
}
