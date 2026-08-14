/**
 * src/utils/seedData.js
 *
 * DEV-ONLY seed data for the ShopZone storefront.
 *
 * This file is imported ONLY by src/pages/dev/SeedPage.jsx.
 * It is NOT imported anywhere else and will be tree-shaken out of
 * production builds automatically.
 *
 * Images use Unsplash Source URLs (reliable, no API key required).
 * Replace with Firebase Storage URLs once the Admin upload feature ships.
 *
 * HOW TO USE:
 *   1. Run the dev server  →  navigate to /dev/seed
 *   2. Click "Seed Categories" then "Seed Products"
 *   3. Refresh /  →  products and categories should appear
 *   4. After seeding, the page checks for existing docs to prevent duplicates
 *
 * TO REMOVE:
 *   Delete this file and src/pages/dev/SeedPage.jsx, then remove the
 *   /dev/seed route from App.jsx.
 */

export const SEED_CATEGORIES = [
  {
    slug:     'electronics',
    name:     'Electronics',
    imageURL: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
  },
  {
    slug:     'fashion',
    name:     'Fashion',
    imageURL: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
  },
  {
    slug:     'home-living',
    name:     'Home & Living',
    imageURL: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  },
  {
    slug:     'beauty',
    name:     'Beauty',
    imageURL: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
  },
  {
    slug:     'sports',
    name:     'Sports',
    imageURL: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
  },
  {
    slug:     'accessories',
    name:     'Accessories',
    imageURL: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80',
  },
]

export const SEED_PRODUCTS = [
  // ── Electronics ────────────────────────────────────────────────────────────
  {
    title:       'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with 30-hour battery life, active noise cancellation, and Hi-Res audio support. Perfect for travel, work, or commuting.',
    price:       129.99,
    category:    'electronics',
    imageURL:    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    stock:       45,
    featured:    true,
    rating:      4.7,
    reviewCount: 312,
  },
  {
    title:       'Smart Watch Series X',
    description: 'Track your fitness, receive notifications, and monitor your health metrics with a vivid AMOLED display. Water resistant to 50m.',
    price:       249.99,
    category:    'electronics',
    imageURL:    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    stock:       22,
    featured:    true,
    rating:      4.5,
    reviewCount: 198,
  },
  {
    title:       'Portable Bluetooth Speaker',
    description: '360° surround sound with 24-hour playtime. IPX7 waterproof rating, built-in microphone, and USB-C fast charging.',
    price:       79.99,
    category:    'electronics',
    imageURL:    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
    stock:       60,
    featured:    false,
    rating:      4.3,
    reviewCount: 87,
  },
  {
    title:       'USB-C Laptop Hub 7-in-1',
    description: 'Expand your laptop\'s connectivity with HDMI 4K, 3×USB-A, SD card reader, and 100W PD charging — all in a slim aluminium body.',
    price:       49.99,
    category:    'electronics',
    imageURL:    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    stock:       110,
    featured:    false,
    rating:      4.6,
    reviewCount: 441,
  },
  // ── Fashion ────────────────────────────────────────────────────────────────
  {
    title:       'Classic Slim-Fit Chinos',
    description: 'Versatile everyday chinos in a modern slim cut. Made from stretch-cotton blend for all-day comfort. Available in 5 colours.',
    price:       59.99,
    category:    'fashion',
    imageURL:    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    stock:       80,
    featured:    true,
    rating:      4.4,
    reviewCount: 156,
  },
  {
    title:       'Oversized Graphic Tee',
    description: 'Soft 100% cotton oversized tee with premium screen-printed artwork. Pre-shrunk, machine washable.',
    price:       29.99,
    category:    'fashion',
    imageURL:    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    stock:       200,
    featured:    false,
    rating:      4.2,
    reviewCount: 93,
  },
  {
    title:       'Minimalist Leather Sneakers',
    description: 'Clean, modern silhouette in full-grain leather with cushioned insoles. Goes from the office to the weekend effortlessly.',
    price:       119.99,
    category:    'fashion',
    imageURL:    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    stock:       35,
    featured:    true,
    rating:      4.8,
    reviewCount: 267,
  },
  // ── Home & Living ──────────────────────────────────────────────────────────
  {
    title:       'Ceramic Pour-Over Coffee Set',
    description: 'Hand-crafted ceramic dripper with matching mug and bamboo stand. Brews a rich, clean cup every time.',
    price:       44.99,
    category:    'home-living',
    imageURL:    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    stock:       55,
    featured:    true,
    rating:      4.9,
    reviewCount: 188,
  },
  {
    title:       'Scented Soy Candle Set',
    description: 'Set of 3 hand-poured soy wax candles in signature ShopZone scents: Sandalwood, Sea Breeze, and Vanilla Amber. 40-hour burn time each.',
    price:       34.99,
    category:    'home-living',
    imageURL:    'https://images.unsplash.com/photo-1602178506468-1c744dbce85a?w=600&q=80',
    stock:       90,
    featured:    false,
    rating:      4.6,
    reviewCount: 74,
  },
  {
    title:       'Bamboo Desk Organiser',
    description: 'Keep your workspace tidy with this eco-friendly bamboo organiser featuring 6 compartments for pens, cables, and stationery.',
    price:       27.99,
    category:    'home-living',
    imageURL:    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=80',
    stock:       70,
    featured:    false,
    rating:      4.3,
    reviewCount: 52,
  },
  // ── Beauty ─────────────────────────────────────────────────────────────────
  {
    title:       'Vitamin C Brightening Serum',
    description: '15% stabilised Vitamin C + Hyaluronic Acid serum for visibly brighter, firmer skin. Dermatologist tested, fragrance-free.',
    price:       38.99,
    category:    'beauty',
    imageURL:    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    stock:       120,
    featured:    true,
    rating:      4.7,
    reviewCount: 502,
  },
  {
    title:       'Matte Lipstick Collection',
    description: 'Long-wearing matte formula in 12 bold shades. Enriched with Vitamin E for comfortable all-day wear. Vegan and cruelty-free.',
    price:       19.99,
    category:    'beauty',
    imageURL:    'https://images.unsplash.com/photo-1586495777744-4e6232bf4e2b?w=600&q=80',
    stock:       150,
    featured:    false,
    rating:      4.4,
    reviewCount: 210,
  },
  // ── Sports ─────────────────────────────────────────────────────────────────
  {
    title:       'Pro Resistance Band Set',
    description: 'Set of 5 heavy-duty latex resistance bands (10–50 lb). Includes carry bag, door anchor, and exercise guide.',
    price:       24.99,
    category:    'sports',
    imageURL:    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
    stock:       200,
    featured:    false,
    rating:      4.5,
    reviewCount: 378,
  },
  {
    title:       'Yoga Mat — 6mm Non-Slip',
    description: 'Eco-friendly TPE yoga mat with alignment lines, high-density cushioning, and a microfibre non-slip surface. 183×61 cm.',
    price:       39.99,
    category:    'sports',
    imageURL:    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
    stock:       85,
    featured:    true,
    rating:      4.6,
    reviewCount: 145,
  },
  // ── Accessories ───────────────────────────────────────────────────────────
  {
    title:       'Slim Minimalist Wallet',
    description: 'RFID-blocking cardholder wallet in full-grain leather. Holds 6 cards and cash. Fits flat in any pocket.',
    price:       35.99,
    category:    'accessories',
    imageURL:    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    stock:       130,
    featured:    true,
    rating:      4.7,
    reviewCount: 299,
  },
  {
    title:       'Polarised Aviator Sunglasses',
    description: 'Classic aviator frame with UV400 polarised lenses. Lightweight stainless steel frame, spring-hinge temples. Includes hard case.',
    price:       54.99,
    category:    'accessories',
    imageURL:    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    stock:       60,
    featured:    false,
    rating:      4.4,
    reviewCount: 133,
  },
]
