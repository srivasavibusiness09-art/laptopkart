"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/lib/hooks";

/* ── Config ──────────────────────────────────────────────── */
const FRICTION      = 0.88;   // velocity decay per frame (lower = more damping)
const LERP_FACTOR   = 0.095;  // display catches up to target (lower = smoother / more lag)
const SENSITIVITY   = 0.022;  // wheel delta → frame units
const TOUCH_SENS    = 0.045;  // touch delta → frame units

/* ── Scene text definitions ─────────────────────────────── */
const scenes = [
  { from: 1,  to: 8,  h: "LaptopLux",               s: "Premium Refurbished Technology",    b: "Built for performance.\nTested for reliability." },
  { from: 9,  to: 16, h: "Performance Restored",     s: "Every core re-engineered",          b: "" },
  { from: 17, to: 24, h: "Memory Upgraded",           s: "Max RAM. Maximum possibilities.",   b: "" },
  { from: 25, to: 32, h: "Lightning Fast Storage",    s: "NVMe SSD. Zero wait time.",         b: "" },
  { from: 33, to: 39, h: "Thermally Tested",          s: "Runs cool under any load.",         b: "" },
  { from: 40, to: 46, h: "72 Point Quality Check",    s: "Display. Keyboard. Ports. Verified.",b: "" },
  { from: 47, to: 52, h: "Feels Brand New",           s: "Certified. Warranted. Delivered.",  b: "" },
];

function getScene(f: number) {
  return scenes.find((s) => f >= s.from && f <= s.to) ?? scenes[0];
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

interface Props { onEnterStore: () => void }

export default function LandingPage({ onEnterStore }: Props) {
  const isMobile = useIsMobile();
  const totalFrames = isMobile ? 50 : 52;

  /* ── Refs for physics (no re-renders from these) ──── */
  const targetRef  = useRef(0);    // where we want to be (0 → totalFrames-1)
  const displayRef = useRef(0);    // smoothly lerped
  const velRef     = useRef(0);    // momentum
  const lastFrame  = useRef(0);    // last frame drawn
  const doneRef    = useRef(false);
  const touchY     = useRef<number | null>(null);
  const rafRef     = useRef<number>(0);

  /* ── React state for UI only ──────────────────────── */
  const [frameNum, setFrameNum]   = useState(1);
  const [menuOpen, setMenuOpen]   = useState(false);

  /* ── Canvas / image refs ─────────────────────────── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs      = useRef<HTMLImageElement[]>([]);

  /* ── Cover draw ───────────────────────────────────── */
  const drawFrame = useCallback((n: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imgs.current[n - 1];
    if (!img) return;

    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !img.naturalWidth) return;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth  * scale;
      const h = img.naturalHeight * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    img.complete && img.naturalWidth ? paint() : (img.onload = paint);
  }, []);

  /* ── Preload all frames ───────────────────────────── */
  useEffect(() => {
    const arr: HTMLImageElement[] = [];
    const getSrc = (n: number) => {
      return isMobile
        ? `/phone-frames/ezgif-frame-${String(n).padStart(3, "0")}.png`
        : `/frames/ezgif-frame-${String(n).padStart(3, "0")}.png`;
    };

    let loadedCount = 0;
    const onImgLoad = () => {
      loadedCount++;
      const currentIntFrame = clamp(Math.round(displayRef.current) + 1, 1, totalFrames);
      drawFrame(currentIntFrame);
    };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = getSrc(i);
      img.onload = onImgLoad;
      arr.push(img);
    }
    imgs.current = arr;

    // Reset/clamp current frame if bounds changed, and draw
    targetRef.current = clamp(targetRef.current, 0, totalFrames - 1);
    displayRef.current = clamp(displayRef.current, 0, totalFrames - 1);
    const currentIntFrame = clamp(Math.round(displayRef.current) + 1, 1, totalFrames);
    drawFrame(currentIntFrame);
  }, [isMobile, totalFrames, drawFrame]);

  /* ── Canvas resize ─────────────────────────────────── */
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = devicePixelRatio || 1;
      c.width  = innerWidth  * dpr;
      c.height = innerHeight * dpr;
      drawFrame(clamp(Math.round(displayRef.current) + 1, 1, totalFrames));
    };
    resize();
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, [drawFrame, isMobile, totalFrames]);

  /* ── Physics RAF loop ─────────────────────────────── */
  useEffect(() => {
    let navigating = false;

    const tick = () => {
      // Apply friction
      velRef.current *= FRICTION;

      // Move target by velocity
      targetRef.current = clamp(
        targetRef.current + velRef.current,
        0,
        totalFrames - 1
      );

      // Lerp display toward target
      const diff = targetRef.current - displayRef.current;
      displayRef.current += diff * LERP_FACTOR;

      // Snap when close enough
      if (Math.abs(diff) < 0.001) {
        displayRef.current = targetRef.current;
      }

      // Map to integer frame (1-based)
      const f = clamp(Math.round(displayRef.current) + 1, 1, totalFrames);

      // Draw only when frame changes
      if (f !== lastFrame.current) {
        lastFrame.current = f;
        drawFrame(f);
        setFrameNum(f); // update UI state
      }

      // Auto-navigate at last frame when motion stops
      if (
        f === totalFrames &&
        Math.abs(velRef.current) < 0.02 &&
        Math.abs(diff) < 0.05 &&
        !doneRef.current &&
        !navigating
      ) {
        doneRef.current = true;
        navigating = true;
        setTimeout(onEnterStore, 1200);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame, onEnterStore, isMobile, totalFrames]);

  /* ── Wheel (mouse + trackpad) ─────────────────────── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Normalize: trackpads emit pixel mode (0), mice emit line (1)
      const raw = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      velRef.current += raw * SENSITIVITY;
    };
    addEventListener("wheel", onWheel, { passive: false });
    return () => removeEventListener("wheel", onWheel);
  }, []);

  /* ── Touch ────────────────────────────────────────── */
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchY.current = e.touches[0].clientY; };
    const onMove  = (e: TouchEvent) => {
      e.preventDefault();
      if (touchY.current === null) return;
      const dy = touchY.current - e.touches[0].clientY;
      touchY.current = e.touches[0].clientY;
      velRef.current += dy * TOUCH_SENS;
    };
    addEventListener("touchstart", onStart, { passive: true });
    addEventListener("touchmove",  onMove,  { passive: false });
    return () => {
      removeEventListener("touchstart", onStart);
      removeEventListener("touchmove", onMove);
    };
  }, []);

  /* ── Keyboard ─────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const DOWN = ["ArrowDown", "ArrowRight", " ", "PageDown"];
      const UP   = ["ArrowUp", "ArrowLeft", "PageUp"];
      if (DOWN.includes(e.key)) { e.preventDefault(); velRef.current += 2; }
      if (UP.includes(e.key))   { e.preventDefault(); velRef.current -= 2; }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  /* ── Lock body scroll ─────────────────────────────── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── Derived UI ───────────────────────────────────── */
  const progress = (frameNum - 1) / (totalFrames - 1);
  const scene    = getScene(frameNum);
  const showCTA  = frameNum >= (isMobile ? 45 : 47);
  const showHint = frameNum <= 3;

  /* Per-scene text opacity */
  const span       = scene.to - scene.from;
  const localRatio = span > 0 ? (frameNum - scene.from) / span : 1;
  const textOpacity =
    localRatio < 0.18 ? localRatio / 0.18 :
    localRatio > 0.82 ? (1 - localRatio) / 0.18 : 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#000",
        userSelect: "none",
      }}
    >
      {/* ── Full-screen canvas ─────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* ── Vignette + gradients ───────────────────── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Outer vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.5) 100%)",
        }} />
        {/* Bottom gradient for text */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
        }} />
        {/* Top gradient for nav */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "20%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
        }} />
      </div>

      {/* ── Navbar ────────────────────────────────── */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 64,
      }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.85)", padding: 6, display: "flex",
            alignItems: "center", borderRadius: 8, transition: "0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)"; }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 20,
          letterSpacing: "-0.02em",
        }}>
          <span style={{ color: "#fff" }}>Laptop</span>
          <span style={{ color: "#38BDF8" }}>Lux</span>
        </div>

        {/* Home skip button */}
        <button
          onClick={onEnterStore}
          style={{
            background: "rgba(56,189,248,0.12)",
            color: "#38BDF8",
            border: "1px solid rgba(56,189,248,0.3)",
            borderRadius: 10,
            padding: "9px 20px",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Sora', sans-serif",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "#38BDF8"; b.style.color = "#000";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "rgba(56,189,248,0.12)"; b.style.color = "#38BDF8";
          }}
        >
          Home
        </button>
      </nav>

      {/* ── Side drawer ───────────────────────────── */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute", inset: 0, zIndex: 98,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
            }}
          />
          <aside style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: 280, background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(30px)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            zIndex: 99, padding: "80px 0 24px",
          }}>
            {["Laptops", "Gaming", "MacBooks", "Ultrabooks", "Accessories"].map((l) => (
              <button
                key={l}
                onClick={() => { setMenuOpen(false); onEnterStore(); }}
                style={{
                  display: "flex", alignItems: "center",
                  width: "100%", textAlign: "left",
                  background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.75)", fontSize: 16,
                  fontFamily: "'Sora', sans-serif",
                  padding: "14px 28px", cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.color = "#38BDF8"; b.style.paddingLeft = "36px";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.color = "rgba(255,255,255,0.75)"; b.style.paddingLeft = "28px";
                }}
              >
                {l}
              </button>
            ))}
          </aside>
        </>
      )}

      {/* ── Scene headline ────────────────────────── */}
      <div style={{
        position: "absolute", bottom: showCTA ? "20vh" : "11vh",
        left: "50%", transform: "translateX(-50%)",
        textAlign: "center", zIndex: 10,
        width: "min(90%, 720px)",
        opacity: textOpacity,
        transition: "opacity 0.4s ease, bottom 0.5s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none",
      }}>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "clamp(32px, 6vw, 72px)",
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 12px",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          textShadow: "0 4px 40px rgba(0,0,0,0.8), 0 0 80px rgba(56,189,248,0.2)",
        }}>
          {scene.h}
        </h1>
        {scene.s && (
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(15px, 2.2vw, 24px)",
            color: "#38BDF8", fontWeight: 600, margin: "0 0 8px",
            textShadow: "0 2px 20px rgba(0,0,0,0.6)",
          }}>
            {scene.s}
          </p>
        )}
        {scene.b && (
          <p style={{
            fontSize: "clamp(13px, 1.6vw, 18px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7, whiteSpace: "pre-line",
          }}>
            {scene.b}
          </p>
        )}
      </div>

      {/* ── CTA (last scene) ──────────────────────── */}
      {showCTA && (
        <div style={{
          position: "absolute", bottom: "7vh", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10, textAlign: "center",
          animation: "fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) forwards",
        }}>
          <button
            onClick={onEnterStore}
            style={{
              background: "#38BDF8", color: "#000",
              border: "none", borderRadius: "100px",
              padding: "16px 48px",
              fontSize: 17, fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              boxShadow: "0 0 60px rgba(56,189,248,0.45)",
              letterSpacing: "-0.01em",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = "scale(1.05)";
              b.style.boxShadow = "0 0 80px rgba(56,189,248,0.65)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.transform = "scale(1)";
              b.style.boxShadow = "0 0 60px rgba(56,189,248,0.45)";
            }}
          >
            Continue To Store →
          </button>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 12, fontFamily: "'Inter', sans-serif" }}>
            or keep scrolling
          </p>
        </div>
      )}

      {/* ── Progress bar ──────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 2, background: "rgba(255,255,255,0.06)", zIndex: 20,
      }}>
        <div style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, #3B82F6, #38BDF8)",
          transition: "width 0.05s linear",
          boxShadow: "0 0 10px rgba(56,189,248,0.6)",
        }} />
      </div>

      {/* ── Scroll hint ───────────────────────────── */}
      {showHint && (
        <div style={{
          position: "absolute", bottom: "5vh", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10, textAlign: "center",
          animation: "floatHint 2s ease-in-out infinite",
          pointerEvents: "none",
          opacity: 1 - (frameNum - 1) / 3,
        }}>
          <div style={{
            color: "rgba(255,255,255,0.4)", fontSize: 11,
            fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: 6,
          }}>
            Scroll
          </div>
          <div style={{ color: "#38BDF8", fontSize: 20 }}>↓</div>
        </div>
      )}

      {/* ── Scene dots indicator ───────────────────── */}
      <div style={{
        position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
        zIndex: 10, display: "flex", flexDirection: "column", gap: 8,
        pointerEvents: "none",
      }}>
        {scenes.map((s, i) => {
          const active = frameNum >= s.from && frameNum <= s.to;
          const past   = frameNum > s.to;
          return (
            <div key={i} style={{
              width: active ? 6 : 4,
              height: active ? 20 : 4,
              borderRadius: 100,
              background: active ? "#38BDF8" : past ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.18)",
              transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
            }} />
          );
        })}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateX(-50%) translateY(28px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes floatHint {
          0%,100%{ transform:translateX(-50%) translateY(0); }
          50%    { transform:translateX(-50%) translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
