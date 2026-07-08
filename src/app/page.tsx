"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";

import LandingPage from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Homepage from "@/components/Homepage";
import ProductListing from "@/components/ProductListing";
import ProductDetail from "@/components/ProductDetail";
import CartPage from "@/components/CartPage";
import CheckoutPage from "@/components/CheckoutPage";
import WishlistPage from "@/components/WishlistPage";
import ProfilePage from "@/components/ProfilePage";
import {
  ComparePage,
  AboutPage,
  BlogPage,
  ContactPage,
  LoginPage,
  WhyRefurbishedPage,
  WriteBlogPage,
} from "@/components/OtherPages";

interface CartItem extends Product {
  qty: number;
}

export default function App() {
  /* Show landing intro first; after user enters store, show main app */
  const [showLanding, setShowLanding] = useState(true);
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  /* Global authentication states */
  const [user, setUser] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<any>(null);

  // Automatically scroll to top on any page transition
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [page]);

  const handleEnterStore = () => {
    setShowLanding(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof document !== "undefined") {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setPendingAction({ type: "cart", payload: product });
      setPage("login");
      return;
    }
    setCart((c) => {
      const existing = c.find((i) => i.id === product.id);
      if (existing)
        return c.map((i) =>
          i.id === product.id ? { ...i, qty: (i.qty || 1) + 1 } : i
        );
      return [...c, { ...product, qty: 1 }];
    });
  };

  const handleWishlist = (id: number) => {
    if (!user) {
      setPendingAction({ type: "wishlist", payload: id });
      setPage("login");
      return;
    }
    setWishlist((w) =>
      w.includes(id) ? w.filter((i) => i !== id) : [...w, id]
    );
  };

  const handleLogin = (loggedInUser: any) => {
    setUser(loggedInUser);
    if (pendingAction) {
      if (pendingAction.type === "cart") {
        const product = pendingAction.payload;
        setCart((c) => {
          const existing = c.find((i) => i.id === product.id);
          if (existing)
            return c.map((i) => i.id === product.id ? { ...i, qty: (i.qty || 1) + 1 } : i);
          return [...c, { ...product, qty: 1 }];
        });
        setPage("cart");
      } else if (pendingAction.type === "wishlist") {
        const id = pendingAction.payload;
        setWishlist((w) => w.includes(id) ? w : [...w, id]);
        setPage("wishlist");
      } else if (pendingAction.type === "checkout") {
        setPage("checkout");
      }
      setPendingAction(null);
    } else {
      setPage("home");
    }
  };

  const handleViewProduct = (product: Product) => {
    setViewProduct(product);
    setPage("product");
  };

  /* ── Landing experience ─────────────────────────────── */
  if (showLanding) {
    return <LandingPage onEnterStore={handleEnterStore} />;
  }

  /* ── Main store experience ──────────────────────────── */
  return (
    <div
      style={{
        fontFamily: "'Sora', 'Inter', sans-serif",
        background: COLORS.darkBg,
        minHeight: "100vh",
        color: COLORS.text,
      }}
    >
      <Navbar
        setPage={setPage}
        cart={cart}
        wishlist={wishlist}
        user={user}
      />

      {page === "home" && (
        <Homepage
          setPage={setPage}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
        />
      )}
      {page === "listing" && (
        <ProductListing
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
        />
      )}
      {page === "product" && (
        <ProductDetail
          product={viewProduct}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
          setPage={setPage}
          onViewProduct={handleViewProduct}
        />
      )}
      {page === "cart" && (
        <CartPage cart={cart} setCart={setCart} setPage={setPage} />
      )}
      {page === "checkout" && (
        user ? (
          <CheckoutPage cart={cart} setPage={setPage} setCart={setCart} />
        ) : (
          (() => {
            setPendingAction({ type: "checkout" });
            setPage("login");
            return null;
          })()
        )
      )}
      {page === "wishlist" && (
        <WishlistPage
          wishlist={wishlist}
          onAddToCart={handleAddToCart}
          setPage={setPage}
          onWishlist={handleWishlist}
        />
      )}
      {page === "compare" && <ComparePage />}
      {page === "about" && <AboutPage />}
      {page === "blog" && <BlogPage user={user} setPage={setPage} />}
      {page === "contact" && <ContactPage />}
      {page === "login" && <LoginPage setPage={setPage} onLogin={handleLogin} />}
      {page === "profile" && user && (
        <ProfilePage user={user} setUser={setUser} setPage={setPage} />
      )}
      {page === "why-refurbished" && <WhyRefurbishedPage />}
      {page === "write-blog" && (
        user ? (
          <WriteBlogPage setPage={setPage} />
        ) : (
          (() => {
            setPendingAction({ type: "write-blog" });
            setPage("login");
            return null;
          })()
        )
      )}

      <Footer setPage={setPage} />
    </div>
  );
}
