"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { COLORS, products, accessoriesList } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import {
  BookOpen, Scale, GraduationCap, Gamepad2, Battery,
  Phone, Mail, MessageSquare, MapPin, CheckCircle2,
  Lock, User, Laptop, ShieldCheck, Leaf, Coins, ChevronRight, Star, ShoppingCart, Heart
} from "lucide-react";
import { FaApple, FaGoogle } from "react-icons/fa6";

export function ComparePage() {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState([products[0], products[1], products[2]]);
  const specs = ["price", "mrp", "discount", "rating", "processor", "ram", "storage", "warranty", "grade"];
  const labels: Record<string, string> = { price: "Price", mrp: "MRP", discount: "Discount %", rating: "Rating", processor: "Processor", ram: "RAM", storage: "Storage", warranty: "Warranty", grade: "Grade" };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 20px" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 24 : 28, fontWeight: 800, color: COLORS.text, marginBottom: 24 }}>Compare Products</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 620 : 700 }}>
          <thead>
            <tr>
              <th style={{ padding: isMobile ? "12px 12px" : "16px 20px", background: COLORS.cardBg, color: COLORS.muted, textAlign: "left", fontSize: 14, border: `1px solid ${COLORS.cardBorder}` }}>Feature</th>
              {selected.map(p => (
                <th key={p.id} style={{ padding: isMobile ? "12px" : "20px", background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, minWidth: isMobile ? 180 : 200 }}>
                  <div style={{ width: 120, height: 120, margin: "0 auto 12px", background: COLORS.background, borderRadius: 12, overflow: "hidden" }}>
                    <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>{p.name}</div>
                  <select onChange={e => { const np = products.find(pr => pr.id === parseInt(e.target.value))!; setSelected(s => s.map(sp => sp.id === p.id ? np : sp)); }} value={p.id}
                    style={{ background: COLORS.darkBg, border: `1px solid ${COLORS.cardBorder}`, color: COLORS.muted, borderRadius: 8, padding: "6px 10px", marginTop: 8, width: "100%", fontSize: 12 }}>
                    {products.map(pr => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
                  </select>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specs.map((spec, i) => (
              <tr key={spec} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                <td style={{ padding: isMobile ? "10px 12px" : "14px 20px", color: COLORS.muted, fontSize: 14, fontWeight: 600, border: `1px solid ${COLORS.cardBorder}` }}>{labels[spec]}</td>
                {selected.map(p => {
                  const rawVal = p[spec as keyof typeof p] as string | number;
                  const val = spec === "price" || spec === "mrp" ? `₹${(rawVal as number).toLocaleString('en-IN')}` : spec === "discount" ? `${rawVal}%` : spec === "rating" ? `★ ${rawVal}` : rawVal;
                  const best = spec === "price" ? Math.min(...selected.map(s => s.price)) === p.price : spec === "rating" ? Math.max(...selected.map(s => s.rating)) === p.rating : spec === "discount" ? Math.max(...selected.map(s => s.discount)) === p.discount : false;
                  return (
                    <td key={p.id} style={{ padding: isMobile ? "10px 12px" : "14px 20px", textAlign: "center", color: best ? COLORS.green : COLORS.text, fontWeight: best ? 800 : 500, fontSize: 14, border: `1px solid ${COLORS.cardBorder}`, background: best ? "rgba(59,130,246,0.12)" : "transparent" }}>
                      {val}{best && <span style={{ display: "block", fontSize: 10, color: COLORS.green }}>Best</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AboutPage() {
  const isMobile = useIsMobile();
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "28px 14px" : "60px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 60 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 32 : 48, fontWeight: 800, color: COLORS.text, margin: "16px 0" }}>Redefining Refurbished Tech</h1>
        <p style={{ color: COLORS.muted, fontSize: isMobile ? 15 : 18, maxWidth: 600, margin: "0 auto" }}>Laptopkart was founded on one belief: everyone deserves premium tech at fair prices, without compromising on quality.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 48, marginBottom: 60, alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 32, fontWeight: 800, color: COLORS.text, marginBottom: 16 }}>Our Mission</h2>
          <p style={{ color: COLORS.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>We started in 2019 with a simple goal — make high-quality refurbished laptops accessible to every Indian, whether a student, professional, or small business owner.</p>
          <p style={{ color: COLORS.muted, fontSize: 16, lineHeight: 1.8 }}>Today, we&apos;ve sold over 50,000 devices across India, with every single device undergoing our rigorous 72-point quality inspection.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["50K+", "Devices Sold"], ["4.8★", "Avg Rating"], ["1 Year", "Warranty"], ["99.2%", "Satisfaction"]].map(([v, l]) => (
            <div key={l} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
              <div style={{ color: COLORS.green, fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{v}</div>
              <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogPage({ user, setPage }: { user: any; setPage: (p: string) => void }) {
  const isMobile = useIsMobile();
  const posts = [
    { title: "Top 5 Refurbished Laptops Under ₹20,000 in 2024", cat: "Buying Guide", date: "Dec 10, 2024", read: "5 min read", icon: <BookOpen size={40} color={COLORS.green} /> },
    { title: "Dell vs HP: Which Refurbished Brand is Better?", cat: "Comparison", date: "Dec 5, 2024", read: "8 min read", icon: <Scale size={40} color={COLORS.green} /> },
    { title: "Why Refurbished Laptops Are Better Than New for Students", cat: "Opinion", date: "Nov 28, 2024", read: "4 min read", icon: <GraduationCap size={40} color={COLORS.green} /> },
    { title: "Gaming on a Budget: Best Refurbished Gaming Laptops", cat: "Gaming", date: "Nov 20, 2024", read: "7 min read", icon: <Gamepad2 size={40} color={COLORS.green} /> },
    { title: "MacBook vs Windows: Which Refurbished is Worth It?", cat: "Comparison", date: "Nov 15, 2024", read: "6 min read", icon: <FaApple size={40} color={COLORS.green} /> },
    { title: "How to Check Battery Health on Your Refurbished Laptop", cat: "Tips", date: "Nov 8, 2024", read: "3 min read", icon: <Battery size={40} color={COLORS.green} /> },
  ];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "28px 14px" : "48px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 30, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>Tech Blog &amp; Buying Guides</h2>
          <p style={{ color: COLORS.muted, fontSize: 15, margin: 0 }}>Expert advice &mdash; exclusive offers if you win the writing contest!</p>
        </div>
        <button
          onClick={() => setPage("write-blog")}
          style={{
            background: COLORS.green, color: COLORS.black, border: "none",
            borderRadius: 12, padding: "12px 24px", fontSize: 13, fontWeight: 800,
            cursor: "pointer", fontFamily: "'Sora', sans-serif", transition: "all 0.2s",
            boxShadow: "0 4px 20px rgba(56,189,248,0.22)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
        >
          Write a New Blog
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {posts.map(post => (
          <div key={post.title} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.green; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.cardBorder; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
          >
            <div style={{ background: `linear-gradient(135deg, ${COLORS.cardBg}, ${COLORS.darkBg})`, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>{post.icon}</div>
            <div style={{ padding: 20 }}>
              <span style={{ background: COLORS.greenDark, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase" }}>{post.cat}</span>
              <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.5, margin: "10px 0 12px" }}>{post.title}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.muted, fontSize: 12 }}>
                <span>{post.date}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={11} /> {post.read}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "28px 14px" : "48px 20px" }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 30, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>Contact Us</h2>
      <p style={{ color: COLORS.muted, fontSize: 15, marginBottom: 32 }}>We&apos;re here to help. Reach out anytime!</p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 40 }}>
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 20, padding: isMobile ? 20 : 32 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <CheckCircle2 size={56} color={COLORS.green} />
              </div>
              <h3 style={{ color: COLORS.green, fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>Message Sent!</h3>
              <p style={{ color: COLORS.muted }}>We&apos;ll get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }} style={{ background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", marginTop: 16 }}>Send Another</button>
            </div>
          ) : (
            <>
              <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, marginBottom: 24 }}>Send a Message</h3>
              {[["Full Name", "name", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"]].map(([label, key, type]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6, display: "block" }}>{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", background: COLORS.background, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6, display: "block" }}>Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
                  style={{ width: "100%", background: COLORS.background, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button onClick={() => setSent(true)} style={{ width: "100%", background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Send Message →</button>
            </>
          )}
        </div>
        <div>
          {[
            { icon: <Phone size={18} color={COLORS.green} />, label: "Phone", val: "+91 99999 99999", sub: "Call us 10AM - 7PM" },
            { icon: <Mail size={18} color={COLORS.green} />, label: "Email", val: "support@laptopkart.com", sub: "Reply within 24 hours" },
            { icon: <MessageSquare size={18} color={COLORS.green} />, label: "WhatsApp", val: "+91 99999 99999", sub: "Quick replies on chat" },
            { icon: <MapPin size={18} color={COLORS.green} />, label: "Address", val: "Chennai, Tamil Nadu", sub: "Visit our showroom" }
          ].map(({ icon, label, val, sub }) => (
            <div key={label} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 14, padding: "16px 20px", marginBottom: 12, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,150,240,0.12)", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ color: COLORS.muted, fontSize: 12 }}>{label}</div>
                <div style={{ color: COLORS.text, fontWeight: 700 }}>{val}</div>
                <div style={{ color: COLORS.muted, fontSize: 12 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoginPage({ setPage, onLogin }: { setPage: (p: string) => void; onLogin: (user: any) => void }) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!form.email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    try {
      if (mode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
        const fbUser = userCredential.user;
        onLogin({
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          email: fbUser.email,
          uid: fbUser.uid,
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName: form.name });
        onLogin({
          name: form.name || fbUser.email?.split("@")[0] || "User",
          email: fbUser.email,
          uid: fbUser.uid,
        });
      }
    } catch (error: any) {
      console.warn("Firebase Auth Error:", error);
      // Sandbox fallback if environment variables are not configured yet
      if (error.code === "auth/invalid-api-key" || error.code === "auth/network-request-failed" || error.message.includes("apiKey") || error.message.includes("api_key")) {
        console.warn("Firebase credentials not configured yet. Simulating credentials login.");
        onLogin({
          name: form.name || form.email.split("@")[0] || "Sudarsan Kumar",
          email: form.email || "sudarsan@example.com",
          uid: "mock_user_123",
          isMock: true
        });
      } else {
        setErrorMsg(error.message.replace("Firebase: ", ""));
      }
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;
      onLogin({
        name: fbUser.displayName || "Google User",
        email: fbUser.email,
        img: fbUser.photoURL,
        uid: fbUser.uid,
      });
    } catch (error: any) {
      console.warn("Firebase Google Auth Error:", error);
      if (error.code === "auth/invalid-api-key" || error.code === "auth/network-request-failed" || error.message.includes("apiKey") || error.message.includes("api_key")) {
        onLogin({
          name: "Mock Google User",
          email: "google@example.com",
          uid: "mock_google_123",
          isMock: true
        });
      } else {
        setErrorMsg(error.message.replace("Firebase: ", ""));
      }
    }
  };

  const handleAppleAuth = async () => {
    setErrorMsg("");
    try {
      const userCredential = await signInWithPopup(auth, appleProvider);
      const fbUser = userCredential.user;
      onLogin({
        name: fbUser.displayName || "Apple User",
        email: fbUser.email,
        uid: fbUser.uid,
      });
    } catch (error: any) {
      console.warn("Firebase Apple Auth Error:", error);
      if (error.code === "auth/invalid-api-key" || error.code === "auth/network-request-failed" || error.message.includes("apiKey") || error.message.includes("api_key")) {
        onLogin({
          name: "Mock Apple User",
          email: "apple@example.com",
          uid: "mock_apple_123",
          isMock: true
        });
      } else {
        setErrorMsg(error.message.replace("Firebase: ", ""));
      }
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 52px)",
      position: "relative",
      overflow: "hidden",
      background: COLORS.darkBg,
      padding: "48px 14px",
      boxSizing: "border-box",
    }}>
      {/* Dynamic Glow Orb 1 */}
      <div style={{
        position: "absolute", top: "10%", left: "12%",
        width: isMobile ? 180 : 360, height: isMobile ? 180 : 360,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
        filter: "blur(50px)",
        animation: "floatBg 12s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      {/* Dynamic Glow Orb 2 */}
      <div style={{
        position: "absolute", bottom: "10%", right: "12%",
        width: isMobile ? 220 : 420, height: isMobile ? 220 : 420,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "floatBg2 16s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      {/* Grid line layer */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.007) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      <style>{`
        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, -32px) scale(1.08); }
        }
        @keyframes floatBg2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-32px, 24px) scale(0.96); }
        }
        .glass-input:focus-within {
          border-color: #38BDF8 !important;
          box-shadow: 0 0 16px rgba(56,189,248,0.18) !important;
        }
      `}</style>

      {/* Login Card */}
      <div style={{
        background: "rgba(20,24,33,0.65)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 24,
        padding: isMobile ? 28 : 40,
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.08)",
        position: "relative",
        zIndex: 2,
        boxSizing: "border-box",
      }}>
        {/* Emblem Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(56,189,248,0.06)",
            border: "1px solid rgba(56,189,248,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 20px rgba(56,189,248,0.08)",
          }}>
            <Laptop size={24} color={COLORS.green} />
          </div>
          <h2 style={{
            fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800,
            color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em",
          }}>
            {mode === "login" ? "Welcome Back" : "Get Started"}
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 13, margin: 0 }}>
            {mode === "login" ? "Enter details to access your account" : "Create a free certified Laptopkart account"}
          </p>
        </div>

        {/* Sliding Tab Switcher */}
        <div style={{
          display: "flex",
          position: "relative",
          marginBottom: 24,
          background: "rgba(13,17,23,0.6)",
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: 14,
          padding: 4,
          height: 44,
          boxSizing: "border-box",
        }}>
          <div style={{
            position: "absolute",
            top: 4, bottom: 4,
            left: mode === "login" ? 4 : "calc(50% + 2px)",
            width: "calc(50% - 6px)",
            background: COLORS.green,
            borderRadius: 10,
            transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
            zIndex: 1,
          }} />
          <button onClick={() => setMode("login")} style={{
            flex: 1, position: "relative", zIndex: 2, background: "transparent", border: "none",
            color: mode === "login" ? "#000" : COLORS.muted, cursor: "pointer", fontWeight: 700,
            fontSize: 13, fontFamily: "'Sora', sans-serif", transition: "color 0.3s",
          }}>
            Login
          </button>
          <button onClick={() => setMode("signup")} style={{
            flex: 1, position: "relative", zIndex: 2, background: "transparent", border: "none",
            color: mode === "signup" ? "#000" : COLORS.muted, cursor: "pointer", fontWeight: 700,
            fontSize: 13, fontFamily: "'Sora', sans-serif", transition: "color 0.3s",
          }}>
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ color: "#EF4444", fontSize: 13, textAlign: "center", marginBottom: 16, background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.18)" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailAuth}>
          {mode === "signup" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Full Name</label>
              <div className="glass-input" style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(13,17,23,0.5)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "0 14px", height: 46,
                transition: "all 0.25s",
              }}>
                <User size={15} color={COLORS.muted} />
                <input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ flex: 1, background: "transparent", border: "none", color: COLORS.text, fontSize: 14, outline: "none" }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Email Address</label>
            <div className="glass-input" style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(13,17,23,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "0 14px", height: 46,
              transition: "all 0.25s",
            }}>
              <Mail size={15} color={COLORS.muted} />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ flex: 1, background: "transparent", border: "none", color: COLORS.text, fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, display: "block" }}>Password</label>
              {mode === "login" && (
                <button type="button" style={{ background: "transparent", border: "none", color: "#38BDF8", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="glass-input" style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(13,17,23,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "0 14px", height: 46,
              transition: "all 0.25s",
            }}>
              <Lock size={15} color={COLORS.muted} />
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ flex: 1, background: "transparent", border: "none", color: COLORS.text, fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            style={{
              width: "100%",
              background: COLORS.green,
              color: COLORS.black,
              border: "none",
              borderRadius: 12,
              padding: "14px 0",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
            }}
            onMouseEnter={e => {
              const b = e.currentTarget;
              b.style.transform = "translateY(-1px)";
              b.style.boxShadow = "0 6px 24px rgba(16,185,129,0.45)";
            }}
            onMouseLeave={e => {
              const b = e.currentTarget;
              b.style.transform = "none";
              b.style.boxShadow = "0 4px 20px rgba(16,185,129,0.25)";
            }}
          >
            {mode === "login" ? "Access Account →" : "Register Account →"}
          </button>
        </form>

        {/* Separator */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            or join with
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* SSO Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={handleGoogleAuth} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "11px 0", color: COLORS.text, fontWeight: 700, fontSize: 13,
            cursor: "pointer", fontFamily: "'Sora', sans-serif", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.30)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          >
            <FaGoogle size={14} color="#EA4335" /> Google
          </button>
          <button onClick={handleAppleAuth} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "11px 0", color: COLORS.text, fontWeight: 700, fontSize: 13,
            cursor: "pointer", fontFamily: "'Sora', sans-serif", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
          >
            <FaApple size={14} color="#fff" /> Apple
          </button>
        </div>
      </div>
    </div>
  );
}

export function WhyRefurbishedPage() {
  const isMobile = useIsMobile();
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "24px 14px 48px" : "48px 20px" }}>
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 32 : 44, fontWeight: 800, color: COLORS.text, marginBottom: 12, lineHeight: 1.15 }}>
          Why Buy Refurbished Laptops?
        </h1>
        <p style={{ color: COLORS.muted, fontSize: isMobile ? 15 : 18, maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
          A certified, sustainable choice that delivers brand-new performance at a fraction of the price.
        </p>
      </div>

      {/* Triple Benefits Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 24, marginBottom: 56 }}>
        {[
          {
            icon: <Coins size={24} color={COLORS.green} />,
            title: "Massive Cost Savings",
            desc: "Get premium business-class laptops (Dell Latitude, ThinkPad, MacBook) at 50% to 70% off retail pricing.",
          },
          {
            icon: <ShieldCheck size={24} color="#38BDF8" />,
            title: "72-Point Inspection",
            desc: "Every laptop undergoes testing, component restoration, and comes backed by a 1-Year Warranty.",
          },
          {
            icon: <Leaf size={24} color="#10B981" />,
            title: "Eco-Friendly Impact",
            desc: "Prevent hazardous electronic waste. Buying refurbished reduces the carbon footprint of manufacturing by 80%.",
          }
        ].map((item, idx) => (
          <div key={idx} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 20, padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              {item.icon}
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
              {item.title}
            </h3>
            <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Refurbished vs. Used vs. New Comparison Section */}
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, padding: isMobile ? 20 : 36, marginBottom: 56 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 20, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>
          Refurbished vs. Used vs. New Laptops
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                <th style={{ textAlign: "left", padding: "12px 8px", color: COLORS.muted, fontWeight: 600 }}>Feature</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: COLORS.green, fontWeight: 700 }}>Laptopkart Refurbished</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: COLORS.muted, fontWeight: 600 }}>Typical Used Laptop</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: COLORS.muted, fontWeight: 600 }}>Brand New Laptop</th>
              </tr>
            </thead>
            <tbody>
              {[
                { f: "Quality Grade", ref: "Grade A+ (Premium quality)", used: "Varies, unknown wear & tear", new: "Perfect condition" },
                { f: "Testing & Cleaning", ref: "72-Point Inspection & sanitization", used: "None (sold as-is)", new: "Factory fresh" },
                { f: "Warranty Included", ref: "1-Year Warranty & 7 Days replacement", used: "None", new: "1-Year brand warranty" },
                { f: "Average Cost", ref: "50% - 70% Off original price", used: "Cheap but highly risky", new: "Full retail price" },
                { f: "Environmental Footprint", ref: "Ultra-low (extends device lifecycle)", used: "Low", new: "High (raw material extraction)" },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx === 4 ? "none" : `1px solid rgba(255,255,255,0.04)` }}>
                  <td style={{ padding: "14px 8px", color: COLORS.text, fontWeight: 600 }}>{row.f}</td>
                  <td style={{ padding: "14px 8px", color: COLORS.text }}>{row.ref}</td>
                  <td style={{ padding: "14px 8px", color: COLORS.muted }}>{row.used}</td>
                  <td style={{ padding: "14px 8px", color: COLORS.muted }}>{row.new}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 72-Point Process Checklist */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 36, alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 24, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
            Our Certified Inspection & Restoration Process
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            At Laptopkart, refurbished doesn't mean repaired. It means fully restored to original manufacturer specifications. Here is how we verify every device:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "Display panel inspection (no dead pixels, clear backlighting)",
              "Full battery health test (minimum 80% capacity guaranteed)",
              "Keyboard & trackpad mechanical keypress audit",
              "Internal thermal cleaning & processor cooling compound refresh",
              "Ports connectivity & motherboard diagnostic scanning",
            ].map((step, idx) => (
              <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green }} />
                </div>
                <span style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.01)", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, padding: 32 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            Eco-Impact Fact:
          </h3>
          <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>
            Manufacturing a single new laptop produces approximately **350kg of CO2** and consumes **190,000 liters of water**. Buying certified refurbished extends the lifespan of high-grade components and avoids 80% of these environmental impacts!
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.green, fontWeight: 700, fontSize: 14 }}>
            <span>Make the sustainable choice</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WriteBlogPage({ setPage }: { setPage: (p: string) => void }) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ title: "", category: "Buying Guide", content: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitted(true);
    setTimeout(() => {
      setPage("blog");
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 640, margin: isMobile ? "24px auto" : "48px auto", padding: isMobile ? "0 14px" : "0 20px" }}>
      <div style={{
        background: "rgba(20,24,33,0.65)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 24,
        padding: isMobile ? 24 : 40,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(16,185,129,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", color: COLORS.green,
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, color: "#fff", margin: "0 0 8px" }}>
              Blog Submitted Successfully!
            </h3>
            <p style={{ color: COLORS.muted, fontSize: 14, margin: "0 0 20px" }}>
              Your tech blog has been submitted for review in our contest. Good luck!
            </p>
            <span style={{ color: COLORS.green, fontSize: 13, fontWeight: 700 }}>
              Returning to Blog...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
              Submit a Tech Blog
            </h2>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 28 }}>
              Participate in our active contest by sharing your tech tips. Exclusive offers if you win!
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                Blog Title
              </label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Why Refurbished Laptops are Perfect for Coding"
                style={{
                  width: "100%", background: "rgba(13,17,23,0.5)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "12px 14px", color: COLORS.text,
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{
                  width: "100%", background: "rgba(13,17,23,0.5)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "12px 14px", color: COLORS.text,
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              >
                {["Buying Guide", "Comparison", "Opinion", "Tips", "Gaming"].map(opt => (
                  <option key={opt} value={opt} style={{ background: COLORS.cardBg, color: COLORS.text }}>{opt}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>
                Blog Content
              </label>
              <textarea
                required
                rows={8}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your informative article here..."
                style={{
                  width: "100%", background: "rgba(13,17,23,0.5)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "12px 14px", color: COLORS.text,
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                  resize: "vertical", fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setPage("blog")}
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
                  color: COLORS.muted, borderRadius: 10, padding: "10px 20px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: COLORS.green, border: "none",
                  color: COLORS.black, borderRadius: 10, padding: "10px 24px",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                }}
              >
                Submit Blog
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function AccessoriesPage({
  accessories,
  setPage,
  onAddToCart,
  onWishlist,
  wishlist,
}: {
  accessories: any[];
  setPage: (p: string) => void;
  onAddToCart: (p: any) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}) {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<string>("All");
  const categoriesList = ["All", "Monitors", "Docking Stations", "Mice & Keyboards", "Chargers & Power", "Bags & Sleeves"];

  const filteredItems = filter === "All"
    ? accessories
    : accessories.filter(item => item.category === filter);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 14px" : "48px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <span style={{
          display: "inline-block",
          color: COLORS.green, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: 10,
          background: "rgba(56,189,248,0.08)",
          padding: "4px 14px", borderRadius: 100,
          border: "1px solid rgba(56,189,248,0.15)",
        }}>
          Enhance Your Setup
        </span>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 800, color: COLORS.text, margin: "0 0 10px" }}>
          Premium Accessories
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Certified refurbished monitors, docking stations, keyboards, and chargers to complete your workspace.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16,
        marginBottom: 32, scrollbarWidth: "none", borderBottom: `1px solid ${COLORS.cardBorder}`,
      }}>
        {categoriesList.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              background: filter === cat ? "linear-gradient(135deg, #3B82F6, #38BDF8)" : COLORS.cardBg,
              color: filter === cat ? "#000" : COLORS.muted,
              border: `1px solid ${filter === cat ? "transparent" : COLORS.cardBorder}`,
              borderRadius: 100, padding: "8px 18px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: 24,
      }}>
        {filteredItems.map(item => {
          const isWished = wishlist.includes(item.id);
          const saving = item.mrp - item.price;
          return (
            <div
              key={item.id}
              style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 20, overflow: "hidden",
                display: "flex", flexDirection: "column",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "rgba(56,189,248,0.28)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.borderColor = COLORS.cardBorder;
              }}
            >
              {/* Image Box */}
              <div style={{ height: 180, overflow: "hidden", background: "#0d1117", position: "relative" }}>
                <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                
                {/* Save Badge */}
                <span style={{
                  position: "absolute", top: 12, left: 12,
                  background: "rgba(16,185,129,0.92)", color: "#fff",
                  fontSize: 10, fontWeight: 800, padding: "4px 8px", borderRadius: 6,
                }}>
                  SAVE ₹{saving.toLocaleString("en-IN")}
                </span>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onWishlist(item.id); }}
                  style={{
                    position: "absolute", top: 12, right: 12,
                    background: "rgba(13,17,23,0.65)", backdropFilter: "blur(8px)",
                    border: "none", borderRadius: "50%", width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <Heart size={15} fill={isWished ? "#EF4444" : "transparent"} color={isWished ? "#EF4444" : "#fff"} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ color: COLORS.green, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  {item.brand} • {item.category}
                </span>
                
                <h3 style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700,
                  color: COLORS.text, margin: "0 0 6px", lineHeight: 1.4,
                  height: 42, overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {item.name}
                </h3>

                <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 16px", height: 18, overflow: "hidden" }}>
                  {item.specs}
                </p>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} fill={s <= Math.floor(item.rating) ? "#FBBF24" : "transparent"} color={s <= Math.floor(item.rating) ? "#FBBF24" : "rgba(255,255,255,0.15)"} />
                    ))}
                  </div>
                  <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 12 }}>{item.rating}</span>
                </div>

                {/* Price & Add to Cart */}
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>
                      ₹{item.price.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted, textDecoration: "line-through" }}>
                      ₹{item.mrp.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart({ ...item, specs: item.specs, warranty: "6 Months" })}
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #38BDF8)",
                      color: "#000", border: "none", borderRadius: 10,
                      padding: "8px 16px", fontSize: 12, fontWeight: 800,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    <ShoppingCart size={12} /> Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

