"use client";

import { useState } from "react";
import {
  Heart, ShoppingCart, Star, Shield, RefreshCw, Truck, BadgeCheck,
  Share2, ChevronLeft, ChevronRight, Zap, Tag, Info, Award,
} from "lucide-react";
import { COLORS, products } from "@/data/products";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useIsMobile } from "@/lib/hooks";

interface Props {
  product: Product | null;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
  setPage: (p: string) => void;
  onViewProduct: (p: Product) => void;
}

const specIcons: Record<string, string> = {
  CPU: "⚡", RAM: "💾", Storage: "📦", Display: "🖥", GPU: "🎮",
  OS: "🪟", Battery: "🔋", Weight: "⚖", Camera: "📷",
};

export default function ProductDetail({ product, onAddToCart, onWishlist, wishlist, setPage, onViewProduct }: Props) {
  const [tab, setTab]     = useState<"specs" | "why" | "reviews">("specs");
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);
  const isMobile = useIsMobile();

  if (!product) return null;

  const isWished  = wishlist.includes(product.id);
  const related   = products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const specs = [
    ["CPU", product.processor],
    ["RAM", product.ram],
    ["Storage", product.storage],
    ["Specs Detail", product.specs],
  ].filter(([, v]) => v);

  const trustBadges = [
    { icon: <Shield size={14} color={COLORS.green} />, text: product.warranty ?? "1 Year Warranty" },
    { icon: <RefreshCw size={14} color={COLORS.green} />, text: "7 Day Returns" },
    { icon: <Truck size={14} color={COLORS.green} />, text: "Free Delivery" },
    { icon: <BadgeCheck size={14} color={COLORS.green} />, text: "Grade " + product.grade },
  ];

  return (
    <main style={{ background: COLORS.darkBg, minHeight: "100vh" }}>
      {/* ── Breadcrumb ─────────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "16px 20px" : "20px 24px",
        display: "flex", gap: 6, alignItems: "center",
      }}>
        {[
          { label: "Home", page: "home" },
          { label: "Laptops", page: "listing" },
          { label: product.name, page: null },
        ].map((b, i) => (
          <span key={b.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <ChevronRight size={12} color="#333" />}
            <span
              onClick={b.page ? () => setPage(b.page!) : undefined}
              style={{
                color: b.page ? COLORS.muted : COLORS.text,
                fontSize: 13, cursor: b.page ? "pointer" : "default",
                fontWeight: b.page ? 400 : 600,
                maxWidth: i === 2 ? 200 : "auto",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >{b.label}</span>
          </span>
        ))}
      </div>

      {/* ── Main content ───────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "0 20px 48px" : "0 24px 80px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 32 : 56,
        alignItems: "start",
      }}>

        {/* Left: Image */}
        <div style={{ position: "relative" }}>
          <div style={{
            borderRadius: 24,
            overflow: "hidden",
            background: COLORS.background,
            border: `1px solid ${COLORS.cardBorder}`,
            aspectRatio: "4/3",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <img
              src={product.img} alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80";
              }}
            />
            <span style={{
              position: "absolute", top: 16, left: 16,
              background: "#EF4444", color: "#fff",
              fontSize: 11, fontWeight: 800, padding: "4px 12px",
              borderRadius: 100,
            }}>
              {product.discount}% OFF
            </span>
          </div>

          {/* Trust badges row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8, marginTop: 14,
          }}>
            {trustBadges.map((b) => (
              <div key={b.text} style={{
                background: COLORS.background,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 12,
                padding: "10px 8px", textAlign: "center",
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>{b.icon}</div>
                <div style={{ color: COLORS.muted, fontSize: 10, fontWeight: 500 }}>{b.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(56,189,248,0.08)",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 100, padding: "4px 12px",
            marginBottom: 14,
          }}>
            <Award size={11} color={COLORS.green} />
            <span style={{ color: COLORS.green, fontSize: 11, fontWeight: 700 }}>
              {product.badge}
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(22px, 3vw, 36px)",
            fontWeight: 800,
            color: COLORS.text,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            margin: "0 0 8px",
          }}>{product.name}</h1>

          <p style={{ color: COLORS.muted, fontSize: 14, margin: "0 0 18px", lineHeight: 1.7 }}>
            {product.specs}
          </p>

          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} fill={s <= Math.floor(product.rating) ? "#F59E0B" : "transparent"} color={s <= Math.floor(product.rating) ? "#F59E0B" : "rgba(255,255,255,0.15)"} />
              ))}
            </div>
            <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{product.rating}</span>
            <span style={{ color: COLORS.muted, fontSize: 13 }}>({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 18, padding: "22px 24px",
            marginBottom: 22,
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 8 }}>
              <span style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 40, fontWeight: 800,
                color: COLORS.text, letterSpacing: "-0.03em",
              }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span style={{ color: COLORS.muted, fontSize: 16, textDecoration: "line-through", marginBottom: 6 }}>
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={{
                background: "rgba(16,185,129,0.12)", color: "#10B981",
                fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
              }}>
                You save ₹{(product.mrp - product.price).toLocaleString("en-IN")}
              </span>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>
                EMI from ₹{Math.round(product.price / 12).toLocaleString("en-IN")}/mo
              </span>
            </div>
          </div>

          {/* Quantity + Add */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 0,
              background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 14, overflow: "hidden",
            }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
                background: "transparent", border: "none", color: COLORS.text,
                width: 44, height: 48, cursor: "pointer", fontSize: 20,
              }}>−</button>
              <span style={{ color: COLORS.text, fontWeight: 700, width: 32, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{
                background: "transparent", border: "none", color: COLORS.text,
                width: 44, height: 48, cursor: "pointer", fontSize: 20,
              }}>+</button>
            </div>
            <button onClick={handleAdd} style={{
              flex: 1, minWidth: 180,
              background: added ? "#10B981" : "linear-gradient(135deg, #3B82F6, #38BDF8)",
              color: "#000", border: "none", borderRadius: 14,
              height: 48, fontWeight: 800, fontSize: 15,
              cursor: "pointer", fontFamily: "'Sora', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              transition: "all 0.25s ease",
              boxShadow: "0 0 40px rgba(56,189,248,0.22)",
            }}>
              {added ? <><span>✓</span> Added!</> : <><Zap size={15} /> Add to Cart</>}
            </button>
            <button
              onClick={() => onWishlist(product.id)}
              style={{
                background: isWished ? "rgba(239,68,68,0.12)" : COLORS.cardBg,
                border: `1px solid ${isWished ? "rgba(239,68,68,0.3)" : COLORS.cardBorder}`,
                borderRadius: 14, width: 48, height: 48,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <Heart size={18} fill={isWished ? "#EF4444" : "transparent"} color={isWished ? "#EF4444" : COLORS.muted} />
            </button>
          </div>

          <button onClick={() => setPage("checkout")} style={{
            width: "100%", background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: COLORS.text, borderRadius: 14, height: 48,
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            fontFamily: "'Sora', sans-serif",
            transition: "border-color 0.2s",
            marginBottom: 22,
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            Buy Now
          </button>

          {/* Tabs */}
          <div>
            <div style={{
              display: "flex", gap: 0,
              borderBottom: `1px solid ${COLORS.cardBorder}`,
              marginBottom: 20,
            }}>
              {(["specs", "why", "reviews"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: "transparent", border: "none",
                  borderBottom: `2px solid ${tab === t ? COLORS.green : "transparent"}`,
                  color: tab === t ? COLORS.text : COLORS.muted,
                  padding: "10px 18px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}>
                  {t === "specs" ? "Specifications" : t === "why" ? "Why Buy?" : "Reviews"}
                </button>
              ))}
            </div>

            {/* Specs */}
            {tab === "specs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {specs.length > 0 ? specs.map(([key, val]) => (
                  <div key={key} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: `1px solid ${COLORS.cardBorder}`,
                  }}>
                    <span style={{ color: COLORS.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                      {specIcons[key] ?? "·"} {key}
                    </span>
                    <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, maxWidth: "55%", textAlign: "right" }}>
                      {val as string}
                    </span>
                  </div>
                )) : (
                  <p style={{ color: COLORS.muted, fontSize: 13 }}>{product.specs}</p>
                )}
              </div>
            )}

            {/* Why Buy */}
            {tab === "why" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "72-point quality inspection completed",
                  "Original parts — no fake components",
                  "Full operating system restored & verified",
                  "Battery cycle count checked & disclosed",
                  "1 Year warranty with nationwide service",
                  "7-day return if not satisfied",
                ].map((item) => (
                  <div key={item} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <BadgeCheck size={16} color={COLORS.green} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {tab === "reviews" && (
              <div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
                  padding: "16px 20px", background: COLORS.background,
                  borderRadius: 16, border: `1px solid ${COLORS.cardBorder}`,
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.text, lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
                      {product.rating}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 4 }}>
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12} fill="#FBBF24" color="#FBBF24" />
                      ))}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>{product.reviews} reviews</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Related products ──────────────────── */}
      <div style={{
        background: COLORS.background,
        borderTop: `1px solid ${COLORS.cardBorder}`,
        padding: isMobile ? "48px 18px" : "80px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(22px, 3vw, 36px)",
            fontWeight: 800, color: COLORS.text,
            letterSpacing: "-0.025em",
            margin: "0 0 32px",
          }}>You Might Also Like</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 18,
          }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onView={onViewProduct} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
