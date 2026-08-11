import React from "react";
import { Tag, BadgeCheck, Zap } from "lucide-react";

interface BadgeProps {
  type: "badge" | "condition";
  text: string;
  style?: React.CSSProperties;
}

export default function Badge({ type, text, style }: BadgeProps) {
  const getBadgeStyles = () => {
    if (type === "badge") {
      const badgeColors: Record<string, string> = {
        "Best Seller": "#EF4444",
        "Gaming": "#8B5CF6",
        "Top Rated": "#059669",
        "Value Deal": "#FF6B00",
      };
      return {
        background: badgeColors[text] || "var(--accent)",
        color: "#FFFFFF",
        border: "none",
        icon: <Tag size={8} />,
      };
    } else {
      if (text === "Brand New") {
        return {
          background: "rgba(0, 98, 255, 0.08)",
          color: "#0062FF",
          border: "1px solid rgba(0, 98, 255, 0.22)",
          icon: <Zap size={8} />,
        };
      } else {
        return {
          background: "rgba(5, 150, 105, 0.08)",
          color: "#059669",
          border: "1px solid rgba(5, 150, 105, 0.22)",
          icon: <BadgeCheck size={8} />,
        };
      }
    }
  };

  const styles = getBadgeStyles();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 9,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 100,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: styles.background,
        color: styles.color,
        border: styles.border,
        fontFamily: "'Sora', sans-serif",
        ...style,
      }}
    >
      {styles.icon}
      {text}
    </span>
  );
}
