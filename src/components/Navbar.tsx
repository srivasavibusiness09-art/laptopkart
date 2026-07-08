"use client";

import { useState, useEffect } from "react";
import {
  Search, Heart, ShoppingCart, User, Scale,
  Flame, Laptop, Monitor, Keyboard, RefreshCw, Tag, Info, X, Menu,
} from "lucide-react";
import { COLORS, navLinks } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface NavbarProps {
  setPage: (page: string) => void;
  cart: { id: number }[];
  wishlist: number[];
}

const linkIcons: Record<string, React.ReactNode> = {
  Offers:          <Flame size={13} color="#F59E0B" />,
  Laptops:         <Laptop size={13} />,
  Desktops:        <Monitor size={13} />,
  Accessories:     <Keyboard size={13} />,
  "Resell Laptop": <RefreshCw size={13} />,
  Blog:            <Tag size={13} />,
  About:           <Info size={13} />,
};

const getTarget = (link: string) => ({
  Laptops: "listing", Desktops: "listing", Accessories: "listing",
  About: "about", Blog: "blog", Offers: "listing", "Resell Laptop": "contact",
} as Record<string, string>)[link] ?? "home";

export default function Navbar({ setPage, cart, wishlist }: NavbarProps) {
  const [search, setSearch]     = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (p: string) => { setPage(p); setMenuOpen(false); };

  const navBg = scrolled
    ? "rgba(13,17,23,0.92)"
    : "rgba(13,17,23,0.65)";

  return (
    <>
      {/* ── Main nav ──────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: navBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid rgba(56,150,240,${scrolled ? 0.12 : 0.07})`,
        transition: "background 0.3s ease",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 20px",
          display: "flex", alignItems: "center",
          height: 52, gap: 16,
        }}>
          {/* Logo */}
          <div
            onClick={() => go("home")}
            style={{
              cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Laptop size={18} color={COLORS.green} />
            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800, fontSize: isMobile ? 16 : 18,
              letterSpacing: "-0.02em",
            }}>
              <span style={{ color: COLORS.text }}>Laptopkart</span>
              <span style={{
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(135deg, #38BDF8, #6366F1)",
              }}> Pro</span>
            </span>
          </div>

          {/* Desktop center links */}
          {!isMobile && (
            <div style={{
              flex: 1, display: "flex", justifyContent: "center",
              gap: 0, overflow: "hidden",
            }}>
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => go(getTarget(link))}
                  style={{
                    padding: "6px 14px", background: "transparent",
                    border: "none",
                    color: link === "Offers" ? "#F59E0B" : COLORS.muted,
                    cursor: "pointer", fontSize: 13, fontWeight: 500,
                    whiteSpace: "nowrap", letterSpacing: "0.01em",
                    display: "flex", alignItems: "center", gap: 4,
                    transition: "color 0.2s",
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.color = COLORS.text; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.color = link === "Offers" ? "#F59E0B" : COLORS.muted; }}
                >
                  {linkIcons[link]}{link}
                </button>
              ))}
            </div>
          )}

          {/* Search (desktop inline) */}
          {!isMobile && (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  width: 200, background: "rgba(56,150,240,0.07)",
                  border: "1px solid rgba(56,189,248,0.12)",
                  borderRadius: 8, padding: "7px 12px 7px 32px",
                  color: COLORS.text, fontSize: 13, outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.width = "260px";
                  e.target.style.background = "rgba(56,150,240,0.11)";
                  e.target.style.borderColor = "rgba(56,189,248,0.35)";
                }}
                onBlur={(e) => {
                  e.target.style.width = "200px";
                  e.target.style.background = "rgba(56,150,240,0.07)";
                  e.target.style.borderColor = "rgba(56,189,248,0.12)";
                }}
              />
              <Search size={13} style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)", color: COLORS.muted,
              }} />
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, marginLeft: "auto", alignItems: "center" }}>
            {isMobile ? (
              <>
                <IconBtn onClick={() => go("wishlist")} count={wishlist.length} countColor="#EF4444">
                  <Heart size={16} color={wishlist.length > 0 ? "#EF4444" : COLORS.muted} fill={wishlist.length > 0 ? "#EF4444" : "none"} />
                </IconBtn>
                <IconBtn onClick={() => go("cart")} count={cart.length} accent={cart.length > 0} countColor="#fff">
                  <ShoppingCart size={16} color={cart.length > 0 ? "#000" : COLORS.muted} />
                </IconBtn>
                <IconBtn onClick={() => setMenuOpen((o) => !o)}>
                  {menuOpen ? <X size={18} color={COLORS.text} /> : <Menu size={18} color={COLORS.text} />}
                </IconBtn>
              </>
            ) : (
              <>
                <IconBtn onClick={() => go("wishlist")} count={wishlist.length} countColor="#EF4444" label="Wishlist">
                  <Heart size={14} color={wishlist.length > 0 ? "#EF4444" : COLORS.muted} fill={wishlist.length > 0 ? "#EF4444" : "none"} />
                </IconBtn>
                <IconBtn onClick={() => go("cart")} count={cart.length} accent={cart.length > 0} countColor="#fff" label={`Cart${cart.length > 0 ? ` (${cart.length})` : ""}`}>
                  <ShoppingCart size={14} color={cart.length > 0 ? "#000" : COLORS.muted} />
                </IconBtn>
                <IconBtn onClick={() => go("compare")} label="Compare">
                  <Scale size={14} color={COLORS.muted} />
                </IconBtn>
                <IconBtn onClick={() => go("login")} label="Login">
                  <User size={14} color={COLORS.muted} />
                </IconBtn>
              </>
            )}
          </div>
        </div>

        {/* Mobile search row */}
        {isMobile && (
          <div style={{ padding: "0 12px 10px", display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search laptops…"
                style={{
                  width: "100%",
                  background: "rgba(56,150,240,0.08)",
                  border: "1px solid rgba(56,189,248,0.14)",
                  borderRadius: 8, padding: "9px 12px 9px 32px",
                  color: COLORS.text, fontSize: 14, outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.muted }} />
            </div>
          </div>
        )}

        {/* Mobile drawer */}
        {isMobile && menuOpen && (
          <div style={{
            background: "rgba(13,17,23,0.97)", backdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(56,150,240,0.08)",
            padding: "8px 0 16px",
          }}>
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => go(getTarget(link))}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", textAlign: "left",
                  background: "transparent", border: "none",
                  color: link === "Offers" ? "#F59E0B" : COLORS.muted,
                  padding: "14px 24px", cursor: "pointer",
                  fontSize: 15, fontWeight: 500,
                  borderBottom: "1px solid rgba(56,150,240,0.06)",
                  minHeight: 48,
                }}
              >
                {linkIcons[link]}{link}
              </button>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 20px" }}>
              {[{l:"Compare",t:"compare",icon:<Scale size={14}/>},{l:"Login",t:"login",icon:<User size={14}/>}].map((b) => (
                <button key={b.l} onClick={() => go(b.t)} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, background: "rgba(56,150,240,0.07)",
                  color: COLORS.muted, border: "1px solid rgba(56,189,248,0.12)",
                  borderRadius: 10, padding: "12px", cursor: "pointer", fontSize: 13,
                  minHeight: 44,
                }}>
                  {b.icon}{b.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

/* ── Small icon button helper ─────────────────────────── */
function IconBtn({
  children, onClick, count, countColor, accent, label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  count?: number;
  countColor?: string;
  accent?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: accent ? COLORS.green : "transparent",
        border: `1px solid ${accent ? "transparent" : "rgba(56,150,240,0.12)"}`,
        borderRadius: 8,
        height: 34,
        display: "flex", alignItems: "center", gap: 5,
        padding: label ? "0 12px" : "0 9px",
        cursor: "pointer", position: "relative",
        fontSize: 12, fontWeight: 600,
        color: accent ? "#000" : COLORS.muted,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (!accent) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56,189,248,0.28)"; }}
      onMouseLeave={(e) => { if (!accent) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56,150,240,0.12)"; }}
    >
      {children}
      {label && <span>{label}</span>}
      {count !== undefined && count > 0 && (
        <span style={{
          position: "absolute", top: -5, right: -5,
          background: countColor ?? "#EF4444",
          color: "#fff", borderRadius: "50%",
          width: 16, height: 16, fontSize: 9, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #0d1117",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
