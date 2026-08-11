"use client";

import { useState, useEffect, useRef } from "react";
import {
  User, Mail, Phone, MapPin, Package, LogOut, CheckCircle2,
  Edit2, Star, GraduationCap, Trophy, BookOpen, Camera, Calendar,
  ChevronRight, Loader2, TrendingUp, Award, PenLine, Clock
} from "lucide-react";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import {
  doc, getDoc, setDoc, collection, query, where, onSnapshot, getDocs
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt?: string;
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

interface BlogPost {
  id: string;
  title: string;
  authorEmail: string;
  authorName?: string;
  status?: string;
  reads?: number;
  createdAt?: string;
  approved?: boolean;
}

interface LeaderboardEntry {
  email: string;
  name: string;
  articles: number;
  reads: number;
}

interface GiveawayCurrent {
  prizeTitle?: string;
  prizeImage?: string;
  deadline?: string;
}

type Tab = "overview" | "address" | "orders" | "hub";

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gdinjtg4";
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cqy73qnu";

export default function ProfilePage({ user, setUser, setPage, triggerAlert }: Props) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Address state
  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    phone: "", street: "", city: "", state: "", pincode: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Orders state
  const [realOrders, setRealOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmittedOrders, setReviewSubmittedOrders] = useState<Record<string, boolean>>({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Avatar upload state
  const [photoURL, setPhotoURL] = useState<string>(user.photoURL || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student Hub state
  const [myBlogs, setMyBlogs] = useState<BlogPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [hubLoading, setHubLoading] = useState(true);
  const [giveaway, setGiveaway] = useState<GiveawayCurrent>({});

  // Member since
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Verified Member";

  /* ── Fetch user details from Firestore ── */
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAddressDetails(data as AddressDetails);
        if (data.photoURL) setPhotoURL(data.photoURL);
      }
    }).catch(console.error);
  }, [user]);

  /* ── Fetch orders ── */
  useEffect(() => {
    if (!user?.email) return;
    const q = query(collection(db, "orders"), where("email", "==", user.email));
    const unsub = onSnapshot(q, (snap) => {
      const list: Order[] = [];
      snap.forEach((d) => list.push({ ...d.data() } as Order));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRealOrders(list);
      setLoadingOrders(false);
    }, (err) => { console.error(err); setLoadingOrders(false); });
    return () => unsub();
  }, [user]);

  /* ── Fetch Student Hub data ── */
  useEffect(() => {
    if (activeTab !== "hub") return;
    setHubLoading(true);

    const fetchHub = async () => {
      try {
        // Fetch all blogs
        const blogsSnap = await getDocs(collection(db, "blogs"));
        const allBlogs: BlogPost[] = [];
        blogsSnap.forEach((d) => allBlogs.push({ id: d.id, ...d.data() } as BlogPost));

        // My blogs
        const mine = allBlogs.filter((b) =>
          b.authorEmail?.toLowerCase() === user.email?.toLowerCase()
        );
        setMyBlogs(mine.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ));

        // Build leaderboard by grouping by email
        const byEmail: Record<string, LeaderboardEntry> = {};
        allBlogs.forEach((b) => {
          const email = b.authorEmail?.toLowerCase() || "";
          if (!email) return;
          if (!byEmail[email]) {
            byEmail[email] = { email, name: b.authorName || email.split("@")[0], articles: 0, reads: 0 };
          }
          byEmail[email].articles += 1;
          byEmail[email].reads += (b.reads || 0);
        });

        const board = Object.values(byEmail).sort((a, b) =>
          b.reads !== a.reads ? b.reads - a.reads : b.articles - a.articles
        );
        setLeaderboard(board);

        const rank = board.findIndex(
          (e) => e.email === user.email?.toLowerCase()
        );
        setMyRank(rank >= 0 ? rank + 1 : null);

        // Fetch current giveaway config
        const gwSnap = await getDoc(doc(db, "giveaway", "current"));
        if (gwSnap.exists()) setGiveaway(gwSnap.data() as GiveawayCurrent);
      } catch (err) {
        console.error("Student Hub load error:", err);
      } finally {
        setHubLoading(false);
      }
    };

    fetchHub();
  }, [activeTab, user]);

  /* ── Avatar Upload (Cloudinary) ── */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      triggerAlert("error", "Please select a valid image file.");
      return;
    }
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_PRESET);
      formData.append("folder", "laptopkart/avatars");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        const url = data.secure_url;
        setPhotoURL(url);
        await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
        triggerAlert("success", "Profile photo updated!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Failed to upload photo. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── Save address ── */
  const handleSave = async () => {
    if (!user?.uid) return;
    try {
      await setDoc(doc(db, "users", user.uid), addressDetails, { merge: true });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      triggerAlert("success", "Address saved successfully!");
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Failed to save address. Try again.");
    }
  };

  /* ── Review submit ── */
  const handleReviewSubmit = async (orderId: string, customerName: string, city: string) => {
    if (!reviewText.trim()) return triggerAlert("warning", "Please type your review.");
    setReviewSubmitting(true);
    try {
      await setDoc(doc(collection(db, "reviews")), {
        name: customerName,
        city: city || "Verified Buyer",
        rating: reviewRating,
        text: reviewText.trim(),
        orderId,
        createdAt: new Date().toISOString(),
      });
      setReviewSubmittedOrders((p) => ({ ...p, [orderId]: true }));
      setReviewingOrderId(null);
      setReviewText("");
      triggerAlert("success", "Review submitted! Thank you.");
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  /* ── Logout ── */
  const handleLogout = () => {
    auth.signOut().then(() => {
      setUser(null);
      setPage("home");
    }).catch(console.error);
  };

  /* ── Helpers ── */
  const displayName = (user as any).displayName || user.name || user.email?.split("@")[0] || "Customer";
  const initials = displayName.split(" ").filter(Boolean).map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "U";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: COLORS.background,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 10,
    padding: "10px 12px",
    color: COLORS.text,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const tabItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <User size={16} /> },
    { key: "address", label: "My Address", icon: <MapPin size={16} /> },
    { key: "orders", label: "My Orders", icon: <Package size={16} /> },
    { key: "hub", label: "Student Hub", icon: <GraduationCap size={16} /> },
  ];

  const getStatusStyle = (status: string) => {
    if (status === "Cancelled") return { bg: "var(--error-bg)", color: "var(--error)" };
    if (status === "Pending (COD)") return { bg: "var(--warning-bg)", color: "var(--warning)" };
    if (status === "Completed" || status === "Delivered") return { bg: "var(--success-bg)", color: "var(--success)" };
    if (status === "Shipped") return { bg: "rgba(139,92,246,0.15)", color: "#8B5CF6" };
    return { bg: "var(--bg-active)", color: "var(--accent)" };
  };

  const isOrderActive = (status: string) =>
    ["Paid", "Pending (COD)", "Paid (Simulated)", "Shipped", "Completed", "Delivered"].includes(status);
  const isOrderShipped = (status: string) =>
    ["Shipped", "Completed", "Delivered"].includes(status);
  const isOrderDone = (status: string) =>
    ["Completed", "Delivered"].includes(status);

  /* ── TAB CONTENT ── */

  const renderOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Avatar Card */}
      <div style={{
        background: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 24,
        padding: isMobile ? "28px 20px" : "36px 32px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle gradient backdrop */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(56,189,248,0.04) 0%, rgba(139,92,246,0.04) 100%)",
          pointerEvents: "none",
        }} />

        {/* Avatar with upload */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
          <div style={{
            width: 96, height: 96, borderRadius: "50%",
            background: photoURL ? "transparent" : "linear-gradient(135deg, var(--accent-2), var(--accent))",
            boxShadow: "0 0 0 4px var(--bg-active), 0 0 0 6px rgba(56,189,248,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}>
            {photoURL ? (
              <img src={photoURL} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "var(--text-inverse)", fontSize: 30, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                {initials}
              </span>
            )}
            {avatarUploading && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%",
              }}>
                <Loader2 size={22} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>
          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload profile photo"
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--accent)", border: "3px solid var(--bg-1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Camera size={13} color="#000" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarUpload}
          />
        </div>

        <h2 style={{
          fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800,
          color: COLORS.text, margin: "0 0 4px",
        }}>{displayName}</h2>

        <span style={{
          background: "var(--bg-active)", color: "var(--accent)",
          fontSize: 10, fontWeight: 700, padding: "3px 10px",
          borderRadius: 100, display: "inline-block", marginBottom: 20,
          letterSpacing: "0.05em", textTransform: "uppercase",
        }}>Verified Customer</span>

        {/* Info rows */}
        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            { icon: <Mail size={14} color={COLORS.muted} />, val: user.email },
            { icon: <Phone size={14} color={COLORS.muted} />, val: addressDetails.phone || "No phone added" },
            { icon: <Calendar size={14} color={COLORS.muted} />, val: `Member since ${memberSince}` },
          ].map(({ icon, val }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {icon}
              <span style={{ fontSize: 13, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, marginBottom: 24,
        }}>
          {[
            { label: "Total Orders", val: loadingOrders ? "—" : realOrders.length },
            { label: "My Articles", val: hubLoading ? "—" : myBlogs.length },
          ].map(({ label, val }) => (
            <div key={label} style={{
              background: "var(--bg-hover)", border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 14, padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", fontFamily: "'Sora', sans-serif" }}>{val}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%", background: "var(--error-bg)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--error)", borderRadius: 12, padding: "12px 0",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontFamily: "'Sora', sans-serif", transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  );

  const renderAddress = () => (
    <div style={{
      background: COLORS.cardBg,
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 24, padding: 24,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-active)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={18} color="var(--accent)" />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: 0 }}>
              Primary Delivery Address
            </h3>
            <p style={{ color: COLORS.muted, fontSize: 12, margin: 0 }}>Used for all your orders</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: "var(--bg-hover)", border: `1px solid ${COLORS.cardBorder}`,
              color: "var(--accent)", borderRadius: 8, padding: "6px 14px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <Edit2 size={12} /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Phone Number</label>
            <input type="tel" value={addressDetails.phone} onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value })} placeholder="+91 97503 31313" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Street Address</label>
            <input type="text" value={addressDetails.street} onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })} placeholder="Apartment, Street Address..." style={inputStyle} />
          </div>
          <div>
            <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>City</label>
            <input type="text" value={addressDetails.city} onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })} placeholder="City" style={inputStyle} />
          </div>
          <div>
            <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>State</label>
            <input type="text" value={addressDetails.state} onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })} placeholder="State" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ color: COLORS.muted, fontSize: 11, marginBottom: 6, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Pincode</label>
            <input type="text" value={addressDetails.pincode} onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value })} placeholder="6-digit pincode" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "span 2", display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button
              onClick={() => setIsEditing(false)}
              style={{ background: "transparent", border: `1px solid ${COLORS.cardBorder}`, color: COLORS.muted, borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >Cancel</button>
            <button
              onClick={handleSave}
              style={{ background: "#0062FF", border: "none", color: "var(--text-inverse)", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >Save Changes</button>
          </div>
        </div>
      ) : (
        <div>
          {addressDetails.street ? (
            <div style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{addressDetails.street}</p>
              <p style={{ margin: "0 0 4px", color: COLORS.muted }}>{addressDetails.city}, {addressDetails.state}</p>
              <p style={{ margin: "0 0 12px", color: COLORS.muted }}>Pincode: {addressDetails.pincode}</p>
              {addressDetails.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Phone size={13} color={COLORS.muted} />
                  <span style={{ color: COLORS.muted, fontSize: 13 }}>{addressDetails.phone}</span>
                </div>
              )}
              {saveSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.green, fontSize: 12, fontWeight: 700, marginTop: 12 }}>
                  <CheckCircle2 size={13} /> Saved successfully!
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <MapPin size={32} color={COLORS.muted} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>No delivery address saved yet.</p>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: "#0062FF", border: "none", color: "var(--text-inverse)",
                  borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >+ Add Address</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div style={{
      background: COLORS.cardBg,
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 24, padding: 24,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-active)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Package size={18} color="var(--accent)" />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: 0 }}>Order History</h3>
          <p style={{ color: COLORS.muted, fontSize: 12, margin: 0 }}>{realOrders.length} order{realOrders.length !== 1 ? "s" : ""} placed</p>
        </div>
      </div>

      {loadingOrders ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.muted, fontSize: 13 }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
          <p style={{ margin: 0 }}>Loading order history...</p>
        </div>
      ) : realOrders.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {realOrders.map((o) => {
            const { bg, color } = getStatusStyle(o.status || "Pending");
            return (
              <div key={o.orderId} style={{
                background: "var(--bg-hover)",
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 18, padding: 18,
                display: "flex", flexDirection: "column", gap: 14,
                transition: "box-shadow 0.2s",
              }}>
                {/* Order header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
                        Order #{o.orderId}
                      </span>
                      <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        {o.status || "Pending"}
                      </span>
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} />
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--accent)", fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif" }}>
                      ₹{o.total.toLocaleString("en-IN")}
                    </div>
                    <div style={{ color: COLORS.muted, fontSize: 11, textTransform: "uppercase", marginTop: 2 }}>{o.paymentMethod}</div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {o.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <img src={item.img} alt={item.name} style={{ width: 44, height: 34, objectFit: "cover", borderRadius: 6, background: COLORS.background, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 13, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, flexShrink: 0 }}>₹{item.price.toLocaleString("en-IN")} × {item.qty}</div>
                    </div>
                  ))}
                </div>

                {/* Delivery timeline */}
                {o.status !== "Cancelled" && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "0 8px" }}>
                      <div style={{ position: "absolute", top: 12, left: "8%", right: "8%", height: 2, background: "var(--border)", zIndex: 0 }} />
                      <div style={{ position: "absolute", top: 12, left: "8%", height: 2, width: isOrderDone(o.status) ? "84%" : isOrderShipped(o.status) ? "55%" : isOrderActive(o.status) ? "27%" : "0%", background: "var(--accent)", zIndex: 0, transition: "width 0.4s ease" }} />
                      {["Ordered", "Processed", "Shipped", "Delivered"].map((label, i) => {
                        const done = i === 0 || (i === 1 && isOrderActive(o.status)) || (i === 2 && isOrderShipped(o.status)) || (i === 3 && isOrderDone(o.status));
                        return (
                          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, position: "relative" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? "var(--accent)" : "var(--border-hi)", border: `2.5px solid ${COLORS.cardBg}`, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-inverse)", fontWeight: 800, fontSize: 10 }}>
                              {done ? "✓" : ""}
                            </div>
                            <span style={{ fontSize: 10, color: done ? COLORS.text : COLORS.muted, fontWeight: done ? 700 : 500, marginTop: 6 }}>{label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tracking */}
                    {o.trackingId && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--border)", border: `1px dashed ${COLORS.cardBorder}`, borderRadius: 12, padding: "10px 14px", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: COLORS.muted }}>Courier:</span>{" "}
                          <strong style={{ color: COLORS.text }}>{o.courierPartner}</strong>
                          <span style={{ color: COLORS.muted, margin: "0 6px" }}>·</span>
                          <span style={{ color: COLORS.muted }}>AWB:</span>{" "}
                          <code style={{ background: "var(--bg-active)", padding: "2px 6px", borderRadius: 4, color: "var(--accent)", fontSize: 11 }}>{o.trackingId}</code>
                        </div>
                        <a href={o.trackingUrl} target="_blank" rel="noreferrer" style={{ background: `linear-gradient(135deg, var(--accent-2), var(--accent))`, color: "var(--text-inverse)", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          Track ↗
                        </a>
                      </div>
                    )}

                    {/* Review section */}
                    {isOrderDone(o.status) && (
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
                        {reviewSubmittedOrders[o.orderId] ? (
                          <div style={{ color: COLORS.green, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                            <CheckCircle2 size={14} /> Thank you! Your review has been submitted.
                          </div>
                        ) : reviewingOrderId === o.orderId ? (
                          <div style={{ background: "var(--border)", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 700 }}>Write a Review</span>
                              <button onClick={() => setReviewingOrderId(null)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={20} onClick={() => setReviewRating(s)} fill={s <= reviewRating ? "var(--warning)" : "transparent"} color={s <= reviewRating ? "var(--warning)" : "var(--text-3)"} style={{ cursor: "pointer", transition: "transform 0.1s" }} />
                              ))}
                            </div>
                            <textarea placeholder="Share your experience with Laptopkart..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3}
                              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 10, color: "var(--text)", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                            <button onClick={() => handleReviewSubmit(o.orderId, user?.name || "Customer", addressDetails?.city || "Verified Buyer")} disabled={reviewSubmitting}
                              style={{ alignSelf: "flex-end", background: `linear-gradient(135deg, var(--accent-2), var(--accent))`, color: "var(--text-inverse)", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                              {reviewSubmitting ? "Submitting..." : "Submit Review"}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                            <span style={{ fontSize: 12, color: COLORS.muted }}>Enjoying your purchase? Let others know!</span>
                            <button onClick={() => { setReviewingOrderId(o.orderId); setReviewRating(5); setReviewText(""); }}
                              style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "var(--accent)", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <Star size={13} fill="var(--accent)" /> Write a Review
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Package size={40} color={COLORS.muted} style={{ marginBottom: 14, opacity: 0.4 }} />
          <p style={{ color: COLORS.muted, fontSize: 14, margin: "0 0 20px" }}>No orders yet.</p>
          <button
            onClick={() => setPage("listing")}
            style={{ background: "#0062FF", color: "var(--text-inverse)", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >Shop Now →</button>
        </div>
      )}
    </div>
  );

  const renderHub = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {hubLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.muted }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 12 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Loading Student Hub...</p>
        </div>
      ) : (
        <>
          {/* Rank Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(139,92,246,0.08))",
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24, padding: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(139,92,246,0.2))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={20} color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: 0 }}>Your Leaderboard Rank</h3>
                <p style={{ color: COLORS.muted, fontSize: 12, margin: 0 }}>Based on articles published & reads earned</p>
              </div>
            </div>

            {myRank !== null ? (
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, boxShadow: "0 0 24px rgba(56,189,248,0.3)",
                }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Sora', sans-serif" }}>#{myRank}</span>
                </div>
                <div>
                  <p style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
                    {myRank === 1 ? "🥇 You're the top contributor!" : myRank === 2 ? "🥈 Amazing work, keep it up!" : myRank === 3 ? "🥉 You're in the top 3!" : `You rank #${myRank} of ${leaderboard.length} contributors`}
                  </p>
                  <p style={{ color: COLORS.muted, fontSize: 12, margin: 0 }}>
                    {leaderboard.find(e => e.email === user.email?.toLowerCase())?.articles || 0} articles · {(leaderboard.find(e => e.email === user.email?.toLowerCase())?.reads || 0).toLocaleString("en-IN")} total reads
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <PenLine size={28} color={COLORS.muted} style={{ marginBottom: 10, opacity: 0.5 }} />
                <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>You haven&apos;t written any blogs yet. Write one to get ranked!</p>
                <button onClick={() => setPage("write-blog")}
                  style={{ background: `linear-gradient(135deg, var(--accent-2), var(--accent))`, color: "#000", border: "none", borderRadius: 12, padding: "10px 22px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                  Write Your First Blog →
                </button>
              </div>
            )}
          </div>

          {/* Giveaway Card */}
          {giveaway.prizeTitle && (
            <div style={{
              background: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 24, padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Award size={18} color="var(--warning)" />
                <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 15, fontWeight: 700, margin: 0 }}>This Week&apos;s Giveaway</h3>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                {giveaway.prizeImage && (
                  <img src={giveaway.prizeImage} alt="Prize" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                )}
                <div>
                  <p style={{ color: COLORS.text, fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>{giveaway.prizeTitle}</p>
                  {giveaway.deadline && (
                    <p style={{ color: COLORS.muted, fontSize: 12, margin: 0 }}>Ends: {new Date(giveaway.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  )}
                  <p style={{ color: COLORS.muted, fontSize: 12, margin: "4px 0 0" }}>Write blogs and climb the leaderboard to win!</p>
                </div>
              </div>
            </div>
          )}

          {/* My Blog Submissions */}
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 24, padding: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-active)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={18} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 15, fontWeight: 700, margin: 0 }}>My Blog Submissions</h3>
                  <p style={{ color: COLORS.muted, fontSize: 12, margin: 0 }}>{myBlogs.length} article{myBlogs.length !== 1 ? "s" : ""} written</p>
                </div>
              </div>
              <button onClick={() => setPage("write-blog")}
                style={{ background: "#0062FF", color: "var(--text-inverse)", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <PenLine size={13} /> Write New
              </button>
            </div>

            {myBlogs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myBlogs.map((blog) => (
                  <div key={blog.id} style={{
                    background: "var(--bg-hover)", border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 14, padding: "14px 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 12, flexWrap: "wrap",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{blog.title || "Untitled"}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {blog.createdAt && (
                          <span style={{ color: COLORS.muted, fontSize: 11 }}>
                            {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: 3, color: COLORS.muted, fontSize: 11 }}>
                          <TrendingUp size={10} /> {(blog.reads || 0).toLocaleString("en-IN")} reads
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase",
                        background: blog.approved ? "var(--success-bg)" : "var(--warning-bg)",
                        color: blog.approved ? "var(--success)" : "var(--warning)",
                      }}>
                        {blog.approved ? "Published" : "Pending"}
                      </span>
                      <button onClick={() => setPage(`blog-${blog.id}`)}
                        style={{ background: "transparent", border: `1px solid ${COLORS.cardBorder}`, color: "var(--accent)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        View <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <BookOpen size={32} color={COLORS.muted} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>No blog articles yet. Start writing to climb the leaderboard!</p>
              </div>
            )}
          </div>

          {/* Top Leaderboard Preview */}
          {leaderboard.length > 0 && (
            <div style={{
              background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: 24, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <TrendingUp size={18} color="var(--accent)" />
                <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 15, fontWeight: 700, margin: 0 }}>Top Contributors</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leaderboard.slice(0, 5).map((entry, idx) => {
                  const isMe = entry.email === user.email?.toLowerCase();
                  const medal = ["🥇", "🥈", "🥉"][idx] || `#${idx + 1}`;
                  return (
                    <div key={entry.email} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: isMe ? "var(--bg-active)" : "var(--bg-hover)",
                      border: `1px solid ${isMe ? "rgba(56,189,248,0.3)" : COLORS.cardBorder}`,
                      borderRadius: 12, padding: "12px 16px",
                      transition: "all 0.2s",
                    }}>
                      <span style={{ fontSize: 16, width: 28, textAlign: "center", flexShrink: 0 }}>{medal}</span>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent-2), var(--accent))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0,
                      }}>
                        {entry.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: COLORS.text, fontSize: 13, fontWeight: isMe ? 800 : 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.name} {isMe && <span style={{ color: "var(--accent)", fontSize: 10 }}>• You</span>}
                        </p>
                        <p style={{ color: COLORS.muted, fontSize: 11, margin: 0 }}>{entry.articles} articles · {entry.reads.toLocaleString("en-IN")} reads</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setPage("blog")}
                style={{ width: "100%", marginTop: 14, background: "transparent", border: `1px solid ${COLORS.cardBorder}`, color: "var(--accent)", borderRadius: 10, padding: "10px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                View Full Leaderboard →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  /* ── MAIN RENDER ── */
  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: isMobile ? "20px 14px 60px" : "40px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 34, fontWeight: 800, color: COLORS.text, margin: "0 0 6px" }}>
          My Account
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14, margin: 0 }}>
          Manage your profile, address, orders, and Student Hub activity.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 24, alignItems: "start" }}>

        {/* Sidebar / Tab Nav */}
        <div style={isMobile ? { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 8 } : {
          display: "flex", flexDirection: "column", gap: 6,
          background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 20, padding: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          position: "sticky", top: 80,
        }}>
          {tabItems.map(({ key, label, icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 6 : 10,
                  padding: isMobile ? "8px 14px" : "12px 14px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? 12 : 13,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  background: active ? "var(--bg-active)" : "transparent",
                  color: active ? "var(--accent)" : COLORS.muted,
                  boxShadow: active ? "inset 0 0 0 1px rgba(56,189,248,0.2)" : "none",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: active ? "var(--accent)" : COLORS.muted }}>{icon}</span>
                {label}
                {key === "orders" && realOrders.length > 0 && !isMobile && (
                  <span style={{ marginLeft: "auto", background: "var(--accent)", color: "#000", fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 100 }}>
                    {realOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div style={{ minWidth: 0 }}>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "address" && renderAddress()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "hub" && renderHub()}
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
