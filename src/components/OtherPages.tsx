"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, query, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLORS, products, accessoriesList } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import Card from "./common/Card";
import Button from "./common/Button";
import Dropdown from "./common/Dropdown";
import {
  BookOpen, Scale, GraduationCap, Gamepad2, Battery,
  Phone, Mail, MessageSquare, MapPin, CheckCircle2,
  Lock, User, Laptop, ShieldCheck, Leaf, Coins, ChevronRight, Star, ShoppingCart, Heart, Keyboard,
  Eye, EyeOff, BadgeCheck, Shield
} from "lucide-react";
import { FaApple, FaGoogle } from "react-icons/fa6";

export function ComparePage({ productsList = [] }: { productsList?: any[] }) {
  const isMobile = useIsMobile();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Automatically sync/initialize selectedIds when productsList is loaded or changed
  useEffect(() => {
    if (productsList.length > 0) {
      const firstId = String(productsList[0]?.id || "");
      const secondId = String(productsList[1]?.id || productsList[0]?.id || "");
      setSelectedIds([firstId, secondId].filter(Boolean));
    }
  }, [productsList]);

  const selected = selectedIds
    .map(id => productsList.find(pr => String(pr.id) === id))
    .filter(Boolean);

  const specs = ["price", "mrp", "discount", "rating", "processor", "ram", "storage", "warranty", "grade"];
  const labels: Record<string, string> = { price: "Price", mrp: "MRP", discount: "Discount %", rating: "Rating", processor: "Processor", ram: "RAM", storage: "Storage", warranty: "Warranty", grade: "Grade" };

  if (productsList.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "40px 14px" : "80px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Scale size={48} color={COLORS.muted} />
        </div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontWeight: 700, fontSize: 20 }}>No Products to Compare</h2>
        <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 8, maxWidth: 450, margin: "8px auto 0", lineHeight: 1.5 }}>
          Your storefront catalog is currently empty. Please add items in the admin panel to enable product comparison.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "20px 12px" : "32px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Compare Products</h1>
        <p style={{ color: COLORS.muted, fontSize: 13 }}>Compare product specifications and features side-by-side.</p>
      </div>

      {!isMobile ? (
        /* ── Desktop Comparison Table ── */
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ padding: "16px 20px", background: COLORS.cardBg, color: COLORS.muted, textAlign: "left", fontSize: 14, border: `1px solid ${COLORS.cardBorder}` }}>Feature</th>
                {selected.map((p, index) => (
                  <th key={index} style={{ padding: "20px", background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, minWidth: 200, verticalAlign: "top" }}>
                    <div style={{ width: 120, height: 120, margin: "0 auto 12px", background: COLORS.background, borderRadius: 12, overflow: "hidden" }}>
                      <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif", minHeight: 40 }}>{p.name}</div>

                    <Dropdown
                      options={productsList.map(pr => ({ value: String(pr.id), label: pr.name }))}
                      value={String(p.id)}
                      onChange={val => {
                        setSelectedIds(s => s.map((id, idx) => idx === index ? val : id));
                      }}
                      style={{ marginTop: 8, width: "100%" }}
                    />

                    {/* No Live comparison widget */}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec, i) => (
                <tr key={spec} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "14px 20px", color: COLORS.muted, fontSize: 14, fontWeight: 600, border: `1px solid ${COLORS.cardBorder}` }}>{labels[spec]}</td>
                  {selected.map((p, index) => {
                    const rawVal = p[spec as keyof typeof p] as string | number;
                    const val = spec === "price" || spec === "mrp" ? `₹${(rawVal as number).toLocaleString('en-IN')}` : spec === "discount" ? `${rawVal}%` : spec === "rating" ? `★ ${rawVal}` : rawVal;
                    const best = spec === "price" ? Math.min(...selected.map(s => s.price)) === p.price : spec === "rating" ? Math.max(...selected.map(s => s.rating)) === p.rating : spec === "discount" ? Math.max(...selected.map(s => s.discount)) === p.discount : false;
                    return (
                      <td key={index} style={{ padding: "14px 20px", textAlign: "center", color: best ? COLORS.green : COLORS.text, fontWeight: best ? 800 : 500, fontSize: 14, border: `1px solid ${COLORS.cardBorder}`, background: best ? "rgba(59,130,246,0.12)" : "transparent" }}>
                        {val}{best && <span style={{ display: "block", fontSize: 10, color: COLORS.green }}>Best Value</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Mobile & Tablet Stacked Card Comparison ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Pickers Header Row */}
          <div style={{ display: "flex", gap: 12 }}>
            {selected.map((p, index) => (
              <div key={index} style={{
                flex: 1,
                width: "50%",
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 16,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                boxSizing: "border-box"
              }}>
                <div style={{ width: 80, height: 80, background: COLORS.background, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{
                  color: COLORS.text,
                  fontWeight: 700,
                  fontSize: 12,
                  fontFamily: "'Sora', sans-serif",
                  lineHeight: 1.3,
                  minHeight: 32,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  marginBottom: 8,
                  width: "100%"
                }}>{p.name}</div>
                <Dropdown
                  options={productsList.map(pr => ({ value: String(pr.id), label: pr.name }))}
                  value={String(p.id)}
                  onChange={val => {
                    setSelectedIds(s => s.map((id, idx) => idx === index ? val : id));
                  }}
                  style={{ width: "100%", fontSize: 11 }}
                />
              </div>
            ))}
          </div>

          {/* Specs List Cards */}
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: 18,
            overflow: "hidden"
          }}>
            {specs.map((spec, i) => (
              <div key={spec} style={{
                padding: "16px 14px",
                borderBottom: i < specs.length - 1 ? `1px solid ${COLORS.cardBorder}` : "none",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"
              }}>
                {/* Spec Label */}
                <div style={{
                  color: COLORS.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                  textAlign: "center"
                }}>{labels[spec]}</div>

                {/* Values columns */}
                <div style={{ display: "flex", gap: 12, textAlign: "center" }}>
                  {selected.map((p, index) => {
                    const rawVal = p[spec as keyof typeof p] as string | number;
                    const val = spec === "price" || spec === "mrp" ? `₹${(rawVal as number).toLocaleString('en-IN')}` : spec === "discount" ? `${rawVal}%` : spec === "rating" ? `★ ${rawVal}` : rawVal;
                    const best = spec === "price" ? Math.min(...selected.map(s => s.price)) === p.price : spec === "rating" ? Math.max(...selected.map(s => s.rating)) === p.rating : spec === "discount" ? Math.max(...selected.map(s => s.discount)) === p.discount : false;

                    return (
                      <div key={index} style={{
                        flex: 1,
                        width: "50%",
                        padding: "8px 4px",
                        borderRadius: 8,
                        background: best ? "rgba(16,185,129,0.08)" : "transparent",
                        border: best ? "1px solid rgba(16,185,129,0.15)" : "1px solid transparent",
                        color: best ? COLORS.green : COLORS.text,
                        fontWeight: best ? 700 : 500,
                        fontSize: 13,
                        boxSizing: "border-box"
                      }}>
                        <div>{val}</div>
                        {best && <span style={{ fontSize: 9, color: COLORS.green, fontWeight: 700, display: "block", marginTop: 2 }}>Best Option</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Live comparison rows (Mobile) */}
        </div>
      )}
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
          <p style={{ color: COLORS.muted, fontSize: 16, lineHeight: 1.8 }}>Today, we&apos;ve sold over 50,000 devices across India, with every single device undergoing our rigorous multi-point quality check.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["5K+", "Devices Sold"], ["4.9★", "Avg Rating"], ["1 Year", "Warranty"], ["99.2%", "Satisfaction"]].map(([v, l]) => (
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
  const [dynamicPosts, setDynamicPosts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "blogs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setDynamicPosts(list);
    });
    return () => unsubscribe();
  }, []);

  const posts = dynamicPosts.filter(post => post.approved !== false);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "28px 14px" : "48px 20px" }}>
      {/* Header explaining the blog section */}
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 30, fontWeight: 800, color: COLORS.text, marginBottom: 12 }}>
        Tech Blog &amp; Buying Guides
      </h2>
      <p style={{ color: COLORS.muted, fontSize: 15, marginBottom: 24 }}>
        Browse our latest articles, tips, and in‑depth guides. Click any card to read the full story.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div></div>
        <button
          onClick={() => setPage("write-blog")}
          style={{
            background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Sora', sans-serif",
            transition: "all 0.2s",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.22)",
          }}
        >
          Write a New Blog
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {posts.map((post, idx) => (
          <div key={post.id || idx} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}
            onClick={() => setPage(`blog-${post.id || idx}`)}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#3B82F6"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.cardBorder; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
          >
            <div style={{
              backgroundImage: `url(${post.coverUrl || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: 160,
              width: "100%",
            }} />
            <div style={{ padding: 20 }}>
              <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.25)", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase" }}>{post.cat || post.category}</span>
              <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.5, margin: "10px 0 12px" }}>{post.title}</h3>
              <div style={{ color: COLORS.muted, fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today')}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={11} /> {post.read || post.readTime}</span>
                </div>
                <div style={{ color: COLORS.green, fontWeight: 600 }}>By {post.author || "Contest Writer"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogDetail({ postId, setPage }: { postId: string; setPage: (p: string) => void }) {
  const isMobile = useIsMobile();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "blogs"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docData = snapshot.docs.find((d) => d.id === postId);
      if (docData) {
        setPost({ id: docData.id, ...docData.data() });
      }
    });
    return () => unsub();
  }, [postId]);

  if (!post) {
    return (
      <div style={{ width: "100vw", minHeight: "100vh", padding: isMobile ? "24px 14px" : "40px 20px", background: "#0f1117", color: "#fff" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", padding: isMobile ? "24px 14px" : "40px 20px", background: "#0f1117", color: "#fff" }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <button onClick={() => setPage("blog")} style={{ color: COLORS.muted, background: "transparent", border: "none", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            ← Back to Blogs
          </button>
        </div>
        <div style={{ height: 300, backgroundImage: `url(${post.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 12, marginBottom: 24 }} />
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 800, color: "#fff", marginBottom: 12 }}>{post.title}</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.25)", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, textTransform: "uppercase" }}>
            {post.category || post.cat}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 13 }}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
          </span>
          <span style={{ color: COLORS.green, fontWeight: 700, fontSize: 13 }}>
            By {post.author || "Contest Writer"}
          </span>
        </div>
        <div style={{ lineHeight: 1.8, color: "#E8EDF5" }} dangerouslySetInnerHTML={{
          __html: post.content
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")           // Bold
            .replace(/### (.*)/g, "<h3>$1</h3>")                       // H3
            .replace(/## (.*)/g, "<h2>$1</h2>")                        // H2
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>') // Links
            .replace(/^> (.*)/gm, "<blockquote>$1</blockquote>")       // Quote
            .replace(/\n/g, "<br/>")
        }} />
      </div>
    </div>
  );
}

export function ContactPage() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: isMobile ? "28px 14px" : "48px 20px", boxSizing: "border-box" }}>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 30, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>Contact Us</h2>
      <p style={{ color: COLORS.muted, fontSize: 15, marginBottom: 32 }}>We&apos;re here to help. Reach out anytime!</p>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 40 }}>
        <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 20, padding: isMobile ? 20 : 32, boxSizing: "border-box" }}>
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
              <button 
                onClick={() => {
                  if (!form.name || !form.message) return alert("Please fill in your name and message.");
                  const text = `*New Inquiry from Laptopkart*%0A%0A*Name:* ${encodeURIComponent(form.name)}%0A*Email:* ${encodeURIComponent(form.email)}%0A*Phone:* ${encodeURIComponent(form.phone)}%0A*Message:* ${encodeURIComponent(form.message)}`;
                  window.open(`https://wa.me/919750331313?text=${text}`, "_blank");
                  setSent(true);
                }} 
                style={{ width: "100%", background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              >
                Send Message →
              </button>
            </>
          )}
        </div>
        <div>
          {[
            { icon: <Phone size={18} color={COLORS.green} />, label: "Phone", val: "+91 97503 31313", sub: "Call us 10AM - 7PM" },
            { icon: <Mail size={18} color={COLORS.green} />, label: "Email", val: "srivasavibusiness09@gmail.com", sub: "Reply within 24 hours" },
            { icon: <MessageSquare size={18} color={COLORS.green} />, label: "WhatsApp", val: "+91 97503 31313", sub: "Quick replies on chat" },
            { icon: <MapPin size={18} color={COLORS.green} />, label: "Address", val: "Salem, Tamil Nadu", sub: "Visit our showroom" }
          ].map(({ icon, label, val, sub }) => (
            <div key={label} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 14, padding: "16px 20px", marginBottom: 12, display: "flex", gap: 16, alignItems: "center", boxSizing: "border-box" }}>
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

export function LoginPage({ setPage, onLogin, triggerAlert }: { setPage: (p: string) => void; onLogin: (user: any) => void; triggerAlert?: (type: "success" | "warning" | "error", message: string) => void }) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!form.email) {
      const errorText = "Please enter your email address.";
      setErrorMsg(errorText);
      if (triggerAlert) triggerAlert("error", errorText);
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
        const errorText = error.message.replace("Firebase: ", "");
        setErrorMsg(errorText);
        if (triggerAlert) triggerAlert("error", errorText);
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
      const errorText = error.message.replace("Firebase: ", "");
      setErrorMsg(errorText);
      if (triggerAlert) triggerAlert("error", errorText);
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

  const handleForgotPassword = async () => {
    setErrorMsg("");
    if (!form.email) {
      const errorText = "Please enter your email address first to request a password reset.";
      setErrorMsg(errorText);
      if (triggerAlert) triggerAlert("error", errorText);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, form.email);
      if (triggerAlert) {
        triggerAlert("success", `Password reset email sent to ${form.email}. Check your inbox!`);
      }
    } catch (error: any) {
      console.warn("Forgot Password Error:", error);
      const errorText = error.message.replace("Firebase: ", "");
      setErrorMsg(errorText);
      if (triggerAlert) {
        triggerAlert("error", errorText);
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
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{ background: "transparent", border: "none", color: "#38BDF8", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                >
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ flex: 1, background: "transparent", border: "none", color: COLORS.text, fontSize: 14, outline: "none" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: COLORS.muted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4,
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = COLORS.text}
                onMouseLeave={e => e.currentTarget.style.color = COLORS.muted}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
            title: "Multi-Point Diagnostics",
            desc: "Every laptop undergoes testing, component restoration, and comes backed by a 1-Year Warranty.",
          },
          {
            icon: <Leaf size={24} color="#10B981" />,
            title: "Eco-Friendly Impact",
            desc: "Prevent hazardous electronic waste. Buying refurbished reduces the carbon footprint of manufacturing by 80%.",
          }
        ].map((item, idx) => (
          <Card
            key={idx}
            style={{ padding: 24 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              {item.icon}
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
              {item.title}
            </h3>
            <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {item.desc}
            </p>
          </Card>
        ))}
      </div>

      {/* Refurbished vs. Used vs. New Comparison Section */}
      <Card
        hoverable={false}
        style={{ padding: isMobile ? 20 : 36, marginBottom: 56, border: "1px solid rgba(0, 229, 255, 0.12)" }}
      >
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 20, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>
          Refurbished vs. Used vs. New Laptops
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                <th style={{ textAlign: "left", padding: "12px 8px", color: COLORS.muted, fontWeight: 600 }}>Feature</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "#00E5FF", fontWeight: 800 }}>Laptopkart Refurbished</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: COLORS.muted, fontWeight: 600 }}>Typical Used Laptop</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: COLORS.muted, fontWeight: 600 }}>Brand New Laptop</th>
              </tr>
            </thead>
            <tbody>
              {[
                { f: "Quality Grade", ref: "Grade A+ (Premium quality)", used: "Varies, unknown wear & tear", new: "Perfect condition" },
                { f: "Testing & Cleaning", ref: "Multi-point diagnostics & sanitization", used: "None (sold as-is)", new: "Factory fresh" },
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
      </Card>

      {/* Multi-Point Process Checklist */}
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

  const COVER_TEMPLATES = [
    { name: "Cyberpunk Tech", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80" },
    { name: "Minimalist Workspace", url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80" },
    { name: "Modern Code Editor", url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80" },
    { name: "Hardware Circuit", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80" },
    { name: "MacBook Desk", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" },
  ];

  const [selectedCover, setSelectedCover] = useState(COVER_TEMPLATES[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const activeCoverUrl = showCustomInput ? (customCoverUrl || COVER_TEMPLATES[0].url) : selectedCover;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content.trim()) return;
    setSubmitted(true);

    try {
      const docId = doc(collection(db, "blogs")).id;
      const authorName = auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Contest Writer";

      await setDoc(doc(db, "blogs", docId), {
        title: form.title,
        category: form.category,
        content: form.content,
        coverUrl: activeCoverUrl,
        createdAt: new Date().toISOString(),
        readTime: `${Math.max(1, Math.ceil(form.content.split(/\s+/).length / 200))} min read`,
        author: authorName,
        authorEmail: auth.currentUser?.email || "N/A",
      });
    } catch (err) {
      console.error("Firestore blog write error: ", err);
    }

    setTimeout(() => setPage("blog"), 1800);
  };

  const insertFormat = (before: string, after: string = "") => {
    const textarea = document.getElementById("blog-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    setForm(f => ({
      ...f,
      content: text.substring(0, start) + replacement + text.substring(end)
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 30);
  };

  return (
    <div style={{ width: "100%", minHeight: "100%", padding: isMobile ? "20px 14px" : "40px 20px", background: "#0a0c14", color: "#fff" }}>
      {submitted ? (
        // Success Screen (unchanged but nicer)
        <div style={{ textAlign: "center", marginTop: "15vh" }}>
          <div style={{ margin: "0 auto 24px", width: 80, height: 80, background: "rgba(16,185,129,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={48} color="#10B981" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Blog Published!</h2>
          <p style={{ color: COLORS.muted, maxWidth: 420, margin: "0 auto 32px" }}>Your story is now live in the blog section.</p>
        </div>
      ) : (
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <button onClick={() => setPage("blog")} style={{ color: COLORS.muted, background: "transparent", border: "none", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              ← Back to Blogs
            </button>
            <button onClick={handleSubmit} style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
              Publish Blog
            </button>
          </div>

          {/* Step 1: Title */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: "#60A5FA", fontWeight: 700, marginBottom: 8 }}>STEP 1</div>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Write a compelling title..."
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                fontSize: isMobile ? 32 : 42, fontWeight: 800, color: "#fff",
                fontFamily: "'Sora', sans-serif", lineHeight: 1.1
              }}
            />
          </div>

          {/* Step 2: Category */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: "#60A5FA", fontWeight: 700, marginBottom: 10 }}>STEP 2 • CATEGORY</div>
            <Dropdown
              options={["Buying Guide", "Comparison", "Opinion", "Tips", "Gaming", "News"].map(c => ({ value: c, label: c }))}
              value={form.category}
              onChange={val => setForm(f => ({ ...f, category: val }))}
              style={{ width: "100%" }}
            />
          </div>

          {/* Step 3: Cover Image */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 13, color: "#60A5FA", fontWeight: 700, marginBottom: 12 }}>STEP 3 • COVER IMAGE</div>

            <div style={{
              height: isMobile ? 240 : 320,
              borderRadius: 20,
              backgroundImage: `url(${activeCoverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              marginBottom: 20,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.75))", borderRadius: 20 }} />
              <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, color: "#fff" }}>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{form.category}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{form.title || "Your Blog Title"}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(140px, 1fr))" : "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {COVER_TEMPLATES.map((item, i) => {
                const active = !showCustomInput && selectedCover === item.url;
                return (
                  <div key={i} onClick={() => { setSelectedCover(item.url); setShowCustomInput(false); }}
                    style={{
                      borderRadius: 12, overflow: "hidden", cursor: "pointer",
                      border: active ? "3px solid #3B82F6" : "2px solid #334155",
                      transition: "all 0.2s"
                    }}>
                    <img src={item.url} alt={item.name} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  </div>
                );
              })}
            </div>

            <button onClick={() => setShowCustomInput(!showCustomInput)} style={{ marginTop: 16, color: "#60A5FA", background: "none", border: "none", fontWeight: 600 }}>
              + Use Custom Image URL
            </button>

            {showCustomInput && (
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={customCoverUrl}
                onChange={e => setCustomCoverUrl(e.target.value)}
                style={{ marginTop: 12, width: "100%", padding: "14px", background: "#1f2937", border: "1px solid #60A5FA", borderRadius: 12, color: "#fff" }}
              />
            )}
          </div>

          {/* Step 4: Content */}
          <div>
            <div style={{ fontSize: 13, color: "#60A5FA", fontWeight: 700, marginBottom: 12 }}>STEP 4 • WRITE CONTENT</div>

            <div style={{ background: "#1f2937", borderRadius: 16, padding: 12, marginBottom: 16 }}>
              {[
                { label: "Bold", before: "**", after: "**" },
                { label: "H2", before: "## ", after: "" },
                { label: "H3", before: "### ", after: "" },
                { label: "Link", before: "[", after: "](url)" },
                { label: "Quote", before: "> ", after: "" },
              ].map((b, i) => (
                <button key={i} onClick={() => insertFormat(b.before, b.after)}
                  style={{ margin: "4px", padding: "8px 16px", background: "#374151", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600 }}>
                  {b.label}
                </button>
              ))}
            </div>

            <textarea
              id="blog-textarea"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Start writing your story here..."
              style={{
                width: "100%", minHeight: 480, background: "#111827", border: "1px solid #374151",
                borderRadius: 16, padding: 24, fontSize: 17, lineHeight: 1.8, color: "#e2e8f0",
                resize: "vertical", outline: "none"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AccessoriesPage({
  accessories,
  setPage,
  onAddToCart,
  onWishlist,
  wishlist,
  onViewAccessory,
}: {
  accessories: any[];
  setPage: (p: string) => void;
  onAddToCart: (p: any) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
  onViewAccessory?: (item: any) => void;
}) {
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<string>("All");

  const baseCategories = ["All", "Monitors", "Docking Stations", "Mice & Keyboards", "Chargers & Power", "Bags & Sleeves"];
  const dynamicCategories = accessories
    .map(item => item.category)
    .filter((cat): cat is string => !!cat && !["All", "Monitors", "Docking Stations", "Mice & Keyboards", "Chargers & Power", "Bags & Sleeves"].includes(cat));
  const categoriesList = [...baseCategories, ...new Set(dynamicCategories)];

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
      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px", background: COLORS.cardBg,
          border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24,
          margin: "20px 0",
        }}>
          <div style={{
            display: "inline-flex", justifyContent: "center", alignItems: "center",
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,150,240,0.12)",
            marginBottom: 20,
          }}>
            <Keyboard size={36} color={COLORS.green} />
          </div>
          <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            No Accessories Available
          </h3>
          <p style={{ color: COLORS.muted, fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
            We don't have any accessories listed in this category right now. Check back soon!
          </p>
        </div>
      ) : (
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
                  cursor: onViewAccessory ? "pointer" : "default",
                }}
                onClick={() => onViewAccessory?.(item)}
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
      )}
    </div>
  );
}

export function AccessoryDetailPage({
  accessory,
  setPage,
  onAddToCart,
  onWishlist,
  wishlist,
}: {
  accessory: any | null;
  setPage: (p: string) => void;
  onAddToCart: (p: any) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}) {
  const isMobile = useIsMobile();
  const [added, setAdded] = useState(false);

  if (!accessory) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "32px 14px" : "64px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          Accessory not found
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>Please go back to the accessories catalog and try again.</p>
        <button
          onClick={() => setPage("accessories")}
          style={{ background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 800, cursor: "pointer" }}
        >
          Back to Accessories
        </button>
      </div>
    );
  }

  const isWished = wishlist.includes(accessory.id);
  const savings = accessory.mrp - accessory.price;

  const handleAdd = () => {
    onAddToCart(accessory);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <main style={{ background: COLORS.darkBg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: isMobile ? "16px 18px 44px" : "24px 24px 72px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => setPage("accessories")}
            style={{ background: "transparent", border: `1px solid ${COLORS.cardBorder}`, color: COLORS.muted, borderRadius: 100, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
          >
            ← Accessories
          </button>
          <span style={{ color: COLORS.muted, fontSize: 12 }}>Accessories</span>
          <span style={{ color: COLORS.muted, fontSize: 12 }}>/</span>
          <span style={{ color: COLORS.text, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 420 }}>
            {accessory.name}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 44, alignItems: "start" }}>
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", background: COLORS.background, border: `1px solid ${COLORS.cardBorder}`, aspectRatio: "4/3" }}>
              <img src={accessory.img} alt={accessory.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(56,189,248,0.08)", color: COLORS.green, border: "1px solid rgba(56,189,248,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>
                {accessory.brand}
              </span>
              <span style={{ background: "rgba(16,185,129,0.10)", color: "#10B981", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>
                {accessory.category}
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Accessory Detail
              </span>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>Small, clean, same-store design</span>
            </div>

            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.text, lineHeight: 1.12, margin: "0 0 10px" }}>
              {accessory.name}
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>
              {accessory.specs}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= Math.floor(accessory.rating) ? "#FBBF24" : "transparent"} color={s <= Math.floor(accessory.rating) ? "#FBBF24" : "rgba(255,255,255,0.15)"} />
                ))}
              </div>
              <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{accessory.rating}</span>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>({accessory.reviews} reviews)</span>
            </div>

            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 18, padding: "18px 20px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>
                  ₹{accessory.price.toLocaleString("en-IN")}
                </span>
                <span style={{ color: COLORS.muted, fontSize: 15, textDecoration: "line-through", marginBottom: 4 }}>
                  ₹{accessory.mrp.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>
                  You save ₹{savings.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <BadgeCheck size={16} color={COLORS.green} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>Verified accessory with matching quality checks and clean retail presentation.</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Shield size={16} color={COLORS.green} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>Compatible for work, home, or mobile setups depending on the product category.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
              <button
                onClick={handleAdd}
                style={{
                  background: added ? "#10B981" : "linear-gradient(135deg, #3B82F6, #38BDF8)",
                  color: "#000",
                  border: "none",
                  borderRadius: 14,
                  padding: "12px 18px",
                  fontWeight: 800,
                  cursor: "pointer",
                  minWidth: 160,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {added ? "Added!" : "Add to Cart"}
              </button>
              <button
                onClick={() => onWishlist(accessory.id)}
                style={{
                  background: isWished ? "rgba(239,68,68,0.12)" : COLORS.cardBg,
                  color: isWished ? "#EF4444" : COLORS.text,
                  border: `1px solid ${isWished ? "rgba(239,68,68,0.3)" : COLORS.cardBorder}`,
                  borderRadius: 14,
                  padding: "12px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                  minWidth: 160,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                <Heart size={14} fill={isWished ? "#EF4444" : "transparent"} style={{ display: "inline", marginRight: 8 }} />
                {isWished ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 18, padding: 18 }}>
              <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Key Specs
              </div>
              <div style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.7 }}>{accessory.specs}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Shared policy page styles ───────────────────────────────────────────────

const policyWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0a0d16",
  color: "#E8EDF5",
  fontFamily: "'Inter', sans-serif",
};

const policyInner: React.CSSProperties = {
  maxWidth: 820,
  margin: "0 auto",
  padding: "60px 24px 80px",
};

const policyH1: React.CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 30,
  fontWeight: 800,
  color: "#fff",
  marginBottom: 6,
};

const policySubtitle: React.CSSProperties = {
  color: "#8B9BBE",
  fontSize: 13,
  marginBottom: 40,
};

const policyH2: React.CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 17,
  fontWeight: 700,
  color: "#38BDF8",
  marginTop: 36,
  marginBottom: 10,
  borderBottom: "1px solid rgba(56,189,248,0.12)",
  paddingBottom: 8,
};

const policyP: React.CSSProperties = {
  color: "#B0BCCE",
  fontSize: 14,
  lineHeight: 1.8,
  marginBottom: 12,
};

const policyUl: React.CSSProperties = {
  color: "#B0BCCE",
  fontSize: 14,
  lineHeight: 1.8,
  paddingLeft: 20,
  marginBottom: 12,
};

const policyCard: React.CSSProperties = {
  background: "rgba(56,189,248,0.05)",
  border: "1px solid rgba(56,189,248,0.15)",
  borderRadius: 14,
  padding: "16px 20px",
  marginBottom: 16,
};

const policyBadge: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(56,189,248,0.1)",
  color: "#38BDF8",
  border: "1px solid rgba(56,189,248,0.25)",
  borderRadius: 100,
  padding: "3px 12px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  marginBottom: 20,
};

// ─── Privacy Policy ───────────────────────────────────────────────────────────

export function PrivacyPolicyPage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={policyWrap}>
      <div style={policyInner}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#8B9BBE", cursor: "pointer", fontSize: 13, marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          ← Back to Home
        </button>
        <span style={policyBadge}>Legal</span>
        <h1 style={policyH1}>Privacy Policy</h1>
        <p style={policySubtitle}>Last Updated: July 2026 &nbsp;·&nbsp; Laptopkart, Salem, Tamil Nadu</p>

        <h2 style={policyH2}>Introduction</h2>
        <p style={policyP}>Laptopkart ("we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.</p>
        <p style={policyP}>By using our website or making a purchase, you agree to the terms of this Privacy Policy.</p>

        <h2 style={policyH2}>Information We Collect</h2>
        <p style={policyP}><strong style={{ color: "#E8EDF5" }}>Personal information you provide:</strong></p>
        <ul style={policyUl}>
          <li>Full name, email address, phone number</li>
          <li>Shipping and billing address</li>
          <li>Payment details (processed securely via Razorpay — we do not store card/UPI/banking credentials)</li>
        </ul>
        <p style={policyP}><strong style={{ color: "#E8EDF5" }}>Information collected automatically:</strong></p>
        <ul style={policyUl}>
          <li>IP address and location data</li>
          <li>Browser type and device information</li>
          <li>Pages visited and time spent on site</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
        <p style={policyP}><strong style={{ color: "#E8EDF5" }}>Information from third parties:</strong><br />When you sign in via Google or Apple, we receive your name and email from those providers as per their respective privacy policies.</p>

        <h2 style={policyH2}>How We Use Your Information</h2>
        <ul style={policyUl}>
          <li>Process and fulfill your orders</li>
          <li>Send order confirmation, shipping, and delivery notifications</li>
          <li>Handle returns, refunds, and warranty claims</li>
          <li>Provide customer support</li>
          <li>Send promotional emails and offers (you can opt out anytime)</li>
          <li>Improve our website experience and product offerings</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 style={policyH2}>Payment Processing</h2>
        <div style={policyCard}>
          <p style={{ ...policyP, marginBottom: 0 }}>All payments on Laptopkart are processed securely through <strong style={{ color: "#38BDF8" }}>Razorpay Payment Gateway</strong>. We do not store your credit card, debit card, or UPI credentials on our servers. Razorpay's handling of your payment data is governed by Razorpay's Privacy Policy.</p>
        </div>

        <h2 style={policyH2}>Sharing of Information</h2>
        <p style={policyP}>We do not sell or rent your personal data to third parties. We may share data only with:</p>
        <ul style={policyUl}>
          <li><strong style={{ color: "#E8EDF5" }}>Razorpay</strong> – for payment processing</li>
          <li><strong style={{ color: "#E8EDF5" }}>Shipping Partners</strong> – (BlueDart, DTDC, ST Courier, etc.) for order delivery</li>
          <li><strong style={{ color: "#E8EDF5" }}>Legal Authorities</strong> – when required by law or to protect our rights</li>
        </ul>

        <h2 style={policyH2}>Cookies</h2>
        <p style={policyP}>Our website uses cookies to enhance your browsing experience. You can disable cookies in your browser settings, but some features may not work correctly.</p>

        <h2 style={policyH2}>Data Retention</h2>
        <p style={policyP}>We retain your personal data for as long as your account is active, or as needed to fulfill the purposes described in this policy, or as required by law.</p>

        <h2 style={policyH2}>Your Rights</h2>
        <ul style={policyUl}>
          <li>Access, correct, or delete your personal information</li>
          <li>Withdraw consent for marketing communications</li>
          <li>Request a copy of your data</li>
        </ul>
        <p style={policyP}>To exercise these rights, contact us at <strong style={{ color: "#38BDF8" }}>srivasavibusiness09@gmail.com</strong>.</p>

        <h2 style={policyH2}>Contact</h2>
        <div style={policyCard}>
          <p style={{ ...policyP, marginBottom: 4 }}><strong style={{ color: "#E8EDF5" }}>Laptopkart</strong></p>
          <p style={{ ...policyP, marginBottom: 4 }}>Salem, Tamil Nadu, India</p>
          <p style={{ ...policyP, marginBottom: 4 }}>📧 srivasavibusiness09@gmail.com</p>
          <p style={{ ...policyP, marginBottom: 0 }}>📞 +91 97503 31313</p>
        </div>
      </div>
    </div>
  );
}

// ─── Refund & Return Policy ───────────────────────────────────────────────────

export function RefundPolicyPage({ setPage }: { setPage: (p: string) => void }) {
  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 16,
    fontSize: 13,
  };
  const thStyle: React.CSSProperties = {
    background: "rgba(56,189,248,0.08)",
    color: "#38BDF8",
    padding: "10px 16px",
    textAlign: "left",
    fontWeight: 700,
    border: "1px solid rgba(56,189,248,0.15)",
  };
  const tdStyle: React.CSSProperties = {
    color: "#B0BCCE",
    padding: "10px 16px",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div style={policyWrap}>
      <div style={policyInner}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#8B9BBE", cursor: "pointer", fontSize: 13, marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          ← Back to Home
        </button>
        <span style={policyBadge}>Legal</span>
        <h1 style={policyH1}>Refund & Return Policy</h1>
        <p style={policySubtitle}>Last Updated: July 2026 &nbsp;·&nbsp; Laptopkart, Salem, Tamil Nadu</p>

        <h2 style={policyH2}>Overview</h2>
        <p style={policyP}>At Laptopkart, we stand behind the quality of every refurbished device we sell. All our products are thoroughly tested, graded, and quality-checked before dispatch. Please read this policy carefully before placing an order.</p>

        <h2 style={policyH2}>Eligibility for Returns</h2>
        <p style={policyP}>You may request a return or replacement within <strong style={{ color: "#10B981" }}>7 days of delivery</strong> if:</p>
        <ul style={policyUl}>
          <li>The product received is <strong style={{ color: "#E8EDF5" }}>physically damaged</strong> or has a manufacturing defect</li>
          <li>The product is <strong style={{ color: "#E8EDF5" }}>not as described</strong> (wrong model, specification mismatch)</li>
          <li>The product is <strong style={{ color: "#E8EDF5" }}>Dead on Arrival (DOA)</strong> — does not power on or function at all</li>
        </ul>

        <p style={policyP}><strong style={{ color: "#EF4444" }}>Non-returnable conditions:</strong></p>
        <ul style={policyUl}>
          <li>Products returned after 7 days from delivery date</li>
          <li>Physical damage caused by the customer after delivery (drops, liquid damage)</li>
          <li>Products with broken or tampered warranty stickers or seals</li>
          <li>Accessories (chargers, bags, peripherals) unless sealed and unopened</li>
          <li>Software-related issues (virus, OS reinstall, driver errors) not related to hardware</li>
        </ul>

        <h2 style={policyH2}>How to Initiate a Return</h2>
        {[
          ["Step 1", "Email srivasavibusiness09@gmail.com or WhatsApp +91 97503 31313 within 7 days of delivery"],
          ["Step 2", "Provide your Order ID, a brief description of the issue, and clear photos or a video of the defect"],
          ["Step 3", "Our team will review your request within 24–48 hours"],
          ["Step 4", "If approved, we will arrange a free reverse pickup from your address"],
        ].map(([step, desc]) => (
          <div key={step} style={{ ...policyCard, display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ background: "rgba(56,189,248,0.15)", color: "#38BDF8", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>{step}</span>
            <p style={{ ...policyP, marginBottom: 0 }}>{desc}</p>
          </div>
        ))}

        <h2 style={policyH2}>Refund Timeline</h2>
        <p style={policyP}>Once the returned product is received and inspected:</p>
        <ul style={policyUl}>
          <li><strong style={{ color: "#10B981" }}>Defect confirmed:</strong> Full refund to original payment method within 5–7 business days</li>
          <li><strong style={{ color: "#F59E0B" }}>Product found working:</strong> No refund; product returned to customer</li>
          <li><strong style={{ color: "#8B9BBE" }}>Minor issues:</strong> Partial refund may be issued at our discretion</li>
        </ul>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Payment Method</th>
              <th style={thStyle}>Refund Timeline</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["UPI / Net Banking", "3–5 business days"],
              ["Credit / Debit Card", "5–7 business days"],
              ["Razorpay Payment Link", "5–7 business days"],
            ].map(([method, time]) => (
              <tr key={method}>
                <td style={tdStyle}>{method}</td>
                <td style={tdStyle}>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={policyH2}>Warranty</h2>
        <div style={policyCard}>
          <p style={{ ...policyP, marginBottom: 0 }}>All refurbished products sold on Laptopkart come with a <strong style={{ color: "#10B981" }}>minimum 1-year warranty</strong> (unless stated otherwise in the product listing). Warranty covers hardware defects and component failures under normal usage. It does not cover physical damage caused by the customer.</p>
        </div>

        <h2 style={policyH2}>Cancellations</h2>
        <ul style={policyUl}>
          <li>Orders can be cancelled <strong style={{ color: "#E8EDF5" }}>before dispatch</strong> free of charge</li>
          <li>Once dispatched, orders cannot be cancelled; follow the return process after delivery</li>
          <li>To cancel, contact us immediately at srivasavibusiness09@gmail.com or +91 97503 31313</li>
        </ul>

        <h2 style={policyH2}>Contact for Returns & Refunds</h2>
        <div style={policyCard}>
          <p style={{ ...policyP, marginBottom: 4 }}>📧 srivasavibusiness09@gmail.com</p>
          <p style={{ ...policyP, marginBottom: 0 }}>📞 +91 97503 31313 &nbsp;(10 AM – 7 PM, Mon–Sat)</p>
        </div>
      </div>
    </div>
  );
}

// ─── Terms of Use ─────────────────────────────────────────────────────────────

export function TermsOfUsePage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={policyWrap}>
      <div style={policyInner}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#8B9BBE", cursor: "pointer", fontSize: 13, marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
          ← Back to Home
        </button>
        <span style={policyBadge}>Legal</span>
        <h1 style={policyH1}>Terms of Use</h1>
        <p style={policySubtitle}>Last Updated: July 2026 &nbsp;·&nbsp; Laptopkart, Salem, Tamil Nadu</p>

        <h2 style={policyH2}>Acceptance of Terms</h2>
        <p style={policyP}>By accessing or using the Laptopkart website or purchasing any product, you agree to be bound by these Terms of Use. If you do not agree, please do not use our website.</p>

        <h2 style={policyH2}>About Laptopkart</h2>
        <div style={policyCard}>
          <p style={{ ...policyP, marginBottom: 4 }}><strong style={{ color: "#E8EDF5" }}>Laptopkart</strong> — Refurbished Laptops, Desktops & Accessories</p>
          <p style={{ ...policyP, marginBottom: 4 }}>Salem, Tamil Nadu, India</p>
          <p style={{ ...policyP, marginBottom: 4 }}>📧 srivasavibusiness09@gmail.com</p>
          <p style={{ ...policyP, marginBottom: 0 }}>📞 +91 97503 31313</p>
        </div>

        <h2 style={policyH2}>Use of the Website</h2>
        <p style={policyP}>You agree to use the site only for lawful purposes. You must not:</p>
        <ul style={policyUl}>
          <li>Use the website for any fraudulent or illegal purpose</li>
          <li>Submit false or misleading information during registration or checkout</li>
          <li>Attempt to gain unauthorized access to any portion of the website</li>
          <li>Reproduce, copy, or resell any content from our website without written permission</li>
        </ul>
        <p style={policyP}>We reserve the right to restrict or terminate access to any user who violates these terms.</p>

        <h2 style={policyH2}>Account Registration</h2>
        <p style={policyP}>When you create an account on Laptopkart, you are responsible for:</p>
        <ul style={policyUl}>
          <li>Maintaining the confidentiality of your login credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and up-to-date information</li>
        </ul>
        <p style={policyP}>You must notify us immediately of any unauthorized use of your account.</p>

        <h2 style={policyH2}>Product Listings & Pricing</h2>
        <ul style={policyUl}>
          <li>All products listed are subject to availability</li>
          <li>Prices may change without prior notice</li>
          <li>We reserve the right to cancel orders if a product is mispriced or out of stock</li>
          <li>Refurbished product grades (A, B, C) are defined in each product listing</li>
        </ul>

        <h2 style={policyH2}>Payment Terms</h2>
        <div style={policyCard}>
          <p style={{ ...policyP, marginBottom: 0 }}>All payments are processed through <strong style={{ color: "#38BDF8" }}>Razorpay</strong>, a secure third-party payment gateway. By making a payment, you agree to Razorpay's Terms of Service and Privacy Policy. Laptopkart does not store any sensitive payment information (card numbers, CVV, banking credentials).</p>
        </div>

        <h2 style={policyH2}>Intellectual Property</h2>
        <p style={policyP}>All content on this website — including logos, graphics, text, product images, and design — is the property of Laptopkart and is protected by applicable copyright and trademark laws. Unauthorized use of any content is prohibited.</p>

        <h2 style={policyH2}>Limitation of Liability</h2>
        <p style={policyP}>To the maximum extent permitted by law, Laptopkart shall not be liable for:</p>
        <ul style={policyUl}>
          <li>Indirect or consequential damages arising from your use of the site</li>
          <li>Loss of data, revenue, or profits</li>
          <li>Errors or interruptions in site availability</li>
        </ul>
        <p style={policyP}>Our total liability to you for any claim shall not exceed the amount paid for the specific product in question.</p>

        <h2 style={policyH2}>Governing Law & Disputes</h2>
        <p style={policyP}>These Terms of Use shall be governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts located in <strong style={{ color: "#E8EDF5" }}>Salem, Tamil Nadu</strong>.</p>
        <p style={policyP}>In the event of any dispute, we encourage you to first contact us directly at srivasavibusiness09@gmail.com. We will make every effort to resolve disputes amicably.</p>

        <h2 style={policyH2}>Amendments</h2>
        <p style={policyP}>We reserve the right to update these Terms of Use at any time. Continued use of the website after changes are posted constitutes your acceptance of the revised terms.</p>

        <h2 style={policyH2}>Contact Us</h2>
        <div style={policyCard}>
          <p style={{ ...policyP, marginBottom: 4 }}><strong style={{ color: "#E8EDF5" }}>Laptopkart</strong></p>
          <p style={{ ...policyP, marginBottom: 4 }}>Salem, Tamil Nadu, India</p>
          <p style={{ ...policyP, marginBottom: 4 }}>📧 srivasavibusiness09@gmail.com</p>
          <p style={{ ...policyP, marginBottom: 0 }}>📞 +91 97503 31313 &nbsp;(10 AM – 7 PM, Mon–Sat)</p>
        </div>
      </div>
    </div>
  );
}
