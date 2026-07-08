"use client";

import { useState } from "react";
import { Trash2, ShoppingCart, ArrowRight, Tag, Shield } from "lucide-react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface CartItem extends Product { qty: number }

interface Props {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setPage: (p: string) => void;
}

export default function CartPage({ cart, setCart, setPage }: Props) {
  const [coupon, setCoupon]   = useState("");
  const [applied, setApplied] = useState(false);
  const isMobile = useIsMobile();

  const total     = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const savings   = cart.reduce((s, i) => s + (i.mrp - i.price) * (i.qty || 1), 0);
  const discount  = applied ? Math.round(total * 0.05) : 0;
  const final     = total - discount;

  const remove    = (id: number) => setCart((c) => c.filter((i) => i.id !== id));
  const updateQty = (id: number, d: number) =>
    setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, (i.qty || 1) + d) } : i));

  if (cart.length === 0) {
    return (
      <main style={{ background: COLORS.darkBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,150,240,0.12)",
            margin: "0 auto 28px",
            boxShadow: "0 0 40px rgba(56,189,248,0.06)",
          }}>
            <ShoppingCart size={48} color={COLORS.green} />
          </div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: COLORS.text, marginBottom: 10 }}>
            Your cart is empty
          </h2>
          <p style={{ color: COLORS.muted, marginBottom: 28, fontSize: 16 }}>
            Add some refurbished laptops to get started
          </p>
          <button onClick={() => setPage("listing")} style={{
            background: COLORS.green, color: "#000",
            border: "none", borderRadius: 100,
            padding: "14px 32px", fontWeight: 800, fontSize: 15,
            cursor: "pointer", fontFamily: "'Sora', sans-serif",
          }}>
            Shop Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: COLORS.darkBg, minHeight: "100vh", padding: isMobile ? "24px 14px 60px" : "40px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(28px,4vw,48px)", fontWeight: 800,
          color: COLORS.text, letterSpacing: "-0.03em",
          margin: "0 0 32px",
        }}>
          Your Cart
          <span style={{ color: COLORS.muted, fontSize: "0.5em", fontWeight: 400, marginLeft: 10 }}>
            {cart.length} item{cart.length > 1 ? "s" : ""}
          </span>
        </h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
          gap: 28, alignItems: "start",
        }}>

          {/* Cart items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cart.map((item) => (
              <div key={item.id} style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 20, padding: 20,
                display: "flex", gap: 18, alignItems: "flex-start",
              }}>
                {/* Image */}
                <div style={{
                  width: isMobile ? 80 : 120, height: isMobile ? 68 : 90,
                  borderRadius: 14, overflow: "hidden", flexShrink: 0,
                  background: COLORS.background,
                }}>
                  <img src={item.img} alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80"; }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", gap: 10,
                  }}>
                    <h3 style={{
                      color: COLORS.text, fontFamily: "'Sora', sans-serif",
                      fontSize: 14, fontWeight: 700, margin: 0,
                      whiteSpace: isMobile ? "normal" : "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300,
                    }}>
                      {item.name}
                    </h3>
                    <button onClick={() => remove(item.id)} style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      borderRadius: 8, padding: "5px",
                      cursor: "pointer", color: "#EF4444", flexShrink: 0,
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p style={{ color: COLORS.muted, fontSize: 11, margin: "4px 0 12px" }}>{item.specs}</p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    {/* Qty */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      background: COLORS.background, border: `1px solid ${COLORS.cardBorder}`,
                      borderRadius: 10, overflow: "hidden",
                    }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{
                        background: "transparent", border: "none",
                        color: COLORS.muted, width: 34, height: 32,
                        cursor: "pointer", fontSize: 18,
                      }}>−</button>
                      <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 13, width: 24, textAlign: "center" }}>
                        {item.qty || 1}
                      </span>
                      <button onClick={() => updateQty(item.id, 1)} style={{
                        background: "transparent", border: "none",
                        color: COLORS.muted, width: 34, height: 32,
                        cursor: "pointer", fontSize: 18,
                      }}>+</button>
                    </div>

                    {/* Price */}
                    <div>
                      <span style={{
                        color: COLORS.text, fontFamily: "'Sora', sans-serif",
                        fontSize: 18, fontWeight: 800,
                      }}>
                        ₹{(item.price * (item.qty || 1)).toLocaleString("en-IN")}
                      </span>
                      <span style={{
                        color: COLORS.muted, fontSize: 12,
                        textDecoration: "line-through", marginLeft: 8,
                      }}>
                        ₹{(item.mrp * (item.qty || 1)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div style={{
              background: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 20, padding: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: COLORS.text, fontWeight: 700, fontSize: 14 }}>
                <Tag size={15} color={COLORS.green} />
                Apply Coupon Code
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE10"
                  style={{
                    flex: 1, background: COLORS.background,
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 10, padding: "11px 14px",
                    color: COLORS.text, fontSize: 14, outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(56,189,248,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = COLORS.cardBorder; }}
                />
                <button
                  onClick={() => { if (coupon.length > 2) setApplied(true); }}
                  style={{
                    background: applied ? "#10B981" : COLORS.green,
                    color: "#000", border: "none", borderRadius: 10,
                    padding: "11px 20px", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {applied ? "✓ Applied" : "Apply"}
                </button>
              </div>
              {applied && (
                <p style={{ color: "#10B981", fontSize: 12, marginTop: 8 }}>
                  🎉 5% discount applied!
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24, padding: 24,
            position: isMobile ? "static" : "sticky",
            top: 72,
          }}>
            <h3 style={{
              fontFamily: "'Sora', sans-serif",
              color: COLORS.text, fontWeight: 800, fontSize: 20,
              margin: "0 0 20px", letterSpacing: "-0.02em",
            }}>Order Summary</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Subtotal", value: `₹${total.toLocaleString("en-IN")}` },
                { label: "You Save", value: `-₹${savings.toLocaleString("en-IN")}`, green: true },
                { label: "Coupon", value: discount > 0 ? `-₹${discount.toLocaleString("en-IN")}` : "—", green: discount > 0 },
                { label: "Delivery", value: total >= 15000 ? "FREE" : "₹499", green: total >= 15000 },
              ].map(({ label, value, green }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  paddingBottom: 12,
                  borderBottom: `1px solid ${COLORS.cardBorder}`,
                }}>
                  <span style={{ color: COLORS.muted, fontSize: 14 }}>{label}</span>
                  <span style={{ color: green ? "#10B981" : COLORS.text, fontWeight: 600, fontSize: 14 }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 22,
            }}>
              <span style={{ color: COLORS.text, fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif" }}>Total</span>
              <span style={{ color: COLORS.green, fontWeight: 800, fontSize: 24, fontFamily: "'Sora', sans-serif" }}>
                ₹{final.toLocaleString("en-IN")}
              </span>
            </div>

            <button onClick={() => setPage("checkout")} style={{
              width: "100%",
              background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000",
              border: "none", borderRadius: 14,
              padding: "16px 0", fontWeight: 800, fontSize: 16,
              cursor: "pointer", fontFamily: "'Sora', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 0 40px rgba(56,189,248,0.22)",
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 60px rgba(56,189,248,0.45)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(56,189,248,0.22)"; }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <button onClick={() => setPage("listing")} style={{
              width: "100%", background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: COLORS.muted, borderRadius: 14,
              padding: "13px 0", fontWeight: 600, fontSize: 14,
              cursor: "pointer", marginTop: 10,
              transition: "border-color 0.2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              Continue Shopping
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 16 }}>
              <Shield size={12} color={COLORS.green} />
              <span style={{ color: COLORS.muted, fontSize: 11 }}>100% Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
