"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import Card from "./common/Card";

interface HeroProps {
  setPage: (p: string) => void;
  banners?: any[];
}

const stats = [
  { value: "5K+", label: "Devices Sold" },
  { value: "1 Year", label: "Warranty" },
  { value: "Tested", label: "QC Checks" },
  { value: "4.9★", label: "Rating" },
];

export function HeroBanner({ setPage, banners = [] }: HeroProps) {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure we have at least one banner to show
  const activeBanners = banners

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Auto-scroll logic (5 seconds)
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(nextSlide, 50000);
    return () => clearInterval(interval);
  }, [nextSlide, activeBanners.length]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: "linear-gradient(135deg, #082F49 0%, #0C4A6E 60%, #0369A1 100%)",
        aspectRatio: isMobile ? "16/9" : "21/9",
        cursor: "pointer",
      }}
      onClick={() => setPage("listing")}
    >
      <div style={{
        display: "flex",
        height: "100%",
        transform: `translateX(-${currentIndex * 100}%)`,
        transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
        willChange: "transform"
      }}>
        {activeBanners.map((b, idx) => (
          <div key={idx} style={{ flex: "0 0 100%", width: "100%", height: "100%", position: "relative" }}>
            <img
              src={isMobile && b.mobileSrc ? b.mobileSrc : b.src}
              alt={b.title || `Banner ${idx + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
            />
          </div>
        ))}
      </div>

      {/* Fallback banner overlay if the admin hasn't uploaded any banners yet */}
      {activeBanners.length === 0 && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)",
          display: "flex", alignItems: "center",
          padding: isMobile ? "0 24px" : "0 80px",
        }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(56,189,248,0.2)",
              border: "1px solid rgba(56,189,248,0.4)",
              borderRadius: 100, padding: "6px 16px",
              marginBottom: 24,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Save Up To 70% Off
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: isMobile ? "32px" : "56px",
              fontWeight: 800, color: "#FFFFFF",
              lineHeight: 1.1, margin: "0 0 16px",
            }}>
              Refurbished Tech That Feels <span style={{ color: "var(--accent)" }}>Brand New</span>
            </h1>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && !isMobile && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            style={{
              position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              color: "#000", zIndex: 10,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            style={{
              position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.9)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              color: "#000", zIndex: 10,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {activeBanners.length > 1 && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 8, zIndex: 10,
        }}>
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              style={{
                width: currentIndex === idx ? 24 : 8,
                height: 8, borderRadius: 4,
                background: currentIndex === idx ? "var(--accent)" : "rgba(255,255,255,0.5)",
                border: "none", cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroStats() {
  const isMobile = useIsMobile();
  const [count, setCount] = useState(1);

  // Counter animation: count from 1 to 50000 like a timer
  useEffect(() => {
    const target = 50000;
    const duration = 2800;
    let startTime: number | null = null;
    let rafId = 0;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.max(1, Math.round(eased * target)));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{
      maxWidth: 1200, margin: "0 auto", width: "100%",
      padding: isMobile ? "24px 16px 24px" : "40px 24px 40px",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: isMobile ? 8 : 24,
      }}>
        {stats.map((s, i) => {
          const isRating = s.label === "Rating";
          return (
            <Card
              key={s.label}
              onClick={isRating ? () => window.open("https://www.google.com/search?q=Laptopkart+Reviews", "_blank") : undefined}
              style={{
                background: "var(--bg-2)",
                border: isRating ? "1px solid var(--warning-border)" : "1px solid var(--border)",
                borderRadius: 16,
                padding: isMobile ? "12px 8px" : "24px 16px",
                textAlign: "center",
                animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
                cursor: isRating ? "pointer" : "default",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: isMobile ? 20 : 28, fontWeight: 800,
                color: isRating ? "var(--warning)" : "var(--accent)",
                marginBottom: 6,
              }}>
                {s.label === "Devices Sold" ? `${Math.min(count, 50000).toLocaleString("en-IN")}+` : s.value}
              </div>
              <div style={{ color: "var(--text-2)", fontSize: isMobile ? 12 : 14, fontWeight: 500, letterSpacing: "0.02em" }}>
                {s.label}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function Hero({ setPage, banners = [] }: HeroProps) {
  const isMobile = useIsMobile();
  return (
    <section style={{
      width: "100%",
      background: "var(--bg)",
      paddingBottom: isMobile ? 8 : 60,
    }}>
      <HeroBanner setPage={setPage} banners={banners} />
      <HeroStats />
    </section>
  );
}
