"use client";

import {
  Shield, RefreshCw, Truck, CreditCard, CheckCircle2,
  Microscope, BadgeDollarSign, ArrowRight, Recycle, Star,
  Laptop, X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS, categories, reviews } from "@/data/products";
import type { Product } from "@/data/products";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { useIsMobile } from "@/lib/hooks";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Card from "./common/Card";
import Button from "./common/Button";
import RatingStars from "./common/RatingStars";
import Dropdown from "./common/Dropdown";
import Script from "next/script";

/* ── Trust Strip ──────────────────────────────────────── */
const trustItems = [
  { icon: <Shield size={15} color={COLORS.green} />, text: "1 Year Warranty" },
  { icon: <RefreshCw size={15} color={COLORS.green} />, text: "7 Day Replacement*" },
  { icon: <CheckCircle2 size={15} color={COLORS.green} />, text: "Quality Checked" },
];

function TrustStrip() {
  return (
    <div style={{
      background: "rgba(10, 15, 30, 0.6)",
      borderTop: "1px solid rgba(0, 229, 255, 0.08)",
      borderBottom: "1px solid rgba(0, 229, 255, 0.08)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "18px 24px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", justifyContent: "space-around",
        flexWrap: "wrap", gap: 14,
      }}>
        {trustItems.map((item) => (
          <div key={item.text} style={{
            display: "flex", alignItems: "center", gap: 9,
            color: COLORS.muted, fontSize: 13, fontWeight: 500,
          }}>
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section header ───────────────────────────────────── */
function SectionHeader({ eyebrow, title, subtitle, titleColor }: { eyebrow?: string; title: string; subtitle?: string; titleColor?: string }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ marginBottom: isMobile ? 24 : 48, textAlign: "center" }}>
      {eyebrow && (
        <div style={{
          display: "inline-block",
          color: "#00E5FF", fontSize: 11, fontWeight: 800,
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: 12,
          background: "rgba(0, 229, 255, 0.06)",
          padding: "5px 14px", borderRadius: 100,
          border: "1px solid rgba(0, 229, 255, 0.22)",
          boxShadow: "0 0 15px rgba(0, 229, 255, 0.1)",
        }}>{eyebrow}</div>
      )}
      <h2 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: "clamp(26px, 4vw, 46px)",
        fontWeight: 800, letterSpacing: "-0.03em",
        color: titleColor || "transparent",
        backgroundImage: titleColor ? "none" : "linear-gradient(135deg, #FFFFFF 30%, #A5B4CD 100%)",
        backgroundClip: titleColor ? "unset" : "text",
        WebkitBackgroundClip: titleColor ? "unset" : "text",
        margin: "0 0 12px", lineHeight: 1.1,
      }}>{title}</h2>
      {subtitle && <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Smart finder ─────────────────────────────────────── */
const finderQ = [
  { q: "What's your budget?", opts: ["Under ₹20,000", "₹20K–₹40K", "₹40K–₹70K", "₹70K+"] },
  { q: "Primary usage?", opts: ["Student / Office", "Gaming", "Creative Work", "Business"] },
  { q: "RAM preference?", opts: ["8GB", "16GB", "32GB", "Any"] },
  { q: "Brand preference?", opts: ["Dell", "HP", "Lenovo", "Apple", "Any"] },
];

const whyItems = [
  { icon: <Microscope size={28} color={COLORS.green} />, t: "Quality Tested", d: "Multi-point checks" },
  { icon: <CheckCircle2 size={28} color={COLORS.green} />, t: "100% Original", d: "Genuine parts" },
  { icon: <Shield size={28} color={COLORS.green} />, t: "1 Year Warranty*", d: "Hassle free" },
  { icon: <RefreshCw size={28} color={COLORS.green} />, t: "7-Day Returns*", d: "No questions asked" },
  { icon: <BadgeDollarSign size={28} color={COLORS.green} />, t: "Best Price", d: "Save up to 70%" },
];

/* ── Homepage ─────────────────────────────────────────── */
interface HomepageProps {
  products: Product[];
  banners: any[];
  setPage: (p: string) => void;
  onViewProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
  accessories: any[];
  customerReviews: any[];
  user: any;
  triggerAlert: (type: "success" | "warning" | "error", msg: string) => void;
}

export default function Homepage({ products, banners, setPage, onViewProduct, onAddToCart, onWishlist, wishlist, accessories, customerReviews, user, triggerAlert }: HomepageProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);

  // Exchange Laptop State
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({ brand: '', processor: '', ram: '', condition: '' });
  const [exchangeEstimate, setExchangeEstimate] = useState<number | null>(null);

  const calculateExchangeValue = () => {
    if (!exchangeForm.brand || !exchangeForm.processor || !exchangeForm.ram || !exchangeForm.condition) return null;
    let base = 0;
    if (['Intel Core i7', 'AMD Ryzen 7', 'Apple M-Series'].includes(exchangeForm.processor)) base = 12000;
    else if (['Intel Core i5', 'AMD Ryzen 5'].includes(exchangeForm.processor)) base = 8000;
    else if (['Intel Core i3', 'AMD Ryzen 3', 'Older/Other'].includes(exchangeForm.processor)) base = 4000;

    if (exchangeForm.ram === '16GB+') base += 3000;
    else if (exchangeForm.ram === '8GB') base += 1500;

    if (exchangeForm.condition === 'Dead / Not Working') return 1500; // Flat scrap value

    let multiplier = 1;
    if (exchangeForm.condition === 'Minor Scratches/Dents') multiplier = 0.75;
    else if (exchangeForm.condition === 'Major Damage (Broken screen/hinges)') multiplier = 0.40;

    return Math.round(base * multiplier);
  };

  useEffect(() => {
    setExchangeEstimate(calculateExchangeValue());
  }, [exchangeForm]);

  // Load Featurable widget script after mount to ensure the DOM div is rendered
  useEffect(() => {
    const scriptId = "featurable-widget-script";

    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.featurable.com/widget/v2/embed.js";
    script.defer = true;
    script.charset = "UTF-8";

    document.body.appendChild(script);

    return () => {
      // Optional: remove only if you really want to unload it
      // document.getElementById(scriptId)?.remove();
    };
  }, []);

  const [videoSettings, setVideoSettings] = useState<{ title: string; subtitle: string; videoUrl: string; orientation?: 'landscape' | 'portrait' } | null>(null);

  // Subscribe to Promo Video settings in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "homepage_settings", "video"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setVideoSettings({
            title: data.title || "",
            subtitle: data.subtitle || "",
            videoUrl: data.videoUrl || "",
            orientation: data.orientation || "landscape"
          });
        }
      },
      (err) => {
        console.error("Failed to load promo video settings:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Review states
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerCity, setReviewerCity] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) {
      return triggerAlert("warning", "Please enter your email address.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return triggerAlert("warning", "Please enter a valid email address.");
    }

    setSubscribing(true);
    try {
      const subscriberId = email.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
      await setDoc(doc(db, "subscribers", subscriberId), {
        email: email,
        subscribedAt: new Date().toISOString()
      });
      triggerAlert("success", "Successfully subscribed to our newsletter!");
      setNewsletterEmail("");
    } catch (err) {
      console.error("Newsletter subscription failed:", err);
      triggerAlert("error", "Subscription failed. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return triggerAlert("warning", "Please enter review text.");
    const name = reviewerName.trim() || user?.name || "Anonymous";
    const city = reviewerCity.trim() || "Verified Buyer";

    setReviewSubmitting(true);
    try {
      // Create a clean new doc in reviews collection
      const newReviewRef = doc(collection(db, "reviews"));
      await setDoc(newReviewRef, {
        name,
        city,
        rating: reviewRating,
        text: reviewText.trim(),
        createdAt: new Date().toISOString()
      });
      setReviewSuccess(true);
      setReviewText("");
      setReviewerName("");
      setReviewerCity("");
      setIsWritingReview(false);
      setTimeout(() => setReviewSuccess(false), 3000);
      triggerAlert("success", "Review submitted! Thank you for sharing.");
    } catch (err) {
      console.error("Error submitting review:", err);
      triggerAlert("error", "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getCategoryCount = (catName: string) => {
    if (catName === "Accessories") {
      const len = accessories?.length || 0;
      return `${len} ${len === 1 ? "item" : "items"}`;
    }
    const normalizedCat = catName.toLowerCase();
    const count = products.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      if (normalizedCat.includes("business") && pCat.includes("business")) return true;
      if (normalizedCat.includes("gaming") && pCat.includes("gaming")) return true;
      if (normalizedCat.includes("macbook") && pCat.includes("macbook")) return true;
      if (normalizedCat.includes("ultrabook") && pCat.includes("ultrabook")) return true;
      if (normalizedCat.includes("workstation") && pCat.includes("workstation")) return true;
      return pCat === normalizedCat;
    }).length;
    return `${count} ${count === 1 ? "item" : "items"}`;
  };
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Product[] | null>(null);

  // Offer & Contest states
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [activeTopPickIdx, setActiveTopPickIdx] = useState(0); // Start with the first card active and centered


  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners?.length]);

  const answer = (a: string) => {
    const na = { ...answers, [step]: a };
    setAnswers(na);
    if (step < finderQ.length - 1) setStep(step + 1);
    else setResult(products.slice(0, 3));
  };
  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  const section = (children: React.ReactNode, alt = false) => (
    <section style={{
      background: alt ? COLORS.background : COLORS.darkBg,
      padding: `${isMobile ? 56 : 100}px ${isMobile ? 18 : 24}px`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
    </section>
  );

  return (
    <main>
      <Hero setPage={setPage} />
      <TrustStrip />

      {/* ── Promo Video Section ── */}
      {videoSettings && videoSettings.videoUrl && (
        <div id="promo-video-section">
          {section(
            <>
              {videoSettings.orientation === 'portrait' ? (
                /* Portrait Split Layout: Content Left, Video Right */
                <div style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: isMobile ? 32 : 48
                }}>
                  {/* Left Column: Text Content */}
                  <div style={{ flex: 1.2, textAlign: isMobile ? "center" : "left" }}>
                    <div style={{
                      display: "inline-block",
                      color: "#00E5FF", fontSize: 11, fontWeight: 800,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      marginBottom: 12,
                      background: "rgba(0, 229, 255, 0.06)",
                      padding: "5px 14px", borderRadius: 100,
                      border: "1px solid rgba(0, 229, 255, 0.22)",
                      boxShadow: "0 0 15px rgba(0, 229, 255, 0.1)",
                    }}>Introduction</div>
                    <h2 style={{
                      fontFamily: "'Sora', sans-serif",
                      fontSize: "clamp(26px, 4vw, 42px)",
                      fontWeight: 800, letterSpacing: "-0.03em",
                      color: "#FFFFFF",
                      margin: "0 0 16px", lineHeight: 1.1,
                    }}>
                      {videoSettings.title || "Explore Laptopkart in Action"}
                    </h2>
                    <p style={{
                      color: COLORS.muted,
                      fontSize: 16,
                      lineHeight: 1.6,
                      marginBottom: 24,
                      maxWidth: isMobile ? "100%" : 540
                    }}>
                      {videoSettings.subtitle || "Watch our certified refurbishment process and see why thousands trust us."}
                    </p>

                    {/* Highly polished trust bullets */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      textAlign: "left",
                      maxWidth: 480,
                      margin: isMobile ? "0 auto" : "0",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 16,
                      padding: 20
                    }}>
                      {[
                        "Premium Refurbished Laptops at Best Prices",
                        "1 Year Warranty on All Laptops",
                        "Fast and Secure Shipping Across India",
                        "7 Days Easy Replacement Policy"
                      ].map((bullet, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#A5B4CD" }}>
                          <span style={{ color: "#00E5FF", fontWeight: "bold" }}>✓</span>
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Vertical Player */}
                  <div style={{
                    flex: 1,
                    width: "100%",
                    maxWidth: 320,
                    aspectRatio: "9/16",
                    background: COLORS.cardBg,
                    border: "1px solid rgba(56, 189, 248, 0.18)",
                    borderRadius: 32,
                    overflow: "hidden",
                    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
                    position: "relative",
                    margin: "0 auto"
                  }}>
                    {videoSettings.videoUrl.includes("youtube.com") || videoSettings.videoUrl.includes("youtu.be") || videoSettings.videoUrl.includes("vimeo.com") ? (
                      <iframe
                        src={videoSettings.videoUrl.includes("youtube.com/watch")
                          ? `https://www.youtube.com/embed/${videoSettings.videoUrl.match(/[?&]v=([^&#]+)/)?.[1] || ''}`
                          : videoSettings.videoUrl.includes("youtu.be/")
                            ? `https://www.youtube.com/embed/${videoSettings.videoUrl.split("youtu.be/")[1]?.split("?")[0] || ''}`
                            : videoSettings.videoUrl
                        }
                        style={{ width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoSettings.videoUrl}
                        controls
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* Landscape Centered Layout */
                <>
                  <SectionHeader
                    eyebrow="Introduction"
                    title={videoSettings.title || "Explore Laptopkart in Action"}
                    subtitle={videoSettings.subtitle || "Watch our certified refurbishment process and see why thousands trust us."}
                    titleColor="#FFFFFF"
                  />

                  <div style={{
                    maxWidth: 800,
                    margin: "0 auto",
                    background: COLORS.cardBg,
                    border: "1px solid rgba(56, 189, 248, 0.15)",
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
                    position: "relative",
                    aspectRatio: "16/9"
                  }}>
                    {videoSettings.videoUrl.includes("youtube.com") || videoSettings.videoUrl.includes("youtu.be") || videoSettings.videoUrl.includes("vimeo.com") ? (
                      <iframe
                        src={videoSettings.videoUrl.includes("youtube.com/watch")
                          ? `https://www.youtube.com/embed/${videoSettings.videoUrl.match(/[?&]v=([^&#]+)/)?.[1] || ''}`
                          : videoSettings.videoUrl.includes("youtu.be/")
                            ? `https://www.youtube.com/embed/${videoSettings.videoUrl.split("youtu.be/")[1]?.split("?")[0] || ''}`
                            : videoSettings.videoUrl
                        }
                        style={{ width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoSettings.videoUrl}
                        controls
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    )}
                  </div>
                </>
              )}
            </>,
            true
          )}
        </div>
      )}

      {/* ── Offers & Contests Section ── */}
      {banners && banners.length > 0 && (
        <div id="offers-section">
          {section(
            <>
              <SectionHeader eyebrow="Contests &amp; Rewards" title="Offers &amp; Contests" subtitle="Join our community writing challenge and unlock exclusive savings" />

              <div
                onClick={() => {
                  if (banners && banners[activeSlideIdx]) {
                    setPage(banners[activeSlideIdx].target);
                  }
                }}
                style={{
                  position: "relative",
                  borderRadius: 24,
                  overflow: "hidden",
                  border: `1px solid ${COLORS.cardBorder}`,
                  background: COLORS.background,
                  aspectRatio: isMobile ? "16/9" : "3.1/1",
                  cursor: "pointer",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  transition: "transform 0.25s ease, border-color 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.005)";
                  e.currentTarget.style.borderColor = "rgba(56,189,248,0.22)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = COLORS.cardBorder;
                }}
              >
                <div style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  transform: `translateX(-${activeSlideIdx * 100}%)`,
                  transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                }}>
                  {(banners || []).map((img, i) => (
                    <div key={i} style={{ flexShrink: 0, width: "100%", height: "100%", position: "relative" }}>
                      <img src={img.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(90deg, rgba(13,17,23,0.9) 0%, rgba(13,17,23,0.3) 60%, transparent 100%)",
                        display: "flex", flexDirection: "column", justifyContent: "center",
                        padding: isMobile ? "20px 24px" : "40px 60px",
                        boxSizing: "border-box",
                      }}>
                        <span style={{
                          background: "rgba(56,189,248,0.1)", color: COLORS.green,
                          fontSize: 10, fontWeight: 800, padding: "4px 10px",
                          borderRadius: 100, textTransform: "uppercase", width: "fit-content",
                          marginBottom: 12, letterSpacing: "0.05em",
                        }}>
                          {img.badge}
                        </span>
                        <h3 style={{
                          fontFamily: "'Sora', sans-serif",
                          fontSize: isMobile ? 18 : 32,
                          fontWeight: 800, color: "#fff",
                          margin: "0 0 8px", letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                        }}>
                          {img.title}
                        </h3>
                        <p style={{
                          color: "rgba(255,255,255,0.65)",
                          fontSize: isMobile ? 11 : 15,
                          margin: 0, maxWidth: 520, lineHeight: 1.5,
                        }}>
                          {img.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slider dots */}
                <div style={{
                  position: "absolute", bottom: 20, right: 30,
                  display: "flex", gap: 6, zIndex: 3,
                }}>
                  {(banners || []).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: activeSlideIdx === i ? 18 : 6,
                        height: 6,
                        borderRadius: 100,
                        background: activeSlideIdx === i ? COLORS.green : "rgba(255,255,255,0.4)",
                        transition: "all 0.25s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
            , true)}
        </div>
      )}

      {/* ── Categories ──────────────────────────── */}
      {section(
        <>
          <SectionHeader eyebrow="Browse" title="Shop By Category" subtitle="Curated selection of certified refurbished tech" />
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",
            gap: isMobile ? 12 : 20,
          }}>
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                onClick={() => {
                  if (cat.name === "Accessories") {
                    setPage("accessories");
                  } else if (cat.name === "Business Laptops") {
                    setPage("listing:Business");
                  } else if (cat.name === "Gaming Laptops") {
                    setPage("listing:Gaming");
                  } else {
                    setPage(`listing:${cat.name}`);
                  }
                }}
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: 20,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                  animation: `fadeUp 0.5s ease ${i * 0.07}s both`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "rgba(56,189,248,0.30)";
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(56,189,248,0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = COLORS.cardBorder;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <div style={{ height: isMobile ? 100 : 140, overflow: "hidden" }}>
                  <img src={cat.icon} alt={cat.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                  />
                </div>
                <div style={{ padding: isMobile ? "12px 14px" : "18px 20px" }}>
                  <div style={{
                    color: COLORS.text, fontWeight: 700, fontSize: isMobile ? 13 : 14,
                    fontFamily: "'Sora', sans-serif", marginBottom: 3,
                  }}>{cat.name}</div>
                  <div style={{ color: COLORS.muted, fontSize: 11 }}>
                    {getCategoryCount(cat.name)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>, true
      )}

      {/* ── Smart Finder ────────────────────────── */}
      {section(
        <>
          <div style={{
            background: COLORS.cardBg,
            border: `1px solid rgba(56,189,248,0.15)`,
            borderRadius: 28,
            padding: isMobile ? "28px 18px" : "56px 48px",
            backgroundImage: "radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(56,189,248,0.06) 0%, transparent 50%)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span style={{
                background: "rgba(99,102,241,0.12)", color: "#818CF8",
                fontSize: 10, fontWeight: 700, padding: "4px 12px",
                borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.1em",
              }}>AI-Powered</span>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontSize: "clamp(22px,4vw,38px)",
                fontWeight: 800, color: COLORS.text,
                margin: "14px 0 8px", letterSpacing: "-0.02em",
              }}>Smart Product Finder</h2>
              <p style={{ color: COLORS.muted, fontSize: 15 }}>
                Answer 4 quick questions — we'll find your perfect laptop
              </p>
            </div>

            {result ? (
              <div>
                <p style={{ color: COLORS.green, textAlign: "center", fontWeight: 700, marginBottom: 20, fontSize: 15 }}>
                  ✦ Top picks for you
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                  gap: 16,
                }}>
                  {result.map((p) => (
                    <div key={p.id} style={{
                      background: COLORS.background, borderRadius: 16, overflow: "hidden",
                      border: `1px solid ${COLORS.cardBorder}`,
                    }}>
                      <div style={{ height: 120, overflow: "hidden" }}>
                        <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ color: COLORS.green, fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif" }}>
                          ₹{p.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button onClick={reset} style={{
                    background: "transparent", color: COLORS.muted,
                    border: `1px solid ${COLORS.cardBorder}`,
                    borderRadius: 10, padding: "10px 24px",
                    cursor: "pointer", fontSize: 13,
                  }}>Start Over</button>
                </div>
              </div>
            ) : (
              <div>
                {/* Progress dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
                  {finderQ.map((_, i) => (
                    <div key={i} style={{
                      height: 4, borderRadius: 2,
                      width: i <= step ? 32 : 16,
                      background: i <= step ? COLORS.green : "rgba(255,255,255,0.08)",
                      transition: "all 0.3s ease",
                    }} />
                  ))}
                </div>
                <p style={{
                  color: COLORS.text, textAlign: "center",
                  fontSize: isMobile ? 16 : 20, fontWeight: 700,
                  marginBottom: 24, fontFamily: "'Sora', sans-serif",
                }}>
                  {finderQ[step].q}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {finderQ[step].opts.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => answer(opt)}
                      style={{
                        background: "rgba(56,189,248,0.08)",
                        color: COLORS.green,
                        border: "1px solid rgba(56,189,248,0.22)",
                        borderRadius: 100,
                        padding: isMobile ? "10px 16px" : "13px 26px",
                        fontSize: isMobile ? 13 : 14, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s ease",
                        fontFamily: "'Sora', sans-serif",
                        minHeight: 44,
                      }}
                      onMouseEnter={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.background = "linear-gradient(135deg, #3B82F6, #38BDF8)"; b.style.color = "#000";
                        b.style.border = "1px solid transparent";
                      }}
                      onMouseLeave={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.background = "rgba(56,189,248,0.08)"; b.style.color = COLORS.green;
                        b.style.border = "1px solid rgba(56,189,248,0.22)";
                      }}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Top Picks ───────────────────────────── */}
      {(() => {
        const latestEightLaptops = [...products]
          .sort((a, b) => {
            const idA = Number(a.id);
            const idB = Number(b.id);
            if (!isNaN(idA) && !isNaN(idB)) {
              return idB - idA;
            }
            return String(b.id).localeCompare(String(a.id));
          })
          .slice(0, 8);

        return section(
          <>
            <SectionHeader eyebrow="Featured" title="Top Picks For You" subtitle="Handpicked devices with best value and performance" />

            {!isMobile ? (
              /* Desktop/Laptop Grid Layout */
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
                marginBottom: 40
              }}>
                {latestEightLaptops.map((p, i) => (
                  <div key={p.id} style={{ animation: `fadeUp 0.5s ease ${i * 0.06}s both` }}>
                    <ProductCard product={p} onView={onViewProduct} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
                  </div>
                ))}
              </div>
            ) : (
              /* Mobile & Tablet Stacked Deck Carousel Layout */
              <>
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: 380,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  padding: "20px 0"
                }}>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 800,
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    {latestEightLaptops.map((p, index) => {
                      const len = latestEightLaptops.length;
                      // Compute circular distance offset so stack stays symmetric
                      let offset = index - activeTopPickIdx;
                      if (offset > len / 2) offset -= len;
                      if (offset < -len / 2) offset += len;

                      const isCenter = index === activeTopPickIdx;
                      const absOffset = Math.abs(offset);

                      if (absOffset > 2) return null;

                      return (
                        <motion.div
                          key={p.id}
                          onClick={() => setActiveTopPickIdx(index)}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.6}
                          onDragEnd={(event, info) => {
                            const swipeThreshold = 50;
                            if (info.offset.x < -swipeThreshold) {
                              // Swiped left -> show next card
                              setActiveTopPickIdx((prev) => (prev + 1) % len);
                            } else if (info.offset.x > swipeThreshold) {
                              // Swiped right -> show previous card
                              setActiveTopPickIdx((prev) => (prev - 1 + len) % len);
                            }
                          }}
                          animate={{
                            x: offset * 110,
                            scale: isCenter ? 1.05 : 0.85,
                            rotate: offset * 8,
                            opacity: absOffset > 2 ? 0 : 1,
                            zIndex: 10 - absOffset,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 25,
                          }}
                          style={{
                            position: "absolute",
                            width: 180,
                            height: 320,
                            cursor: "pointer",
                            transformOrigin: "center center",
                          }}
                        >
                          <ProductCard product={p} onView={onViewProduct} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Carousel Dot Selectors (Mobile only) */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  margin: "20px 0 28px"
                }}>
                  {latestEightLaptops.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTopPickIdx(idx)}
                      style={{
                        width: activeTopPickIdx === idx ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        border: "none",
                        background: activeTopPickIdx === idx ? COLORS.green : "rgba(255,255,255,0.2)",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setPage("listing")}
              >
                View All Laptops <ArrowRight size={15} />
              </Button>
            </div>
          </>,
          true
        );
      })()}

      {/* ── Exchange Banner ──────────────────────── */}
      {section(
        <div style={{
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 28,
          padding: isMobile ? "28px 18px" : "56px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: "wrap", gap: 24,
          flexDirection: isMobile ? "column" : "row",
          backgroundImage: "radial-gradient(ellipse at 0% 50%, rgba(56,189,248,0.07) 0%, transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(99,102,241,0.06) 0%, transparent 55%)",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, color: COLORS.muted, fontSize: 13, marginBottom: 10 }}>
              <Recycle size={15} color={COLORS.green} />
              <span>Eco-friendly Exchange Program</span>
            </div>
            <h3 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: isMobile ? 24 : 38, fontWeight: 800,
              color: COLORS.text, margin: "0 0 10px",
              letterSpacing: "-0.025em",
            }}>Exchange Your Old Laptop</h3>
            <p style={{ color: COLORS.muted, fontSize: 15, margin: 0 }}>
              Get up to{" "}
              <span style={{ color: COLORS.green, fontWeight: 800 }}>₹15,000 Off</span>
              {" "}on your next purchase
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ opacity: 0.35 }}>
              <Laptop size={isMobile ? 40 : 64} color={COLORS.muted} />
            </div>
            <ArrowRight size={22} color={COLORS.green} />
            <div style={{ filter: "drop-shadow(0 0 16px rgba(16,185,129,0.3))" }}>
              <Laptop size={isMobile ? 40 : 64} color={COLORS.green} />
            </div>
          </div>
          <Button
            size="lg"
            style={{ width: isMobile ? "100%" : "auto" }}
            onClick={() => setExchangeModalOpen(true)}
          >
            Exchange Now <ArrowRight size={15} />
          </Button>
        </div>
      )}

      {/* ── Why Laptopkart ──────────────────────── */}
      {section(
        <>
          <SectionHeader eyebrow="Why Us" title="The Laptopkart Promise" subtitle="We make refurbished trustworthy and reliable" />
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(5,1fr)",
            gap: isMobile ? 12 : 20,
          }}>
            {whyItems.map((f, i) => (
              <Card
                key={f.t}
                style={{
                  padding: isMobile ? "20px 14px" : "28px 20px",
                  textAlign: "center",
                  animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)`,
                }} />
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{f.icon}</div>
                <div style={{ color: COLORS.text, fontWeight: 700, fontSize: isMobile ? 12 : 13, fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>{f.t}</div>
                <div style={{ color: COLORS.muted, fontSize: isMobile ? 11 : 12 }}>{f.d}</div>
              </Card>
            ))}
          </div>
        </>, true
      )}

      {/* ── Customer Reviews ─────────────────────── */}
      {(() => {
        const combinedReviews = [
          ...customerReviews.map(r => ({
            name: r.name,
            city: r.city || "Verified Buyer",
            rating: r.rating || 5,
            text: r.text,
            avatar: r.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
            isReal: true
          })),
          ...reviews.map(r => ({ ...r, isReal: false }))
        ];
        const directReviews = combinedReviews.filter(r => r.isReal);
        const displayedReviews = showAllReviews ? combinedReviews : combinedReviews.slice(0, 6);

        return section(
          <>
            <SectionHeader eyebrow="Reviews" title="What Customer Says" subtitle="Trusted by students, professionals, and businesses across India" titleColor="#FFFFFF" />

            {/* Write a Review Toggle */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Button
                onClick={() => setIsWritingReview(!isWritingReview)}
                variant={isWritingReview ? "secondary" : "primary"}
              >
                {isWritingReview ? "Cancel Review" : "Write a Review"}
              </Button>
            </div>

            {/* Submit Success Toast */}
            {reviewSuccess && (
              <div style={{
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                color: "#10B981", borderRadius: 12, padding: "12px 24px",
                maxWidth: 400, margin: "0 auto 20px", textAlign: "center",
                fontWeight: 700, fontSize: 13, fontFamily: "Sora"
              }}>
                ✓ Review submitted successfully! Thank you.
              </div>
            )}

            {/* Review Form Block */}
            {isWritingReview && (
              <form
                onSubmit={handleReviewSubmit}
                style={{
                  background: COLORS.cardBg,
                  border: "1px solid rgba(56,189,248,0.18)",
                  borderRadius: 24, padding: isMobile ? 20 : 32,
                  maxWidth: 600, margin: "0 auto 40px",
                  display: "flex", flexDirection: "column", gap: 16,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.3)"
                }}
              >
                <h3 style={{ margin: 0, fontFamily: "Sora", color: "#fff", fontSize: 18, fontWeight: 800 }}>Share Your Experience</h3>

                {/* Rating selection (Stars) */}
                <div>
                  <label style={{ display: "block", color: COLORS.muted, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Your Rating</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={24}
                        onClick={() => setReviewRating(s)}
                        fill={s <= reviewRating ? "#F59E0B" : "transparent"}
                        color={s <= reviewRating ? "#F59E0B" : "rgba(255,255,255,0.2)"}
                        style={{ cursor: "pointer", transition: "transform 0.1s" }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", color: COLORS.muted, fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Your Name</label>
                    <input
                      type="text"
                      placeholder={user?.name || "e.g. John Doe"}
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      style={{
                        width: "100%", background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: COLORS.muted, fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Your City</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi, Mumbai"
                      value={reviewerCity}
                      onChange={(e) => setReviewerCity(e.target.value)}
                      style={{
                        width: "100%", background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: COLORS.muted, fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Review Text</label>
                  <textarea
                    placeholder="Tell us what you liked about your device..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    rows={4}
                    style={{
                      width: "100%", background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none",
                      resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={reviewSubmitting}
                  style={{ height: 48, width: "100%" }}
                >
                  {reviewSubmitting ? "Submitting Review..." : "Submit Review"}
                </Button>
              </form>
            )}

            {/* Featurable Embed Widget */}
            <div style={{ margin: "24px 0", minHeight: 300 }}>
              <div id="featurable-57997301-33a3-4de6-b3e4-2507f21be404" data-featurable-async></div>
            </div>

            {/* Direct Website Customer Reviews */}
            {directReviews.length > 0 && (
              <div style={{ marginTop: 48 }}>
                <h3 style={{
                  fontFamily: "Sora", color: "#fff", fontSize: 20,
                  fontWeight: 800, marginBottom: 24, textAlign: "center"
                }}>
                  Direct Website Customer Reviews
                </h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(280px,1fr))",
                  gap: 20,
                }}>
                  {directReviews.map((r, i) => (
                    <Card
                      key={`${r.name}-${i}`}
                      style={{
                        padding: 24,
                        animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
                      }}
                    >
                      <RatingStars rating={r.rating} size={13} style={{ marginBottom: 12 }} />
                      <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>
                        &ldquo;{r.text}&rdquo;
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))",
                          border: "1px solid rgba(56,189,248,0.22)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: COLORS.green, fontWeight: 800, fontSize: 12,
                          fontFamily: "'Sora', sans-serif",
                        }}>
                          {r.avatar}
                        </div>
                        <div>
                          <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                          <div style={{ color: COLORS.muted, fontSize: 12 }}>{r.city}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>, true
        );
      })()}

      {/* ── Newsletter ───────────────────────────── */}
      {section(
        <Card
          hoverable={false}
          style={{
            padding: isMobile ? "32px 18px" : "60px 48px",
            textAlign: "center",
            backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(56,189,248,0.06) 0%, transparent 60%)",
            border: "1px solid rgba(0, 229, 255, 0.12)",
          }}
        >
          <h3 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 800,
            color: COLORS.text, margin: "0 0 10px", letterSpacing: "-0.02em",
          }}>
            Stay Ahead of the Deals
          </h3>
          <p style={{ color: COLORS.muted, margin: "0 0 32px", fontSize: 15, lineHeight: 1.6 }}>
            Exclusive offers, new arrivals, and tech insights — straight to your inbox
          </p>
          <form
            onSubmit={handleNewsletterSubscribe}
            style={{
              display: "flex", maxWidth: 500, margin: "0 auto",
              gap: 10, flexDirection: isMobile ? "column" : "row",
            }}
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                flex: 1, background: "rgba(10,15,30,0.6)",
                border: "1px solid rgba(0,229,255,0.18)",
                borderRadius: 12, padding: "14px 18px",
                color: COLORS.text, fontSize: 15, outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(0,229,255,0.45)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(0,229,255,0.18)"; }}
            />
            <Button
              type="submit"
              size="lg"
              disabled={subscribing}
              style={{
                width: isMobile ? "100%" : "auto",
                minHeight: 48,
              }}
            >
              {subscribing ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </Card>
      )}

      {/* ── Exchange Modal ──────────────────────── */}
      <AnimatePresence>
        {exchangeModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={() => setExchangeModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} style={{ position: "relative", background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, width: "100%", maxWidth: 500, padding: isMobile ? 24 : 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <button onClick={() => setExchangeModalOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)", border: "none", color: COLORS.muted, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} />
              </button>
              
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ background: "rgba(16,185,129,0.1)", padding: 10, borderRadius: 12 }}>
                  <Recycle size={24} color={COLORS.green} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: COLORS.text, fontSize: 20, fontWeight: 800 }}>Exchange Calculator</h3>
                  <div style={{ color: COLORS.muted, fontSize: 13 }}>Find out what your old laptop is worth</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", color: COLORS.text, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Laptop Brand</label>
                  <Dropdown
                    value={exchangeForm.brand}
                    onChange={(val) => setExchangeForm(prev => ({ ...prev, brand: val }))}
                    placeholder="Select Brand"
                    options={["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "Other"].map(b => ({ label: b, value: b }))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: COLORS.text, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Processor</label>
                  <Dropdown
                    value={exchangeForm.processor}
                    onChange={(val) => setExchangeForm(prev => ({ ...prev, processor: val }))}
                    placeholder="Select Processor"
                    options={["Intel Core i3", "Intel Core i5", "Intel Core i7", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M-Series", "Older/Other"].map(p => ({ label: p, value: p }))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: COLORS.text, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>RAM Size</label>
                  <Dropdown
                    value={exchangeForm.ram}
                    onChange={(val) => setExchangeForm(prev => ({ ...prev, ram: val }))}
                    placeholder="Select RAM"
                    options={["4GB", "8GB", "16GB+"].map(r => ({ label: r, value: r }))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: COLORS.text, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Physical Condition</label>
                  <Dropdown
                    value={exchangeForm.condition}
                    onChange={(val) => setExchangeForm(prev => ({ ...prev, condition: val }))}
                    placeholder="Select Condition"
                    options={["Flawless (Like New)", "Minor Scratches/Dents", "Major Damage (Broken screen/hinges)", "Dead / Not Working"].map(c => ({ label: c, value: c }))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {exchangeEstimate !== null && (
                <div style={{ marginTop: 24, padding: 20, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, textAlign: "center" }}>
                  <div style={{ color: COLORS.green, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Estimated Exchange Value</div>
                  <div style={{ color: COLORS.text, fontSize: 32, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>₹{exchangeEstimate.toLocaleString()} - ₹{(exchangeEstimate + 1500).toLocaleString()}</div>
                  <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>*Final price subject to physical inspection.</div>
                </div>
              )}

              <Button
                style={{ width: "100%", marginTop: 24 }}
                size="lg"
                onClick={() => {
                  if (exchangeEstimate === null) return;
                  const text = `*New Laptop Exchange Request*%0A%0A*Brand:* ${exchangeForm.brand}%0A*Processor:* ${exchangeForm.processor}%0A*RAM:* ${exchangeForm.ram}%0A*Condition:* ${exchangeForm.condition}%0A*Estimated Value:* ₹${exchangeEstimate} - ₹${exchangeEstimate + 1500}%0A%0AHi Laptopkart, I would like to exchange my old laptop.`;
                  window.open(`https://wa.me/919750331313?text=${text}`, "_blank");
                  setExchangeModalOpen(false);
                }}
                disabled={exchangeEstimate === null}
              >
                Claim Offer via WhatsApp <ArrowRight size={16} />
              </Button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
