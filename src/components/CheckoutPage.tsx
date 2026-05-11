"use client";

import { useState } from "react";
import {
  Check,
  PartyPopper,
  Smartphone,
  CreditCard,
  Building2,
  CalendarDays,
  Banknote,
  MapPin,
  Truck,
  Zap,
} from "lucide-react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface CartItem extends Product { qty: number }
interface CheckoutPageProps {
  cart: CartItem[];
  setPage: (p: string) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const STEPS = ["Address", "Delivery", "Payment", "Confirm"] as const;

const DELIVERY_OPTIONS = [
  { name: "Standard (Free)", time: "3-5 days", price: "₹0",  icon: <Truck size={18} /> },
  { name: "Express",         time: "1-2 days", price: "₹199", icon: <Zap size={18} /> },
  { name: "Same Day",        time: "Today",    price: "₹399", icon: <MapPin size={18} /> },
];

const PAYMENT_OPTIONS = [
  { val: "upi",        label: "UPI / PhonePe / GPay", icon: <Smartphone size={20} /> },
  { val: "card",       label: "Credit / Debit Card",  icon: <CreditCard size={20} /> },
  { val: "netbanking", label: "Net Banking",           icon: <Building2 size={20} /> },
  { val: "emi",        label: "EMI (No Cost)",         icon: <CalendarDays size={20} /> },
  { val: "cod",        label: "Cash on Delivery",      icon: <Banknote size={20} /> },
];

interface Address { name: string; phone: string; pincode: string; city: string; state: string; street: string }

const inputStyle = {
  width: "100%",
  background: "#1C2133",
  border: `1px solid #1E2535`,
  borderRadius: 10,
  padding: "12px 14px",
  color: "#F0F4FF",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function CheckoutPage({ cart, setPage, setCart }: CheckoutPageProps) {
  const [step, setStep]       = useState(0);
  const [address, setAddress] = useState<Address>({ name: "", phone: "", pincode: "", city: "", state: "", street: "" });
  const [payment, setPayment] = useState("upi");
  const [orderId] = useState(() =>
    Math.floor(100000 + Math.random() * 900000).toString()
  );
  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const isMobile = useIsMobile();

  const handleNext = () => {
    if (step === 2) setCart([]);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 20px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 32 }}>
        Checkout
      </h1>

      {/* Steps */}
      <div style={{ display: "flex", marginBottom: 36, overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 8 : 0 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, minWidth: isMobile ? 88 : 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%", background: i <= step ? COLORS.green : COLORS.cardBg, border: `2px solid ${i <= step ? COLORS.green : COLORS.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: i <= step ? COLORS.black : COLORS.muted, fontWeight: 700, fontSize: isMobile ? 12 : 14, zIndex: 1 }}>
              {i < step ? <Check size={16} strokeWidth={3} /> : i + 1}
            </div>
            <div style={{ color: i === step ? COLORS.green : COLORS.muted, fontSize: isMobile ? 11 : 12, marginTop: 8, fontWeight: i === step ? 700 : 400, textAlign: "center" }}>{s}</div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: "50%",
                  width: isMobile ? "50%" : "100%",
                  height: 2,
                  background: i < step ? COLORS.green : COLORS.cardBorder,
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: 28 }}>
        {/* Step content */}
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 20, padding: isMobile ? 18 : 32 }}>

          {/* Step 0: Address */}
          {step === 0 && (
            <div>
              <h2 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={20} color={COLORS.green} /> Delivery Address
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                {([ ["Full Name", "name", "text"], ["Phone", "phone", "tel"], ["Pincode", "pincode", "text"], ["City", "city", "text"], ["State", "state", "text"] ] as [string, keyof Address, string][]).map(([label, key, type]) => (
                  <div key={key}>
                    <label style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6, display: "block" }}>{label}</label>
                    <input type={type} value={address[key]} onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6, display: "block" }}>Street Address</label>
                  <input value={address.street} onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Delivery */}
          {step === 1 && (
            <div>
              <h2 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <Truck size={20} color={COLORS.green} /> Choose Delivery
              </h2>
              {DELIVERY_OPTIONS.map(({ name, time, price, icon }) => (
                <div key={name} style={{ background: "#1C2133", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", cursor: "pointer", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: COLORS.green }}>{icon}</span>
                    <div>
                      <div style={{ color: COLORS.text, fontWeight: 600 }}>{name}</div>
                      <div style={{ color: COLORS.muted, fontSize: 13 }}>{time}</div>
                    </div>
                  </div>
                  <span style={{ color: price === "₹0" ? COLORS.green : COLORS.text, fontWeight: 700 }}>
                    {price === "₹0" ? "FREE" : price}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <h2 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <CreditCard size={20} color={COLORS.green} /> Payment Method
              </h2>
              {PAYMENT_OPTIONS.map(({ val, label, icon }) => (
                <label key={val} style={{ display: "flex", alignItems: "center", gap: 14, background: payment === val ? "rgba(34,197,94,0.08)" : "#1C2133", border: `1px solid ${payment === val ? COLORS.green : COLORS.cardBorder}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12, cursor: "pointer" }}>
                  <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} style={{ accentColor: COLORS.green }} />
                  <span style={{ color: payment === val ? COLORS.green : COLORS.muted }}>{icon}</span>
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <PartyPopper size={80} color={COLORS.green} strokeWidth={1.5} />
              </div>
              <h2 style={{ color: COLORS.green, fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Order Placed!</h2>
              <p style={{ color: COLORS.text, fontSize: 16, marginBottom: 8 }}>Order #LK-{orderId}</p>
              <p style={{ color: COLORS.muted, marginBottom: 32 }}>Your refurbished tech is on its way! Estimated delivery: 3-5 business days.</p>
              <button onClick={() => { setCart([]); setPage("home"); }} style={{ background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Continue Shopping
              </button>
            </div>
          )}

          {/* Nav buttons */}
          {step < 3 && (
             <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 10, flexDirection: isMobile ? "column-reverse" : "row" }}>
               {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} style={{ background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontSize: 14, width: isMobile ? "100%" : "auto" }}>
                  ← Back
                </button>
              )}
              <button onClick={handleNext} style={{ background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginLeft: "auto", width: isMobile ? "100%" : "auto" }}>
                {step === 2 ? "Place Order →" : "Continue →"}
              </button>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 20, padding: 24, height: "fit-content", position: isMobile ? "static" : "sticky", top: isMobile ? 0 : 140 }}>
          <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${COLORS.cardBorder}` }}>
              <div>
                <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: COLORS.muted, fontSize: 12 }}>Qty: {item.qty || 1}</div>
              </div>
              <span style={{ color: COLORS.green, fontWeight: 700 }}>₹{(item.price * (item.qty || 1)).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>Total</span>
            <span style={{ color: COLORS.green, fontWeight: 800, fontSize: 18 }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
