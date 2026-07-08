"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Package, Clock, LogOut, CheckCircle2, ShieldAlert } from "lucide-react";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Props {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setPage: (p: string) => void;
}

export default function ProfilePage({ user, setUser, setPage }: Props) {
  const isMobile = useIsMobile();
  const [address, setAddress] = useState(user.address);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setUser((u) => u ? { ...u, address } : null);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  const mockOrders = [
    {
      id: "LK-8392",
      date: "July 01, 2026",
      product: "Dell Latitude 5400",
      price: 27999,
      status: "Delivered",
      color: COLORS.green,
    },
    {
      id: "LK-7281",
      date: "June 15, 2026",
      product: "Lenovo ThinkPad T480",
      price: 26999,
      status: "Shipped",
      color: "#38BDF8",
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "24px 14px 48px" : "48px 20px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
        My Account
      </h1>
      <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 32 }}>
        Manage your profile, shipping addresses, and track orders.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 24 }}>
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
          }}>
            {/* Avatar circle */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6, #38BDF8)",
              color: "#000", fontSize: 28, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontFamily: "'Sora', sans-serif",
            }}>
              {user.name.split(" ").map(n => n[0]).join("")}
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
                <span style={{ fontSize: 13, color: COLORS.text }}>{user.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={15} color={COLORS.muted} />
                <span style={{ fontSize: 13, color: COLORS.text }}>{user.phone}</span>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Address Card */}
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24,
            padding: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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
                  }}
                >
                  Edit Address
                </button>
              )}
            </div>

            {isEditing ? (
              <div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    background: COLORS.background,
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 12,
                    padding: 12,
                    color: COLORS.text,
                    fontSize: 14,
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    marginBottom: 12,
                  }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setAddress(user.address); setIsEditing(false); }}
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {user.address}
                </p>
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
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Package size={18} color={COLORS.green} />
              <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: 0 }}>
                Order History
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mockOrders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
                        {o.product}
                      </span>
                      <span style={{
                        background: `${o.color}15`, color: o.color,
                        fontSize: 10, fontWeight: 700, padding: "2px 7px",
                        borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 3,
                      }}>
                        {o.status}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 12, color: COLORS.muted, fontSize: 12 }}>
                      <span>Order: {o.id}</span>
                      <span>•</span>
                      <span>Date: {o.date}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: COLORS.text, fontWeight: 800, fontSize: 16, fontFamily: "'Sora', sans-serif" }}>
                      ₹{o.price.toLocaleString("en-IN")}
                    </div>
                    <span style={{ color: COLORS.muted, fontSize: 11 }}>Paid Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
