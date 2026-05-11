"use client";

import { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Star,
  BadgeCheck,
  Tag,
  Zap,
} from "lucide-react";
import { COLORS } from "@/data/products";
import { getBadgeColor } from "@/lib/utils";
import type { Product } from "@/data/products";

/* ── StarRating ───────────────────────────────────────────── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.floor(rating) ? "#FBBF24" : "transparent"}
          color={i <= Math.floor(rating) ? "#FBBF24" : "#374151"}
        />
      ))}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────── */
function Badge({
  children,
  color = COLORS.badge,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        background: color,
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 20,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {children}
    </span>
  );
}

/* ── ProductCard ──────────────────────────────────────────── */
interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}

export default function ProductCard({
  product,
  onView,
  onAddToCart,
  onWishlist,
  wishlist,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const isWished = wishlist.includes(product.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.cardBg,
        border: `1px solid ${hovered ? COLORS.green : COLORS.cardBorder}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 40px rgba(34,197,94,0.12)" : "none",
        position: "relative",
      }}
    >
      {/* Badge */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
        <Badge color={getBadgeColor(product.badge)}>
          <Tag size={8} />
          {product.badge}
        </Badge>
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onWishlist(product.id);
        }}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          background: isWished ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.5)",
          border: "none",
          cursor: "pointer",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        <Heart
          size={16}
          fill={isWished ? "#EF4444" : "transparent"}
          color={isWished ? "#EF4444" : COLORS.muted}
        />
      </button>

      {/* Image area */}
      <div
        onClick={() => onView(product)}
        style={{
          background: "linear-gradient(135deg, #1a2035 0%, #0f1520 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 180,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={product.img}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transition: "transform 0.35s ease",
            transform: hovered ? "scale(1.07)" : "scale(1)",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80&auto=format&fit=crop";
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              background: "#1E3A2A",
              color: COLORS.green,
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <BadgeCheck size={10} />
            Grade {product.grade}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 12 }}>
            {product.warranty} Warranty
          </span>
        </div>

        <h3
          style={{
            color: COLORS.text,
            fontFamily: "'Sora', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            margin: "0 0 4px",
          }}
        >
          {product.name}
        </h3>
        <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 10px" }}>
          {product.specs}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <StarRating rating={product.rating} />
          <span style={{ color: COLORS.muted, fontSize: 12 }}>
            ({product.reviews})
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              color: COLORS.green,
              fontSize: 20,
              fontWeight: 800,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span
            style={{
              color: COLORS.muted,
              fontSize: 13,
              textDecoration: "line-through",
            }}
          >
            ₹{product.mrp.toLocaleString('en-IN')}
          </span>
          <Badge color="#EF4444">{product.discount}% OFF</Badge>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          style={{
            width: "100%",
            background: hovered ? COLORS.green : "transparent",
            color: hovered ? COLORS.black : COLORS.green,
            border: `1.5px solid ${COLORS.green}`,
            borderRadius: 10,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "'Sora', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {hovered ? (
            <>
              <Zap size={14} />
              Add to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
