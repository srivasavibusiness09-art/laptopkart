"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, BadgeCheck, Users } from "lucide-react";
import { useIsMobile } from "@/lib/hooks";
import Card from "./common/Card";

interface HeroProps {
  setPage: (p: string) => void;
  banners?: any[];
  isLoading?: boolean;
}

const heroLaptopImg =
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80&auto=format&fit=crop";

const stats = [
  { value: "5000+", label: "Laptops Sold", animated: true, target: 5000 },
  { value: "Protection", label: "On Refurbished Laptops", animated: false },
  { value: "Tested", label: "Tested before dispatch", animated: false },
  { value: "100+", label: "Reviews", animated: false, link: "https://www.google.com/search?q=sri+vasavi+business+systems&sca_esv=9cac12e99034826d&sxsrf=APpeQnsgEQI8B9HHMExrQOy2_EgiJ04YCA%3A1786641519474&ei=b_x9avq7HKGyhvcPiqGUKQ&biw=1536&bih=730&gs_ssp=eJwFwUEKgCAQBVDaBp2gjZvWzTBK2BG6haKWSC38FXb73uuHeZ-Za2nhQNHUrRM18c4ntuwpUCQJKzWRxEYbbcRa1mHZRtSsXgf3ZuUf5CsCCh_ueOIH_6gaAQ&oq=sri+vas&gs_lp=Egxnd3Mtd2l6LXNlcnAiB3NyaSB2YXMqAggAMgoQLhjHARivARgnMgQQIxgnMgQQIxgnMgQQIxgnMgsQLhiABBjHARivATIKEAAYgAQYFBiHAjIFEAAYgAQyCxAuGIAEGMcBGK8BMgUQABiABDIFEAAYgAQyFxAuGMcBGK8BGJcFGNwEGN4EGOAE2AEBSL0mUIEEWMkecAJ4AZABA5gBmgGgAbQWqgEEMC4yNLgBA8gBAPgBAZgCCqACoQmoAhTCAgoQABhHGNYEGLADwgIHECMY6gIYJ8ICFxAAGIAEGIoFGJECGOcGGOoCGLQC2AEBwgIQEAAYAxiPARjqAhi0AtgBAcICEBAuGAMYjwEY6gIYtALYAQHCAgsQABiABBiKBRiRAsICCxAAGIAEGLEDGIMBwgIIEAAYgAQYsQPCAg4QABiABBiKBRixAxiDAcICERAuGIAEGIoFGJECGMcBGK8BwgIIEC4YgAQYsQPCAgUQLhiABMICCxAuGIAEGLEDGIMBmAMG8QVssaaTnMN1_YgGAZAGCLoGBggBEAEYAZIHAzIuOKAH2eMBsgcDMC44uAeUCcIHBTItNC42yAdSgAgB&sclient=gws-wiz-serp#lrd=0x3babf191b0d0e03d:0x33f15454539914d7,1,,,," },
];

export function HeroBanner({ setPage, banners = [], isLoading = false }: HeroProps) {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide, activeBanners.length]);

  if (isLoading) {
    return <div style={{ minHeight: isMobile ? 480 : 560, background: 'linear-gradient(135deg, #082F49 0%, #0C4A6E 60%, #0369A1 100%)' }} />;
  }

  const hasPosters = activeBanners.length > 0;

  if (hasPosters) {
    /* ── Admin posters: raw full-bleed carousel only ── */
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          background: "var(--bg)",
        }}
      >
        <div style={{
          display: "flex",
          width: "100%",
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
          willChange: "transform",
        }}>
          {activeBanners.map((b, idx) => (
            <div
              key={idx}
              onClick={() => setPage(b.target || "listing")}
              style={{
                flex: "0 0 100%",
                width: "100%",
                position: "relative",
                cursor: "pointer",
                aspectRatio: isMobile ? "1/1" : "21/9",
              }}
            >
              <img
                src={isMobile && b.mobileSrc ? b.mobileSrc : b.src}
                alt={b.title || `Banner ${idx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", pointerEvents: "none", background: "var(--bg-1)" }}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              style={{
                position: "absolute", left: isMobile ? 10 : 20, top: "50%", transform: "translateY(-50%)",
                width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#FFFFFF", zIndex: 10,
                transition: "all 0.2s ease", backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)"; }}
            >
              <ChevronLeft size={isMobile ? 20 : 24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              style={{
                position: "absolute", right: isMobile ? 10 : 20, top: "50%", transform: "translateY(-50%)",
                width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#FFFFFF", zIndex: 10,
                transition: "all 0.2s ease", backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)"; }}
            >
              <ChevronRight size={isMobile ? 20 : 24} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {activeBanners.length > 1 && (
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 8, zIndex: 10,
          }}>
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                style={{
                  width: currentIndex === idx ? 24 : 8,
                  height: 8, borderRadius: 4,
                  background: currentIndex === idx ? "var(--accent)" : "rgba(255,255,255,0.45)",
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

  /* ── Default hero: no admin posters, static content ── */
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: "linear-gradient(135deg, #082F49 0%, #0C4A6E 60%, #0369A1 100%)",
        minHeight: isMobile ? 480 : 560,
      }}
    >
      {/* Content overlay */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: isMobile ? "40px 18px" : "56px 24px", minHeight: "inherit", boxSizing: "border-box" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "55% 45%",
          alignItems: "center",
          gap: isMobile ? 28 : 24,
        }}>
          {/* Left: headline */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.28)",
              borderRadius: 100, padding: "6px 16px",
              marginBottom: 22,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 2s ease-in-out infinite" }} />
              <span style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Certified Refurbished • Save Up To 70%
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: isMobile ? "34px" : "clamp(38px, 5.2vw, 58px)",
              fontWeight: 800, color: "#FFFFFF",
              lineHeight: 1.08, margin: "0 0 16px",
              letterSpacing: "-0.03em",
            }}>
              THE RIGHT LAPTOP.<br />
              WITHOUT THE <span style={{ color: "var(--accent)" }}>GUESSWORK.</span>
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: isMobile ? 14 : 16,
              lineHeight: 1.6,
              maxWidth: 460,
              margin: "0 0 28px",
            }}>
              Every laptop passes a 50-point quality check and ships with warranty, so you buy with total confidence.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => setPage("listing")}
                style={{
                  background: "var(--accent)", color: "#FFFFFF",
                  border: "none", borderRadius: 100,
                  padding: isMobile ? "12px 22px" : "15px 30px",
                  fontSize: isMobile ? 13 : 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "'Sora', sans-serif",
                  boxShadow: "0 8px 24px rgba(0, 98, 255, 0.4)",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#0052D6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "var(--accent)"; }}
              >
                EXPLORE LAPTOPS
              </button>
              <button
                onClick={() => {
                  document.getElementById("smart-finder-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  background: "transparent", color: "#FFFFFF",
                  border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 100,
                  padding: isMobile ? "12px 22px" : "15px 30px",
                  fontSize: isMobile ? 13 : 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "'Sora', sans-serif",
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
              >
                FIND MY LAPTOP
              </button>
            </div>
          </div>

          {/* Right: floating laptop + badges (desktop only) */}
          {!isMobile && (
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 380, height: 300 }}>
                <img
                  src={heroLaptopImg}
                  alt="Laptopkart certified laptop"
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    borderRadius: 24, boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
                    animation: "float 6s ease-in-out infinite",
                    border: "3px solid rgba(255,255,255,0.25)",
                  }}
                />
                <div style={{
                  position: "absolute", top: -14, left: -18,
                  background: "linear-gradient(135deg, #FFD600, #F59E0B)",
                  color: "#1F2937", borderRadius: 14,
                  padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 12px 30px rgba(245,158,11,0.5)",
                  fontWeight: 800, fontSize: 11, letterSpacing: "0.02em",
                  fontFamily: "'Sora', sans-serif",
                }}>
                  <BadgeCheck size={16} />
                  LAPTOPKART CERTIFIED
                </div>
                <div style={{
                  position: "absolute", bottom: -12, right: -14,
                  background: "#FFFFFF", color: "#0F172A", borderRadius: 100,
                  padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                  fontWeight: 700, fontSize: 12, fontFamily: "'Sora', sans-serif",
                }}>
                  <Users size={15} color="var(--accent)" />
                  Trusted by 10,000+ Customers
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeroStats() {
  const isMobile = useIsMobile();
  const [count, setCount] = useState(1);

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
      setCount(Math.max(1, Math.round(eased * 5000)));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{
      maxWidth: 1200, margin: "0 auto", width: "100%",
      padding: isMobile ? "24px 16px 32px" : "40px 24px 64px",
    }}>
      <div style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "var(--shadow-sm)",
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: 0,
        overflow: "hidden",
      }}>
        {stats.map((s, i) => {
          const isRating = s.label === "Reviews";
          return (
            <Card
              key={s.label}
              hoverable={false}
              onClick={isRating && s.link ? () => window.open(s.link, "_blank") : undefined}
              style={{
                background: "transparent",
                gridColumn: isMobile && i === stats.length - 1 && stats.length % 2 !== 0 ? "span 2" : "auto",
                border: "none",
                borderLeft: isMobile
                  ? (i % 2 !== 0 ? "1px solid var(--border)" : "none")
                  : (i > 0 ? "1px solid var(--border)" : "none"),
                borderTop: isMobile && i >= 2 ? "1px solid var(--border)" : "none",
                borderRadius: 0,
                padding: isMobile ? "14px 8px" : "24px 16px",
                textAlign: "center",
                cursor: isRating ? "pointer" : "default",
                boxShadow: "none",
              }}
            >
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: isMobile ? 18 : 26, fontWeight: 800,
                color: isRating ? "var(--warning)" : "var(--accent)",
                marginBottom: 6,
              }}>
                {s.animated ? `${Math.min(count, 5000).toLocaleString("en-IN")}+` : s.value}
              </div>
              <div style={{ color: "var(--text-2)", fontSize: isMobile ? 11 : 13, fontWeight: 500, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
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
    </section>
  );
}
