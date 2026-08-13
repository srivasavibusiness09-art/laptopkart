"use client";

import { useState, useEffect } from "react";
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
  X,
} from "lucide-react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CartItem extends Product { qty: number }
interface CheckoutPageProps {
  cart: CartItem[];
  setPage: (p: string) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: { uid: string; email: string; name: string };
  appliedCoupon: any;
  setAppliedCoupon: React.Dispatch<React.SetStateAction<any>>;
}

const STEPS = ["Address", "Payment", "Confirm"] as const;

const PAYMENT_OPTIONS = [
  { val: "upi", label: "UPI / PhonePe / GPay", icon: <Smartphone size={20} /> },
  { val: "card", label: "Credit / Debit Card", icon: <CreditCard size={20} /> },
  { val: "netbanking", label: "Net Banking", icon: <Building2 size={20} /> },
];

interface Address { name: string; phone: string; pincode: string; city: string; state: string; street: string }

const inputStyle = {
  width: "100%",
  background: COLORS.background,
  border: `1px solid ${COLORS.cardBorder}`,
  borderRadius: 10,
  padding: "12px 14px",
  color: COLORS.text,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function CheckoutPage({ cart, setPage, setCart, user, appliedCoupon, setAppliedCoupon }: CheckoutPageProps) {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>({ name: "", phone: "", pincode: "", city: "", state: "", street: "" });
  const [payment, setPayment] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(() =>
    Math.floor(100000 + Math.random() * 900000).toString()
  );
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discount = Math.round((total * appliedCoupon.discount) / 100);
      if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
        discount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discount = appliedCoupon.discount;
    }
  }
  const finalTotal = Math.max(0, total - discount);
  const isMobile = useIsMobile();

  const [paymentStatus, setPaymentStatus] = useState<{ status: string; orderId: string } | null>(null);

  // Monitor returned URL parameters from payment redirect callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get("payment_status");
      const rOrderId = urlParams.get("orderId");
      if (status && rOrderId) {
        setPaymentStatus({ status, orderId: rOrderId });
        setOrderId(rOrderId);
        setStep(2); // Auto-navigate to receipt step
        if (status === "success") {
          setCart([]);
          setAppliedCoupon(null);
        }
      }
    }
  }, []);

  // Pre-fill shipping details from Firestore profile if it exists
  useEffect(() => {
    if (!user?.uid) return;
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const uData = docSnap.data();
          setAddress({
            name: user.name || "",
            phone: uData.phone || "",
            street: uData.street || "",
            city: uData.city || "",
            state: uData.state || "",
            pincode: uData.pincode || "",
          });
        } else {
          setAddress(prev => ({ ...prev, name: user.name || "" }));
        }
      })
      .catch((err) => console.error("Error pre-filling address details:", err));
  }, [user]);

  const ensureUniqueOrderId = async (currentId: string): Promise<string> => {
    let checkId = currentId;
    let attempts = 0;
    while (attempts < 100) {
      const docRef = doc(db, "orders", checkId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setOrderId(checkId);
        return checkId;
      }
      const existingData = docSnap.data();
      if (existingData && (existingData.status === "Pending Payment" || existingData.status === "Failed")) {
        setOrderId(checkId);
        return checkId; // Reuse the order ID for retries
      }
      checkId = Math.floor(100000 + Math.random() * 900000).toString();
      attempts++;
    }
    throw new Error("Failed to generate a unique Order ID.");
  };

  const handleApplyCoupon = async () => {
    setCouponError(null);
    setCouponSuccess(null);
    if (!address.phone) {
      setCouponError("Please enter your phone number in Step 1 first.");
      return;
    }
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    const code = couponInput.trim().toUpperCase();
    try {
      const cSnap = await getDoc(doc(db, "coupons", code));
      if (!cSnap.exists()) {
        setCouponError("Invalid coupon code.");
        return;
      }
      const cData = cSnap.data();
      if (cData.minCartValue && total < cData.minCartValue) {
        setCouponError(`Minimum purchase of ₹${cData.minCartValue.toLocaleString('en-IN')} required.`);
        return;
      }
      if (cData.maxUses && cData.usedCount >= cData.maxUses) {
        setCouponError("This coupon has expired or reached max uses.");
        return;
      }
      if (cData.usedBy && cData.usedBy.includes(address.phone)) {
        setCouponError("You have already used this coupon code.");
        return;
      }
      setAppliedCoupon({ ...cData, code });
      setCouponSuccess("Coupon applied successfully!");
    } catch (e) {
      console.error(e);
      setCouponError("Failed to apply coupon.");
    }
  };

  const handleNext = async () => {
    // If they choose payment, launch Razorpay Checkout flow
    if (step === 1) {
      setIsProcessing(true);

      // Verify stock in database before proceeding to payment/checkout
      try {
        for (const item of cart) {
          const productRef = doc(db, "products", String(item.id));
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const pData = productSnap.data();
            if (pData.stock !== undefined && pData.stock < (item.qty || 1)) {
              alert(`Sorry, "${item.name}" is now out of stock. Please adjust your cart.`);
              setIsProcessing(false);
              return;
            }
          }
        }
      } catch (stockErr) {
        console.error("Stock validation failed:", stockErr);
      }

      // Re-validate coupon right before paying
      if (appliedCoupon) {
        if (!address.phone) {
          alert("Please enter your phone number to use this coupon.");
          setIsProcessing(false);
          return;
        }
        try {
          const cSnap = await getDoc(doc(db, "coupons", appliedCoupon.code));
          if (!cSnap.exists()) {
            alert("Coupon is no longer valid.");
            setIsProcessing(false);
            return;
          }
          const cData = cSnap.data();
          if (cData.usedBy && cData.usedBy.includes(address.phone)) {
            alert("You have already used this coupon code.");
            setIsProcessing(false);
            return;
          }
        } catch (e) {
          console.error("Coupon validation error", e);
        }
      }

      let finalOrderId = orderId;
      try {
        finalOrderId = await ensureUniqueOrderId(orderId);
      } catch (err) {
        alert("Unable to generate a unique Order ID. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Cash on delivery bypass
      if (payment === "cod") {
        try {
          const newOrder = {
            orderId: finalOrderId,
            createdAt: new Date().toISOString(),
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty || 1,
              img: item.img
            })),
            total: finalTotal,
            address,
            status: "Pending (COD)",
            paymentMethod: "cod",
            email: user.email,
            uid: user.uid,
            couponCode: appliedCoupon?.code || null,
            discountAmount: discount
          };
          const orderRef = doc(db, "orders", finalOrderId);
          await setDoc(orderRef, newOrder);

          // Decrease stock for items in the order
          for (const item of cart) {
            const productRef = doc(db, "products", String(item.id));
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const pData = productSnap.data();
              if (pData.stock !== undefined) {
                await updateDoc(productRef, {
                  stock: increment(-(item.qty || 1))
                });
              }
            }
          }

          // Update default address details inside users doc for subsequent orders
          await setDoc(doc(db, "users", user.uid), {
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode
          }, { merge: true });

          setCart([]);
          setStep(2);
        } catch (e) {
          console.error("Failed to save COD order:", e);
          setStep(2);
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      setIsProcessing(true);
      try {
        // Trigger server-side Cashfree session generation
        const res = await fetch("/api/cashfree/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            orderId: finalOrderId,
            email: user.email,
            phone: address.phone,
            userId: user.uid,
            address,
            cart,
            couponCode: appliedCoupon?.code || null,
            discountAmount: discount
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Unable to reach Cashfree backend gateway.");
        }

        const data = await res.json();
        if (data.paymentSessionId) {
          // Update default address details inside users doc for subsequent orders prior to checkout
          await setDoc(doc(db, "users", user.uid), {
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode
          }, { merge: true });

          // Initialize client SDK and checkout using the session ID
          const cashfree = (window as any).Cashfree({
            mode: (process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox").toLowerCase()
          });

          cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: "_modal"
          }).then((result: any) => {
            if (result.error) {
              console.error("Payment error or cancelled", result.error);
              // alert(result.error.message || "Payment was cancelled or failed.");
              setIsProcessing(false);
            }
            if (result.paymentDetails) {
              console.log("Payment completed, waiting for redirect...");
              // Typically, Cashfree auto-redirects the parent window to the return_url on success.
            }
          }).catch((err: any) => {
            console.error("Checkout promise failed:", err);
            setIsProcessing(false);
          });
        } else {
          throw new Error(data.error || "Failed to retrieve Cashfree payment session.");
        }
      } catch (err: any) {
        console.error("Cashfree payment flow initiation failed:", err);
        alert(err.message || "Failed to initiate payment. Please try again.");
        setIsProcessing(false);
      }
      return;
    }

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
            <div style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: "50%", background: i <= step ? COLORS.blue : COLORS.cardBg, border: `2px solid ${i <= step ? COLORS.blue : COLORS.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: i <= step ? COLORS.black : COLORS.muted, fontWeight: 700, fontSize: isMobile ? 12 : 14, zIndex: 1 }}>
              {i < step ? <Check size={isMobile ? 16 : 18} /> : i + 1}
            </div>
            <div style={{ color: i === step ? COLORS.blue : COLORS.muted, fontSize: isMobile ? 11 : 12, marginTop: 8, fontWeight: i === step ? 700 : 400, textAlign: "center" }}>{s}</div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: "50%",
                  width: isMobile ? "50%" : "100%",
                  height: 2,
                  background: i < step ? COLORS.blue : COLORS.cardBorder,
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
                <MapPin size={20} color={COLORS.blue} /> Delivery Address
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                {([["Full Name", "name", "text"], ["Phone", "phone", "tel"], ["Pincode", "pincode", "text"], ["City", "city", "text"], ["State", "state", "text"]] as [string, keyof Address, string][]).map(([label, key, type]) => (
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

          {/* Step 1: Payment */}
          {step === 1 && (
            <div>
              <h2 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                <CreditCard size={20} color={COLORS.blue} /> Payment Method
              </h2>
              {PAYMENT_OPTIONS.map(({ val, label, icon }) => (
                <label key={val} style={{ display: "flex", alignItems: "center", gap: 14, background: payment === val ? "var(--bg-hover)" : COLORS.background, border: `1px solid ${payment === val ? COLORS.blue : COLORS.cardBorder}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12, cursor: "pointer" }}>
                  <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} style={{ accentColor: COLORS.blue }} />
                  <span style={{ color: payment === val ? COLORS.blue : COLORS.muted }}>{icon}</span>
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Step 2: Success / Failure */}
          {step === 2 && (
            paymentStatus?.status === "failed" || paymentStatus?.status === "error" ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <X size={80} color="var(--error)" strokeWidth={1.5} />
                </div>
                <h2 style={{ color: "var(--error)", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Payment Failed</h2>
                <p style={{ color: COLORS.text, fontSize: 16, marginBottom: 8 }}>Transaction for Order #LK-{orderId} was unsuccessful.</p>
                <p style={{ color: COLORS.muted, marginBottom: 32 }}>Please try checking out again or contact customer support if money was debited.</p>
                <button onClick={() => { setStep(1); setPaymentStatus(null); }} style={{ background: "#0062FF", color: "var(--text-inverse)", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Retry Payment
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <PartyPopper size={80} color={COLORS.green} strokeWidth={1.5} />
                </div>
                <h2 style={{ color: COLORS.green, fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Order Placed!</h2>
                <p style={{ color: COLORS.text, fontSize: 16, marginBottom: 8 }}>Order #LK-{orderId}</p>
                <p style={{ color: COLORS.muted, marginBottom: 32 }}>Your refurbished tech is on its way! Estimated delivery: 3-5 business days.</p>
                <button onClick={() => { setCart([]); setPage("home"); }} style={{ background: "#0062FF", color: "var(--text-inverse)", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  Continue Shopping
                </button>
              </div>
            )
          )}

          {/* Nav buttons */}
          {step < 2 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 10, flexDirection: isMobile ? "column-reverse" : "row" }}>
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} style={{ background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontSize: 14, width: isMobile ? "100%" : "auto" }}>
                  ← Back
                </button>
              )}
              <button 
                onClick={handleNext} 
                disabled={isProcessing}
                style={{ 
                  background: isProcessing ? "var(--bg-hover)" : "#0062FF", 
                  color: isProcessing ? "var(--text-3)" : "var(--text-inverse)", 
                  border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 14, 
                  cursor: isProcessing ? "not-allowed" : "pointer", marginLeft: "auto", width: isMobile ? "100%" : "auto" 
                }}>
                {step === 1 ? (isProcessing ? "Processing..." : "Place Order") : "Continue"}
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
              <span style={{ color: COLORS.text, fontWeight: 700 }}>₹{(item.price * (item.qty || 1)).toLocaleString('en-IN')}</span>
            </div>
          ))}

          {/* Coupon Section */}
          <div style={{ marginTop: 16, marginBottom: 16, borderTop: `1px solid ${COLORS.cardBorder}`, paddingTop: 16 }}>
            {!appliedCoupon ? (
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    style={{ ...inputStyle, textTransform: "uppercase" }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={{ background: "#0062FF", color: "var(--text-inverse)", border: "none", borderRadius: 10, padding: "0 16px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 8 }}>{couponError}</div>}
              </div>
            ) : (
              <div style={{ background: "rgba(56, 189, 248, 0.1)", border: `1px dashed ${COLORS.green}`, padding: 12, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: COLORS.green, fontWeight: 700, fontSize: 14 }}>{appliedCoupon.code} Applied</div>
                    <div style={{ color: COLORS.green, fontSize: 12 }}>{couponSuccess}</div>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); setCouponSuccess(null); }} style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, paddingBottom: appliedCoupon ? 8 : 0 }}>
            <span style={{ color: COLORS.text, fontWeight: 600 }}>Subtotal</span>
            <span style={{ color: COLORS.text, fontWeight: 600 }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
          {appliedCoupon && (
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8 }}>
              <span style={{ color: COLORS.green, fontWeight: 600 }}>Discount ({appliedCoupon.code})</span>
              <span style={{ color: COLORS.green, fontWeight: 600 }}>- ₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${COLORS.cardBorder}` }}>
            <span style={{ color: COLORS.text, fontWeight: 700 }}>Total</span>
            <span style={{ color: COLORS.text, fontWeight: 800, fontSize: 18 }}>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
