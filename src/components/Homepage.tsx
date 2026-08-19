"use client";

import {
  Shield, RefreshCw, Truck, CreditCard, CheckCircle2,
  Microscope, BadgeDollarSign, ArrowRight, Recycle, Star,
  Laptop, X, FileText, Package, Undo2, Play, Headset, VolumeX, Volume2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS, categories, reviews } from "@/data/products";
import type { Product } from "@/data/products";
import Hero, { HeroBanner, HeroStats } from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import StudentHubBanner from "@/components/StudentHubBanner";
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
  { icon: <Shield size={18} color="var(--accent)" />, title: "1-Year Warranty", desc: "Protection on refurbished laptops" },
  { icon: <CheckCircle2 size={18} color="var(--accent)" />, title: "Tested before dispatch", desc: "50+ point strict quality check" },
  { icon: <Microscope size={18} color="var(--accent)" />, title: "Key components verified", desc: "Battery, screen & performance assured" },
  { icon: <Truck size={18} color="var(--accent)" />, title: "We deliver across India", desc: "Fast & secure shipping nationwide" },
  { icon: <Headset size={18} color="var(--accent)" />, title: "Need a specific model? We'll help you find it", desc: "Contact us for custom requirements" },
];

function TrustStrip() {
  const duplicatedItems = [...trustItems, ...trustItems];
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Desktop: Static grid
    return (
      <div style={{
        background: "var(--bg-2)",
        padding: "24px 24px",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 20,
        }}>
          {trustItems.map((item) => (
            <div key={item.title} style={{
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0, 98, 255, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                <div style={{ color: "var(--text-2)", fontSize: 11 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile: Auto-sliding marquee with reduced spacing
  return (
    <div style={{
      background: "var(--bg-2)",
      padding: "12px 0", // Reduced padding to minimize spacing
      overflow: "hidden",
      width: "100%",
    }}>
      <style>{`
        @keyframes slideMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .trust-marquee {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: slideMarquee 20s linear infinite;
        }
        .trust-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="trust-marquee">
        {duplicatedItems.map((item, idx) => (
          <div key={idx} style={{
            display: "flex", alignItems: "center", gap: 8,
            flexShrink: 0,
            paddingRight: 16,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(0, 98, 255, 0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ color: "var(--text)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{item.title}</div>
              <div style={{ color: "var(--text-2)", fontSize: 10, whiteSpace: "nowrap" }}>{item.desc}</div>
            </div>
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
          color: "var(--accent)", fontSize: 11, fontWeight: 800,
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
        backgroundImage: titleColor ? "none" : "linear-gradient(135deg, var(--text) 30%, var(--text-2) 100%)",
        backgroundClip: titleColor ? "unset" : "text",
        WebkitBackgroundClip: titleColor ? "unset" : "text",
        margin: "0 0 12px", lineHeight: 1.1,
      }}>{title}</h2>
      {subtitle && <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Video helpers ─────────────────────────────────────── */
const getYouTubeVideoId = (url: string): string | null => {
  if (url.includes("youtube.com/watch")) return url.match(/[?&]v=([^&#]+)/)?.[1] || null;
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0] || null;
  return null;
};

const getVideoEmbedSrc = (url: string): string | null => {
  const id = getYouTubeVideoId(url);
  if (id) return `https://www.youtube.com/embed/${id}`;
  if (url.includes("vimeo.com")) return url;
  return null;
};

const getVideoPosterSrc = (url: string): string | null => {
  const id = getYouTubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

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
  heroPosters?: any[];
  firestoreReady?: boolean;
  setPage: (p: string) => void;
  onViewProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number | string) => void;
  wishlist: (number | string)[];
  accessories: any[];
  customerReviews: any[];
  user: any;
  triggerAlert: (type: "success" | "warning" | "error", msg: string) => void;
}

export default function Homepage({ products, banners, heroPosters, firestoreReady, setPage, onViewProduct, onAddToCart, onWishlist, wishlist, accessories, customerReviews, user, triggerAlert }: HomepageProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);



  // Load Featurable widget script after mount to ensure the DOM div is rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Remove the outer embed script
      const scriptId = "featurable-widget-script";
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // 2. CRITICAL SPA FIX: Remove the inner loader script that embed.js dynamically creates.
      // embed.js checks for this script and aborts if it exists. Removing it forces re-initialization.
      document.querySelectorAll('script[data-featurable-loader]').forEach(node => node.remove());

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.featurable.com/widget/v2/embed.js";
      script.defer = true;
      script.charset = "UTF-8";

      document.body.appendChild(script);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const [videoSettings, setVideoSettings] = useState<{
    title: string;
    subtitle: string;
    videoUrl: string;
    orientation?: 'landscape' | 'portrait';
    posterUrl?: string;
    eyebrow?: string;
  } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoBuffering, setVideoBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const [showVideoText, setShowVideoText] = useState(true);

  useEffect(() => {
    if (!videoSectionRef.current) return;
    let textTimeoutId: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (videoRef.current) videoRef.current.play().catch(() => { });
          setShowVideoText(true);
          textTimeoutId = setTimeout(() => setShowVideoText(false), 4000);
        } else {
          if (videoRef.current) videoRef.current.pause();
          clearTimeout(textTimeoutId);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(videoSectionRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(textTimeoutId);
    };
  }, [videoSettings, videoPlaying]);

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
            orientation: data.orientation || "landscape",
            posterUrl: data.posterUrl || "",
            eyebrow: data.eyebrow || "Introduction",
          });
        }
      },
      (err) => {
        console.error("Failed to load promo video settings:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  const videoEmbedSrc = videoSettings ? getVideoEmbedSrc(videoSettings.videoUrl) : null;
  const videoPosterSrc = (() => {
    if (!videoSettings) return null;
    if (videoSettings.posterUrl) return videoSettings.posterUrl;
    return getVideoPosterSrc(videoSettings.videoUrl);
  })();

  const handleVideoPlay = () => {
    setVideoError(false);
    setVideoBuffering(true);
    setVideoPlaying(true);
    window.setTimeout(() => setVideoBuffering(false), 2500);
  };

  const renderVideoTextOverlay = (align: "left" | "center") => (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0,
      padding: isMobile ? "22px 20px" : "38px 44px",
      textAlign: align, pointerEvents: "none",
      background: showVideoText ? "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" : "transparent",
      opacity: showVideoText ? 1 : 0,
      transition: "opacity 0.8s ease-in-out, background 0.8s ease-in-out",
    }}>
      <div style={{
        display: "inline-block",
        color: "var(--accent)", fontSize: 11, fontWeight: 800,
        letterSpacing: "0.08em", textTransform: "uppercase",
        marginBottom: 10,
        background: "rgba(0, 98, 255, 0.16)",
        padding: "5px 14px", borderRadius: 100,
        border: "1px solid rgba(0, 98, 255, 0.4)",
      }}>
        {videoSettings?.eyebrow || "Introduction"}
      </div>
      <h2 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: isMobile ? "clamp(20px, 5vw, 26px)" : "clamp(26px, 3.6vw, 40px)",
        fontWeight: 800, letterSpacing: "-0.02em",
        color: "#fff", margin: "0 0 10px", lineHeight: 1.12,
        textShadow: "0 2px 18px rgba(0,0,0,0.5)",
      }}>
        {videoSettings?.title || "Explore Laptopkart in Action"}
      </h2>
      <p style={{
        color: "rgba(255,255,255,0.85)",
        fontSize: isMobile ? 13 : 15,
        lineHeight: 1.6,
        margin: align === "center" ? "0 auto" : "0",
        maxWidth: 620,
        textShadow: "0 1px 10px rgba(0,0,0,0.5)",
      }}>
        {videoSettings?.subtitle || "Watch our certified refurbishment process and see why thousands trust us."}
      </p>
    </div>
  );

  const renderVideoPlayer = () => {
    if (!videoSettings) return null;

    const isEmbed = videoEmbedSrc !== null;
    const embedSrc = isEmbed
      ? videoEmbedSrc!.includes("vimeo.com")
        ? `${videoEmbedSrc}${videoEmbedSrc.includes("?") ? "&" : "?"}autoplay=1`
        : `${videoEmbedSrc}?autoplay=1&rel=0`
      : null;

    const showPortrait = videoSettings?.orientation === "portrait";
    const playerBoxStyle = showPortrait
      ? { width: "min(100vw, calc(100dvh * 0.5625))", height: "100dvh", maxWidth: "100vw" }
      : { width: "100vw", height: "auto", aspectRatio: "16 / 9" };

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {!videoPlaying ? (
          <button
            onClick={handleVideoPlay}
            aria-label="Play promo video"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", background: "none", padding: 0, cursor: "pointer", display: "block" }}
          >
            {videoPosterSrc ? (
              <img src={videoPosterSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #082F49 0%, #0C4A6E 45%, #0369A1 100%)" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)" }} />
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 74, height: 74, borderRadius: "50%", background: "rgba(0, 98, 255, 0.95)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(0, 98, 255, 0.7)", animation: "pulse-ring 1.8s ease-out infinite" }} />
              <Play size={30} fill="currentColor" style={{ marginLeft: 3 }} />
            </span>
            <span style={{ position: "absolute", bottom: 18, left: 0, right: 0, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Watch now</span>
          </button>
        ) : videoError ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "linear-gradient(135deg, #082F49 0%, #0C4A6E 45%, #0369A1 100%)", color: "#fff", textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Couldn't load the video.</div>
            <button onClick={handleVideoPlay} style={{ background: "rgba(0, 98, 255, 0.9)", color: "#fff", border: "none", borderRadius: 100, padding: "10px 22px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Retry</button>
          </div>
        ) : (
          <>
            {videoBuffering && (
              <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "linear-gradient(90deg, rgba(8,47,73,0.9) 0%, rgba(8,47,73,0.75) 40%, rgba(8,47,73,0.9) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s linear infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Loading video…</span>
              </div>
            )}
            {isEmbed ? (
              <div style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                ...playerBoxStyle,
              }}>
                <iframe
                  src={embedSrc!}
                  title="Laptopkart promo video"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setVideoBuffering(false)}
                />
              </div>
            ) : (
              <div style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                ...playerBoxStyle,
              }}>
                <video
                  ref={videoRef}
                  src={videoSettings.videoUrl}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
                  onLoadedData={() => setVideoBuffering(false)}
                  onError={() => { setVideoError(true); setVideoBuffering(false); }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: isMobile ? 16 : 32,
                    right: isMobile ? 16 : 48,
                    background: "rgba(0, 0, 0, 0.3)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 100,
                    padding: isMobile ? "10px" : "12px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: isMobile ? 0 : 10,
                    cursor: "pointer",
                    zIndex: 10,
                    backdropFilter: "blur(12px)",
                    fontWeight: 700,
                    fontSize: isMobile ? 12 : 16,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    transition: "background 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 0, 0, 0.45)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)"}
                >
                  {isMuted ? (
                    <>
                      <VolumeX size={isMobile ? 18 : 20} />
                      {!isMobile && "Tap to Unmute"}
                    </>
                  ) : (
                    <>
                      <Volume2 size={isMobile ? 18 : 20} />
                      {!isMobile && "Mute"}
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

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
    }, 50000);
    return () => clearInterval(timer);
  }, [banners?.length]);

  const answer = (a: string) => {
    const na = { ...answers, [step]: a };
    setAnswers(na);
    if (step < finderQ.length - 1) {
      setStep(step + 1);
    } else {
      const b = na[0];
      const u = na[1];
      const r = na[2];
      const br = na[3];

      let filtered = products.filter(p => {
        let budgetMatch = true;
        if (b === "Under ₹20,000") budgetMatch = p.price < 20000;
        else if (b === "₹20K–₹40K") budgetMatch = p.price >= 20000 && p.price <= 40000;
        else if (b === "₹40K–₹70K") budgetMatch = p.price > 40000 && p.price <= 70000;
        else if (b === "₹70K+") budgetMatch = p.price > 70000;

        let usageMatch = true;
        if (u === "Gaming") usageMatch = !!(p.category?.toLowerCase().includes("gaming") || p.badge === "Gaming");
        else if (u === "Creative Work") usageMatch = !!(p.category?.toLowerCase().includes("macbook") || p.ram === "16GB" || p.ram === "32GB");
        else if (u === "Business") usageMatch = !!(p.category?.toLowerCase().includes("business"));

        let ramMatch = true;
        if (r !== "Any") ramMatch = p.ram === r;

        let brandMatch = true;
        if (br !== "Any") brandMatch = p.brand?.toLowerCase() === br.toLowerCase();

        return budgetMatch && usageMatch && ramMatch && brandMatch;
      });

      if (filtered.length < 3) {
        const lessStrict = products.filter(p => {
          let budgetMatch = true;
          if (b === "Under ₹20,000") budgetMatch = p.price <= 30000;
          else if (b === "₹20K–₹40K") budgetMatch = p.price >= 15000 && p.price <= 50000;
          else if (b === "₹40K–₹70K") budgetMatch = p.price >= 30000;

          let brandMatch = true;
          if (br !== "Any") brandMatch = p.brand?.toLowerCase() === br.toLowerCase();
          return budgetMatch && brandMatch;
        });
        const merged = [...filtered, ...lessStrict].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
        filtered = merged;
      }

      if (filtered.length < 3) {
        const merged = [...filtered, ...products].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
        filtered = merged;
      }

      setResult(filtered.slice(0, 3));
    }
  };
  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  const section = (children: React.ReactNode, bgColor: string | boolean = COLORS.darkBg, paddingOverride?: string) => {
    const finalBg = typeof bgColor === "boolean" ? (bgColor ? COLORS.background : COLORS.darkBg) : bgColor;
    return (
      <section style={{
        background: finalBg,
        padding: paddingOverride || `${isMobile ? 56 : 100}px ${isMobile ? 18 : 24}px`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>{children}</Reveal>
        </div>
      </section>
    );
  };

  const renderTopPicks = () => {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: isMobile ? 24 : 40 }}>
          <div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "var(--text)", margin: "0 0 8px", textTransform: "uppercase" }}>
              Best Deals Of The Week
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: 15, margin: 0 }}>Grab them before they're gone</p>
          </div>
          {!isMobile && (
            <Button variant="ghost" onClick={() => setPage("listing")}>
              View All Deals <ArrowRight size={14} />
            </Button>
          )}
        </div>

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

            <motion.div
              onPanEnd={(e, info) => {
                const len = latestEightLaptops.length;
                const swipeThreshold = 30;
                if (info.offset.x < -swipeThreshold) {
                  setActiveTopPickIdx((prev) => (prev + 1) % len);
                } else if (info.offset.x > swipeThreshold) {
                  setActiveTopPickIdx((prev) => (prev - 1 + len) % len);
                }
              }}
              style={{
                position: "relative",
                width: "100%",
                height: 380,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                padding: "20px 0",
                touchAction: "pan-y"
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
                  let offset = index - activeTopPickIdx;
                  if (offset > len / 2) offset -= len;
                  if (offset < -len / 2) offset += len;

                  const absOffset = Math.abs(offset);
                  const isCenter = offset === 0;
                  if (absOffset > 2) return null;

                  return (
                    <motion.div
                      key={p.id}
                      onClick={() => setActiveTopPickIdx(index)}
                      animate={{
                        x: offset * 180,
                        scale: isCenter ? 1.05 : 0.85,
                        rotate: offset * 5,
                        opacity: absOffset > 2 ? 0 : 1,
                        zIndex: 10 - absOffset,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 20,
                        mass: 0.8
                      }}
                      style={{
                        position: "absolute",
                        width: 200,
                        height: 340,
                        cursor: "pointer",
                        transformOrigin: "center center",
                        display: "flex"
                      }}
                    >
                      <div style={{ width: "100%", height: "100%", pointerEvents: isCenter ? "auto" : "none" }}>
                        <ProductCard product={p} onView={onViewProduct} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

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
                    background: activeTopPickIdx === idx ? COLORS.green : "var(--border-hi)",
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
      true,
      isMobile ? "24px 18px" : "100px 24px"
    );
  };

  return (
    <main>
      {!isMobile ? (
        // Desktop Layout
        <>
          <Reveal y={0}><HeroBanner setPage={setPage} banners={heroPosters || []} isLoading={!firestoreReady} /></Reveal>
          <Reveal delay={0.08} y={20}><TrustStrip /></Reveal>
          <Reveal delay={0.12} y={20}><HeroStats /></Reveal>
        </>
      ) : (
        // Mobile Layout
        <>
          <Reveal y={0}><HeroBanner setPage={setPage} banners={heroPosters || []} isLoading={!firestoreReady} /></Reveal>
          <Reveal delay={0.08} y={20}><TrustStrip /></Reveal>
          <Reveal delay={0.12} y={20}><HeroStats /></Reveal>
          {renderTopPicks()}
        </>
      )}

      {/* ── Promo Video Section (full-bleed hero) ── */}
      {videoSettings && videoSettings.videoUrl && (
        <Reveal y={0}>
          <section
            ref={videoSectionRef}
            id="promo-video-section"
            className={videoSettings.orientation === "portrait" ? "full-window-video" : ""}
            style={{ 
              position: "relative", 
              overflow: "hidden", 
              background: "linear-gradient(135deg, #082F49 0%, #0C4A6E 45%, #0369A1 100%)", 
              marginLeft: "calc(50% - 50vw)",
              width: "100vw",
              aspectRatio: videoSettings.orientation === "portrait" ? "auto" : "16/9"
            }}
          >
            {renderVideoPlayer()}
            {renderVideoTextOverlay(videoSettings.orientation === "portrait" ? "center" : "left")}
          </section>
        </Reveal>
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
                          fontWeight: 800, color: "var(--text)",
                          margin: "0 0 8px", letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                        }}>
                          {img.title}
                        </h3>
                        <p style={{
                          color: "var(--text-3)",
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
                        background: activeSlideIdx === i ? COLORS.green : "var(--border-focus)",
                        transition: "all 0.25s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </>,
            COLORS.background
          )}
        </div>
      )}

      {/* ── Categories ──────────────────────────── */}
      {section(
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: isMobile ? 24 : 40 }}>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "var(--text)", margin: "0 0 8px", textTransform: "uppercase" }}>
                Shop By Category
              </h2>
              <p style={{ color: "var(--text-2)", fontSize: 15, margin: 0 }}>Find the perfect laptop for your needs</p>
            </div>
            {!isMobile && (
              <Button variant="ghost" onClick={() => setPage("listing")}>
                View All Categories <ArrowRight size={14} />
              </Button>
            )}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(6,1fr)",
            gap: isMobile ? 12 : 20,
          }}>
            {categories.map((cat, i) => {
              let realCount = 0;
              if (cat.name === "Accessories") {
                realCount = accessories.length;
              } else {
                let mappedCat = cat.name.replace(" Laptops", "").replace(/s$/, "");
                realCount = products.filter(p =>
                  p.category.toLowerCase().includes(mappedCat.toLowerCase()) ||
                  (mappedCat === 'MacBook' && p.brand.toLowerCase() === 'apple')
                ).length;
              }

              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    if (cat.name === "Accessories") setPage("accessories");
                    else if (cat.name === "Business Laptops") setPage("listing:Business");
                    else if (cat.name === "Gaming Laptops") setPage("listing:Gaming");
                    else setPage(`listing:${cat.name}`);
                  }}
                  style={{
                    background: "var(--bg-2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 16,
                    padding: "20px 12px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--accent)";
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "var(--border)";
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <img src={cat.icon} alt={cat.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>
                    {cat.name}
                  </div>
                  <div style={{ color: "var(--text-2)", fontSize: 11 }}>
                    {realCount} items
                  </div>
                </div>
              )
            })}
          </div>
          {isMobile && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Button variant="ghost" onClick={() => setPage("listing")}>
                View All Categories <ArrowRight size={14} />
              </Button>
            </div>
          )}
        </>,
        "var(--bg)",
        `${isMobile ? 56 : 100}px ${isMobile ? 18 : 24}px ${isMobile ? 24 : 40}px`
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
                background: "rgba(99,102,241,0.12)", color: "var(--accent-2)",
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
                <p style={{ color: COLORS.primary, textAlign: "center", fontWeight: 700, marginBottom: 20, fontSize: 15 }}>
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
                      display: "flex", flexDirection: "column"
                    }}>
                      <div style={{ height: 140, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", padding: "12px" }}>
                        <img src={p.img} alt={p.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                      </div>
                      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "left" }}>
                        <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>{p.name}</div>
                        <div style={{ color: COLORS.primary, fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif" }}>
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
                      background: i <= step ? COLORS.primary : "var(--border-hi)",
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
                        color: COLORS.primary,
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
                        b.style.background = "linear-gradient(135deg, var(--accent-2), var(--accent))"; b.style.color = "#000";
                        b.style.border = "1px solid transparent";
                      }}
                      onMouseLeave={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.background = "rgba(56,189,248,0.08)"; b.style.color = COLORS.primary;
                        b.style.border = "1px solid rgba(56,189,248,0.22)";
                      }}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>,
        "var(--bg)",
        `${isMobile ? 24 : 40}px ${isMobile ? 18 : 24}px ${isMobile ? 24 : 60}px` // Reduced bottom padding
      )}

      {/* ── Student Hub Banner ── */}
      <StudentHubBanner setPage={setPage} />

      {/* ── Top Picks (Desktop) ───────────────────────────── */}
      {!isMobile && renderTopPicks()}

      {/* ── Promo Banners ──────────────────────── */}
      {section(
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 24 }}>
          {/* Banner 1 */}
          <div style={{ background: "linear-gradient(135deg, var(--bg-1), var(--bg-2))", borderRadius: 24, padding: "40px", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1, maxWidth: "60%" }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 12, lineHeight: 1.2 }}>Exchange Offer</h3>
              <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>Get the best value for your old laptop when you upgrade.</p>
              <button style={{ background: "var(--accent)", color: "#FFFFFF", padding: "12px 24px", borderRadius: 100, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }} onClick={() => setPage("resell")}>
                Calculate Value <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.2 }}>
              <Recycle size={200} color="var(--accent)" />
            </div>
          </div>

          {/* Banner 2 */}
          <div style={{ background: "linear-gradient(135deg, var(--bg-1), var(--bg-2))", borderRadius: 24, padding: "40px", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1, maxWidth: "60%" }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 12, lineHeight: 1.2 }}>Warranty Available</h3>
              <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>Enjoy peace of mind with our warranty options on select models.</p>
              <button style={{ background: "var(--accent)", color: "#FFFFFF", padding: "12px 24px", borderRadius: 100, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }} onClick={() => setPage("warranty")}>
                Learn More <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.2 }}>
              <Shield size={200} color="var(--accent)" />
            </div>
          </div>
        </div>,
        "transparent",
        `${isMobile ? 8 : 40}px ${isMobile ? 18 : 24}px ${isMobile ? 24 : 40}px` // Reduced top padding
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
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
                }} />
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{f.icon}</div>
                <div style={{ color: COLORS.text, fontWeight: 700, fontSize: isMobile ? 12 : 13, fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>{f.t}</div>
                <div style={{ color: COLORS.muted, fontSize: isMobile ? 11 : 12 }}>{f.d}</div>
              </Card>
            ))}
          </div>
        </>,
        "var(--bg)",
        `${isMobile ? 24 : 40}px ${isMobile ? 18 : 24}px ${isMobile ? 56 : 100}px`
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
            <SectionHeader eyebrow="Reviews" title="What Customer Says" subtitle="Trusted by students, professionals, and businesses across India" titleColor="var(--text)" />

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
                color: "var(--success)", borderRadius: 12, padding: "12px 24px",
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
                <h3 style={{ margin: 0, fontFamily: "Sora", color: "var(--text)", fontSize: 18, fontWeight: 800 }}>Share Your Experience</h3>

                {/* Rating selection (Stars) */}
                <div>
                  <label style={{ display: "block", color: COLORS.muted, fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Your Rating</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={24}
                        onClick={() => setReviewRating(s)}
                        fill={s <= reviewRating ? "var(--warning)" : "transparent"}
                        color={s <= reviewRating ? "var(--warning)" : "var(--text-3)"}
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
                        width: "100%", background: "var(--bg-2)", border: "1px solid var(--border-hi)",
                        borderRadius: 12, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none",
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
                        width: "100%", background: "var(--bg-2)", border: "1px solid var(--border-hi)",
                        borderRadius: 12, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none",
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
                      width: "100%", background: "var(--bg-2)", border: "1px solid var(--border-hi)",
                      borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontSize: 13, outline: "none",
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
                  fontFamily: "Sora", color: "var(--text)", fontSize: 20,
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
          </>, "var(--bg-1)"
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
                flex: 1, background: "var(--bg-2)",
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


    </main>
  );
}
