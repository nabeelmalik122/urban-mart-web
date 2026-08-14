/**
 * src/firebase/admin.js
 *
 * All Firestore operations used exclusively by the Admin Dashboard.
 * Imports `db` from the existing config — no second Firebase initialization.
 *
 * Collections accessed:
 *   products/{productId}
 *   orders/{orderId}
 *   users/{uid}
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

// ─── Normalisers ──────────────────────────────────────────────────────────────
function toProduct(snap) {
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id, ...d,
    createdAt: d.createdAt?.toDate?.() ?? null,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
  }
}

function toOrder(snap) {
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id, ...d,
    createdAt:  d.createdAt?.toDate?.()  ?? null,
    updatedAt:  d.updatedAt?.toDate?.()  ?? null,
  }
}

function toUser(snap) {
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id, ...d,
    createdAt: d.createdAt?.toDate?.() ?? null,
  }
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

/**
 * Returns aggregate statistics for the dashboard overview.
 * Makes 3 parallel Firestore reads (products, orders, users).
 */
export async function getAdminStats() {
  const [productSnap, orderSnap, userSnap] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'users')),
  ])

  const orders = orderSnap.docs.map((s) => s.data())

  const totalSales = orders.reduce((sum, o) => {
    // Count all non-cancelled orders toward sales
    if (o.status !== 'Cancelled') sum += o.total ?? 0
    return sum
  }, 0)

  const recentOrders = orderSnap.docs
    .map(toOrder)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 5)

  return {
    totalProducts:  productSnap.size,
    totalOrders:    orderSnap.size,
    totalCustomers: userSnap.docs.filter((s) => s.data().role !== 'admin').length,
    totalSales,
    recentOrders,
  }
}

// ─── Products ──────────────────────────────────────────────────────────────────

export async function getAdminProducts() {
  const q    = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(toProduct)
}

export async function getAdminProductById(productId) {
  const snap = await getDoc(doc(db, 'products', productId))
  return toProduct(snap)
}

/**
 * Create a new product. Caller provides all fields except timestamps.
 * @param {Object} data
 * @returns {Promise<string>} new document ID
 */
export async function createProduct(data) {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Update an existing product. Sets updatedAt automatically.
 * @param {string} productId
 * @param {Object} data  — partial update fields
 */
export async function updateProduct(productId, data) {
  await updateDoc(doc(db, 'products', productId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Permanently delete a product document.
 * @param {string} productId
 */
export async function deleteProduct(productId) {
  await deleteDoc(doc(db, 'products', productId))
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export async function getAdminOrders() {
  const q    = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(toOrder)
}

export async function getAdminOrder(orderId) {
  const snap = await getDoc(doc(db, 'orders', orderId))
  return toOrder(snap)
}

/**
 * Update order status. Adds updatedAt timestamp.
 * Does NOT create a new document.
 * @param {string} orderId
 * @param {string} status  — "Pending" | "Processing" | "Shipped" | "Delivered"
 */
export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getCustomers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map(toUser)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}
