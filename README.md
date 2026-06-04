# Techstore Pro 💻

Techstore Pro is a modern, responsive, and high-performance e-commerce web application built specifically for buying certified refurbished laptops, desktops, and tech accessories. 

The application offers a seamless shopping experience from browsing products to checkout, complete with dynamic product filtering, a shopping cart, a wishlist, and side-by-side product comparisons.

## 🚀 Features

- **Modern UI/UX**: Sleek, dark-mode design with smooth gradients, responsive layouts, and interactive hover effects.
- **Product Discovery**: Dynamic grid layouts, category browsing, and a fully functional product filtering system (by brand, RAM, grade, and price).
- **Shopping Cart & Checkout**: Interactive cart with quantity adjustments, coupon code support (try `TECH10`), and a multi-step checkout flow (Address → Delivery → Payment → Confirmation).
- **Wishlist & Compare**: Save items for later and compare multiple devices side-by-side to find the best deal.
- **Fully Responsive**: Optimized for all devices (mobile, tablet, and desktop) using modern responsive design patterns and a custom `useIsMobile` hook.
- **Fast & SEO Friendly**: Built on Next.js App Router for optimal Server-Side Rendering (SSR) and SEO performance.

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library:** [React 19](https://react.dev/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & Custom Inline Styles
- **Icons:** [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/) (Brand specific icons)

## 🎨 Color Tokens

The UI theme is centralized in `src/data/products.ts` via `COLOR_TOKENS`:

- **Primary:** `#3B82F6`
- **Primary Hover:** `#2563EB`
- **Accent:** `#38BDF8`
- **Background:** `#0B1220`
- **Card Background:** `#111A2B`
- **Border:** `#23324A`
- **Main Text:** `#E6EEF8`
- **Muted Text:** `#93A4B8`

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router (Layouts, Pages, SEO config)
│   ├── layout.tsx        # Root layout, fonts, and global metadata
│   └── page.tsx          # Main entry point and state manager (SPA-like routing)
│
├── components/           # Reusable UI Components
│   ├── CartPage.tsx      # Shopping cart management
│   ├── CheckoutPage.tsx  # Multi-step checkout process
│   ├── Footer.tsx        # Global footer
│   ├── Hero.tsx          # Homepage hero section
│   ├── Homepage.tsx      # Main landing page content
│   ├── Navbar.tsx        # Global navigation & mobile menu
│   ├── OtherPages.tsx    # About, Contact, Compare, Blog, and Login pages
│   ├── ProductCard.tsx   # Individual product component
│   ├── ProductDetail.tsx # Detailed product view with image gallery
│   └── ProductListing.tsx# Product catalog with sidebar filters
│
├── data/
│   └── products.ts       # Mock database containing products, categories, reviews
│
└── lib/
    └── hooks.ts          # Custom React hooks (e.g., SSR-safe useIsMobile)
```

## 💻 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Future Enhancements

- **Backend Integration**: Replace the static `products.ts` with a real database (e.g., PostgreSQL, MongoDB) and API routes.
- **State Persistence**: Store Cart and Wishlist data using `localStorage` or a database to retain state across sessions.
- **Authentication**: Connect the Login page to an authentication provider (e.g., NextAuth.js, Clerk).
- **Payment Gateway**: Integrate real payment processors (Stripe, Razorpay) into the Checkout flow.

## 📄 License

This project is licensed under the MIT License.
