"use client";

import { useState } from "react";
import {
  Search, Scale, Heart, ShoppingCart, User, Flame,
  Laptop, Monitor, Keyboard, RefreshCw, Tag, Info, Menu, X,
} from "lucide-react";
import { COLORS, navLinks } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface NavbarProps {
  setPage: (page: string) => void;
  cart: { id: number }[];
  wishlist: number[];
}

const linkIcons: Record<string, React.ReactNode> = {
  Offers:          <Flame size={13} color={COLORS.green} />,
  Laptops:         <Laptop size={13} />,
  Desktops:        <Monitor size={13} />,
  Accessories:     <Keyboard size={13} />,
  "Resell Laptop": <RefreshCw size={13} />,
  Blog:            <Tag size={13} />,
  About:           <Info size={13} />,
};

const getNavTarget = (link: string) => {
  const map: Record<string, string> = {
    Laptops: "listing", Desktops: "listing", Accessories: "listing",
    About: "about", Blog: "blog", Offers: "listing", "Resell Laptop": "contact",
  };
  return map[link] ?? "home";
};

export default function Navbar({ setPage, cart, wishlist }: NavbarProps) {
  const [search, setSearch]         = useState("");
  const [menuOpen, setMenuOpen]     = useState(false);
  const isMobile                    = useIsMobile();

  const go = (p: string) => { setPage(p); setMenuOpen(false); };

  return (
    <>
      {/* Announcement Bar */}
      <div style={{ background: COLORS.green, color: COLORS.black, textAlign: "center", fontSize: isMobile ? 11 : 13, fontWeight: 700, padding: "7px 12px", letterSpacing: "0.3px" }}>
        {isMobile
          ? "Up to 70% OFF | 1 Yr Warranty | Free Shipping"
          : "Up to 70% OFF on Refurbished Laptops | 1 Year Warranty | Free Shipping Above ₹15,000 | EMI Available"}
      </div>

      <nav style={{ background: COLORS.darkBg, borderBottom: `1px solid ${COLORS.cardBorder}`, position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>

        {/* Main Row */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: isMobile ? 10 : 20, height: 60 }}>

          {/* Logo */}
          <div onClick={() => go("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <Laptop size={20} color={COLORS.green} />
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: isMobile ? 17 : 22, color: COLORS.text }}>LAPTOP</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: isMobile ? 17 : 22, color: COLORS.green }}>KART</span>
          </div>

          {/* Search — hidden on very small, full width on tablet+ */}
          {!isMobile && (
            <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for laptops, brands, models..."
                style={{ width: "100%", background: "#1C2133", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "9px 16px 9px 38px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: COLORS.muted, display: "flex" }}><Search size={15} /></span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: isMobile ? 6 : 8, marginLeft: "auto", alignItems: "center" }}>
            {isMobile ? (
              /* Mobile: icon-only buttons */
              <>
                <button onClick={() => go("wishlist")} style={iconBtn}>
                  <Heart size={18} color={wishlist.length > 0 ? "#EF4444" : COLORS.muted} fill={wishlist.length > 0 ? "#EF4444" : "transparent"} />
                  {wishlist.length > 0 && <Badge count={wishlist.length} />}
                </button>
                <button onClick={() => go("cart")} style={{ ...iconBtn, background: cart.length > 0 ? COLORS.green : "transparent", position: "relative" }}>
                  <ShoppingCart size={18} color={cart.length > 0 ? COLORS.black : COLORS.muted} />
                  {cart.length > 0 && <Badge count={cart.length} dark />}
                </button>
                <button onClick={() => setMenuOpen((o) => !o)} style={iconBtn}>
                  {menuOpen ? <X size={20} color={COLORS.text} /> : <Menu size={20} color={COLORS.text} />}
                </button>
              </>
            ) : (
              /* Desktop: full buttons */
              <>
                {[
                  { label: `Wishlist${wishlist.length > 0 ? ` (${wishlist.length})` : ""}`, icon: <Heart size={14} />, target: "wishlist", accent: false },
                  { label: `Cart${cart.length > 0 ? ` (${cart.length})` : ""}`,            icon: <ShoppingCart size={14} />, target: "cart",    accent: cart.length > 0 },
                  { label: "Compare", icon: <Scale size={14} />, target: "compare", accent: false },
                  { label: "Login",   icon: <User size={14} />,  target: "login",   accent: false },
                ].map((item) => (
                  <button key={item.label} onClick={() => go(item.target)}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: item.accent ? COLORS.green : "transparent", color: item.accent ? COLORS.black : COLORS.muted, border: item.accent ? "none" : `1px solid ${COLORS.cardBorder}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: item.accent ? 700 : 500, whiteSpace: "nowrap" }}>
                    {item.icon}<span>{item.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && (
          <div style={{ padding: "0 12px 10px", display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search laptops..."
                style={{ width: "100%", background: "#1C2133", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, padding: "9px 12px 9px 34px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.muted, display: "flex" }}><Search size={14} /></span>
            </div>
          </div>
        )}

        {/* Desktop Category Links */}
        {!isMobile && (
          <div style={{ background: "#0D1120", borderTop: `1px solid ${COLORS.cardBorder}`, display: "flex", justifyContent: "center", overflowX: "auto" }}>
            {navLinks.map((link) => (
              <button key={link} onClick={() => go(getNavTarget(link))}
                style={{ padding: "11px 18px", background: "transparent", border: "none", color: link === "Offers" ? COLORS.green : COLORS.muted, cursor: "pointer", fontSize: 13, fontWeight: link === "Offers" ? 700 : 500, whiteSpace: "nowrap", borderBottom: "2px solid transparent", display: "flex", alignItems: "center", gap: 5 }}>
                {linkIcons[link]}{link}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Drawer Menu */}
        {isMobile && menuOpen && (
          <div style={{ background: "#0D1120", borderTop: `1px solid ${COLORS.cardBorder}`, padding: "8px 0" }}>
            {navLinks.map((link) => (
              <button key={link} onClick={() => go(getNavTarget(link))}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "13px 20px", background: "transparent", border: "none", color: link === "Offers" ? COLORS.green : COLORS.text, cursor: "pointer", fontSize: 15, fontWeight: link === "Offers" ? 700 : 500, textAlign: "left", borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                {linkIcons[link]}{link}
              </button>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 16px" }}>
              {[{ label: "Compare", icon: <Scale size={14} />, t: "compare" }, { label: "Login", icon: <User size={14} />, t: "login" }].map((b) => (
                <button key={b.label} onClick={() => go(b.t)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.cardBg, color: COLORS.muted, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 14 }}>
                  {b.icon}{b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

/* ── Helpers ── */
const iconBtn: React.CSSProperties = {
  background: "transparent", border: `1px solid #1E2535`, borderRadius: 8,
  width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", position: "relative",
};

function Badge({ count, dark }: { count: number; dark?: boolean }) {
  return (
    <span style={{ position: "absolute", top: -6, right: -6, background: dark ? COLORS.black : "#EF4444", color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {count}
    </span>
  );
}
