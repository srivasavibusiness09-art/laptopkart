"use client";

import { useState, useEffect } from "react";
import {
  Search, Heart, ShoppingCart, User, Scale,
  Flame, Laptop, Monitor, Keyboard, RefreshCw, Tag, Info, X, Menu, Phone, ChevronDown,
} from "lucide-react";
import { COLORS, navLinks } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  setPage: (page: string) => void;
  cart: { id: number }[];
  wishlist: number[];
  user: any;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const linkIcons: Record<string, React.ReactNode> = {
  Offers: <Flame size={13} color="var(--warning)" />,
  Laptops: <Laptop size={13} />,
  Desktops: <Monitor size={13} />,
  Accessories: <Keyboard size={13} />,
  "Resell Laptop": <RefreshCw size={13} />,
  Blog: <Tag size={13} />,
};

const getTarget = (link: string) => ({
  Laptops: "listing:Laptops", Desktops: "listing:Desktops", Accessories: "accessories",
  About: "about", Blog: "blog", Offers: "listing:Offers", "Resell Laptop": "resell",
} as Record<string, string>)[link] ?? "home";

export default function Navbar({ setPage, cart, wishlist, user, onSearch, searchQuery = "" }: NavbarProps) {
  const [search, setSearch] = useState(searchQuery);
  const [searchActive, setSearchActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bulkDropdownOpen, setBulkDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setSearch(searchQuery);
    if (searchQuery) {
      setSearchActive(true);
    }
  }, [searchQuery]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (p: string) => { setPage(p); setMenuOpen(false); };

  const handleNavClick = (link: string) => {
    if (link === "Offers") {
      setPage("home");
      setMenuOpen(false);
      setTimeout(() => {
        const el = document.getElementById("offers-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      go(getTarget(link));
    }
  };

  const navBg = scrolled
    ? "color-mix(in srgb, var(--bg) 92%, transparent)"
    : "color-mix(in srgb, var(--bg) 65%, transparent)";

  return (
    <>
      {/* ── Main nav ──────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: navBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid rgba(56,189,248,${scrolled ? 0.08 : 0.04})`,
        transition: "background 0.3s ease",
      }}>
        <div style={{
          maxWidth: "100%", margin: "0 auto",
          padding: isMobile ? "0 12px" : "0 24px",
          display: "flex", alignItems: "center",
          height: 60, gap: isMobile ? 8 : 16,
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
              <span style={{
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(135deg, var(--accent), #6366F1)",
              }}>Laptopkart</span>
            </span>
          </div>

          {/* Desktop center links */}
          {!isMobile && (
            <div style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 4,
              minWidth: 0,
              marginLeft: 28,
              marginRight: "auto",
              flexShrink: 0,
            }}>
              {navLinks
                .filter((link) => !searchActive || (link !== "Resell Laptop" && link !== "About"))
                .map((link) => (
                  <button
                    key={link}
                    title={link}
                    className={link === "Resell Laptop" ? "nav-link-resell" : link === "About" ? "nav-link-about" : ""}
                    onClick={() => handleNavClick(link)}
                    style={{
                      padding: "6px 10px", background: "transparent",
                      border: "none",
                      color: link === "Offers" ? "var(--warning)" : "var(--text-2)",
                      cursor: "pointer", fontSize: 14, fontWeight: 500,
                      whiteSpace: "nowrap", letterSpacing: "0.01em",
                      display: "flex", alignItems: "center", gap: 3,
                      transition: "color 0.2s",
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.color = "var(--text)"; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.color = link === "Offers" ? "var(--warning)" : "var(--text-2)"; }}
                  >
                    {linkIcons[link] && <span className="nav-link-icon">{linkIcons[link]}</span>}
                    {link === "Resell Laptop" ? (
                      <>
                        <span className="resell-text-long">Resell</span>
                        <span className="resell-text-short">Resell</span>
                      </>
                    ) : (
                      <span>{link}</span>
                    )}
                  </button>
                ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, marginLeft: "auto", alignItems: "center", flexShrink: 0 }}>
            {/* Expandable Search Input */}
            {searchActive ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                width: isMobile ? 110 : 260,
                height: 34,
                transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSearch?.(search);
                    }
                  }}
                  autoFocus
                  placeholder="Search..."
                  style={{
                    width: "100%",
                    background: "var(--bg-1)",
                    border: "1px solid var(--border-hi)",
                    borderRadius: 8,
                    padding: "6px 26px 6px 10px",
                    color: "var(--text)",
                    fontSize: isMobile ? 16 : 12,
                    lineHeight: "20px",
                    margin: 0,
                    outline: "none",
                    WebkitAppearance: "none",
                    height: 34,
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={() => {
                    setSearch("");
                    onSearch?.("");
                    setSearchActive(false);
                  }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <IconBtn onClick={() => setSearchActive(true)}>
                <Search size={isMobile ? 16 : 14} color="var(--text-2)" />
              </IconBtn>
            )}

            {isMobile ? (
              <>
                <IconBtn onClick={() => go("wishlist")} count={wishlist.length} countColor="var(--error)">
                  <Heart size={16} color={wishlist.length > 0 ? "var(--error)" : "var(--text-2)"} fill={wishlist.length > 0 ? "var(--error)" : "none"} />
                </IconBtn>
                <IconBtn onClick={() => go("cart")} count={cart.length} accent={cart.length > 0} countColor="#fff">
                  <ShoppingCart size={16} color={cart.length > 0 ? "#000" : "var(--text-2)"} />
                </IconBtn>
                <ThemeToggle />
                <IconBtn onClick={() => setMenuOpen((o) => !o)}>
                  {menuOpen ? <X size={18} color="var(--text)" /> : <Menu size={18} color="var(--text)" />}
                </IconBtn>
              </>
            ) : (
              <>
                <IconBtn onClick={() => go("wishlist")} count={wishlist.length} countColor="var(--error)" label="Wishlist">
                  <Heart size={14} color={wishlist.length > 0 ? "var(--error)" : "var(--text-2)"} fill={wishlist.length > 0 ? "var(--error)" : "none"} />
                </IconBtn>
                <IconBtn onClick={() => go("cart")} count={cart.length} accent={cart.length > 0} countColor="#fff" label={`Cart${cart.length > 0 ? ` (${cart.length})` : ""}`}>
                  <ShoppingCart size={14} color={cart.length > 0 ? "#000" : "var(--text-2)"} />
                </IconBtn>
                <IconBtn onClick={() => go("compare")} label="Compare">
                  <Scale size={14} color="var(--text-2)" />
                </IconBtn>
                <IconBtn onClick={() => go(user ? "profile" : "login")} label={user ? "Profile" : "Login"}>
                  <User size={14} color={user ? COLORS.green : "var(--text-2)"} />
                </IconBtn>
                <ThemeToggle />
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setBulkDropdownOpen(!bulkDropdownOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "var(--bg-hover)",
                      border: "1px solid var(--bg-active)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "var(--accent)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      height: 30,
                      boxSizing: "border-box",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-active)";
                      e.currentTarget.style.borderColor = "var(--border-focus)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                      e.currentTarget.style.borderColor = "var(--bg-active)";
                    }}
                  >
                    <span className="bulk-order-text-long">Bulk Order Contact</span>
                    <span className="bulk-order-text-short">Bulk Order</span>
                    <ChevronDown size={11} style={{ transform: bulkDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                  {bulkDropdownOpen && (
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      minWidth: 165,
                      boxShadow: "0 10px 25px var(--bg-overlay)",
                      zIndex: 1000,
                      textAlign: "center",
                    }}>
                      <div style={{ color: "var(--text-2)", fontSize: 10, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.02em" }}>Call or WhatsApp</div>
                      <a
                        href="tel:+919750331313"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          color: "var(--accent)",
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                        }}
                      >
                        <Phone size={12} />
                        <span>+91 97503 31313</span>
                      </a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile drawer */}
        {isMobile && menuOpen && (
          <div style={{
            background: "color-mix(in srgb, var(--bg) 97%, transparent)", backdropFilter: "blur(24px)",
            borderTop: "1px solid var(--border)",
            padding: "8px 0 16px",
          }}>
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleNavClick(link)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", textAlign: "left",
                  background: "transparent", border: "none",
                  color: link === "Offers" ? "var(--warning)" : "var(--text-2)",
                  padding: "14px 24px", cursor: "pointer",
                  fontSize: 15, fontWeight: 500,
                  borderBottom: "1px solid var(--border)",
                  minHeight: 48,
                }}
              >
                {linkIcons[link]}{link}
              </button>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 20px" }}>
              {[{ l: "Compare", t: "compare", icon: <Scale size={14} /> }, { l: user ? "Profile" : "Login", t: user ? "profile" : "login", icon: <User size={14} color={user ? COLORS.green : undefined} /> }].map((b) => (
                <button key={b.l} onClick={() => go(b.t)} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, background: "var(--bg-1)",
                  color: "var(--text-2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "12px", cursor: "pointer", fontSize: 13,
                  minHeight: 44,
                }}>
                  {b.icon}{b.l}
                </button>
              ))}
            </div>
          </div>
        )}
        <style>{`
          @media (max-width: 1440px) {
            .nav-link-icon {
              display: none !important;
            }
            .nav-link-about {
              display: none !important;
            }
            .resell-text-long {
              display: none !important;
            }
            .resell-text-short {
              display: inline !important;
            }
            .nav-btn-label {
              display: none !important;
            }
            .bulk-order-text-long {
              display: none !important;
            }
            .bulk-order-text-short {
              display: inline !important;
            }
          }
          @media (min-width: 1441px) {
            .resell-text-short {
              display: none !important;
            }
            .bulk-order-text-short {
              display: none !important;
            }
          }
        `}</style>
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
        border: `1px solid ${accent ? "transparent" : "var(--border)"}`,
        borderRadius: 8,
        height: 34,
        display: "flex", alignItems: "center", gap: 5,
        padding: label ? "0 12px" : "0 9px",
        cursor: "pointer", position: "relative",
        fontSize: 12, fontWeight: 600,
        color: accent ? "#000" : "var(--text-2)",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (!accent) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)"; }}
      onMouseLeave={(e) => { if (!accent) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
    >
      {children}
      {label && <span className="nav-btn-label">{label}</span>}
      {count !== undefined && count > 0 && (
        <span style={{
          position: "absolute", top: -5, right: -5,
          background: countColor ?? "var(--error)",
          color: "var(--text)", borderRadius: "50%",
          width: 16, height: 16, fontSize: 9, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2px solid ${COLORS.darkBg}`,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
