import React from "react";
import { COLORS } from "@/data/products";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export default function Card({
  children,
  hoverable = true,
  style,
  className = "",
  ...props
}: CardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`card-common ${className}`}
      style={{
        background: hovered && hoverable 
          ? "rgba(18, 28, 52, 0.6)" 
          : "rgba(11, 18, 34, 0.45)",
        border: `1px solid ${hovered && hoverable ? "rgba(0, 229, 255, 0.28)" : "rgba(255, 255, 255, 0.04)"}`,
        borderRadius: 20,
        overflow: "hidden",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered && hoverable ? "translateY(-6px)" : "none",
        boxShadow: hovered && hoverable
          ? "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.08), 0 0 30px rgba(0,229,255,0.15)"
          : "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.04)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
