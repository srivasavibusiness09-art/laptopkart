"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Package, Clock, LogOut, CheckCircle2, ShieldAlert, Edit2, Star } from "lucide-react";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
}

interface Props {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setPage: (p: string) => void;
  triggerAlert: (type: "success" | "warning" | "error", msg: string) => void;
}

interface AddressDetails {
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
}

interface Order {
  orderId: string;
  createdAt: string;
  total: number;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  courierPartner?: string;
  trackingId?: string;
  trackingUrl?: string;
}

export default function ProfilePage({ user, setUser, setPage, triggerAlert }: Props) {
  const isMobile = useIsMobile();
  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Review states
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmittedOrders, setReviewSubmittedOrders] = useState<Record<string, boolean>>({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleOrderReviewSubmit = async (orderId: string, customerName: string, customerCity: string) => {
    if (!reviewText.trim()) return triggerAlert("warning", "Please type your review.");
    setReviewSubmitting(true);
    try {
      await setDoc(doc(collection(db, "reviews")), {
        name: customerName,
        city: customerCity || "Verified Buyer",
        rating: reviewRating,
        text: reviewText.trim(),
        orderId: orderId,
        createdAt: new Date().toISOString()
      });
      setReviewSubmittedOrders(prev => ({ ...prev, [orderId]: true }));
      setReviewingOrderId(null);
      setReviewText("");
      triggerAlert("success", "Review submitted! Thank you for sharing.");
    } catch (err) {
      console.error("Error submitting order review:", err);
      triggerAlert("error", "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // 1. Fetch saved user details from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const docRef = doc(db, "users", user.uid);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setAddressDetails(docSnap.data() as AddressDetails);
        }
      })
      .catch((err) => console.error("Error loading user profile:", err));
  }, [user]);

  // 2. Fetch real orders matching user's email
  useEffect(() => {
    if (!user?.email) return;
    const ordersQuery = query(
      collection(db, "orders"),
      where("email", "==", user.email)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data() } as Order);
        });
        // Sort orders by date descending
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRealOrders(list);
        setLoadingOrders(false);
      },
      (error) => {
        console.error("Error loading customer order history:", error);
        setLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, "users", user.uid), addressDetails, { merge: true });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Error saving user details:", err);
      alert("Failed to save shipping details. Try again.");
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setUser(null);
        setPage("home");
      })
      .catch((err) => console.error("Signout error:", err));
  };

  const inputStyle = {
    width: "100%",
    background: COLORS.background,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 10,
    padding: "10px 12px",
    color: COLORS.text,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "24px 14px 48px" : "48px 24px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
        My Account
      </h1>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 32 }}>
        Manage your profile, shipping addresses, and track orders.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: 28 }}>
        {/* Left Card: Profile details */}
        <div>
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24,
            padding: 24,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}>
            {/* Avatar circle */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6, #38BDF8)",
              color: "#000", fontSize: 28, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontFamily: "'Sora', sans-serif",
            }}>
              {user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U"}
            </div>

            <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>
              {user.name}
            </h3>
            <span style={{
              background: "rgba(56,189,248,0.10)", color: COLORS.green,
              fontSize: 10, fontWeight: 700, padding: "3px 9px",
              borderRadius: 100, display: "inline-block", marginBottom: 24,
              letterSpacing: "0.03em", textTransform: "uppercase",
            }}>
              Verified Customer
            </span>

            {/* List details */}
            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Mail size={15} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={15} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.text }}>{addressDetails.phone || "No phone added"}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#EF4444",
                borderRadius: 12,
                padding: "12px 0",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s",
                fontFamily: "'Sora', sans-serif",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>

        {/* Right Area: Address & Orders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Address Card */}
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={18} color={COLORS.green} />
                <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Primary Delivery Address
                </h3>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "transparent", border: "none", color: "#38BDF8",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4
                  }}
                >
                  <Edit2 size={12} /> Edit Details
                </button>
              )}
            </div>

            {isEditing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600 }}>Phone Number</label>
                  <input
                    type="tel"
                    value={addressDetails.phone}
                    onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value })}
                    placeholder="e.g. +91 99999 99999"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600 }}>Street Address</label>
                  <input
                    type="text"
                    value={addressDetails.street}
                    onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                    placeholder="Apartment, Street Address..."
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600 }}>City</label>
                  <input
                    type="text"
                    value={addressDetails.city}
                    onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                    placeholder="City Name"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600 }}>State</label>
                  <input
                    type="text"
                    value={addressDetails.state}
                    onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
                    placeholder="State Name"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600 }}>Pincode</label>
                  <input
                    type="text"
                    value={addressDetails.pincode}
                    onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })}
                    placeholder="6-digit ZIP code"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "span 2", display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    style={{
                      background: "transparent", border: `1px solid ${COLORS.cardBorder}`,
                      color: COLORS.muted, borderRadius: 8, padding: "8px 16px",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      background: COLORS.green, border: "none",
                      color: "#000", borderRadius: 8, padding: "8px 16px",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {addressDetails.street ? (
                    <div style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.6 }}>
                      <p style={{ margin: "0 0 4px" }}>{addressDetails.street}</p>
                      <p style={{ margin: 0, color: COLORS.muted }}>
                        {addressDetails.city}, {addressDetails.state} — {addressDetails.pincode}
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: COLORS.muted, fontSize: 13, margin: 0, fontStyle: "italic" }}>
                      No default delivery address set yet. Click Edit Details to add one.
                    </p>
                  )}
                </div>
                {saveSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.green, fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle2 size={13} /> Saved!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orders History Card */}
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Package size={18} color={COLORS.green} />
              <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: 0 }}>
                Order History
              </h3>
            </div>

            {loadingOrders ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: COLORS.muted, fontSize: 13 }}>
                Loading order history...
              </div>
            ) : realOrders.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {realOrders.map((o) => (
                  <div
                    key={o.orderId}
                    style={{
                      background: "rgba(255,255,255,0.01)",
                      border: `1px solid ${COLORS.cardBorder}`,
                      borderRadius: 16,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
                            Order #{o.orderId}
                          </span>
                          {(() => {
                            const status = o.status || 'Pending';
                            let bg = 'rgba(56,189,248,0.15)';
                            let color = '#38BDF8';
                            if (status === 'Cancelled') {
                              bg = 'rgba(239,68,68,0.15)';
                              color = '#EF4444';
                            } else if (status === 'Pending (COD)') {
                              bg = 'rgba(245,158,11,0.15)';
                              color = '#F59E0B';
                            } else if (status === 'Completed' || status === 'Delivered') {
                              bg = 'rgba(16,185,129,0.15)';
                              color = '#10B981';
                            } else if (status === 'Shipped') {
                              bg = 'rgba(139,92,246,0.15)';
                              color = '#8B5CF6';
                            }
                            return (
                              <span style={{
                                background: bg,
                                color: color,
                                fontSize: 10, fontWeight: 700, padding: "2px 7px",
                                borderRadius: 100,
                                textTransform: "uppercase",
                                letterSpacing: "0.02em"
                              }}>
                                {status}
                              </span>
                            );
                          })()}
                        </div>
                        <div style={{ color: COLORS.muted, fontSize: 12 }}>
                          Placed on: {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div style={{ textAlign: isMobile ? "left" : "right" }}>
                        <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 16, fontFamily: "'Sora', sans-serif" }}>
                          ₹{o.total.toLocaleString("en-IN")}
                        </div>
                        <span style={{ color: COLORS.muted, fontSize: 11, textTransform: "uppercase" }}>Method: {o.paymentMethod}</span>
                      </div>
                    </div>

                    {/* Order Items list */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      {o.items.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <img src={item.img} alt={item.name} style={{ width: 40, height: 30, objectFit: "cover", borderRadius: 4, background: COLORS.background }} />
                          <div style={{ flex: 1, fontSize: 12, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 12, color: COLORS.muted }}>
                            ₹{item.price.toLocaleString("en-IN")} × {item.qty}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Timeline Tracker */}
                    {o.status !== "Cancelled" && (
                      <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        paddingTop: 16, marginTop: 4,
                        display: "flex", flexDirection: "column", gap: 14
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "0 10px" }}>
                          {/* Progress Line Background */}
                          <div style={{
                            position: "absolute", top: 12, left: "10%", right: "10%", height: 2,
                            background: "rgba(255,255,255,0.06)", zIndex: 0
                          }} />
                          {/* Progress Line Active Fill */}
                          <div style={{
                            position: "absolute", top: 12, left: "10%", height: 2,
                            width: (o.status === "Completed" || o.status === "Delivered") ? "80%" 
                                  : o.status === "Shipped" ? "53%" 
                                  : "26%",
                            background: COLORS.green, zIndex: 0,
                            transition: "width 0.4s ease"
                          }} />

                          {/* Node 1: Ordered */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: COLORS.green, border: `2.5px solid ${COLORS.cardBg}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#000", fontWeight: 800, fontSize: 10
                            }}>✓</div>
                            <span style={{ fontSize: 11, color: COLORS.text, fontWeight: 700, marginTop: 6 }}>Ordered</span>
                          </div>

                          {/* Node 2: Processed */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: (o.status === "Paid" || o.status === "Pending (COD)" || o.status === "Paid (Simulated)" || o.status === "Shipped" || o.status === "Completed" || o.status === "Delivered") ? COLORS.green : "rgba(255,255,255,0.08)",
                              border: `2.5px solid ${COLORS.cardBg}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#000", fontWeight: 800, fontSize: 10
                            }}>
                              {(o.status === "Paid" || o.status === "Pending (COD)" || o.status === "Paid (Simulated)" || o.status === "Shipped" || o.status === "Completed" || o.status === "Delivered") ? "✓" : ""}
                            </div>
                            <span style={{ fontSize: 11, color: (o.status === "Paid" || o.status === "Pending (COD)" || o.status === "Paid (Simulated)" || o.status === "Shipped" || o.status === "Completed" || o.status === "Delivered") ? COLORS.text : COLORS.muted, fontWeight: 600, marginTop: 6 }}>Processed</span>
                          </div>

                          {/* Node 3: Shipped */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: (o.status === "Shipped" || o.status === "Completed" || o.status === "Delivered") ? COLORS.green : "rgba(255,255,255,0.08)",
                              border: `2.5px solid ${COLORS.cardBg}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#000", fontWeight: 800, fontSize: 10
                            }}>
                              {(o.status === "Shipped" || o.status === "Completed" || o.status === "Delivered") ? "✓" : ""}
                            </div>
                            <span style={{ fontSize: 11, color: (o.status === "Shipped" || o.status === "Completed" || o.status === "Delivered") ? COLORS.text : COLORS.muted, fontWeight: 600, marginTop: 6 }}>Shipped</span>
                          </div>

                          {/* Node 4: Completed */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: (o.status === "Completed" || o.status === "Delivered") ? COLORS.green : "rgba(255,255,255,0.08)",
                              border: `2.5px solid ${COLORS.cardBg}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#000", fontWeight: 800, fontSize: 10
                            }}>
                              {(o.status === "Completed" || o.status === "Delivered") ? "✓" : ""}
                            </div>
                            <span style={{ fontSize: 11, color: (o.status === "Completed" || o.status === "Delivered") ? COLORS.text : COLORS.muted, fontWeight: 600, marginTop: 6 }}>Delivered</span>
                          </div>
                        </div>

                        {/* Courier Partner & Track Package Button */}
                        {o.trackingId && (
                          <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            background: "rgba(255,255,255,0.01)", border: `1px dashed ${COLORS.cardBorder}`,
                            borderRadius: 14, padding: "10px 16px", marginTop: 4, flexWrap: "wrap", gap: 12
                          }}>
                            <div style={{ fontSize: 12 }}>
                              <span style={{ color: COLORS.muted }}>Courier Partner:</span>{" "}
                              <strong style={{ color: COLORS.text }}>{o.courierPartner}</strong>{" "}
                              <span style={{ color: COLORS.muted, margin: "0 4px" }}>|</span>{" "}
                              <span style={{ color: COLORS.muted }}>AWB / Tracking:</span>{" "}
                              <code style={{ background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 4, color: COLORS.green, fontFamily: "monospace", fontSize: 11 }}>{o.trackingId}</code>
                            </div>
                            <a
                              href={o.trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: `linear-gradient(135deg, ${COLORS.green}, #38BDF8)`,
                                color: "#000", border: "none", borderRadius: 8,
                                padding: "6px 14px", fontSize: 11, fontWeight: 800,
                                cursor: "pointer", textDecoration: "none", display: "inline-flex",
                                alignItems: "center", gap: 4, fontFamily: "'Sora', sans-serif"
                              }}
                            >
                              Track Package ↗
                            </a>
                          </div>
                        )}

                        {/* Write Review Underlay for Completed/Delivered orders */}
                        {(o.status === "Completed" || o.status === "Delivered") && (
                          <div style={{
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                            paddingTop: 16, marginTop: 12,
                            display: "flex", flexDirection: "column", gap: 12
                          }}>
                            {reviewSubmittedOrders[o.orderId] ? (
                              <div style={{ color: COLORS.green, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                ✓ Thank you! Your review has been submitted.
                              </div>
                            ) : reviewingOrderId === o.orderId ? (
                              <div style={{
                                background: "rgba(255,255,255,0.01)", border: `1px solid ${COLORS.cardBorder}`,
                                borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 700 }}>Write a Review for Order #{o.orderId}</span>
                                  <button
                                    onClick={() => setReviewingOrderId(null)}
                                    style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 12 }}
                                  >
                                    Cancel
                                  </button>
                                </div>

                                {/* Stars Selection */}
                                <div style={{ display: "flex", gap: 4 }}>
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      size={18}
                                      onClick={() => setReviewRating(s)}
                                      fill={s <= reviewRating ? "#F59E0B" : "transparent"}
                                      color={s <= reviewRating ? "#F59E0B" : "rgba(255,255,255,0.15)"}
                                      style={{ cursor: "pointer" }}
                                    />
                                  ))}
                                </div>

                                {/* Review Text */}
                                <textarea
                                  placeholder="Share your experience with Laptopkart..."
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  rows={3}
                                  style={{
                                    width: "100%", background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 10, padding: 10, color: "#fff", fontSize: 12, outline: "none",
                                    resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.4
                                  }}
                                />

                                <button
                                  onClick={() => handleOrderReviewSubmit(o.orderId, user?.name || "Customer", addressDetails?.city || "Verified Buyer")}
                                  disabled={reviewSubmitting}
                                  style={{
                                    alignSelf: "flex-end",
                                    background: `linear-gradient(135deg, ${COLORS.green}, #38BDF8)`,
                                    color: "#000", border: "none", borderRadius: 8,
                                    padding: "6px 16px", fontSize: 12, fontWeight: 800,
                                    cursor: "pointer", fontFamily: "'Sora', sans-serif"
                                  }}
                                >
                                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                                <span style={{ fontSize: 12, color: COLORS.muted }}>Enjoying your purchase? Let others know!</span>
                                <button
                                  onClick={() => {
                                    setReviewingOrderId(o.orderId);
                                    setReviewRating(5);
                                    setReviewText("");
                                  }}
                                  style={{
                                    background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
                                    color: "#38BDF8", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
                                  }}
                                >
                                  <Star size={13} fill="#38BDF8" /> Write a Review
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Package size={32} color={COLORS.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ color: COLORS.muted, fontSize: 13, margin: 0 }}>
                  You haven&apos;t placed any orders yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
