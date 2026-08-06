# Laptopkart 💻

Laptopkart is an e-commerce platform for certified refurbished and brand-new laptops, desktops, and tech accessories. It ships as **two applications** that share a single **Firebase backend**:

1. **Storefront** — a Next.js (App Router) SPA-style store with browsing, filtering, cart, wishlist, compare, and a 4-step checkout powered by the **Cashfree Payment Gateway**.
2. **Admin Dashboard** — a separate Vite + React CMS used to manage the catalog, orders, coupons, blogs, banners, and more against the same Firestore database.

---

## ✨ Features

### Storefront
- **Landing experience** — animated `LandingIntro` shown once per session, then a full storefront.
- **Product discovery** — grid layouts, category browsing, search, sort, and filters by brand, RAM, grade, and price.
- **Product details** — image gallery, spec tabs, live price comparison with Amazon/Flipkart/Croma, related products.
- **Cart & Checkout** — quantity controls, stock limits, coupon codes (validated from Firestore), and a multi-step flow (Address → Delivery → Payment → Confirmation).
- **Payments** — Cashfree payment gateway with server-side order verification, automatic stock decrement, and coupon usage syncing on success.
- **Wishlist & Compare** — save items for later and compare devices side-by-side.
- **Auth** — Firebase Authentication (email + Google/Apple OAuth). Cart & wishlist persist per user in Firestore and auto-merge from guest `localStorage`.
- **Account** — profile page with order history and live order-status updates (toast notifications when an order is shipped).
- **Content** — blog with write/edit by logged-in users, accessories store, "Why Refurbished", about, contact, and policy pages.
- **Sell / Request** — "Sell Your Laptop" form and a "Request a Product" modal.
- **Trust & support** — WhatsApp widget, responsive light/dark theme (light default via `next-themes`).

### Admin Dashboard
- **Overview** — KPIs, recent orders, quick stats.
- **Catalog** — full CRUD for laptops/PCs, accessories, banners/contests, and hero posters.
- **Orders** — view/manage customer orders, update status (triggers real-time customer toasts), mark shipped with courier + tracking.
- **Coupons** — create/manage discount codes consumed by the checkout.
- **Blogs & Videos** — publish tech blogs and manage video content.
- **Subscribers / Requests** — manage newsletter subscribers, sell-your-laptop requests, and product requests.
- **Push notifications** — Firebase Cloud Messaging (FCM) to notify store owners of new paid orders.

---

## 🛠️ Tech Stack

| Layer | Storefront | Admin |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Vite 8 + React 19 |
| Language | TypeScript | TypeScript |
| Styling | Tailwind CSS 4 + CSS variables + inline styles | Custom CSS |
| Backend | Firebase (Auth, Firestore) | Firebase (Auth, Firestore, Cloud Messaging) |
| Payments | Cashfree (`cashfree-pg` SDK) | — |
| Media | Cloudinary (via env config) | Cloudinary uploads |
| Icons | Lucide React + React Icons | Lucide React |
| Misc | Framer Motion, next-themes, firebase-admin | — |

---

## 🗄️ Architecture

### Routing model
The storefront is **not** a standard multi-route app. `src/app/page.tsx` is a single client component that keeps a `page` string in state and conditionally renders one of ~25 page components. Browser history is simulated with `pushState`/`popstate` plus a `#hash` (e.g. `#home`, `#cart`).

### Firestore collections
| Collection | Purpose | Access |
|---|---|---|
| `products` | Laptops & desktops catalog (static `products.ts` is the offline fallback) | public read |
| `accessories` | Accessories catalog (static fallback in `products.ts`) | public read |
| `banners` / `heroPosters` | Homepage banners & hero posters | public read |
| `reviews` | Customer reviews | public read |
| `users` | Per-user cart, wishlist, profile | owner + admin |
| `orders` | Order records created at payment initiation | owner read / admin |
| `coupons` | Discount codes (type, value, limits, usage) | admin |
| `blogs` | Blog posts | public read |
| `admins` | Authorized admin UIDs (see `Docs/Admin_login.md`) | admin |
| `admin_fcm_tokens` | Registered admin push-notification tokens | admin |
| `price_cache` | Cached live market prices (Amazon/Flipkart/Croma) | public read |

### Storefront API routes
| Route | Purpose |
|---|---|
| `POST /api/cashfree/initiate` | Validates stock, pre-creates a `Pending Payment` order, returns Cashfree session |
| `GET/POST /api/cashfree/callback` | Verifies payment server-side with Cashfree, marks order paid/failed, decrements stock, syncs coupon usage, triggers admin push |
| `GET /api/live-price?id=` | Returns cached market prices from `price_cache` |
| `POST /api/send-admin-push` | FCM multicast push to all registered admin devices |
| `GET /api/migrate` | One-off data repair (backfills product rating/reviews) |
| `POST /api/update-prices` | Cron proxy to the external Render scraper backend |

---

## 📁 Project Structure

```
.
├── admin/                    # Admin Dashboard (Vite + React)
│   └── src/
│       ├── App.tsx           # Main dashboard (all tabs / CRUD)
│       ├── lib/firebase.ts   # Firebase client config
│       └── lib/storage.ts    # Cloudinary image/video uploads
│
├── src/                      # Storefront (Next.js)
│   ├── app/
│   │   ├── page.tsx          # Single-page state manager + routing
│   │   ├── layout.tsx        # Root layout, theme, Cashfree SDK script
│   │   └── api/              # Server-side API routes (see table above)
│   ├── components/           # All page components (Cart, Checkout, Navbar, ...)
│   │   ├── common/           # Shared UI primitives (Button, Badge, Card, ...)
│   │   ├── OtherPages.tsx    # About, Blog, Contact, Login, Compare, Accessories, ...
│   │   ├── CheckoutPage.tsx  # 4-step checkout + Cashfree + coupons
│   │   └── ...               # Homepage, ProductListing, ProductDetail, Profile, etc.
│   ├── data/products.ts      # Static fallback catalog + COLORS tokens
│   ├── lib/
│   │   ├── firebase.ts       # Firebase client config
│   │   ├── hooks.ts          # Custom hooks (useIsMobile, etc.)
│   │   └── utils.ts          # Helpers (badge colors, etc.)
│   └── styles/globals.css    # Global styles & design tokens
│
├── Docs/                     # Architecture & planning docs
├── next.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A Firebase project (Auth + Firestore) and, for production use, a Cashfree merchant account.

### 1. Storefront

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

### Environment variables

**Storefront (`.env.local`):**

```env
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cashfree payment gateway
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_ENV=sandbox          # or production
NEXT_PUBLIC_CASHFREE_ENV=sandbox

# Cloudinary (image uploads from the storefront)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# Firebase Admin SDK (server-side push notifications)
FIREBASE_SERVICE_ACCOUNT_KEY=

# Optional: external scraper backend (live price refresh)
RENDER_BACKEND_URL=
CRON_SECRET=
```

**Admin Dashboard (`admin/.env`):**

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=            # FCM web push
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

> ⚠️ The storefront ships with static fallback data, but cart, checkout, orders, and the admin dashboard require Firestore to be configured (and seeded — e.g. a `products` collection). See `Docs/Admin_login.md` and `Docs/firestore_production_rules.md` for seeding and securing the database.

---

## 🧪 Useful Scripts

| App | Command | Purpose |
|---|---|---|
| Storefront | `npm run dev` | Dev server |
| Storefront | `npm run build` / `npm start` | Production build / start |
| Storefront | `npm run lint` | ESLint |
| Admin | `cd admin && npm run dev` | Dev server |
| Admin | `cd admin && npm run build` | Type-check + production build |
| Admin | `cd admin && npm run lint` | Oxlint |

---

## 📚 Documentation

The `Docs/` folder contains architecture and planning notes:

- **`Admin_login.md`** — secure, database-driven admin authorization (Firestore `admins` collection + security rules).
- **`firestore_production_rules.md`** — production-grade Firestore security rules and admin claim setup.
- **`future_challenges.md`** — roadmap: scraper blockers, payment webhooks, inventory race conditions, latency.
- **`New_UI.md`** — design-system plan (tokens, shared component layer, page-by-page redesign).
- **`plan.md`** — aspirational scroll-driven 3D website plan.
- **`Scrollable website.md`** — additional scroll experience notes.

---

## 📄 License

MIT
