/**
 * src/pages/admin/products/AdminProductForm.jsx
 *
 * Shared form for both Add (/admin/products/new) and Edit (/admin/products/:id/edit).
 * Determines mode from useParams — if productId is present, it's edit mode.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAdminProductById, createProduct, updateProduct } from '../../../firebase/admin'
import Skeleton from '../../../components/common/Skeleton'

const CATEGORIES = [
  { value: 'electronics',  label: 'Electronics' },
  { value: 'fashion',      label: 'Fashion' },
  { value: 'home-living',  label: 'Home & Living' },
  { value: 'beauty',       label: 'Beauty' },
  { value: 'sports',       label: 'Sports' },
  { value: 'accessories',  label: 'Accessories' },
]

const EMPTY_FORM = {
  title: '', description: '', price: '', category: '',
  imageURL: '', stock: '', rating: '', reviewCount: '', featured: false,
}

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="text-xs text-red-500 mt-1 ml-1">{msg}</p>
}

const inputClass = 'w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all'
const errClass   = 'w-full px-4 py-2.5 text-sm bg-red-50 border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all'

function validate(form) {
  const e = {}
  if (!form.title.trim())         e.title       = 'Title is required.'
  if (!form.description.trim())   e.description = 'Description is required.'
  if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
                                  e.price       = 'Enter a valid price (≥ 0).'
  if (!form.category)             e.category    = 'Please select a category.'
  if (!form.imageURL.trim())      e.imageURL    = 'Image URL is required.'
  if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0)
                                  e.stock       = 'Enter a valid stock quantity (≥ 0).'
  return e
}

// ─── Live image preview ────────────────────────────────────────────────────────
function ImagePreview({ url }) {
  const [err, setErr] = useState(false)

  useEffect(() => { setErr(false) }, [url])

  if (!url) {
    return (
      <div className="w-full h-44 rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
        <ImageIcon size={28} />
        <p className="text-xs mt-2">Image preview</p>
      </div>
    )
  }
  if (err) {
    return (
      <div className="w-full h-44 rounded-xl bg-red-50 flex flex-col items-center justify-center text-red-300 border border-red-200">
        <ImageIcon size={28} />
        <p className="text-xs mt-2 text-red-400">Invalid image URL</p>
      </div>
    )
  }
  return (
    <img
      src={url} alt="Preview" onError={() => setErr(true)}
      className="w-full h-44 object-cover rounded-xl border border-gray-200"
    />
  )
}

// ─── Form field wrapper ────────────────────────────────────────────────────────
function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  )
}

export default function AdminProductForm() {
  const { productId } = useParams()
  const isEdit   = Boolean(productId)
  const navigate = useNavigate()

  const [form,       setForm]       = useState(EMPTY_FORM)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(isEdit)

  // Load existing product in edit mode
  useEffect(() => {
    if (!isEdit) return
    setLoadingExisting(true)
    getAdminProductById(productId)
      .then((p) => {
        if (!p) { toast.error('Product not found.'); navigate('/admin/products'); return }
        setForm({
          title:       p.title       ?? '',
          description: p.description ?? '',
          price:       p.price?.toString() ?? '',
          category:    p.category    ?? '',
          imageURL:    p.imageURL    ?? '',
          stock:       p.stock?.toString() ?? '',
          rating:      p.rating?.toString() ?? '',
          reviewCount: p.reviewCount?.toString() ?? '',
          featured:    p.featured    ?? false,
        })
      })
      .catch(() => { toast.error('Unable to load product.'); navigate('/admin/products') })
      .finally(() => setLoadingExisting(false))
  }, [productId, isEdit, navigate])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((ev) => ({ ...ev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      price:       parseFloat(form.price),
      category:    form.category,
      imageURL:    form.imageURL.trim(),
      stock:       parseInt(form.stock, 10),
      featured:    form.featured,
      rating:      form.rating      ? parseFloat(form.rating)      : null,
      reviewCount: form.reviewCount ? parseInt(form.reviewCount, 10) : null,
    }

    try {
      if (isEdit) {
        await updateProduct(productId, payload)
        toast.success('Product updated successfully.')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully.')
      }
      navigate('/admin/products')
    } catch (err) {
      console.error('[AdminProductForm]', err)
      toast.error(isEdit ? 'Unable to update product.' : 'Unable to create product.')
      setSubmitting(false)
    }
  }

  if (loadingExisting) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-5"
      >
        <ArrowLeft size={15} />
        Back to Products
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isEdit ? 'Update product details below.' : 'Fill in the details to add a new product to the catalog.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-5">
              <FormField label="Title" required error={errors.title}>
                <input name="title" type="text" value={form.title} onChange={handleChange}
                  placeholder="e.g. Wireless Headphones Pro"
                  className={errors.title ? errClass : inputClass} disabled={submitting} />
              </FormField>

              <FormField label="Category" required error={errors.category}>
                <select name="category" value={form.category} onChange={handleChange}
                  className={`${errors.category ? errClass : inputClass} cursor-pointer`} disabled={submitting}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Price ($)" required error={errors.price}>
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange}
                    placeholder="0.00" className={errors.price ? errClass : inputClass} disabled={submitting} />
                </FormField>
                <FormField label="Stock" required error={errors.stock}>
                  <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange}
                    placeholder="0" className={errors.stock ? errClass : inputClass} disabled={submitting} />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Rating" error={errors.rating}>
                  <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange}
                    placeholder="4.5" className={inputClass} disabled={submitting} />
                </FormField>
                <FormField label="Review Count" error={errors.reviewCount}>
                  <input name="reviewCount" type="number" min="0" step="1" value={form.reviewCount} onChange={handleChange}
                    placeholder="0" className={inputClass} disabled={submitting} />
                </FormField>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                  disabled={submitting}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    form.featured ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.featured ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Featured product
                  <span className="ml-1.5 text-xs text-gray-400">(shows in Featured section)</span>
                </span>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <FormField label="Image URL" required error={errors.imageURL}>
                <input name="imageURL" type="url" value={form.imageURL} onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={errors.imageURL ? errClass : inputClass} disabled={submitting} />
              </FormField>

              {/* Live image preview */}
              <ImagePreview url={form.imageURL} />
            </div>
          </div>

          {/* Description — full width */}
          <FormField label="Description" required error={errors.description}>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the product in detail…"
              rows={4} className={`${errors.description ? errClass : inputClass} resize-none`} disabled={submitting} />
          </FormField>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link
              to="/admin/products"
              className="flex-1 sm:flex-none sm:w-28 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit" disabled={submitting}
              className={`flex-1 sm:flex-none sm:w-40 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all
                ${submitting ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'}`}
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" />{isEdit ? 'Saving…' : 'Creating…'}</>
              ) : (
                isEdit ? 'Save Changes' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
