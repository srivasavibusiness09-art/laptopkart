import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { COLORS } from "@/data/products";

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  menuStyle?: React.CSSProperties;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  style = {},
  menuStyle = {},
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "Space" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      onChange(options[focusedIndex].value);
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: "relative",
        outline: "none",
        minWidth: 160,
        fontFamily: "'Sora', sans-serif",
        ...style,
      }}
    >
      {/* Dropdown Header Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          background: COLORS.cardBg || "var(--border)",
          border: `1px solid ${isOpen ? "var(--accent-2)" : COLORS.cardBorder || "var(--border-hi)"}`,
          borderRadius: 12,
          padding: "10px 16px",
          color: COLORS.text || "#fff",
          fontSize: 14,
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.2s ease",
          boxShadow: isOpen ? "0 0 0 2px rgba(59, 130, 246, 0.15)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = COLORS.cardBorder || "var(--border-hi)";
          }
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: COLORS.muted || "#8B9BBE",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "color-mix(in srgb, var(--bg-2) 95%, transparent)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-hi)",
            borderRadius: 12,
            padding: 6,
            zIndex: 9999,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "var(--shadow-md)",
            ...menuStyle,
          }}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isFocused = index === focusedIndex;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: isSelected ? "var(--accent-2)" : "var(--text)",
                  background: isSelected
                    ? "var(--bg-active)"
                    : isFocused
                    ? "var(--border)"
                    : "transparent",
                  cursor: "pointer",
                  fontWeight: isSelected ? 700 : 400,
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {opt.label}
                </span>
                {isSelected && <span style={{ fontSize: 12, color: "var(--accent-2)" }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
