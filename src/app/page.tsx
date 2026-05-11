"use client";

import { useState } from "react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Homepage from "@/components/Homepage";
import ProductListing from "@/components/ProductListing";
import ProductDetail from "@/components/ProductDetail";
import CartPage from "@/components/CartPage";
import CheckoutPage from "@/components/CheckoutPage";
import WishlistPage from "@/components/WishlistPage";
import {
  ComparePage,
  AboutPage,
  BlogPage,
  ContactPage,
  LoginPage,
} from "@/components/OtherPages";

interface CartItem extends Product {
  qty: number;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const handleAddToCart = (product: Product) => {
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
    setWishlist((w) =>
      w.includes(id) ? w.filter((i) => i !== id) : [...w, id]
    );
  };

  const handleViewProduct = (product: Product) => {
    setViewProduct(product);
    setPage("product");
  };

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
        <CheckoutPage cart={cart} setPage={setPage} setCart={setCart} />
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
      {page === "blog" && <BlogPage />}
      {page === "contact" && <ContactPage />}
      {page === "login" && <LoginPage setPage={setPage} />}

      <Footer setPage={setPage} />
    </div>
  );
}
