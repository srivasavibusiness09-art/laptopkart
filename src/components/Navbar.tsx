"use client";

import { useState, useEffect } from "react";
import {
  Heart, ShoppingCart, User, Scale,
  X, Menu, Phone, ChevronDown, Truck
} from "lucide-react";
import { navLinks, categories } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import { ThemeToggle } from "./ThemeToggle";
import RequestProductModal from "./RequestProductModal";

interface NavbarProps {
  setPage: (page: string) => void;
  currentPage: string;
  activeListingCategory?: string;
  cart: { id: number }[];
  wishlist: (number | string)[];
  user: any;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const getTarget = (link: string) => ({
  Laptops: "listing:Laptops", Desktops: "listing:Desktops", Accessories: "accessories",
  Blog: "blog", Offers: "listing:Offers", "Resell Laptop": "resell", "Student Hub": "student-hub",
} as Record<string, string>)[link] ?? "home";

export default function Navbar({ setPage, currentPage, activeListingCategory = "", cart, wishlist, user, onSearch, searchQuery = "" }: NavbarProps) {
  const [search, setSearch] = useState(searchQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [offersActive, setOffersActive] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage !== "home") {
      setOffersActive(false);
    }
  }, [currentPage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (p: string) => { setPage(p); setMenuOpen(false); };

  const handleNavClick = (link: string) => {
    if (link === "Offers") {
      setOffersActive(true);
      setPage("home");
      setMenuOpen(false);
      setTimeout(() => {
        const el = document.getElementById("offers-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      setOffersActive(false);
      go(getTarget(link));
    }
  };

  const isLinkActive = (link: string) => {
    if (link === "Laptops") {
      return currentPage === "listing" && activeListingCategory === "Laptops";
    }
    if (link === "Desktops") {
      return currentPage === "listing" && activeListingCategory === "Desktops";
    }
    if (link === "Accessories") {
      return currentPage === "accessories";
    }
    if (link === "Student Hub") {
      return currentPage === "student-hub";
    }
    if (link === "Resell Laptop") {
      return currentPage === "resell";
    }
    if (link === "Blog") {
      return currentPage === "blog" || currentPage === "blog-detail" || currentPage === "write-blog";
    }
    if (link === "Offers") {
      return offersActive || (currentPage === "listing" && activeListingCategory === "Offers");
    }
    return false;
  };

  const navBg = scrolled
    ? "color-mix(in srgb, var(--bg-1) 96%, transparent)"
    : "var(--bg-1)";

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: navBg,
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: `1px solid var(--border)`,
        transition: "background 0.3s ease",
      }}>
        {/* TOP ROW */}
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: isMobile ? "12px" : "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: isMobile ? 12 : 24,
          flexWrap: isMobile ? "wrap" : "nowrap"
        }}>
          {/* Logo Section */}
          <div
            onClick={() => go("home")}
            style={{
              cursor: "pointer", flexShrink: 0,
              display: "flex", flexDirection: "column",
            }}
          >
            <img
              src="/Laptopkart logo.png"
              alt="Laptopkart Logo"
              style={{ height: isMobile ? 70 : 100, width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Search Bar & Helper (Desktop) */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", flex: 1, maxWidth: 650, gap: 20 }}>
              <div style={{ display: "flex", flex: 1, border: "2px solid #0062FF", borderRadius: 8, overflow: "hidden" }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSearch?.(search);
                  }}
                  placeholder="Search laptops, models, specs..."
                  style={{
                    flex: 1, padding: "12px 16px", border: "none", outline: "none",
                    background: "var(--bg-2)", color: "var(--text-2)", fontSize: 13,
                  }}
                />
                <button
                  onClick={() => onSearch?.(search)}
                  style={{
                    background: "#0062FF", color: "#fff", border: "none",
                    padding: "0 28px", fontWeight: 700, cursor: "pointer",
                    fontSize: 13, transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#0052D6"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#0062FF"}
                >
                  Search
                </button>
              </div>
              <div className="nav-helper-txt" style={{ display: "flex", flexDirection: "column", fontSize: 11, color: "#0062FF", flexShrink: 0, lineHeight: 1.4 }}>
                <span style={{ fontWeight: 500 }}>Can't find what you need?</span>
                <span onClick={() => setRequestModalOpen(true)} style={{ fontWeight: 600, cursor: "pointer", display: "inline-block" }}>Tell us →</span>
              </div>
            </div>
          )}

          {/* Icons Section */}
          <div style={{ display: "flex", gap: isMobile ? 8 : 16, alignItems: "center" }}>
            {isMobile && (
              <IconBtn onClick={() => setMenuOpen((o) => !o)}>
                {menuOpen ? <X size={20} color="var(--text-2)" /> : <Menu size={20} color="var(--text-2)" />}
              </IconBtn>
            )}

            {!isMobile && (
              <IconBtn onClick={() => go("profile")} label="Profile" className="nav-extra-btn">
                <User size={20} color="var(--text-2)" />
              </IconBtn>
            )}

            {!isMobile && (
              <IconBtn onClick={() => go("profile-orders")} label="Track Order" className="nav-extra-btn">
                <Truck size={20} color="var(--text-2)" />
              </IconBtn>
            )}

            {!isMobile && (
              <IconBtn onClick={() => go("compare")} label="Compare" className="nav-extra-btn">
                <Scale size={20} color="var(--text-2)" />
              </IconBtn>
            )}

            <IconBtn onClick={() => go("wishlist")} count={wishlist.length} label={!isMobile ? "Wishlist" : undefined}>
              <Heart size={20} color="var(--text-2)" />
            </IconBtn>

            <IconBtn onClick={() => go("cart")} count={cart.length} label={!isMobile ? "Cart" : undefined}>
              <ShoppingCart size={20} color="var(--text-2)" />
            </IconBtn>

            {!isMobile && (
              <div style={{ paddingLeft: 8, borderLeft: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {isMobile && (
          <div style={{ padding: "0 12px 12px 12px", display: "flex" }}>
            <div style={{ display: "flex", flex: 1, border: "2px solid #0062FF", borderRadius: 8, overflow: "hidden" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch?.(search);
                }}
                placeholder="Search laptops, models..."
                style={{
                  flex: 1, padding: "10px 14px", border: "none", outline: "none",
                  background: "var(--bg-2)", color: "var(--text-2)", fontSize: 13,
                }}
              />
              <button
                onClick={() => onSearch?.(search)}
                style={{
                  background: "#0062FF", color: "#fff", border: "none",
                  padding: "0 20px", fontWeight: 700, cursor: "pointer", fontSize: 13,
                }}
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM ROW (Nav Links) */}
        {!isMobile && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <div style={{
              maxWidth: 1280, margin: "0 auto", padding: "0 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between", height: 48
            }}>
              <div className="nav-bottom-links" style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {navLinks.map((link) => (
                  <div key={link} className="nav-dropdown-wrapper" style={{ position: "relative" }}>
                    {(() => {
                      const active = isLinkActive(link);
                      return (
                    <button
                      className={`nav-link-btn ${active ? "is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => handleNavClick(link)}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: active ? (link === "Offers" ? "var(--warning)" : "#0062FF") : (link === "Offers" ? "var(--warning)" : "var(--text-2)"),
                        fontSize: 13, fontWeight: active ? 700 : 500,
                        display: "flex", alignItems: "center", gap: 6, padding: "14px 0",
                        transition: "color 0.2s"
                      }}
                    >
                      {link}
                      {link === "Laptops" && <ChevronDown size={14} />}
                      {link === "Student Hub" && (
                        <span className="hub-new-badge" style={{
                          background: "var(--badge-new)", color: "#fff",
                          fontSize: 8, fontWeight: 800, letterSpacing: "0.05em",
                          padding: "1px 5px", borderRadius: 100, lineHeight: 1.4,
                        }}>NEW</span>
                      )}
                    </button>
                      );
                    })()}

                    {/* Dropdown for Laptops */}
                    {link === "Laptops" && (
                      <div className="nav-dropdown" style={{
                        position: "absolute", top: "100%", left: 0,
                        background: "var(--bg-1)", border: "1px solid var(--border)",
                        borderRadius: 12, padding: 8, minWidth: 220,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.15)", zIndex: 100,
                        display: "none", flexDirection: "column", gap: 4
                      }}>
                        {categories.map((c) => (
                          <div key={c.name} onClick={() => {
                            if (c.name === "Accessories") go("accessories");
                            else if (c.name === "Business Laptops") go("listing:Business Laptops");
                            else if (c.name === "Gaming Laptops") go("listing:Gaming");
                            else go(`listing:${c.name}`);
                          }} style={{
                            fontSize: 13, fontWeight: 500, color: "var(--text-2)", cursor: "pointer",
                            padding: "10px 16px", borderRadius: 8, transition: "background 0.2s"
                          }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                            {c.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Phone Number */}
              <div className="nav-phone" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={20} color="var(--text-2)" />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>+91 97503 31313</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-2)" }}>Mon-Sat 10AM-7PM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu drawer */}
        {isMobile && menuOpen && (
          <div style={{
            background: "var(--bg-1)", borderTop: "1px solid var(--border)", padding: "16px 20px",
            maxHeight: "calc(100vh - 120px)", overflowY: "auto"
          }}>
            {navLinks.map((link) => (
              (() => {
                const active = isLinkActive(link);
                return (
              <button
                key={link}
                onClick={() => handleNavClick(link)}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", textAlign: "left", background: "transparent", border: "none",
                  color: active ? (link === "Offers" ? "var(--warning)" : "#0062FF") : (link === "Offers" ? "var(--warning)" : "var(--text-2)"),
                  padding: "16px 0", cursor: "pointer",
                  fontSize: 14, fontWeight: active ? 700 : 600, borderBottom: "1px solid var(--border)",
                  borderLeft: active ? "3px solid #0062FF" : "3px solid transparent",
                  paddingLeft: active ? 10 : 0,
                  transition: "color 0.2s, border-color 0.2s, padding-left 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {link}
                  {link === "Student Hub" && (
                    <span style={{ background: "var(--error)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4 }}>NEW</span>
                  )}
                </div>
                {link === "Laptops" && <ChevronDown size={18} />}
              </button>
                );
              })()
            ))}

            <div style={{ padding: "20px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: 16 }}>
              <IconBtn onClick={() => go("profile")} label="Profile">
                <User size={20} color="var(--text-2)" />
              </IconBtn>
              <IconBtn onClick={() => go("compare")} label="Compare">
                <Scale size={20} color="var(--text-2)" />
              </IconBtn>
              <IconBtn onClick={() => go("profile-orders")} label="Track Order">
                <Truck size={20} color="var(--text-2)" />
              </IconBtn>
            </div>

            <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone size={20} color="var(--text-2)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>+91 97503 31313</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>Mon-Sat 10AM-7PM</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        )}
        <style>{`
          .nav-dropdown-wrapper:hover .nav-dropdown {
            display: flex !important;
          }
          .nav-link-btn {
            position: relative;
          }
          .nav-link-btn::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 6px;
            height: 2px;
            border-radius: 2px;
            background: #0062FF;
            transform: scaleX(0);
            transform-origin: left center;
            transition: transform 0.22s ease;
          }
          .nav-link-btn:hover {
            color: #0062FF !important;
          }
          .nav-link-btn:hover::after,
          .nav-link-btn.is-active::after {
            transform: scaleX(1);
          }
          .nav-link-btn:focus-visible {
            outline: 2px solid #0062FF;
            outline-offset: 4px;
            border-radius: 4px;
          }
          @media (max-width: 1280px) {
            .nav-btn-label {
              display: none !important;
            }
            .nav-helper-txt {
              display: none !important;
            }
            .hub-new-badge {
              display: none !important;
            }
            .nav-bottom-links {
              gap: 20px !important;
            }
          }
          @media (max-width: 1100px) {
            .nav-phone {
              display: none !important;
            }
          }
          @media (max-width: 1000px) {
            .nav-extra-btn {
              display: none !important;
            }
          }
        `}</style>
      </nav>
      <RequestProductModal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} />
    </>
  );
}

/* ── Small icon button helper ─────────────────────────── */
function IconBtn({
  children, onClick, count, label, className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  count?: number;
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        background: "transparent", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)",
        fontWeight: 500, fontSize: 12, padding: "6px 4px", transition: "color 0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = "#0062FF"}
      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-2)"}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
        {count !== undefined && (
          <span style={{
            position: "absolute", top: -8, right: -8,
            background: count > 0 ? "#0062FF" : "var(--bg-hover)",
            color: count > 0 ? "#fff" : "var(--text-2)", borderRadius: "50%",
            width: 18, height: 18, fontSize: 10, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid var(--bg-1)`,
          }}>
            {count}
          </span>
        )}
      </div>
      {label && <span className="nav-btn-label">{label}</span>}
    </button>
  );
}
