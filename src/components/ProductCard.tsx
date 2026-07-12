"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Star, BadgeCheck, Tag, Zap } from "lucide-react";
import { COLORS } from "@/data/products";
import { getBadgeColor } from "@/lib/utils";
import type { Product } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

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
  const isMobile = useIsMobile();

  const limit = product.stock !== undefined ? product.stock : 5;
  const isOutOfStock = limit <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
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
        borderRadius: isMobile ? 16 : 20,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered && !isMobile ? "translateY(-6px)" : "none",
        boxShadow: hovered
          ? "0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.08)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        position: "relative",
      }}
    >
      {/* Badge top-left */}
      <div style={{ position: "absolute", top: isMobile ? 8 : 12, left: isMobile ? 8 : 12, zIndex: 2 }}>
        <span style={{
          background: badgeColors[product.badge] ?? COLORS.primary,
          color: "#fff", fontSize: isMobile ? 8 : 9, fontWeight: 700,
          padding: isMobile ? "2px 6px" : "3px 9px", borderRadius: 100,
          letterSpacing: "0.04em", textTransform: "uppercase",
          display: "inline-flex", alignItems: "center", gap: 3,
        }}>
          <Tag size={isMobile ? 6 : 7} />{product.badge}
        </span>
      </div>

      {/* Wishlist top-right */}
      <button
        onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
        style={{
          position: "absolute", top: isMobile ? 8 : 12, right: isMobile ? 8 : 12, zIndex: 2,
          background: isWished ? "rgba(239,68,68,0.15)" : "rgba(13,17,23,0.60)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${isWished ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
          cursor: "pointer", borderRadius: "50%",
          width: isMobile ? 28 : 34, height: isMobile ? 28 : 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        <Heart size={isMobile ? 12 : 15}
          fill={isWished ? "#EF4444" : "transparent"}
          color={isWished ? "#EF4444" : "rgba(255,255,255,0.5)"} />
      </button>

      {/* Image */}
      <div
        onClick={() => onView(product)}
        style={{
          height: isMobile ? 110 : 190, overflow: "hidden", position: "relative",
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
            opacity: isOutOfStock ? 0.4 : 1,
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
        {isOutOfStock && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(13,17,23,0.6)", color: "#EF4444", fontWeight: 800, fontSize: 13, textTransform: "uppercase"
          }}>
            Out of Stock
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: isMobile ? "12px 12px 14px" : "16px 16px 18px" }}>
        {/* Grade + warranty chips */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8, marginBottom: isMobile ? 6 : 9 }}>
          {product.condition === "Brand New" ? (
            <span style={{
              background: "rgba(99,102,241,0.12)", color: "#8B5CF6",
              fontSize: isMobile ? 9 : 10, fontWeight: 800, padding: isMobile ? "2px 6px" : "3px 9px",
              borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 3,
              letterSpacing: "0.03em",
              border: "1px solid rgba(99,102,241,0.2)",
            }}>
              <Zap size={isMobile ? 8 : 9} />Brand New
            </span>
          ) : (
            <span style={{
              background: "rgba(56,189,248,0.10)", color: COLORS.green,
              fontSize: isMobile ? 9 : 10, fontWeight: 700, padding: isMobile ? "2px 6px" : "3px 9px",
              borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 3,
              letterSpacing: "0.03em",
            }}>
              <BadgeCheck size={isMobile ? 8 : 9} />Grade {product.grade}
            </span>
          )}
          <span style={{ color: COLORS.muted, fontSize: isMobile ? 10 : 11 }}>{product.warranty}</span>
        </div>

        <h3 style={{
          color: COLORS.text, fontFamily: "'Sora', sans-serif",
          fontSize: isMobile ? 12 : 14, fontWeight: 700, margin: "0 0 5px",
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
          overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {product.name}
        </h3>
        <p style={{
          color: COLORS.muted, fontSize: isMobile ? 10 : 11, margin: "0 0 8px", lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {product.specs}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isMobile ? 8 : 12 }}>
          <StarRating rating={product.rating} />
          <span style={{ color: COLORS.muted, fontSize: isMobile ? 10 : 11 }}>({product.reviews})</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8, flexWrap: "wrap", marginBottom: isMobile ? 10 : 14 }}>
          <span style={{
            color: COLORS.text, fontSize: isMobile ? 16 : 22, fontWeight: 800,
            fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em",
          }}>
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span style={{ color: COLORS.muted, fontSize: isMobile ? 10 : 12, textDecoration: "line-through" }}>
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
          <span style={{
            background: "#EF4444", color: "#fff",
            fontSize: isMobile ? 8 : 9, fontWeight: 700, padding: "2px 6px",
            borderRadius: 100,
          }}>
            {product.discount}% OFF
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          style={{
            width: "100%",
            background: isOutOfStock
              ? "rgba(255,255,255,0.05)"
              : hovered
                ? (adding ? "#10B981" : "linear-gradient(135deg, #3B82F6, #38BDF8)")
                : "rgba(56,189,248,0.08)",
            color: isOutOfStock ? COLORS.muted : hovered ? "#000" : COLORS.green,
            border: isOutOfStock
              ? "1.5px solid rgba(255,255,255,0.05)"
              : `1.5px solid ${hovered ? "transparent" : "rgba(56,189,248,0.18)"}`,
            borderRadius: 12,
            padding: isMobile ? "8px 0" : "11px 0",
            fontWeight: 700,
            fontSize: isMobile ? 11 : 13,
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "'Sora', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            minHeight: isMobile ? 36 : 44,
          }}
        >
          {isOutOfStock ? (
            "Out of Stock"
          ) : adding ? (
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
