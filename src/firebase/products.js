/**
 * src/firebase/products.js
 *
 * All Firestore product + category queries live here.
 * UI components must never call Firestore directly — import from this file.
 *
 * Firestore collections:
 *   products/{productId}   — fields: title, description, price, category,
 *                            imageURL, stock, featured, rating, reviewCount,
 *                            createdAt, updatedAt
 *   categories/{categoryId} — fields: name, slug, imageURL
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from './config'

// ─── Collection refs ──────────────────────────────────────────────────────────
const PRODUCTS_COL   = 'products'
const CATEGORIES_COL = 'categories'

// ─── Normaliser ───────────────────────────────────────────────────────────────
/**
 * Converts a Firestore snapshot into a plain JS object.
 * Converts Firestore Timestamps → JS Date so components don't have to
 * know about the Timestamp type.
 *
 * @param {import('firebase/firestore').DocumentSnapshot} snap
 * @returns {Object|null}
 */
function snapToProduct(snap) {
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  }
}

function snapToCategory(snap) {
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

// ─── Product queries ──────────────────────────────────────────────────────────

/**
 * Fetch all products, ordered by createdAt descending.
 * @returns {Promise<Object[]>}
 */
export async function getAllProducts() {
  const q    = query(collection(db, PRODUCTS_COL), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(snapToProduct)
}

/**
 * Fetch only products where featured == true, capped at 8.
 * @returns {Promise<Object[]>}
 */
export async function getFeaturedProducts() {
  const q    = query(
    collection(db, PRODUCTS_COL),
    where('featured', '==', true),
    orderBy('createdAt', 'desc'),
    limit(8),
  )
  const snap = await getDocs(q)
  return snap.docs.map(snapToProduct)
}

/**
 * Fetch a single product by its Firestore document ID.
 * @param {string} productId
 * @returns {Promise<Object|null>}
 */
export async function getProductById(productId) {
  const snap = await getDoc(doc(db, PRODUCTS_COL, productId))
  return snapToProduct(snap)
}

/**
 * Fetch products belonging to a specific category slug.
 * @param {string} categorySlug
 * @returns {Promise<Object[]>}
 */
export async function getProductsByCategory(categorySlug) {
  const q    = query(
    collection(db, PRODUCTS_COL),
    where('category', '==', categorySlug),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(snapToProduct)
}

/**
 * Client-side search: filters an already-loaded product array by title.
 * Firestore does not support case-insensitive contains queries natively.
 * For a dataset of reasonable size (< ~1000 products), this is fast enough.
 *
 * @param {Object[]} products   — already-fetched product array
 * @param {string}   searchTerm
 * @returns {Object[]}
 */
export function filterProductsBySearch(products, searchTerm) {
  const term = searchTerm.trim().toLowerCase()
  if (!term) return products
  return products.filter(
    (p) =>
      p.title?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term),
  )
}

/**
 * Client-side sort.
 * @param {Object[]} products
 * @param {'featured'|'price_asc'|'price_desc'|'name_asc'|'name_desc'} sortKey
 * @returns {Object[]}
 */
export function sortProducts(products, sortKey) {
  const arr = [...products]
  switch (sortKey) {
    case 'price_asc':
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    case 'price_desc':
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    case 'name_asc':
      return arr.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
    case 'name_desc':
      return arr.sort((a, b) => (b.title ?? '').localeCompare(a.title ?? ''))
    case 'featured':
    default:
      // Featured first, then by createdAt desc
      return arr.sort((a, b) => {
        if (b.featured && !a.featured) return 1
        if (a.featured && !b.featured) return -1
        return (b.createdAt ?? 0) - (a.createdAt ?? 0)
      })
  }
}

// ─── Category queries ─────────────────────────────────────────────────────────

/**
 * Fetch all categories, ordered by name.
 * @returns {Promise<Object[]>}
 */
export async function getAllCategories() {
  const q    = query(collection(db, CATEGORIES_COL), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map(snapToCategory)
}

// ─── Seed helpers (called only from the /dev/seed page) ──────────────────────

/**
 * Write a single product document.  Used by the dev seed page only.
 * @param {Object} productData
 * @returns {Promise<string>} the new document ID
 */
export async function seedProduct(productData) {
  const ref = await addDoc(collection(db, PRODUCTS_COL), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Write a single category document with a known ID (slug used as doc ID).
 * @param {string} slug
 * @param {Object} categoryData
 */
export async function seedCategory(slug, categoryData) {
  await setDoc(doc(db, CATEGORIES_COL, slug), categoryData)
}
