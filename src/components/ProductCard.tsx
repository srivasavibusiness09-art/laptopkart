"use client";

import React, { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import Card from "./common/Card";
import Button from "./common/Button";
import Badge from "./common/Badge";
import PriceTag from "./common/PriceTag";
import RatingStars from "./common/RatingStars";

interface Props {
  product: Product;
  onView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}

export default function ProductCard({ product, onView, onAddToCart, onWishlist, wishlist }: Props) {
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
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

  return (
    <Card
      onClick={() => onView(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: isMobile ? 16 : 20,
        position: "relative",
      }}
    >
      {/* Badge top-left */}
      {product.badge && (
        <div style={{ position: "absolute", top: isMobile ? 8 : 12, left: isMobile ? 8 : 12, zIndex: 2 }}>
          <Badge type="badge" text={product.badge} />
        </div>
      )}

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
        <Heart
          size={isMobile ? 12 : 15}
          fill={isWished ? "#EF4444" : "transparent"}
          color={isWished ? "#EF4444" : "rgba(255,255,255,0.5)"}
        />
      </button>

      {/* Image */}
      <div
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
        <div style={{
          position: "absolute", inset: 0,
          background: hovered ? "rgba(56,189,248,0.02)" : "transparent",
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
          <Badge type="condition" text={product.condition === "Brand New" ? "Brand New" : `Grade ${product.grade}`} />
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
          <RatingStars rating={product.rating} />
          <span style={{ color: COLORS.muted, fontSize: isMobile ? 10 : 11 }}>({product.reviews})</span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
          borderTop: "1px solid rgba(255,255,255,0.03)",
          paddingTop: 12,
          marginTop: 12,
        }}>
          <div>
            <PriceTag 
              price={product.price} 
              mrp={product.mrp} 
              discount={product.discount} 
              size={isMobile ? "sm" : "md"} 
            />
          </div>
          <Button
            variant={isOutOfStock ? "secondary" : "primary"}
            onClick={handleAdd}
            disabled={isOutOfStock}
            style={{
              padding: isMobile ? "8px 12px" : "10px 16px",
              minHeight: isMobile ? 32 : 40,
              borderRadius: 12,
              flexShrink: 0,
            }}
          >
            {isOutOfStock ? (
              "Sold"
            ) : adding ? (
              "✓"
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShoppingCart size={13} />
                {!isMobile && "Add"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
