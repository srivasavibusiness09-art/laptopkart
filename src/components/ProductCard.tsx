"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Star, BadgeCheck, Tag, Zap } from "lucide-react";
import { COLORS } from "@/data/products";
import { getBadgeColor } from "@/lib/utils";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
  onView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={11}
          fill={i <= Math.floor(rating) ? "#F59E0B" : "transparent"}
          color={i <= Math.floor(rating) ? "#F59E0B" : "rgba(255,255,255,0.15)"} />
      ))}
    </div>
  );
}

export default function ProductCard({ product, onView, onAddToCart, onWishlist, wishlist }: Props) {
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding]   = useState(false);
  const isWished = wishlist.includes(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => setAdding(false), 600);
  };

  const badgeColors: Record<string, string> = {
    "Best Seller": "#EF4444",
    "Gaming":      "#8B5CF6",
    "Top Rated":   "#10B981",
    "Value Deal":  "#F59E0B",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.cardBg,
        border: `1px solid ${hovered ? "rgba(99,102,241,0.30)" : COLORS.cardBorder}`,
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered
          ? "0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.08)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        position: "relative",
      }}
    >
      {/* Badge top-left */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
        <span style={{
          background: badgeColors[product.badge] ?? COLORS.primary,
          color: "#fff", fontSize: 9, fontWeight: 700,
          padding: "3px 9px", borderRadius: 100,
          letterSpacing: "0.04em", textTransform: "uppercase",
          display: "inline-flex", alignItems: "center", gap: 3,
        }}>
          <Tag size={7} />{product.badge}
        </span>
      </div>

      {/* Wishlist top-right */}
      <button
        onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          background: isWished ? "rgba(239,68,68,0.15)" : "rgba(13,17,23,0.60)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${isWished ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
          cursor: "pointer", borderRadius: "50%",
          width: 34, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        <Heart size={15}
          fill={isWished ? "#EF4444" : "transparent"}
          color={isWished ? "#EF4444" : "rgba(255,255,255,0.5)"} />
      </button>

      {/* Image */}
      <div
        onClick={() => onView(product)}
        style={{
          height: 190, overflow: "hidden", position: "relative",
          background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.darkBg} 100%)`,
        }}
      >
        <img
          src={product.img} alt={product.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center",
            transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: hovered ? "scale(1.07)" : "scale(1)",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80&auto=format&fit=crop";
          }}
        />
        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: hovered ? "rgba(99,102,241,0.05)" : "transparent",
          transition: "background 0.3s",
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: "16px 16px 18px" }}>
        {/* Grade + warranty chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
          <span style={{
            background: "rgba(56,189,248,0.10)", color: COLORS.green,
            fontSize: 10, fontWeight: 700, padding: "3px 9px",
            borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 3,
            letterSpacing: "0.03em",
          }}>
            <BadgeCheck size={9} />Grade {product.grade}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 11 }}>{product.warranty}</span>
        </div>

        <h3 style={{
          color: COLORS.text, fontFamily: "'Sora', sans-serif",
          fontSize: 14, fontWeight: 700, margin: "0 0 5px",
          letterSpacing: "-0.01em",
        }}>
          {product.name}
        </h3>
        <p style={{ color: COLORS.muted, fontSize: 11, margin: "0 0 10px", lineHeight: 1.5 }}>
          {product.specs}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <StarRating rating={product.rating} />
          <span style={{ color: COLORS.muted, fontSize: 11 }}>({product.reviews})</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
          <span style={{
            color: COLORS.text, fontSize: 22, fontWeight: 800,
            fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em",
          }}>
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 12, textDecoration: "line-through" }}>
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
          <span style={{
            background: "#EF4444", color: "#fff",
            fontSize: 9, fontWeight: 700, padding: "2px 7px",
            borderRadius: 100,
          }}>
            {product.discount}% OFF
          </span>
        </div>

        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            background: hovered
              ? (adding ? "#10B981" : "linear-gradient(135deg, #3B82F6, #38BDF8)")
              : "rgba(56,189,248,0.08)",
            color: hovered ? "#000" : COLORS.green,
            border: `1.5px solid ${hovered ? "transparent" : "rgba(56,189,248,0.18)"}`,
            borderRadius: 12,
            padding: "11px 0", fontWeight: 700, fontSize: 13,
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "'Sora', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            minHeight: 44,
          }}
        >
          {adding ? (
            <><span>✓</span> Added!</>
          ) : hovered ? (
            <><Zap size={13} /> Add to Cart</>
          ) : (
            <><ShoppingCart size={13} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
}
