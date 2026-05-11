"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface HeroProps { setPage: (page: string) => void }

export default function Hero({ setPage }: HeroProps) {
  const [count, setCount] = useState(0);
  const isMobile          = useIsMobile();

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => (c < 50000 ? c + 1234 : 50000)), 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{
      background: "linear-gradient(135deg,#0A0F1E 0%,#0F1A2E 50%,#091A0F 100%)",
      minHeight: isMobile ? "auto" : 520,
      display: "flex", alignItems: "center", position: "relative", overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%,rgba(34,197,94,0.08) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(59,130,246,0.06) 0%,transparent 40%)" }} />

      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: isMobile ? "36px 16px" : "60px 20px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 32 : 60,
        alignItems: "center", width: "100%",
      }}>

        {/* Left: Text */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "6px 14px", marginBottom: 20 }}>
            <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 700 }}>⚡ SAVE UP TO 70% OFF</span>
          </div>

          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: isMobile ? "clamp(28px,7vw,40px)" : "clamp(32px,4vw,54px)", fontWeight: 800, color: COLORS.text, lineHeight: 1.15, margin: "0 0 16px" }}>
            Refurbished Tech<br />That Feels{" "}
            <span style={{ color: COLORS.green }}>Brand New</span>
          </h1>

          <p style={{ color: COLORS.muted, fontSize: isMobile ? 15 : 17, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 480 }}>
            Best Quality. Tested by Experts. Backed by Warranty. Every device undergoes a 72-point quality check before reaching you.
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
            <button onClick={() => setPage("listing")} style={{ background: COLORS.green, color: COLORS.black, border: "none", borderRadius: 12, padding: isMobile ? "13px 24px" : "14px 32px", fontSize: isMobile ? 15 : 16, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              Shop Laptops →
            </button>
            <button style={{ background: "transparent", color: COLORS.text, border: `1.5px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: isMobile ? "13px 20px" : "14px 32px", fontSize: isMobile ? 15 : 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
              Why Refurbished?
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: isMobile ? 8 : 16,
            }}
          >
            {[
              { value: `${Math.min(count, 50000).toLocaleString("en-IN")}+`, label: "Devices Sold" },
              { value: "1 Year",  label: "Warranty" },
              { value: "72+",     label: "QC Checks" },
              { value: "4.8/5",   label: "Rating" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: isMobile ? "10px 4px" : "14px 8px" }}>
                <div style={{ color: COLORS.green, fontSize: isMobile ? 14 : 20, fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>{stat.value}</div>
                <div style={{ color: COLORS.muted, fontSize: isMobile ? 9 : 11, marginTop: 3 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Laptop Image */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: 350, height: 350, background: "radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)", borderRadius: "50%", animation: "pulse 3s ease-in-out infinite" }} />
            <div style={{ width: 340, height: 340, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 80px rgba(34,197,94,0.25),0 8px 32px rgba(0,0,0,0.6)", animation: "float 4s ease-in-out infinite", border: "1px solid rgba(34,197,94,0.2)" }}>
              <img src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&q=85&auto=format&fit=crop" alt="Refurbished Laptop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* Badges */}
            <div style={{ position: "absolute", top: "10%", right: "5%", background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ color: COLORS.green, fontSize: 13, fontWeight: 700 }}>✓ Quality Checked</div>
              <div style={{ color: COLORS.muted, fontSize: 11 }}>72-point inspection</div>
            </div>
            <div style={{ position: "absolute", bottom: "15%", left: "0%", background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ color: "#FBBF24", fontSize: 13, fontWeight: 700 }}>★ 4.8/5 Rating</div>
              <div style={{ color: COLORS.muted, fontSize: 11 }}>50,000+ Reviews</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.05);opacity:1} }
      `}</style>
    </section>
  );
}
