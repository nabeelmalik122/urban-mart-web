/**
 * src/pages/admin/AdminLayout.jsx
 *
 * Shell layout wrapping all admin pages.
 * Renders sidebar + header + main content area.
 * Nested routes render via <Outlet />.
 */

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader  from '../../components/admin/AdminHeader'

// Derive a readable page title from the current path
function getPageMeta(pathname) {
  if (pathname === '/admin')                        return { title: 'Dashboard',        breadcrumb: ['Admin'] }
  if (pathname.startsWith('/admin/products/new'))   return { title: 'Add Product',      breadcrumb: ['Admin', 'Products', 'New'] }
  if (pathname.includes('/admin/products/') && pathname.endsWith('/edit'))
                                                    return { title: 'Edit Product',     breadcrumb: ['Admin', 'Products', 'Edit'] }
  if (pathname.startsWith('/admin/products'))       return { title: 'Products',         breadcrumb: ['Admin', 'Products'] }
  if (pathname.startsWith('/admin/orders/'))        return { title: 'Order Details',    breadcrumb: ['Admin', 'Orders', 'Detail'] }
  if (pathname.startsWith('/admin/orders'))         return { title: 'Orders',           breadcrumb: ['Admin', 'Orders'] }
  if (pathname.startsWith('/admin/customers'))      return { title: 'Customers',        breadcrumb: ['Admin', 'Customers'] }
  if (pathname.startsWith('/admin/settings'))       return { title: 'Settings',         breadcrumb: ['Admin', 'Settings'] }
  return { title: 'Admin', breadcrumb: ['Admin'] }
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { title, breadcrumb } = getPageMeta(location.pathname)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main area — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">
        <AdminHeader
          title={title}
          breadcrumb={breadcrumb}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
