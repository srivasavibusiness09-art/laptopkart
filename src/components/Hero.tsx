"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import Button from "./common/Button";
import Card from "./common/Card";

interface HeroProps { setPage: (p: string) => void }

const stats = [
  { value: "50K+", label: "Devices Sold" },
  { value: "1 Year", label: "Warranty" },
  { value: "Tested", label: "QC Checks" },
  { value: "4.8★", label: "Rating" },
];

export default function Hero({ setPage }: HeroProps) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCount((c) => (c < 50000 ? c + 1618 : 50000)), 28);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      minHeight: isMobile ? "auto" : "100vh",
      background: `linear-gradient(160deg, #070A13 0%, #0C1020 50%, #080C16 100%)`,
      display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
      padding: isMobile ? "58px 18px 48px" : "60px 40px 48px",
    }}>
      {/* Ambient background orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Blue orb — right */}
        <div style={{
          position: "absolute", top: "15%", left: "55%",
          width: "55vw", height: "55vw",
          background: "radial-gradient(circle, rgba(41,121,255,0.16) 0%, transparent 65%)",
          borderRadius: "50%", filter: "blur(60px)",
          animation: "pulse-glow 5s ease-in-out infinite",
        }} />
        {/* Indigo orb — left */}
        <div style={{
          position: "absolute", top: "40%", left: "-10%",
          width: "45vw", height: "45vw",
          background: "radial-gradient(circle, rgba(124,77,255,0.12) 0%, transparent 65%)",
          borderRadius: "50%", filter: "blur(60px)",
          animation: "pulse-glow 7s ease-in-out infinite 1.5s",
        }} />
        {/* Cyan accent — bottom */}
        <div style={{
          position: "absolute", bottom: "5%", left: "35%",
          width: "30vw", height: "30vw",
          background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(50px)",
          animation: "pulse-glow 9s ease-in-out infinite 3s",
        }} />
        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 35%, transparent 100%)",
        }} />
      </div>

      <div style={{
        maxWidth: 1200, margin: "0 auto", width: "100%",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 40 : 80, alignItems: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease",
        position: "relative", zIndex: 1,
      }}>

        {/* Left: Text */}
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(56,189,248,0.1)",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: 100, padding: "6px 16px",
            marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, animation: "pulse-glow 2s ease-in-out infinite" }} />
            <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Save Up To 70% Off
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: isMobile ? "clamp(32px,9vw,48px)" : "clamp(44px,5.5vw,76px)",
            fontWeight: 800,
            color: COLORS.text,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            margin: "0 0 24px",
          }}>
            Refurbished Tech
            <br />
            That Feels{" "}
            <span style={{
              color: "transparent",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              backgroundImage: "linear-gradient(135deg, #38BDF8 0%, #6366F1 60%, #22D3EE 100%)",
            }}>
              Brand New
            </span>
          </h1>

          <p style={{
            color: COLORS.muted, fontSize: isMobile ? 15 : 17,
            lineHeight: 1.7, marginBottom: 36,
            maxWidth: 460,
          }}>
            Every device undergoes a rigorous quality check.
            Premium performance at a fraction of the cost.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
            <Button
              onClick={() => setPage("listing")}
              size="lg"
            >
              Shop Laptops <ArrowRight size={16} />
            </Button>
            <Button
              onClick={() => setPage("why-refurbished")}
              variant="ghost"
              size="lg"
            >
              Why Refurbished?
            </Button>
          </div>

          {/* Stats */}
          {!isMobile && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
            }}>
              {stats.map((s, i) => (
                <Card
                  key={s.label}
                  style={{
                    background: "rgba(56,189,248,0.02)",
                    border: "1px solid rgba(56,189,248,0.08)",
                    borderRadius: 14,
                    padding: "16px 12px",
                    textAlign: "center",
                    animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
                  }}
                >
                  <div style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 22, fontWeight: 800,
                    color: COLORS.green, marginBottom: 3,
                  }}>
                    {s.label === "Devices Sold" ? `${Math.min(count, 5000).toLocaleString("en-IN")}+` : s.value}
                  </div>
                  <div style={{ color: COLORS.muted, fontSize: 11, letterSpacing: "0.02em" }}>
                    {s.label}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Floating product image */}
        {!isMobile && (
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            {/* Glow blob */}
            <div style={{
              position: "absolute",
              width: "80%", height: "80%",
              background: "radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(40px)",
              animation: "pulse-glow 4s ease-in-out infinite",
            }} />

            {/* Product card */}
            <Card
              hoverable={true}
              style={{
                width: 380, height: 380,
                borderRadius: 28,
                overflow: "hidden",
                border: "1px solid rgba(0,229,255,0.20)",
                animation: "float 5s ease-in-out infinite",
                position: "relative",
                zIndex: 1,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85&auto=format&fit=crop"
                alt="Premium refurbished laptop"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Overlay badge top-right */}
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: "rgba(13,17,23,0.80)", backdropFilter: "blur(12px)",
                borderRadius: 12, padding: "10px 14px",
                border: "1px solid rgba(56,189,248,0.18)",
              }}>
                <div style={{ color: COLORS.green, fontSize: 12, fontWeight: 700 }}>✓ Quality Checked</div>
                <div style={{ color: COLORS.muted, fontSize: 10, marginTop: 2 }}>Multi-point inspection</div>
              </div>
              {/* Bottom badge */}
              <div style={{
                position: "absolute", bottom: 16, left: 16,
                background: "rgba(13,17,23,0.80)", backdropFilter: "blur(12px)",
                borderRadius: 12, padding: "10px 14px",
                border: "1px solid rgba(245,158,11,0.25)",
              }}>
                <div style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700 }}>★ 4.8 / 5 Rating</div>
                <div style={{ color: COLORS.muted, fontSize: 10, marginTop: 2 }}>100+ Reviews</div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Scroll indicator (desktop) */}
      {!isMobile && (
        <div style={{
          position: "absolute", bottom: 36, left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center", opacity: 0.5,
          animation: "floatHint 2.5s ease-in-out infinite",
        }}>
          <div style={{ color: COLORS.muted, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
            Scroll
          </div>
          <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, rgba(56,189,248,0.5), transparent)", margin: "0 auto" }} />
        </div>
      )}

      <style>{`
        @keyframes floatHint {
          0%,100%{ transform:translateX(-50%) translateY(0); }
          50%    { transform:translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  );
}
