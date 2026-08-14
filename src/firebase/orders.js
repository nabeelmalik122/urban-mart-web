/**
 * src/firebase/orders.js
 *
 * All Firestore order operations.
 * Components must never call Firestore directly — import from this file.
 *
 * Firestore collection:
 *   orders/{orderId}
 *     userId        : string          — Firebase UID (primary identity key)
 *     customerInfo  : {
 *       name, email, phone, address, city, postalCode, notes
 *     }
 *     items         : [
 *       { productId, title, price, imageURL, quantity }
 *     ]
 *     subtotal      : number
 *     shipping      : number
 *     total         : number
 *     status        : "Pending" | "Processing" | "Shipped" | "Delivered"
 *     createdAt     : Timestamp
 *
 * Security note:
 *   Prices come from the client-side cart snapshot.  For a competition build
 *   this is acceptable.  Production hardening would move price validation to a
 *   Cloud Function.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const ORDERS_COL = 'orders'

// ─── Normaliser ───────────────────────────────────────────────────────────────
function snapToOrder(snap) {
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Write a new order document to Firestore.
 *
 * @param {{
 *   userId       : string,
 *   customerInfo : { name, email, phone, address, city, postalCode, notes },
 *   items        : Array<{ productId, title, price, imageURL, quantity }>,
 *   subtotal     : number,
 *   shipping     : number,
 *   total        : number,
 * }} orderData
 * @returns {Promise<string>} the new order document ID
 */
export async function createOrder(orderData) {
  const ref = await addDoc(collection(db, ORDERS_COL), {
    ...orderData,
    status:    'Pending',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetch a single order by ID.
 * Returns null if the document does not exist.
 *
 * CALLER MUST verify order.userId === currentUser.uid before rendering.
 *
 * @param {string} orderId
 * @returns {Promise<Object|null>}
 */
export async function getOrderById(orderId) {
  const snap = await getDoc(doc(db, ORDERS_COL, orderId))
  return snapToOrder(snap)
}

/**
 * Fetch all orders belonging to a specific user, newest first.
 *
 * @param {string} userId  — Firebase UID
 * @returns {Promise<Object[]>}
 */
export async function getUserOrders(userId) {
  const q    = query(
    collection(db, ORDERS_COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(snapToOrder)
}
