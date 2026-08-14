/**
 * src/pages/home/Home.jsx
 *
 * Phase 2 storefront homepage.
 * Replaces the Phase 1 placeholder entirely.
 * Auth state comes from the existing Zustand authStore — nothing new added here.
 *
 * Structure:
 *   <Navbar />
 *   <Hero />
 *   <CategoriesSection />
 *   <FeaturedProducts />
 *   <PromoSection />
 *   <NewsletterBanner />   ← lightweight inline component, no backend
 *   <Footer />
 */

import Navbar            from '../../components/common/Navbar'
import Footer            from '../../components/common/Footer'
import Hero              from '../../components/home/Hero'
import CategoriesSection from '../../components/home/CategoriesSection'
import FeaturedProducts  from '../../components/home/FeaturedProducts'
import PromoSection      from '../../components/home/PromoSection'
import NewsletterBanner  from '../../components/home/NewsletterBanner'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <CategoriesSection />
        <FeaturedProducts />
        <PromoSection />
        <NewsletterBanner />
      </main>

      <Footer />
    </div>
  )
}
