"use client";

import { useState } from "react";
import { SlidersHorizontal, X, Search, ChevronDown } from "lucide-react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useIsMobile } from "@/lib/hooks";

interface ProductListingProps {
  products: Product[];
  onViewProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}

const filterConfig = [
  { label: "Condition", key: "condition", options: ["Refurbished", "Brand New"] },
  { label: "Brand", key: "brand", options: ["Dell", "HP", "Lenovo", "Apple", "Asus"] },
  { label: "RAM",   key: "ram",   options: ["8GB", "16GB", "32GB"] },
  { label: "Grade", key: "grade", options: ["A+", "A", "B+"] },
] as const;

type FilterKey = "brand" | "ram" | "grade" | "condition";
interface Filters { brand: string; ram: string; grade: string; condition: string; priceMax: number; }

const sortOptions = [
  { label: "Most Popular",  value: "popular"   },
  { label: "Price: Low–High", value: "asc"    },
  { label: "Price: High–Low", value: "desc"   },
  { label: "Top Rated",     value: "rating"    },
  { label: "Biggest Discount", value: "discount" },
];

export default function ProductListing({ products, onViewProduct, onAddToCart, onWishlist, wishlist }: ProductListingProps) {
  const [filters, setFilters] = useState<Filters>({ brand: "", ram: "", grade: "", condition: "", priceMax: 200000 });
  const [sort, setSort]       = useState("popular");
  const [search, setSearch]   = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const setFilter = (k: FilterKey, v: string) =>
    setFilters((f) => ({ ...f, [k]: f[k] === v ? "" : v }));

  const filtered = products
    .filter((p) =>
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.ram   || p.ram   === filters.ram)   &&
      (!filters.grade || p.grade === filters.grade)  &&
      (!filters.condition || (p.condition ?? "Refurbished") === filters.condition) &&
      p.price <= filters.priceMax &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.specs.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "asc")      return a.price - b.price;
      if (sort === "desc")     return b.price - a.price;
      if (sort === "rating")   return b.rating - a.rating;
      if (sort === "discount") return b.discount - a.discount;
      return 0;
    });

  const activeCount = [filters.brand, filters.ram, filters.grade, filters.condition].filter(Boolean).length;
  const clearAll    = () => setFilters({ brand: "", ram: "", grade: "", condition: "", priceMax: 200000 });

  const FilterPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {filterConfig.map((f) => {
        // Hide Grade filter if "Brand New" condition is selected
        if (f.key === "grade" && filters.condition === "Brand New") return null;

        return (
          <div key={f.key}>
            <div style={{
              color: COLORS.text, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              marginBottom: 12, fontFamily: "'Sora', sans-serif",
            }}>{f.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {f.options.map((opt) => {
                const active = filters[f.key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setFilter(f.key, opt)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: active ? "rgba(56,189,248,0.12)" : "transparent",
                      border: `1px solid ${active ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 10, padding: "9px 14px",
                      cursor: "pointer", color: active ? COLORS.green : COLORS.muted,
                      fontSize: 13, fontWeight: active ? 700 : 400,
                      transition: "all 0.2s", textAlign: "left",
                    }}
                  >
                    {opt}
                    {active && <span style={{ fontSize: 14 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Price slider */}
      <div>
        <div style={{
          color: COLORS.text, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase",
          marginBottom: 6, fontFamily: "'Sora', sans-serif",
        }}>Max Price</div>
        <div style={{ color: COLORS.green, fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif", marginBottom: 10 }}>
          ₹{filters.priceMax.toLocaleString("en-IN")}
        </div>
        <input
          type="range" min={10000} max={200000} step={5000}
          value={filters.priceMax}
          onChange={(e) => setFilters((f) => ({ ...f, priceMax: Number(e.target.value) }))}
          style={{ width: "100%", accentColor: COLORS.green }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.muted, fontSize: 11, marginTop: 4 }}>
          <span>₹10K</span><span>₹2L</span>
        </div>
      </div>
    </div>
  );

  return (
    <main style={{ background: COLORS.darkBg, minHeight: "100vh" }}>
      {/* Page header */}
      <div style={{
        background: COLORS.background,
        borderBottom: "1px solid rgba(56,150,240,0.08)",
        padding: isMobile ? "28px 18px 20px" : "40px 24px 28px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6 }}>
            Shop / All Laptops
          </div>
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
            color: COLORS.text, letterSpacing: "-0.03em",
            margin: "0 0 20px",
          }}>
            All Laptops
            <span style={{ color: COLORS.muted, fontWeight: 400, fontSize: "0.5em", marginLeft: 12 }}>
              {filtered.length} products
            </span>
          </h1>

          {/* Search + Sort bar */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <Search size={14} style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)", color: COLORS.muted,
              }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search laptops, specs…"
                style={{
                  width: "100%", background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 12, padding: "11px 14px 11px 38px",
                  color: COLORS.text, fontSize: 14, outline: "none",
                  boxSizing: "border-box", transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(56,189,248,0.4)"; }}
                onBlur={(e) => { e.target.style.borderColor = COLORS.cardBorder; }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 12, padding: "11px 40px 11px 14px",
                  color: COLORS.text, fontSize: 14, outline: "none",
                  cursor: "pointer", appearance: "none",
                }}
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)", color: COLORS.muted,
                pointerEvents: "none",
              }} />
            </div>

            {/* Filter toggle (mobile) */}
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: activeCount > 0 ? "rgba(56,189,248,0.10)" : COLORS.cardBg,
                  border: `1px solid ${activeCount > 0 ? "rgba(56,189,248,0.32)" : COLORS.cardBorder}`,
                  borderRadius: 12, padding: "11px 16px",
                  color: activeCount > 0 ? COLORS.green : COLORS.muted,
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                }}
              >
                <SlidersHorizontal size={14} />
                Filters{activeCount > 0 ? ` (${activeCount})` : ""}
              </button>
            )}

            {activeCount > 0 && (
              <button
                onClick={clearAll}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 12, padding: "11px 14px",
                  color: "#EF4444", cursor: "pointer", fontSize: 13,
                }}
              >
                <X size={13} />Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 20px 60px" : "32px 24px 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
          gap: 28, alignItems: "start",
        }}>
          {/* Desktop sidebar filters */}
          {!isMobile && (
            <div style={{
              background: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 20, padding: 24,
              position: "sticky", top: 72,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 24,
              }}>
                <div style={{
                  color: COLORS.text, fontWeight: 800, fontSize: 15,
                  fontFamily: "'Sora', sans-serif",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <SlidersHorizontal size={15} color={COLORS.green} />
                  Filters
                </div>
                {activeCount > 0 && (
                  <button onClick={clearAll} style={{
                    background: "transparent", border: "none",
                    color: "#EF4444", cursor: "pointer", fontSize: 12,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <X size={11} />Clear
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          )}

          {/* Product grid */}
          <div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <div style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                  width: 96, height: 96, borderRadius: "50%",
                  background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,150,240,0.12)",
                  margin: "0 auto 24px",
                  boxShadow: "0 0 30px rgba(56,189,248,0.05)",
                }}>
                  <Search size={36} color={COLORS.green} />
                </div>
                <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700 }}>
                  No products found
                </h3>
                <p style={{ color: COLORS.muted, marginTop: 8, marginBottom: 20 }}>
                  Try adjusting your filters or search term
                </p>
                <button onClick={clearAll} style={{
                  background: COLORS.green, color: "#000",
                  border: "none", borderRadius: 100,
                  padding: "12px 28px", fontWeight: 700, cursor: "pointer",
                }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(auto-fill, minmax(240px, 1fr))",
                gap: isMobile ? 12 : 18,
              }}>
                {filtered.map((p, i) => (
                  <div key={p.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                    <ProductCard product={p} onView={onViewProduct} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isMobile && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(6px)", zIndex: 99,
            }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: COLORS.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            border: `1px solid ${COLORS.cardBorder}`, zIndex: 100,
            padding: "24px 18px 40px",
            maxHeight: "85vh", overflowY: "auto",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 24,
            }}>
              <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif" }}>
                Filters
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{
                background: COLORS.background, border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 10, width: 36, height: 36,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: COLORS.muted,
              }}>
                <X size={16} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                width: "100%", marginTop: 28,
                background: COLORS.green, color: "#000",
                border: "none", borderRadius: 14,
                padding: "16px", fontWeight: 800, fontSize: 16,
                cursor: "pointer", fontFamily: "'Sora', sans-serif",
              }}
            >
              Show {filtered.length} Results
            </button>
          </div>
        </>
      )}
    </main>
  );
}
