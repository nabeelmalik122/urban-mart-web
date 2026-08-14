/**
 * src/pages/products/ProductDetailPage.jsx
 *
 * Single product detail page — route: /products/:productId
 *
 * Shows full product info, quantity selector, add-to-cart (cartStore stub),
 * and a "Related products" row (same category, excludes current product).
 */

import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Package,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
  Tag,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getProductById, getAllProducts } from '../../firebase/products'
import useCartStore from '../../store/cartStore'
import Navbar          from '../../components/common/Navbar'
import Footer          from '../../components/common/Footer'
import Skeleton        from '../../components/common/Skeleton'
import ErrorState      from '../../components/common/ErrorState'
import ProductCard     from '../../components/product/ProductCard'
import ProductSkeleton from '../../components/product/ProductSkeleton'

// ─── Category label map ───────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  electronics:  'Electronics',
  fashion:      'Fashion',
  'home-living':'Home & Living',
  beauty:       'Beauty',
  sports:       'Sports',
  accessories:  'Accessories',
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRow({ rating, reviewCount }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-200 fill-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      {reviewCount != null && (
        <span className="text-sm text-gray-400">({reviewCount} reviews)</span>
      )}
    </div>
  )
}

// ─── Quantity selector ────────────────────────────────────────────────────────
function QtySelector({ value, onChange, max }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-600">Quantity</span>
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="w-10 text-center text-sm font-semibold text-gray-800 select-none">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
          aria-label="Increase quantity"
          disabled={value >= max}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Skeleton for the detail page ─────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-5 w-32 rounded-full mb-8" />
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-8 w-1/2 rounded-xl" />
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Related products row ─────────────────────────────────────────────────────
function RelatedProducts({ currentId, category }) {
  const [related,  setRelated]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!category) { setLoading(false); return }
    getAllProducts()
      .then((all) => {
        setRelated(
          all
            .filter((p) => p.category === category && p.id !== currentId)
            .slice(0, 4),
        )
      })
      .catch(() => setRelated([]))
      .finally(() => setLoading(false))
  }, [currentId, category])

  if (!loading && related.length === 0) return null

  return (
    <div className="mt-16">
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">
        You might also like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          : related.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { productId } = useParams()
  const navigate      = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)

  const [product,  setProduct]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [qty,      setQty]      = useState(1)
  const [imgErr,   setImgErr]   = useState(false)
  const [adding,   setAdding]   = useState(false)

  function loadProduct() {
    setLoading(true)
    setError(null)
    getProductById(productId)
      .then((p) => {
        if (!p) { setError('Product not found.'); return }
        setProduct(p)
      })
      .catch((err) => {
        console.error('[ProductDetailPage]', err)
        setError('Unable to load product details.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    loadProduct()
  }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAddToCart() {
    if (!product || adding) return
    const cartItem  = cartItems.find((i) => i.productId === product.id)
    const cartQty   = cartItem?.quantity ?? 0
    if (cartQty + qty > product.stock) {
      toast.error(`Only ${product.stock} in stock — you already have ${cartQty} in your cart.`)
      return
    }
    setAdding(true)
    addItem(product, qty)
    toast.success(`${qty}× "${product.title}" added to cart!`, { duration: 2500 })
    setTimeout(() => setAdding(false), 700)
  }

  const inStock = product?.stock > 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <ErrorState message={error} onRetry={loadProduct} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

            {/* ── Breadcrumb / back link ── */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8"
            >
              <ArrowLeft size={15} />
              Back to products
            </button>

            {/* ── Product layout ── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">

                {/* ── Image panel ── */}
                <div className="bg-gray-50 flex items-center justify-center p-5 sm:p-8 lg:p-12 min-h-[260px] sm:min-h-[320px] lg:min-h-[380px]">
                  {!imgErr && product.imageURL ? (
                    <img
                      src={product.imageURL}
                      alt={product.title}
                      onError={() => setImgErr(true)}
                      className="max-w-full max-h-[460px] object-contain rounded-2xl"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-6xl text-gray-200">
                      🛍️
                    </div>
                  )}
                </div>

                {/* ── Info panel ── */}
                <div className="p-5 sm:p-8 lg:p-12 flex flex-col">

                  {/* Category breadcrumb */}
                  <Link
                    to={`/products?category=${product.category}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-4 hover:bg-blue-100 transition-colors"
                  >
                    <Tag size={11} />
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </Link>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                    {product.title}
                  </h1>

                  {/* Rating */}
                  <div className="mb-4">
                    <StarRow rating={product.rating} reviewCount={product.reviewCount} />
                  </div>

                  {/* Price */}
                  <p className="text-3xl font-extrabold text-gray-900 mb-4">
                    ${product.price?.toFixed(2)}
                  </p>

                  {/* Stock status */}
                  <div className="flex items-center gap-2 mb-5">
                    {inStock ? (
                      <>
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span className="text-sm text-emerald-600 font-medium">
                          {product.stock > 10
                            ? 'In stock'
                            : `Only ${product.stock} left in stock`}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-400" />
                        <span className="text-sm text-red-500 font-medium">
                          Out of stock
                        </span>
                      </>
                    )}
                    <span className="text-gray-200">•</span>
                    <Package size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400">Free shipping over $50</span>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 border-t border-gray-100 pt-5">
                      {product.description}
                    </p>
                  )}

                  {/* Qty + CTA */}
                  {inStock && (
                    <div className="space-y-4 mt-auto">
                      <QtySelector
                        value={qty}
                        onChange={setQty}
                        max={Math.min(product.stock, 10)}
                      />

                      <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all
                          ${adding
                            ? 'bg-emerald-500 text-white scale-[0.98]'
                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0'
                          }`}
                      >
                        <ShoppingCart size={18} />
                        {adding ? 'Added to cart!' : 'Add to cart'}
                      </button>

                      <Link
                        to="/products"
                        className="block text-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        ← Continue shopping
                      </Link>
                    </div>
                  )}

                  {!inStock && (
                    <div className="mt-auto pt-4">
                      <div className="w-full py-4 rounded-2xl bg-gray-100 text-center text-sm font-semibold text-gray-400 cursor-not-allowed">
                        Currently unavailable
                      </div>
                      <Link
                        to="/products"
                        className="block text-center mt-3 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        ← Browse other products
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Related products ── */}
            <RelatedProducts currentId={product.id} category={product.category} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
