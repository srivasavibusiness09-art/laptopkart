"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { COLORS, products } from "@/data/products";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useIsMobile } from "@/lib/hooks";

interface ProductListingProps {
  onViewProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}

const filterConfig = [
  { label: "Brand", key: "brand", options: ["Dell", "HP", "Lenovo", "Apple", "Asus"] },
  { label: "RAM",   key: "ram",   options: ["8GB", "16GB", "32GB"] },
  { label: "Grade", key: "grade", options: ["A+", "A", "B+"] },
] as const;

type FilterKey = "brand" | "ram" | "grade";

interface Filters {
  brand: string;
  ram: string;
  grade: string;
  priceMax: number;
}

export default function ProductListing({
  onViewProduct,
  onAddToCart,
  onWishlist,
  wishlist,
}: ProductListingProps) {
  const [filters, setFilters] = useState<Filters>({ brand: "", ram: "", grade: "", priceMax: 100000 });
  const [sort, setSort]       = useState("popular");
  const [search, setSearch]   = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const isMobile              = useIsMobile();

  const filtered = products
    .filter((p) => !filters.brand || p.brand === filters.brand)
    .filter((p) => !filters.ram   || p.ram   === filters.ram)
    .filter((p) => !filters.grade || p.grade  === filters.grade)
    .filter((p) => p.price <= filters.priceMax)
    .filter(
      (p) =>
        !search || p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "low"    ? a.price  - b.price  :
      sort === "high"   ? b.price  - a.price  :
      sort === "rating" ? b.rating - a.rating :
      b.reviews - a.reviews
    );

  const setFilter = (key: FilterKey, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "16px 14px" : "32px 20px" }}>

      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 24,
          color: COLORS.muted,
          fontSize: 14,
        }}
      >
        <span style={{ cursor: "pointer", color: COLORS.green }}>Home</span>
        <span>›</span>
        <span>All Laptops</span>
      </div>

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "10px 16px", color: COLORS.text, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          >
            {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px 1fr", gap: 24 }}>

        {/* ── Sidebar ── */}
        {(!isMobile || showFilters) && (
        <aside>
          <div
            style={{
              background: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 16,
              padding: isMobile ? 16 : 24,
              position: isMobile ? "static" : "sticky",
              top: isMobile ? 0 : 120,
            }}
          >
            <h3
              style={{
                color: COLORS.text,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                margin: "0 0 20px",
              }}
            >
              Filters
            </h3>

            {filterConfig.map((filter) => (
              <div key={filter.key} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    color: COLORS.text,
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  {filter.label}
                </div>
                {filter.options.map((opt) => (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters[filter.key] === opt}
                      onChange={(e) =>
                        setFilter(filter.key, e.target.checked ? opt : "")
                      }
                      style={{ accentColor: COLORS.green }}
                    />
                    <span style={{ color: COLORS.muted, fontSize: 13 }}>{opt}</span>
                  </label>
                ))}
              </div>
            ))}

            {/* Price range */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: COLORS.text,
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Max Price: ₹{filters.priceMax.toLocaleString('en-IN')}
              </div>
              <input
                type="range"
                min={10000}
                max={100000}
                step={5000}
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMax: parseInt(e.target.value) }))
                }
                style={{ width: "100%", accentColor: COLORS.green }}
              />
            </div>

            <button
              onClick={() =>
                setFilters({ brand: "", ram: "", grade: "", priceMax: 100000 })
              }
              style={{
                width: "100%",
                background: "transparent",
                color: COLORS.muted,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                padding: "8px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Clear All Filters
            </button>
          </div>
        </aside>
        )}

        {/* ── Product Grid ── */}
        <div>
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ color: COLORS.muted, fontSize: 14 }}>
              {filtered.length} products found
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                width: isMobile ? "100%" : "auto",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: COLORS.text,
                  fontSize: 13,
                  outline: "none",
                  width: isMobile ? "100%" : "auto",
                }}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: COLORS.text,
                  fontSize: 13,
                  outline: "none",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onView={onViewProduct}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                wishlist={wishlist}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "60px 0", color: COLORS.muted }}
            >
              <div style={{ fontSize: 48 }}>🔍</div>
              <p>No products match your filters. Try adjusting them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
