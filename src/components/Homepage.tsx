"use client";

import {
  Shield,
  RefreshCw,
  Truck,
  CreditCard,
  CheckCircle2,
  Microscope,
  BadgeDollarSign,
  ArrowRight,
  Recycle,
  Star,
} from "lucide-react";
import { useState } from "react";
import { COLORS, products, categories, reviews } from "@/data/products";
import type { Product } from "@/data/products";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";

/* ── Trust Bar ───────────────────────────────────────────── */
const trustItems = [
  { icon: <Shield size={16} color={COLORS.green} />, text: "1 Year Warranty" },
  { icon: <RefreshCw size={16} color={COLORS.green} />, text: "7 Day Replacement" },
  { icon: <Truck size={16} color={COLORS.green} />, text: "Free Shipping" },
  { icon: <CreditCard size={16} color={COLORS.green} />, text: "EMI Available" },
  { icon: <CheckCircle2 size={16} color={COLORS.green} />, text: "Quality Checked" },
];

function TrustBar() {
  return (
    <div
      style={{
        background: COLORS.cardBg,
        borderTop: `1px solid ${COLORS.cardBorder}`,
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        padding: "14px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {trustItems.map((item) => (
          <div
            key={item.text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: COLORS.muted,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section Title ───────────────────────────────────────── */
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 30,
          fontWeight: 800,
          color: COLORS.text,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h2>
      {subtitle && <p style={{ color: COLORS.muted, fontSize: 15 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Why features ────────────────────────────────────────── */
const whyFeatures = [
  { icon: <Microscope size={32} color={COLORS.green} />, title: "Quality Tested", desc: "72+ Quality Checks" },
  { icon: <CheckCircle2 size={32} color={COLORS.green} />, title: "100% Original", desc: "Genuine Parts" },
  { icon: <Shield size={32} color={COLORS.green} />, title: "1 Year Warranty", desc: "Hassle Free" },
  { icon: <RefreshCw size={32} color={COLORS.green} />, title: "7 Days Replacement", desc: "No Questions Asked" },
  { icon: <BadgeDollarSign size={32} color={COLORS.green} />, title: "Best Price", desc: "Save up to 70%" },
];

/* ── Smart Finder ────────────────────────────────────────── */
const finderQuestions = [
  { q: "What's your budget?", options: ["Under ₹20,000", "₹20K-₹40K", "₹40K-₹70K", "₹70K+"] },
  { q: "Primary usage?", options: ["Student / Office", "Gaming", "Creative Work", "Business"] },
  { q: "RAM preference?", options: ["8GB", "16GB", "32GB", "Any"] },
  { q: "Brand preference?", options: ["Dell", "HP", "Lenovo", "Apple", "Any"] },
];

/* ── Homepage ────────────────────────────────────────────── */
interface HomepageProps {
  setPage: (p: string) => void;
  onViewProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}

export default function Homepage({
  setPage,
  onViewProduct,
  onAddToCart,
  onWishlist,
  wishlist,
}: HomepageProps) {
  const [finderStep, setFinderStep] = useState(0);
  const [finderAnswers, setFinderAnswers] = useState<Record<number, string>>({});
  const [finderResult, setFinderResult] = useState<Product[] | null>(null);

  const handleFinderAnswer = (ans: string) => {
    const newAnswers = { ...finderAnswers, [finderStep]: ans };
    setFinderAnswers(newAnswers);
    if (finderStep < finderQuestions.length - 1) {
      setFinderStep(finderStep + 1);
    } else {
      setFinderResult(products.slice(0, 3));
    }
  };

  const resetFinder = () => {
    setFinderStep(0);
    setFinderAnswers({});
    setFinderResult(null);
  };

  return (
    <main>
      <Hero setPage={setPage} />
      <TrustBar />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 20px" }}>

        {/* ── Categories ── */}
        <SectionTitle title="Shop By Category" subtitle="Browse our curated selection of refurbished tech" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 60,
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setPage("listing")}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 16,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.green;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.cardBorder;
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }}
            >
              {/* Keep category emoji as product imagery */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 12,
                  margin: "0 auto 12px",
                }}
              >
                <img
                  src={cat.icon}
                  alt={cat.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  color: COLORS.text,
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Sora', sans-serif",
                  marginBottom: 4,
                }}
              >
                {cat.name}
              </div>
              <div style={{ color: COLORS.muted, fontSize: 12 }}>{cat.count}</div>
            </div>
          ))}
        </div>

        {/* ── Smart Finder ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #0D1F10 0%, #0A1520 100%)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 24,
            padding: "40px",
            marginBottom: 60,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span
              style={{
                background: COLORS.green,
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 20,
                textTransform: "uppercase",
              }}
            >
              AI-Powered
            </span>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 28,
                fontWeight: 800,
                color: COLORS.text,
                margin: "12px 0 8px",
              }}
            >
              Smart Product Finder
            </h2>
            <p style={{ color: COLORS.muted }}>
              Answer 4 quick questions — we&apos;ll find your perfect laptop
            </p>
          </div>
          {finderResult ? (
            <div>
              <p style={{ color: COLORS.green, textAlign: "center", fontWeight: 700, marginBottom: 20 }}>
                ✨ Top picks for you:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {finderResult.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: COLORS.cardBg,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${COLORS.cardBorder}`,
                    }}
                  >
                    <div
                      style={{
                        height: 100,
                        borderRadius: 8,
                        overflow: "hidden",
                        marginBottom: 8,
                        background: "#0f1520",
                      }}
                    >
                      <img
                        src={p.img}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80"; }}
                      />
                    </div>
                    <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 18 }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={resetFinder}
                  style={{
                    background: "transparent",
                    color: COLORS.muted,
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 8,
                    padding: "8px 20px",
                    cursor: "pointer",
                  }}
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                {finderQuestions.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 32,
                      height: 4,
                      borderRadius: 2,
                      background: i <= finderStep ? COLORS.green : COLORS.cardBorder,
                    }}
                  />
                ))}
              </div>
              <p style={{ color: COLORS.text, textAlign: "center", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                {finderQuestions[finderStep].q}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                {finderQuestions[finderStep].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleFinderAnswer(opt)}
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: COLORS.green,
                      border: "1.5px solid rgba(34,197,94,0.3)",
                      borderRadius: 10,
                      padding: "12px 24px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = COLORS.green;
                      (e.currentTarget as HTMLButtonElement).style.color = COLORS.black;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.color = COLORS.green;
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Top Picks ── */}
        <SectionTitle title="Top Picks For You" subtitle="Handpicked devices with best value and performance" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
            marginBottom: 60,
          }}
        >
          {products.map((p) => (
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

        {/* ── Exchange Banner ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #0D2010 0%, #1A3A20 100%)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 24,
            padding: "40px 48px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 60,
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 14, marginBottom: 8 }}>
              <Recycle size={16} color={COLORS.green} />
              Eco-friendly Exchange Program
            </div>
            <h3
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 32,
                fontWeight: 800,
                color: COLORS.text,
                margin: "0 0 8px",
              }}
            >
              Exchange Your Old Laptop
            </h3>
            <p style={{ color: COLORS.muted, fontSize: 16, margin: 0 }}>
              Get Up to{" "}
              <span style={{ color: COLORS.green, fontWeight: 800 }}>₹15,000 Off</span>{" "}
              on your next purchase
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 80, opacity: 0.5 }}>💻</div>
            <ArrowRight size={28} color={COLORS.green} strokeWidth={2.5} />
            <div style={{ fontSize: 80 }}>💻</div>
          </div>
          <button
            style={{
              background: COLORS.green,
              color: COLORS.black,
              border: "none",
              borderRadius: 12,
              padding: "14px 28px",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Exchange Now <ArrowRight size={16} />
          </button>
        </div>

        {/* ── Why NewJaisa ── */}
        <SectionTitle title="Why Choose NewJaisa?" subtitle="We make refurbished trustworthy and reliable" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
            marginBottom: 60,
          }}
        >
          {whyFeatures.map((f) => (
            <div
              key={f.title}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                {f.icon}
              </div>
              <div
                style={{
                  color: COLORS.text,
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "'Sora', sans-serif",
                  marginBottom: 4,
                }}
              >
                {f.title}
              </div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Reviews ── */}
        <SectionTitle title="Happy Customers" subtitle="Join 50,000+ satisfied customers" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginBottom: 60,
          }}
        >
          {reviews.map((r) => (
            <div
              key={r.name}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i <= r.rating ? "#FBBF24" : "transparent"}
                    color={i <= r.rating ? "#FBBF24" : "#374151"}
                  />
                ))}
              </div>
              <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.6, margin: "12px 0 16px" }}>
                &ldquo;{r.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.green,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
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

        {/* ── Newsletter ── */}
        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24,
            padding: "48px 40px",
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          <h3
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: COLORS.text,
              margin: "0 0 8px",
            }}
          >
            Stay Updated With Offers &amp; Latest Deals
          </h3>
          <p style={{ color: COLORS.muted, margin: "0 0 28px" }}>
            Get exclusive offers, new arrivals, and tech news directly to your inbox
          </p>
          <div style={{ display: "flex", maxWidth: 480, margin: "0 auto", gap: 12 }}>
            <input
              placeholder="Enter your email"
              style={{
                flex: 1,
                background: "#1C2133",
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 10,
                padding: "12px 16px",
                color: COLORS.text,
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              style={{
                background: COLORS.green,
                color: COLORS.black,
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Subscribe
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
