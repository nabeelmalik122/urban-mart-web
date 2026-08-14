/**
 * src/store/cartStore.js
 *
 * Phase 3 — complete cart store with localStorage persistence.
 *
 * Item shape stored in `items` array:
 *   {
 *     productId  : string
 *     title      : string
 *     price      : number
 *     imageURL   : string
 *     quantity   : number
 *     stock      : number   — snapshot at add-time for stock enforcement
 *     category   : string
 *   }
 *
 * Persistence:
 *   Zustand `persist` middleware writes to localStorage under the key
 *   "shopzone-cart".  The cart survives page refresh, navigation, and
 *   browser close/reopen.  Nothing is written to Firestore until the
 *   customer successfully places an order.
 *
 * Backward-compatibility:
 *   The Phase 2 stub stored items as { product: {...}, quantity }.
 *   This store uses a flat shape { productId, title, … , quantity }.
 *   ProductCard and ProductDetailPage call addItem(product, qty) — the
 *   addItem action here accepts the same signature and normalises internally.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

// ─── Helper: build a normalised cart item from a Firestore product object ─────
function toCartItem(product, qty) {
  return {
    productId: product.id,
    title:     product.title     ?? '',
    price:     product.price     ?? 0,
    imageURL:  product.imageURL  ?? '',
    quantity:  qty,
    stock:     product.stock     ?? 99,
    category:  product.category  ?? '',
  }
}

// ─── Shipping rule (single source of truth — also imported by Checkout) ───────
export const FREE_SHIPPING_THRESHOLD = 50
export const SHIPPING_COST           = 5

export function calcShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
}

// ─── Store ────────────────────────────────────────────────────────────────────
const useCartStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      items: [],

      // ── Derived helpers (called as functions to stay reactive) ────────────

      /** Total number of units across all line items. */
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      /** Subtotal before shipping. */
      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),

      /** Shipping cost based on subtotal. */
      shippingCost: () => calcShipping(get().totalPrice()),

      /** Grand total including shipping. */
      grandTotal: () => get().totalPrice() + get().shippingCost(),

      // ── Actions ───────────────────────────────────────────────────────────

      /**
       * Add a product to the cart (or increment if already present).
       * Accepts the full Firestore product object + qty to add.
       * Respects product.stock — clamps and toasts if the limit is hit.
       *
       * Also accepts a pre-shaped cart item (e.g. from persistence rehydration).
       *
       * @param {Object} product  Firestore product OR existing cart item
       * @param {number} qty      Units to add (default 1)
       */
      addItem: (product, qty = 1) => {
        set((state) => {
          // Determine the productId regardless of which shape was passed
          const id    = product.id ?? product.productId
          const stock = product.stock ?? 99

          const existing = state.items.find((i) => i.productId === id)

          if (existing) {
            const newQty = existing.quantity + qty
            if (newQty > stock) {
              toast.error(
                `Only ${stock} available — you already have ${existing.quantity} in your cart.`,
                { id: `stock-limit-${id}` },
              )
              // Clamp to stock
              return {
                items: state.items.map((i) =>
                  i.productId === id ? { ...i, quantity: stock } : i,
                ),
              }
            }
            return {
              items: state.items.map((i) =>
                i.productId === id ? { ...i, quantity: newQty } : i,
              ),
            }
          }

          // New item — clamp requested qty to stock
          const clampedQty = Math.min(qty, stock)
          return { items: [...state.items, toCartItem(product, clampedQty)] }
        })
      },

      /**
       * Remove a line item entirely.
       * @param {string} productId
       */
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      /**
       * Set an exact quantity for a line item.
       * Enforces: qty >= 1 and qty <= stock.
       * Removes the item if qty is set to 0.
       * @param {string} productId
       * @param {number} qty
       */
      updateQty: (productId, qty) => {
        const item = get().items.find((i) => i.productId === productId)
        if (!item) return

        if (qty <= 0) {
          get().removeItem(productId)
          return
        }

        const clamped = Math.min(qty, item.stock)
        if (clamped < qty) {
          toast.error(`Only ${item.stock} available.`, { id: `stock-limit-${productId}` })
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: clamped } : i,
          ),
        }))
      },

      /** Increment a line item by 1 (capped at stock). */
      increaseQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId)
        if (!item) return
        get().updateQty(productId, item.quantity + 1)
      },

      /** Decrement a line item by 1 (minimum 1). */
      decreaseQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId)
        if (!item) return
        get().updateQty(productId, item.quantity - 1)
      },

      /** Clear all items (called after a successful order). */
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'urbanmart-cart',   // localStorage key
      // Only persist the items array — derived functions are not serialisable
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export default useCartStore
