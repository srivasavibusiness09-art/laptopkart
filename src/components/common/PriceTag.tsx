import React from "react";
import { COLORS } from "@/data/products";

interface PriceTagProps {
  price: number;
  mrp: number;
  discount: number;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export default function PriceTag({
  price,
  mrp,
  discount,
  size = "md",
  style,
}: PriceTagProps) {
  const getPriceSize = () => {
    switch (size) {
      case "sm": return 14;
      case "lg": return 24;
      case "md":
      default: return 18;
    }
  };

  const getMrpSize = () => {
    switch (size) {
      case "sm": return 10;
      case "lg": return 14;
      case "md":
      default: return 12;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size === "sm" ? 4 : 8,
        flexWrap: "wrap",
        fontFamily: "'Sora', 'Inter', sans-serif",
        ...style,
      }}
    >
      <span
        style={{
          color: COLORS.text,
          fontSize: getPriceSize(),
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        ₹{price.toLocaleString("en-IN")}
      </span>
      <span
        style={{
          color: COLORS.muted,
          fontSize: getMrpSize(),
          textDecoration: "line-through",
        }}
      >
        ₹{mrp.toLocaleString("en-IN")}
      </span>
      <span
        style={{
          background: "#EF4444",
          color: "#ffffff",
          fontSize: size === "sm" ? 8 : 9,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 100,
        }}
      >
        {discount}% OFF
      </span>
    </div>
  );
}
