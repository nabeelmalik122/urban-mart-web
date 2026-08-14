/**
 * src/pages/admin/customers/AdminCustomers.jsx
 * /admin/customers — registered customer list.
 */

import { useEffect, useState } from 'react'
import { Search, X, Users } from 'lucide-react'
import { getCustomers } from '../../../firebase/admin'
import AdminTableSkeleton from '../../../components/admin/AdminTableSkeleton'

function Avatar({ user }) {
  const [err, setErr] = useState(false)
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? 'U').toUpperCase()

  if (!err && user.photoURL) {
    return <img src={user.photoURL} alt={user.name} onError={() => setErr(true)}
      className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${user.role === 'admin' ? 'bg-orange-500' : 'bg-blue-600'}`}>
      {initials}
    </div>
  )
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')

  function loadCustomers() {
    setLoading(true); setError(null)
    getCustomers()
      .then((c) => { setCustomers(c); setFiltered(c) })
      .catch((err) => { console.error('[AdminCustomers]', err); setError('Unable to load customers.') })
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadCustomers() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(customers); return }
    const t = search.trim().toLowerCase()
    setFiltered(customers.filter((c) =>
      c.name?.toLowerCase().includes(t) ||
      c.email?.toLowerCase().includes(t),
    ))
  }, [search, customers])

  const customerCount = customers.filter((c) => c.role !== 'admin').length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500">{customerCount} registered customer{customerCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Stats mini card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-900">{loading ? '—' : customerCount}</p>
            <p className="text-xs text-gray-400">Total customers</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="px-5 py-16 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={loadCustomers} className="text-xs font-semibold text-blue-600 hover:underline">Try again</button>
          </div>
        ) : loading ? (
          <AdminTableSkeleton rows={5} cols={5} />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-600 font-semibold mb-1">No customers found</p>
            <p className="text-gray-400 text-sm">{search ? 'Try a different search.' : 'Customers will appear here after they register.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Customer', 'Email', 'Role', 'Joined', 'UID'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={c} />
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">
                          {c.name || '(no name)'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 max-w-[160px] truncate">{c.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.role === 'admin'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {c.role ?? 'customer'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {c.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-400 truncate max-w-[100px]">
                      {c.uid?.slice(0, 10) ?? '—'}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {customers.length} users
          </div>
        )}
      </div>
    </div>
  )
}
