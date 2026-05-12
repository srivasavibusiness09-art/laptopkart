"use client";

import { useState } from "react";
import { COLORS, products, reviews } from "@/data/products";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useIsMobile } from "@/lib/hooks";

interface ProductDetailProps {
  product: Product | null;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
  setPage: (p: string) => void;
  onViewProduct: (p: Product) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= Math.floor(rating) ? "#FBBF24" : "#374151",
            fontSize: 12,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const faqData: [string, string][] = [
  [
    "What is a refurbished laptop?",
    "A refurbished laptop is a pre-owned device that has been professionally inspected, repaired, and restored to working condition. At NewJaisa, every device undergoes a 72-point quality check.",
  ],
  [
    "What does Grade A+ mean?",
    "Grade A+ means the device is in near-perfect cosmetic and functional condition. Minor signs of use may exist but are barely noticeable.",
  ],
  [
    "What warranty do you offer?",
    "We offer a 1 Year comprehensive warranty on all refurbished devices, covering hardware defects and functional issues.",
  ],
  [
    "Can I return if not satisfied?",
    "Yes! We offer a 7-day no-questions-asked return policy on all products.",
  ],
];

export default function ProductDetail({
  product,
  onAddToCart,
  onWishlist,
  wishlist,
  setPage,
  onViewProduct,
}: ProductDetailProps) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("specs");
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const isMobile = useIsMobile();

  if (!product) return null;

  const isWished = wishlist.includes(product.id);
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const specRows: [string, string][] = [
    ["Processor", product.processor],
    ["RAM", product.ram],
    ["Storage", product.storage],
    ["Display", "14 inch Full HD (1920x1080)"],
    ["OS", "Windows 11 Pro"],
    ["Battery", "4-cell, 48Wh"],
    ["Weight", "1.8 kg"],
    ["Warranty", product.warranty],
    ["Grade", `Grade ${product.grade}`],
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 20px" }}>

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
        <span
          onClick={() => setPage("home")}
          style={{ cursor: "pointer", color: COLORS.green }}
        >
          Home
        </span>
        <span>›</span>
        <span
          onClick={() => setPage("listing")}
          style={{ cursor: "pointer", color: COLORS.green }}
        >
          Laptops
        </span>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 48, marginBottom: 48 }}>
        {/* Gallery */}
        <div>
          <div
            style={{
              background: COLORS.background,
              borderRadius: 20,
              marginBottom: 16,
              border: `1px solid ${COLORS.cardBorder}`,
              height: 320,
              overflow: "hidden",
            }}
          >
            <img
              src={product.img}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80&auto=format&fit=crop"; }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {[0, 25, 50, 75].map((offset) => (
              <div
                key={offset}
                style={{
                  background: COLORS.background,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 10,
                  height: 72,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <img
                  src={`${product.img}&crop=entropy&_offset=${offset}`}
                  alt={`${product.name} view`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = product.img; }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: COLORS.text,
              margin: "0 0 8px",
            }}
          >
            {product.name}
          </h1>
          <p style={{ color: COLORS.muted, margin: "0 0 12px" }}>{product.specs}</p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <StarRating rating={product.rating} />
            <span style={{ color: COLORS.muted, fontSize: 14 }}>
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: COLORS.green,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span
              style={{
                color: COLORS.muted,
                textDecoration: "line-through",
                fontSize: 18,
              }}
            >
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <span
              style={{
                background: "#EF4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 20,
              }}
            >
              {product.discount}% OFF
            </span>
            <span style={{ color: COLORS.muted, fontSize: 13 }}>
              You save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>
            EMI from ₹{Math.floor(product.price / 12).toLocaleString('en-IN')}/month &bull; No
            Cost EMI Available
          </div>

          {/* Battery */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                color: COLORS.text,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              🔋 Battery Health: 88%
            </div>
            <div
              style={{
                background: COLORS.cardBorder,
                borderRadius: 6,
                height: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "88%",
                  height: "100%",
                  background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>

          {/* Pincode */}
          <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter pincode"
              maxLength={6}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: COLORS.text,
                fontSize: 13,
                outline: "none",
                width: 160,
              }}
            />
            <button
              onClick={() =>
                setDeliveryMsg(
                  pincode.length === 6
                    ? "✅ Delivery by Tomorrow!"
                    : "Enter valid pincode"
                )
              }
              style={{
                background: COLORS.green,
                color: COLORS.black,
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Check
            </button>
            {deliveryMsg && (
              <span
                style={{
                  color: deliveryMsg.includes("✅") ? COLORS.green : "#EF4444",
                  fontSize: 13,
                  alignSelf: "center",
                }}
              >
                {deliveryMsg}
              </span>
            )}
          </div>

          {/* Qty */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span style={{ color: COLORS.muted, fontSize: 14 }}>Qty:</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  background: COLORS.cardBg,
                  color: COLORS.text,
                  border: "none",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                −
              </button>
              <span
                style={{
                  padding: "8px 16px",
                  color: COLORS.text,
                  background: COLORS.background,
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{
                  background: COLORS.cardBg,
                  color: COLORS.text,
                  border: "none",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexDirection: isMobile ? "column" : "row" }}>
            <button
              onClick={() => onAddToCart(product)}
              style={{
                flex: 1,
                background: COLORS.green,
                color: COLORS.black,
                border: "none",
                borderRadius: 12,
                padding: "16px 0",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
              }}
            >
              🛒 Add to Cart
            </button>
            <button
              onClick={() => onWishlist(product.id)}
              style={{
                background: isWished ? "rgba(239,68,68,0.15)" : COLORS.cardBg,
                color: isWished ? "#EF4444" : COLORS.muted,
                border: `1px solid ${isWished ? "#EF4444" : COLORS.cardBorder}`,
                borderRadius: 12,
                padding: "16px 20px",
                cursor: "pointer",
                fontSize: 20,
                width: isMobile ? "100%" : "auto",
              }}
            >
              {isWished ? "❤️" : "🤍"}
            </button>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10 }}
          >
            {["🛡️ 1 Yr Warranty", "🔄 7 Day Return", "✅ Quality Checked"].map((b) => (
              <div
                key={b}
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                  color: COLORS.muted,
                  fontSize: 12,
                }}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          marginBottom: 32,
          display: "flex",
          overflowX: isMobile ? "auto" : "visible",
          whiteSpace: "nowrap",
        }}
      >
        {["specs", "quality", "reviews", "faq"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "14px 24px",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${tab === t ? COLORS.green : "transparent"}`,
              color: tab === t ? COLORS.green : COLORS.muted,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: tab === t ? 700 : 500,
              textTransform: "capitalize",
              whiteSpace: "nowrap",
            }}
          >
            {t === "faq" ? "FAQ" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Specs Tab */}
      {tab === "specs" && (
        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 48,
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", minWidth: isMobile ? 520 : "100%", borderCollapse: "collapse" }}>
            <tbody>
              {specRows.map(([key, val], i) => (
                <tr
                  key={key}
                  style={{
                    borderBottom: `1px solid ${COLORS.cardBorder}`,
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 20px",
                      color: COLORS.muted,
                      fontSize: 14,
                      width: "40%",
                    }}
                  >
                    {key}
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      color: COLORS.text,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quality Tab */}
      {tab === "quality" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {[
            "Keyboard ✅",
            "Display ✅",
            "Ports ✅",
            "Camera ✅",
            "Battery ✅",
            "Touchpad ✅",
            "Speaker ✅",
            "WiFi ✅",
            "Charging ✅",
          ].map((c) => (
            <div
              key={c}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 12,
                padding: "14px 16px",
                color: COLORS.text,
                fontSize: 14,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {tab === "reviews" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {reviews.map((r) => (
            <div
              key={r.name}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <StarRating rating={r.rating} />
              <p style={{ color: COLORS.text, fontSize: 14, margin: "10px 0 14px" }}>
                &ldquo;{r.text}&rdquo;
              </p>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>
                {r.name} &bull; {r.city}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Tab */}
      {tab === "faq" && (
        <div style={{ marginBottom: 48 }}>
          {faqData.map(([q, a]) => (
            <details
              key={q}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 12,
                marginBottom: 12,
                padding: "16px 20px",
                cursor: "pointer",
              }}
            >
              <summary
                style={{
                  color: COLORS.text,
                  fontWeight: 600,
                  fontSize: 15,
                  listStyle: "none",
                }}
              >
                {q}
              </summary>
              <p
                style={{
                  color: COLORS.muted,
                  fontSize: 14,
                  marginTop: 12,
                  lineHeight: 1.7,
                }}
              >
                {a}
              </p>
            </details>
          ))}
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 30,
              fontWeight: 800,
              color: COLORS.text,
              margin: "0 0 24px",
            }}
          >
            Similar Products
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {related.map((p) => (
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
        </>
      )}
    </div>
  );
}
