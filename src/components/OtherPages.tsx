"use client";

import { useState } from "react";
import { COLORS, products } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

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
                  <div style={{ width: 120, height: 120, margin: "0 auto 12px", background: "#0f1520", borderRadius: 12, overflow: "hidden" }}>
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
                    <td key={p.id} style={{ padding: isMobile ? "10px 12px" : "14px 20px", textAlign: "center", color: best ? COLORS.green : COLORS.text, fontWeight: best ? 800 : 500, fontSize: 14, border: `1px solid ${COLORS.cardBorder}`, background: best ? "rgba(34,197,94,0.06)" : "transparent" }}>
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
        <p style={{ color: COLORS.muted, fontSize: isMobile ? 15 : 18, maxWidth: 600, margin: "0 auto" }}>NewJaisa was founded on one belief: everyone deserves premium tech at fair prices, without compromising on quality.</p>
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

export function BlogPage() {
  const isMobile = useIsMobile();
  const posts = [
    { title: "Top 5 Refurbished Laptops Under ₹20,000 in 2024", cat: "Buying Guide", date: "Dec 10, 2024", read: "5 min read", icon: "📝" },
    { title: "Dell vs HP: Which Refurbished Brand is Better?", cat: "Comparison", date: "Dec 5, 2024", read: "8 min read", icon: "⚖️" },
    { title: "Why Refurbished Laptops Are Better Than New for Students", cat: "Opinion", date: "Nov 28, 2024", read: "4 min read", icon: "🎓" },
    { title: "Gaming on a Budget: Best Refurbished Gaming Laptops", cat: "Gaming", date: "Nov 20, 2024", read: "7 min read", icon: "🎮" },
    { title: "MacBook vs Windows: Which Refurbished is Worth It?", cat: "Comparison", date: "Nov 15, 2024", read: "6 min read", icon: "🍎" },
    { title: "How to Check Battery Health on Your Refurbished Laptop", cat: "Tips", date: "Nov 8, 2024", read: "3 min read", icon: "🔋" },
  ];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "28px 14px" : "48px 20px" }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 30, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>Tech Blog &amp; Buying Guides</h2>
      <p style={{ color: COLORS.muted, fontSize: 15, marginBottom: 32 }}>Expert advice to help you make the best decision</p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {posts.map(post => (
          <div key={post.title} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.green; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.cardBorder; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
          >
            <div style={{ background: "linear-gradient(135deg, #1a2035, #0f1520)", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>{post.icon}</div>
            <div style={{ padding: 20 }}>
              <span style={{ background: COLORS.greenDark, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase" }}>{post.cat}</span>
              <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.5, margin: "10px 0 12px" }}>{post.title}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.muted, fontSize: 12 }}>
                <span>{post.date}</span>
                <span>📖 {post.read}</span>
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
              <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
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
                    style={{ width: "100%", background: "#1C2133", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6, display: "block" }}>Message</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
                  style={{ width: "100%", background: "#1C2133", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button onClick={() => setSent(true)} style={{ width: "100%", background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Send Message →</button>
            </>
          )}
        </div>
        <div>
          {[["📞", "Phone", "+91 99999 99999", "Call us 10AM - 7PM"], ["📧", "Email", "support@newjaisa.com", "Reply within 24 hours"], ["💬", "WhatsApp", "+91 99999 99999", "Quick replies on chat"], ["📍", "Address", "Chennai, Tamil Nadu", "Visit our showroom"]].map(([icon, label, val, sub]) => (
            <div key={label} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 14, padding: "16px 20px", marginBottom: 12, display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
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

export function LoginPage({ setPage }: { setPage: (p: string) => void }) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  return (
    <div style={{ maxWidth: 440, margin: isMobile ? "28px auto" : "60px auto", padding: isMobile ? "0 14px" : "0 20px" }}>
      <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, padding: isMobile ? 24 : 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: isMobile ? 24 : 28 }}>
            <span style={{ color: COLORS.text }}>LAPTOP</span><span style={{ color: COLORS.green }}>KART</span>
          </div>
          <div style={{ color: COLORS.muted, marginTop: 8 }}>{mode === "login" ? "Welcome back!" : "Create your account"}</div>
        </div>
        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#1C2133", borderRadius: 12, padding: 4 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, background: mode === m ? COLORS.green : "transparent", color: mode === m ? COLORS.black : COLORS.muted, border: "none", borderRadius: 10, padding: "10px 0", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.2s" }}>
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>
        {mode === "signup" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6, display: "block" }}>Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", background: "#1C2133", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        {[["Email", "email", "email"], ["Password", "password", "password"]].map(([label, key, type]) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <label style={{ color: COLORS.muted, fontSize: 13, marginBottom: 6, display: "block" }}>{label}</label>
            <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", background: "#1C2133", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <button onClick={() => setPage("home")} style={{ width: "100%", background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Sora', sans-serif", marginBottom: 16 }}>
          {mode === "login" ? "Login →" : "Create Account →"}
        </button>
        <div style={{ textAlign: "center", color: COLORS.muted, fontSize: 14 }}>
          or continue with{" "}
          <button style={{ background: "transparent", border: "none", color: COLORS.green, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Google</button>
        </div>
      </div>
    </div>
  );
}
