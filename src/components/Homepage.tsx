"use client";

import {
  Shield, RefreshCw, Truck, CreditCard, CheckCircle2,
  Microscope, BadgeDollarSign, ArrowRight, Recycle, Star,
} from "lucide-react";
import { useState } from "react";
import { COLORS, products, categories, reviews } from "@/data/products";
import type { Product } from "@/data/products";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { useIsMobile } from "@/lib/hooks";

/* ── Trust Strip ──────────────────────────────────────── */
const trustItems = [
  { icon: <Shield size={15} color={COLORS.green} />, text: "1 Year Warranty" },
  { icon: <RefreshCw size={15} color={COLORS.green} />, text: "7 Day Replacement" },
  { icon: <Truck size={15} color={COLORS.green} />, text: "Free Shipping" },
  { icon: <CreditCard size={15} color={COLORS.green} />, text: "EMI Available" },
  { icon: <CheckCircle2 size={15} color={COLORS.green} />, text: "Quality Checked" },
];

function TrustStrip() {
  return (
    <div style={{
      background: COLORS.background,
      borderTop: "1px solid rgba(56,150,240,0.08)",
      borderBottom: "1px solid rgba(56,150,240,0.08)",
      padding: "18px 24px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", justifyContent: "space-around",
        flexWrap: "wrap", gap: 14,
      }}>
        {trustItems.map((item) => (
          <div key={item.text} style={{
            display: "flex", alignItems: "center", gap: 9,
            color: COLORS.muted, fontSize: 13, fontWeight: 500,
          }}>
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section header ───────────────────────────────────── */
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 48, textAlign: "center" }}>
      {eyebrow && (
        <div style={{
          display: "inline-block",
          color: COLORS.green, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: 12,
          background: "rgba(56,189,248,0.08)",
          padding: "4px 14px", borderRadius: 100,
          border: "1px solid rgba(56,189,248,0.15)",
        }}>{eyebrow}</div>
      )}
      <h2 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: "clamp(26px, 4vw, 46px)",
        fontWeight: 800, letterSpacing: "-0.03em",
        color: COLORS.text, margin: "0 0 12px", lineHeight: 1.1,
      }}>{title}</h2>
      {subtitle && <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Smart finder ─────────────────────────────────────── */
const finderQ = [
  { q: "What's your budget?",  opts: ["Under ₹20,000", "₹20K–₹40K", "₹40K–₹70K", "₹70K+"] },
  { q: "Primary usage?",       opts: ["Student / Office", "Gaming", "Creative Work", "Business"] },
  { q: "RAM preference?",      opts: ["8GB", "16GB", "32GB", "Any"] },
  { q: "Brand preference?",    opts: ["Dell", "HP", "Lenovo", "Apple", "Any"] },
];

const whyItems = [
  { icon: <Microscope size={28} color={COLORS.green} />, t: "Quality Tested",      d: "72+ point checks" },
  { icon: <CheckCircle2 size={28} color={COLORS.green} />, t: "100% Original",     d: "Genuine parts" },
  { icon: <Shield size={28} color={COLORS.green} />,       t: "1 Year Warranty",   d: "Hassle free" },
  { icon: <RefreshCw size={28} color={COLORS.green} />,    t: "7-Day Returns",     d: "No questions asked" },
  { icon: <BadgeDollarSign size={28} color={COLORS.green} />, t: "Best Price",     d: "Save up to 70%" },
];

/* ── Homepage ─────────────────────────────────────────── */
interface HomepageProps {
  setPage: (p: string) => void;
  onViewProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}

export default function Homepage({ setPage, onViewProduct, onAddToCart, onWishlist, wishlist }: HomepageProps) {
  const isMobile = useIsMobile();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult]   = useState<Product[] | null>(null);

  const answer = (a: string) => {
    const na = { ...answers, [step]: a };
    setAnswers(na);
    if (step < finderQ.length - 1) setStep(step + 1);
    else setResult(products.slice(0, 3));
  };
  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  const section = (children: React.ReactNode, alt = false) => (
    <section style={{
      background: alt ? COLORS.background : COLORS.darkBg,
      padding: `${isMobile ? 56 : 100}px ${isMobile ? 18 : 24}px`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
    </section>
  );

  return (
    <main>
      <Hero setPage={setPage} />
      <TrustStrip />

      {/* ── Categories ──────────────────────────── */}
      {section(
        <>
          <SectionHeader eyebrow="Browse" title="Shop By Category" subtitle="Curated selection of certified refurbished tech" />
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",
            gap: isMobile ? 12 : 20,
          }}>
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                onClick={() => setPage("listing")}
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 20,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  animation: `fadeUp 0.5s ease ${i * 0.07}s both`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(56,189,248,0.30)";
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(56,189,248,0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = COLORS.cardBorder;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <div style={{ height: isMobile ? 100 : 140, overflow: "hidden" }}>
                  <img src={cat.icon} alt={cat.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  />
                </div>
                <div style={{ padding: isMobile ? "12px 14px" : "18px 20px" }}>
                  <div style={{
                    color: COLORS.text, fontWeight: 700, fontSize: isMobile ? 13 : 14,
                    fontFamily: "'Sora', sans-serif", marginBottom: 3,
                  }}>{cat.name}</div>
                  <div style={{ color: COLORS.muted, fontSize: 11 }}>{cat.count}</div>
                </div>
              </div>
            ))}
          </div>
        </>, true
      )}

      {/* ── Smart Finder ────────────────────────── */}
      {section(
        <>
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid rgba(56,189,248,0.15)`,
            borderRadius: 28,
            padding: isMobile ? "28px 18px" : "56px 48px",
            backgroundImage: "radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(56,189,248,0.06) 0%, transparent 50%)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span style={{
                background: "rgba(99,102,241,0.12)", color: "#818CF8",
                fontSize: 10, fontWeight: 700, padding: "4px 12px",
                borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.1em",
              }}>AI-Powered</span>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontSize: "clamp(22px,4vw,38px)",
                fontWeight: 800, color: COLORS.text,
                margin: "14px 0 8px", letterSpacing: "-0.02em",
              }}>Smart Product Finder</h2>
              <p style={{ color: COLORS.muted, fontSize: 15 }}>
                Answer 4 quick questions — we'll find your perfect laptop
              </p>
            </div>

            {result ? (
              <div>
                <p style={{ color: COLORS.green, textAlign: "center", fontWeight: 700, marginBottom: 20, fontSize: 15 }}>
                  ✦ Top picks for you
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                  gap: 16,
                }}>
                  {result.map((p) => (
                    <div key={p.id} style={{
                      background: COLORS.background, borderRadius: 16, overflow: "hidden",
                      border: `1px solid ${COLORS.cardBorder}`,
                    }}>
                      <div style={{ height: 120, overflow: "hidden" }}>
                        <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif" }}>
                          ₹{p.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button onClick={reset} style={{
                    background: "transparent", color: COLORS.muted,
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 10, padding: "10px 24px",
                    cursor: "pointer", fontSize: 13,
                  }}>Start Over</button>
                </div>
              </div>
            ) : (
              <div>
                {/* Progress dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
                  {finderQ.map((_, i) => (
                    <div key={i} style={{
                      height: 4, borderRadius: 2,
                      width: i <= step ? 32 : 16,
                      background: i <= step ? COLORS.green : "rgba(255,255,255,0.08)",
                      transition: "all 0.3s ease",
                    }} />
                  ))}
                </div>
                <p style={{
                  color: COLORS.text, textAlign: "center",
                  fontSize: isMobile ? 16 : 20, fontWeight: 700,
                  marginBottom: 24, fontFamily: "'Sora', sans-serif",
                }}>
                  {finderQ[step].q}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {finderQ[step].opts.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => answer(opt)}
                      style={{
                        background: "rgba(56,189,248,0.08)",
                        color: COLORS.green,
                        border: "1px solid rgba(56,189,248,0.22)",
                        borderRadius: 100,
                        padding: isMobile ? "10px 16px" : "13px 26px",
                        fontSize: isMobile ? 13 : 14, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s ease",
                        fontFamily: "'Sora', sans-serif",
                        minHeight: 44,
                      }}
                      onMouseEnter={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.background = "linear-gradient(135deg, #3B82F6, #38BDF8)"; b.style.color = "#000";
                        b.style.border = "1px solid transparent";
                      }}
                      onMouseLeave={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.background = "rgba(56,189,248,0.08)"; b.style.color = COLORS.green;
                        b.style.border = "1px solid rgba(56,189,248,0.22)";
                      }}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Top Picks ───────────────────────────── */}
      {section(
        <>
          <SectionHeader eyebrow="Featured" title="Top Picks For You" subtitle="Handpicked devices with best value and performance" />
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(auto-fill,minmax(148px,1fr))"
              : "repeat(auto-fill,minmax(260px,1fr))",
            gap: isMobile ? 12 : 20,
          }}>
            {products.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeUp 0.5s ease ${i * 0.06}s both` }}>
                <ProductCard product={p} onView={onViewProduct} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button
              onClick={() => setPage("listing")}
              style={{
                background: "rgba(56,189,248,0.07)", color: COLORS.text,
                border: "1px solid rgba(56,189,248,0.18)",
                borderRadius: 100, padding: "14px 36px",
                fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Sora', sans-serif",
                display: "inline-flex", alignItems: "center", gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "rgba(56,189,248,0.38)";
                b.style.background = "rgba(56,189,248,0.12)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.borderColor = "rgba(56,189,248,0.18)";
                b.style.background = "rgba(56,189,248,0.07)";
              }}
            >
              View All Laptops <ArrowRight size={15} />
            </button>
          </div>
        </>, true
      )}

      {/* ── Exchange Banner ──────────────────────── */}
      {section(
        <div style={{
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 28,
          padding: isMobile ? "28px 18px" : "56px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: "wrap", gap: 24,
          flexDirection: isMobile ? "column" : "row",
          backgroundImage: "radial-gradient(ellipse at 0% 50%, rgba(56,189,248,0.07) 0%, transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(99,102,241,0.06) 0%, transparent 55%)",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, color: COLORS.muted, fontSize: 13, marginBottom: 10 }}>
              <Recycle size={15} color={COLORS.green} />
              <span>Eco-friendly Exchange Program</span>
            </div>
            <h3 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: isMobile ? 24 : 38, fontWeight: 800,
              color: COLORS.text, margin: "0 0 10px",
              letterSpacing: "-0.025em",
            }}>Exchange Your Old Laptop</h3>
            <p style={{ color: COLORS.muted, fontSize: 15, margin: 0 }}>
              Get up to{" "}
              <span style={{ color: COLORS.green, fontWeight: 800 }}>₹15,000 Off</span>
              {" "}on your next purchase
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: isMobile ? 48 : 64, opacity: 0.4 }}>💻</div>
            <ArrowRight size={22} color={COLORS.green} />
            <div style={{ fontSize: isMobile ? 48 : 64 }}>💻</div>
          </div>
          <button style={{
            background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000",
            border: "none", borderRadius: 100,
            padding: "15px 32px", fontSize: 15, fontWeight: 800,
            cursor: "pointer", fontFamily: "'Sora', sans-serif",
            display: "flex", alignItems: "center", gap: 8,
            width: isMobile ? "100%" : "auto", justifyContent: "center",
            boxShadow: "0 0 40px rgba(56,189,248,0.25)",
            minHeight: 48,
          }}>
            Exchange Now <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* ── Why Techstore Pro ──────────────────────── */}
      {section(
        <>
          <SectionHeader eyebrow="Why Us" title="The Techstore Pro Promise" subtitle="We make refurbished trustworthy and reliable" />
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(5,1fr)",
            gap: isMobile ? 12 : 20,
          }}>
            {whyItems.map((f, i) => (
              <div key={f.t} style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 20, padding: isMobile ? "20px 14px" : "28px 20px",
                textAlign: "center",
                animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                transition: "all 0.3s ease",
                position: "relative", overflow: "hidden",
              }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(56,189,248,0.28)";
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = COLORS.cardBorder;
                  el.style.transform = "none";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)`,
                }} />
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{f.icon}</div>
                <div style={{ color: COLORS.text, fontWeight: 700, fontSize: isMobile ? 12 : 13, fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>{f.t}</div>
                <div style={{ color: COLORS.muted, fontSize: isMobile ? 11 : 12 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </>, true
      )}

      {/* ── Customer Reviews ─────────────────────── */}
      {section(
        <>
          <SectionHeader eyebrow="Reviews" title="50,000+ Happy Customers" subtitle="Trusted by students, professionals, and businesses across India" />
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(250px,1fr))",
            gap: 20,
          }}>
            {reviews.map((r, i) => (
              <div key={r.name} style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 20, padding: 24,
                animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
                transition: "border-color 0.2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(56,189,248,0.22)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.cardBorder; }}
              >
                <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13}
                      fill={s <= r.rating ? "#F59E0B" : "transparent"}
                      color={s <= r.rating ? "#F59E0B" : "rgba(255,255,255,0.15)"} />
                  ))}
                </div>
                <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))",
                    border: "1px solid rgba(56,189,248,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: COLORS.green, fontWeight: 800, fontSize: 12,
                    fontFamily: "'Sora', sans-serif",
                  }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                    <div style={{ color: COLORS.muted, fontSize: 12 }}>{r.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Newsletter ───────────────────────────── */}
      {section(
        <div style={{
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 28,
          padding: isMobile ? "32px 18px" : "60px 48px",
          textAlign: "center",
          backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(56,189,248,0.06) 0%, transparent 60%)",
        }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 800,
            color: COLORS.text, margin: "0 0 10px", letterSpacing: "-0.02em",
          }}>
            Stay Ahead of the Deals
          </h3>
          <p style={{ color: COLORS.muted, margin: "0 0 32px", fontSize: 15, lineHeight: 1.6 }}>
            Exclusive offers, new arrivals, and tech insights — straight to your inbox
          </p>
          <div style={{
            display: "flex", maxWidth: 500, margin: "0 auto",
            gap: 10, flexDirection: isMobile ? "column" : "row",
          }}>
            <input
              placeholder="Enter your email"
              style={{
                flex: 1, background: COLORS.background,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 12, padding: "14px 18px",
                color: COLORS.text, fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(56,189,248,0.38)"; }}
              onBlur={(e) => { e.target.style.borderColor = COLORS.cardBorder; }}
            />
            <button style={{
              background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000",
              border: "none", borderRadius: 12,
              padding: "14px 28px", fontWeight: 800, fontSize: 15,
              cursor: "pointer", fontFamily: "'Sora', sans-serif",
              whiteSpace: "nowrap",
              width: isMobile ? "100%" : "auto",
              minHeight: 48,
            }}>
              Subscribe
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
