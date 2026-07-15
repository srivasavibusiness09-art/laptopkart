import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  className = "",
  ...props
}: ButtonProps) {
  const [btnHovered, setBtnHovered] = React.useState(false);

  const getPadding = () => {
    switch (size) {
      case "sm": return "8px 16px";
      case "lg": return "16px 36px";
      case "md":
      default: return "12px 24px";
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm": return 12;
      case "lg": return 15;
      case "md":
      default: return 13;
    }
  };

  const getVariantStyles = () => {
    if (props.disabled) {
      return {
        background: "rgba(255,255,255,0.03)",
        color: "rgba(255,255,255,0.25)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "none",
        transform: "none",
      };
    }

    switch (variant) {
      case "secondary":
        return {
          background: btnHovered ? "rgba(0, 229, 255, 0.06)" : "rgba(0, 229, 255, 0.02)",
          color: "#F3F6FA",
          border: `1px solid ${btnHovered ? "rgba(0, 229, 255, 0.25)" : "rgba(0, 229, 255, 0.12)"}`,
          boxShadow: "none",
          transform: btnHovered ? "translateY(-1px)" : "none",
        };
      case "ghost":
        return {
          background: btnHovered ? "rgba(0, 229, 255, 0.04)" : "transparent",
          color: "#00E5FF",
          border: `1px solid ${btnHovered ? "rgba(0, 229, 255, 0.35)" : "rgba(0, 229, 255, 0.18)"}`,
          boxShadow: "none",
          transform: btnHovered ? "translateY(-1px)" : "none",
        };
      case "danger":
        return {
          background: btnHovered ? "rgba(255, 23, 68, 0.08)" : "rgba(255, 23, 68, 0.03)",
          color: "#FF1744",
          border: `1px solid ${btnHovered ? "rgba(255, 23, 68, 0.25)" : "rgba(255, 23, 68, 0.12)"}`,
          boxShadow: "none",
          transform: btnHovered ? "translateY(-1px)" : "none",
        };
      case "primary":
      default:
        return {
          background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
          color: "#FFFFFF",
          border: "none",
          boxShadow: btnHovered 
            ? "0 4px 14px rgba(37, 99, 235, 0.22)" 
            : "0 2px 8px rgba(0, 0, 0, 0.12)",
          transform: btnHovered ? "scale(1.01) translateY(-1px)" : "none",
        };
    }
  };

  return (
    <button
      className={`btn-common ${className}`}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "'Sora', 'Inter', sans-serif",
        fontWeight: 800,
        borderRadius: 100,
        padding: getPadding(),
        fontSize: getFontSize(),
        cursor: props.disabled ? "not-allowed" : "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
