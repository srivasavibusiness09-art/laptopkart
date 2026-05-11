"use client";

import { Heart } from "lucide-react";
import { COLORS, products } from "@/data/products";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

interface WishlistPageProps {
  wishlist: number[];
  onAddToCart: (p: Product) => void;
  setPage: (p: string) => void;
  onWishlist: (id: number) => void;
}

export default function WishlistPage({ wishlist, onAddToCart, setPage, onWishlist }: WishlistPageProps) {
  const wished = products.filter((p) => wishlist.includes(p.id));

  if (wished.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Heart size={80} color={COLORS.cardBorder} strokeWidth={1} />
        </div>
        <h2 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
          Your wishlist is empty
        </h2>
        <p style={{ color: COLORS.muted }}>Save products you love to your wishlist</p>
        <button
          onClick={() => setPage("listing")}
          style={{
            background: COLORS.green, color: COLORS.black, border: "none",
            borderRadius: 12, padding: "14px 28px", fontWeight: 700,
            fontSize: 15, cursor: "pointer", marginTop: 20,
          }}
        >
          Browse Products
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
        <Heart size={26} fill={COLORS.green} color={COLORS.green} />
        My Wishlist ({wished.length})
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
        {wished.map((p) => (
          <ProductCard key={p.id} product={p} onView={() => setPage("product")} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
        ))}
      </div>
    </div>
  );
}
