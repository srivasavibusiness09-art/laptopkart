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
        "Best Seller": "var(--error)",
        "Gaming": "#8B5CF6",
        "Top Rated": "var(--success)",
        "Value Deal": "var(--warning)",
      };
      return {
        background: badgeColors[text] || "var(--accent-2)",
        color: "#FFFFFF",
        border: "none",
        icon: <Tag size={8} />,
      };
    } else {
      if (text === "Brand New") {
        return {
          background: "rgba(99,102,241,0.12)",
          color: "#8B5CF6",
          border: "1px solid rgba(99,102,241,0.2)",
          icon: <Zap size={8} />,
        };
      } else {
        return {
          background: "var(--bg-active)",
          color: "var(--accent)",
          border: "1px solid var(--bg-active)",
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
