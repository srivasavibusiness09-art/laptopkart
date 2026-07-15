import React from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: number;
  style?: React.CSSProperties;
}

export default function RatingStars({
  rating,
  size = 11,
  style,
}: RatingStarsProps) {
  return (
    <div style={{ display: "flex", gap: 2, ...style }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.floor(rating) ? "#F59E0B" : "transparent"}
          color={i <= Math.floor(rating) ? "#F59E0B" : "rgba(255,255,255,0.15)"}
        />
      ))}
    </div>
  );
}
