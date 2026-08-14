/**
 * src/pages/admin/products/AdminProducts.jsx
 *
 * /admin/products — product catalog management table.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Star, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAdminProducts, deleteProduct } from '../../../firebase/admin'
import AdminTableSkeleton  from '../../../components/admin/AdminTableSkeleton'
import AdminConfirmDialog  from '../../../components/admin/AdminConfirmDialog'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const CATEGORIES = ['', 'electronics', 'fashion', 'home-living', 'beauty', 'sports', 'accessories']
const CAT_LABELS = {
  '': 'All Categories',
  electronics: 'Electronics', fashion: 'Fashion', 'home-living': 'Home & Living',
  beauty: 'Beauty', sports: 'Sports', accessories: 'Accessories',
}

function ProductImage({ url, title }) {
  const [err, setErr] = useState(false)
  if (!err && url) {
    return (
      <img src={url} alt={title} onError={() => setErr(true)}
        className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
    )
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
      🛍️
    </div>
  )
}

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [deleteId,   setDeleteId]   = useState(null)
  const [deleting,   setDeleting]   = useState(false)

  function loadProducts() {
    setLoading(true)
    setError(null)
    getAdminProducts()
      .then((p) => { setProducts(p); setFiltered(p) })
      .catch((err) => {
        console.error('[AdminProducts]', err)
        setError('Unable to load products.')
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadProducts() }, [])

  // Client-side filter
  useEffect(() => {
    let list = products
    if (category) list = list.filter((p) => p.category === category)
    if (search.trim()) {
      const t = search.trim().toLowerCase()
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(t) ||
        p.category?.toLowerCase().includes(t),
      )
    }
    setFiltered(list)
  }, [search, category, products])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteProduct(deleteId)
      setProducts((prev) => prev.filter((p) => p.id !== deleteId))
      toast.success('Product deleted successfully.')
    } catch (err) {
      console.error('[AdminProducts delete]', err)
      toast.error('Unable to delete product.')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">Manage your UrbanMart catalog</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={category} onChange={(e) => setCategory(e.target.value)}
          className="py-2.5 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="px-5 py-16 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={loadProducts} className="text-xs font-semibold text-blue-600 hover:underline">
              Try again
            </button>
          </div>
        ) : loading ? (
          <AdminTableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-600 font-semibold mb-1">No products found</p>
            <p className="text-gray-400 text-sm mb-4">
              {search || category ? 'Try adjusting your filters.' : 'Start by adding your first product.'}
            </p>
            {!search && !category && (
              <Link to="/admin/products/new" className="text-sm font-semibold text-blue-600 hover:underline">
                + Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Rating', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <ProductImage url={p.imageURL} title={p.title} />
                        <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[160px]">{p.title}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium capitalize">
                        {CAT_LABELS[p.category] ?? p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{fmt(p.price ?? 0)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.stock > 10 ? 'bg-emerald-50 text-emerald-700' :
                        p.stock > 0  ? 'bg-yellow-50 text-yellow-700'   :
                                       'bg-red-50 text-red-600'
                      }`}>
                        {p.stock > 0 ? p.stock : 'Out'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.featured
                        ? <span className="text-yellow-500">★</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="py-3 px-4">
                      {p.rating ? (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          {p.rating.toFixed(1)}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Pencil size={11} />
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={11} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Count footer */}
        {!loading && !error && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {products.length} products
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AdminConfirmDialog
        open={!!deleteId}
        title="Delete Product?"
        message="This will permanently remove the product from your catalog. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
