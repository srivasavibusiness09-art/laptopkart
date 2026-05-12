"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, Shield, RefreshCw, CheckCircle2 } from "lucide-react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface CartItem extends Product { qty: number }

interface CartPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setPage: (p: string) => void;
}

export default function CartPage({ cart, setCart, setPage }: CartPageProps) {
  const total   = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const savings = cart.reduce((sum, i) => sum + (i.mrp - i.price) * i.qty, 0);
  const [coupon, setCoupon]               = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const discount = couponApplied ? Math.floor(total * 0.1) : 0;
  const isMobile = useIsMobile();

  const updateQty = (id: number, delta: number) =>
    setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const removeItem = (id: number) => setCart((c) => c.filter((i) => i.id !== id));

  if (cart.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <ShoppingCart size={80} color={COLORS.cardBorder} strokeWidth={1} />
        </div>
        <h2 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
          Your cart is empty
        </h2>
        <p style={{ color: COLORS.muted }}>Add some amazing refurbished tech to your cart!</p>
        <button
          onClick={() => setPage("listing")}
          style={{
            background: COLORS.green, color: COLORS.black, border: "none",
            borderRadius: 12, padding: "14px 28px", fontWeight: 700,
            fontSize: 15, cursor: "pointer", marginTop: 20,
          }}
        >
          Browse Products
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 20px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 28 }}>
        Shopping Cart ({cart.length} items)
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap: 28 }}>

        {/* Items */}
        <div>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 16,
                padding: isMobile ? 14 : 20,
                marginBottom: 16,
                display: "flex",
                gap: 14,
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <div
                style={{
                  width: isMobile ? "100%" : 88,
                  height: isMobile ? 180 : 88,
                  background: COLORS.background,
                  borderRadius: 12,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80"; }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 16, fontFamily: "'Sora', sans-serif" }}>{item.name}</div>
                <div style={{ color: COLORS.muted, fontSize: 13, margin: "4px 0 8px" }}>{item.specs}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, overflow: "hidden" }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ background: COLORS.darkBg, color: COLORS.text, border: "none", padding: "6px 14px", cursor: "pointer", fontSize: 16 }}>−</button>
                    <span style={{ padding: "6px 14px", color: COLORS.text, background: COLORS.background, fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ background: COLORS.darkBg, color: COLORS.text, border: "none", padding: "6px 14px", cursor: "pointer", fontSize: 16 }}>+</button>
                  </div>
                  <span style={{ color: COLORS.green, fontWeight: 800, fontSize: 18 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  marginLeft: isMobile ? 0 : "auto",
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 16, padding: isMobile ? 16 : 24, position: isMobile ? "static" : "sticky", top: isMobile ? 0 : 140 }}>
            <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
            {[
              { label: "Subtotal", value: `₹${total.toLocaleString('en-IN')}`,    green: false },
              { label: "Savings",  value: `−₹${savings.toLocaleString('en-IN')}`, green: true },
              { label: "Delivery", value: "FREE",                           green: true },
            ].map(({ label, value, green }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: COLORS.muted }}>{label}</span>
                <span style={{ color: green ? COLORS.green : COLORS.text, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
            {couponApplied && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: COLORS.muted }}>Coupon (LAPTOP10)</span>
                <span style={{ color: COLORS.green, fontWeight: 600 }}>−₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ borderTop: `1px solid ${COLORS.cardBorder}`, paddingTop: 16, marginTop: 8, display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ color: COLORS.green, fontWeight: 800, fontSize: 20, fontFamily: "'Sora', sans-serif" }}>₹{(total - discount).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code"
                style={{ flex: 1, background: COLORS.background, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, padding: "10px 12px", color: COLORS.text, fontSize: 13, outline: "none" }} />
              <button onClick={() => { if (coupon.toUpperCase() === "LAPTOP10") setCouponApplied(true); }}
                style={{ background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, width: isMobile ? "100%" : "auto" }}>
                Apply
              </button>
            </div>
            {couponApplied && <p style={{ color: COLORS.green, fontSize: 13, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={14} /> Coupon applied! 10% off</p>}
            <button onClick={() => setPage("checkout")} style={{ width: "100%", background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 12, padding: "16px 0", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
              Proceed to Checkout →
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 16 }}>
              {[
                { icon: <Shield size={12} />, text: "Secure" },
                { icon: <RefreshCw size={12} />, text: "7-Day" },
                { icon: <CheckCircle2 size={12} />, text: "Trusted" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px", textAlign: "center", color: COLORS.muted, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  {icon}{text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
