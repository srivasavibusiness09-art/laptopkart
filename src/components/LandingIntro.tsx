"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/lib/hooks";

/* ── Config ──────────────────────────────────────────────── */
const FRICTION = 0.88;   // velocity decay per frame
const LERP_FACTOR = 0.095;  // display catches up to target
const SENSITIVITY = 0.022;  // wheel delta → frame units

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/* ── Scene text definitions (compressed for 24 frames) ──── */
const scenes = [
  { from: 1, to: 4, h: "Laptopkart", s: "Premium Refurbished Technology", b: "Built for performance.\nTested for reliability." },
  { from: 5, to: 8, h: "Performance Restored", s: "Every core re-engineered", b: "" },
  { from: 9, to: 12, h: "Memory Upgraded", s: "Max RAM. Maximum possibilities.", b: "" },
  { from: 13, to: 16, h: "Lightning Fast Storage", s: "NVMe SSD. Zero wait time.", b: "" },
  { from: 17, to: 20, h: "Thermally Tested", s: "Runs cool under any load.", b: "" },
  { from: 21, to: 24, h: "Feels Brand New", s: "Certified. Warranted. Delivered.", b: "" },
];

function getScene(f: number) {
  return scenes.find((s) => f >= s.from && f <= s.to) ?? scenes[0];
}

interface Props { 
  onEnterStore: () => void 
}

export default function LandingIntro({ onEnterStore }: Props) {
  const isMobile = useIsMobile();
  const totalFrames = isMobile ? 23 : 24;

  /* ── React state for UI ──────────────────────── */
  const [frameNum, setFrameNum] = useState(1);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Refs for physics ────────────────────────── */
  const targetRef = useRef(0);
  const displayRef = useRef(0);
  const velRef = useRef(0);
  const lastFrame = useRef(0);
  const doneRef = useRef(false);
  const touchY = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const isLoadingRef = useRef(true);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  /* ── Canvas / image refs ─────────────────────────── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);

  /* ── Canvas draw ───────────────────────────────────── */
  const drawFrame = useCallback((n: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imgs.current[n - 1];
    if (!img) return;

    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !img.naturalWidth) return;

      // Quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isMobile ? "low" : "medium";

      const cw = canvas.width;
      const hRatio = cw / img.naturalWidth;
      
      // We fill width but might not fill height entirely, 
      // but to match the previous structure that centered the image cleanly:
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      
      // Clear background to white for the Light Theme
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, cw, ch);
      
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    img.complete && img.naturalWidth ? paint() : img.addEventListener("load", paint, { once: true });
  }, [isMobile]);

  /* ── Preload all frames ───────────────────────────── */
  useEffect(() => {
    const arr: HTMLImageElement[] = [];
    const getSrc = (n: number) => {
      return isMobile
        ? `/phone-frames/ezgif-frame-${String(n).padStart(3, "0")}.png`
        : `/frames/ezgif-frame-${String(n).padStart(3, "0")}.png`;
    };

    let count = 0;
    setLoadedCount(0);
    setIsLoading(true);
    const loadedSet = new Set<number>();

    const onImgLoad = async (index: number, img: HTMLImageElement) => {
      if (loadedSet.has(index)) return;

      try {
        if (img.decode) await img.decode();
      } catch (err) {}

      loadedSet.add(index);
      count++;
      setLoadedCount(count);

      if (count === totalFrames) {
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }

      if (index === 0) {
        drawFrame(1);
      }
    };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = getSrc(i);
      img.onload = () => onImgLoad(i - 1, img);
      img.onerror = () => onImgLoad(i - 1, img);
      if (img.complete && img.naturalWidth) {
        onImgLoad(i - 1, img);
      }
      arr.push(img);
    }
    imgs.current = arr;

    targetRef.current = 0;
    displayRef.current = 0;
    const currentIntFrame = clamp(Math.round(displayRef.current) + 1, 1, totalFrames);
    drawFrame(currentIntFrame);
  }, [isMobile, totalFrames, drawFrame]);

  /* ── Canvas resize ─────────────────────────────────── */
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      let dpr = window.devicePixelRatio || 1;
      if (isMobile && dpr > 1.25) dpr = 1.25;

      c.width = innerWidth * dpr;
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
      velRef.current *= FRICTION;
      targetRef.current = clamp(targetRef.current + velRef.current, 0, totalFrames - 1);
      
      const diff = targetRef.current - displayRef.current;
      displayRef.current += diff * (isMobile ? 0.15 : LERP_FACTOR);

      if (Math.abs(diff) < 0.001) displayRef.current = targetRef.current;

      const f = clamp(Math.round(displayRef.current) + 1, 1, totalFrames);

      if (f !== lastFrame.current) {
        lastFrame.current = f;
        drawFrame(f);
        if (!isMobile || f % 2 === 0 || f === 1 || f === totalFrames) {
          setFrameNum(f);
        }
      }

      // Transition immediately when we hit the last frame
      if (f === totalFrames && Math.abs(velRef.current) < 0.02 && Math.abs(diff) < 0.05 && !doneRef.current && !navigating) {
        doneRef.current = true;
        navigating = true;
        onEnterStore(); // NO CONTINUE BUTTON - Just directly load the store
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame, onEnterStore, isMobile, totalFrames]);

  /* ── Mouse Wheel ─────────────────────── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (isLoadingRef.current) return;
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      velRef.current += raw * SENSITIVITY;
    };
    addEventListener("wheel", onWheel, { passive: false });
    return () => removeEventListener("wheel", onWheel);
  }, []);

  /* ── Touch ────────────────────────────────────────── */
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (isLoadingRef.current) return;
      touchY.current = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (isLoadingRef.current) return;
      e.preventDefault();
      if (touchY.current === null) return;
      const dy = touchY.current - e.touches[0].clientY;
      touchY.current = e.touches[0].clientY;
      velRef.current += dy * (isMobile ? 0.09 : 0.045);
    };
    addEventListener("touchstart", onStart, { passive: true });
    addEventListener("touchmove", onMove, { passive: false });
    return () => {
      removeEventListener("touchstart", onStart);
      removeEventListener("touchmove", onMove);
    };
  }, [isMobile]);

  /* ── Keyboard ─────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isLoadingRef.current) return;
      const DOWN = ["ArrowDown", "ArrowRight", " ", "PageDown"];
      const UP = ["ArrowUp", "ArrowLeft", "PageUp"];
      if (DOWN.includes(e.key)) { e.preventDefault(); velRef.current += 2; }
      if (UP.includes(e.key)) { e.preventDefault(); velRef.current -= 2; }
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

  const progress = (frameNum - 1) / (totalFrames - 1);
  const scene = getScene(frameNum);
  const showHint = frameNum <= 2;

  /* Per-scene text opacity */
  const span = scene.to - scene.from;
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
        background: "#FFFFFF", // Premium Light Theme background
        userSelect: "none",
        zIndex: 10000,
      }}
    >
      {/* ── Loader overlay ────────────────────────── */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#FFFFFF",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Sora', sans-serif",
        opacity: isLoading ? 1 : 0,
        pointerEvents: isLoading ? "auto" : "none",
        transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{
          color: "#000",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: 24,
        }}>
          Loading Assembly
        </div>
        <div style={{
          width: 240, height: 4, background: "rgba(0,0,0,0.1)",
          borderRadius: 2, overflow: "hidden", margin: "0 auto 12px",
        }}>
          <div style={{
            height: "100%",
            width: `${Math.round((loadedCount / totalFrames) * 100)}%`,
            background: "#000",
            transition: "width 0.1s ease",
          }} />
        </div>
        <div style={{ color: "rgba(0,0,0,0.5)", fontSize: 13, fontWeight: 600 }}>
          {Math.round((loadedCount / totalFrames) * 100)}%
        </div>
      </div>

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

      {/* ── White Gradient Fade ───────────────────── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
        background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 60%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 5,
      }} />

      {/* ── Scene headline ────────────────────────── */}
      <div style={{
        position: "absolute", bottom: "11vh",
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
          color: "#000",
          margin: "0 0 12px",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          textShadow: "0 4px 40px rgba(255,255,255,0.8)",
        }}>
          {scene.h}
        </h1>
        {scene.s && (
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(15px, 2.2vw, 24px)",
            color: "#666", fontWeight: 600, margin: "0 0 8px",
          }}>
            {scene.s}
          </p>
        )}
        {scene.b && (
          <p style={{
            fontSize: "clamp(13px, 1.6vw, 18px)",
            color: "#999",
            lineHeight: 1.7, whiteSpace: "pre-line",
          }}>
            {scene.b}
          </p>
        )}
      </div>

      {/* ── Navbar ────────────────────────────────── */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 16px" : "0 32px", height: 64,
      }}>
        <div style={{
          fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: isMobile ? 16 : 20,
          letterSpacing: "-0.02em", color: "#000"
        }}>
          Laptopkart
        </div>

        <button
          onClick={onEnterStore}
          style={{
            background: "rgba(0,0,0,0.05)",
            color: "#000",
            border: "none",
            borderRadius: 100,
            padding: "8px 20px",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Sora', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#000"; 
            e.currentTarget.style.color = "#FFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.05)"; 
            e.currentTarget.style.color = "#000";
          }}
        >
          Home
        </button>
      </nav>

      {/* ── Scroll hint ───────────────────────────── */}
      {!isLoading && frameNum <= 5 && (
        <div style={{
          position: "absolute", bottom: "5vh", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10, textAlign: "center",
          animation: "floatHint 2s ease-in-out infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            color: "#000", fontSize: 11,
            fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: 6, fontWeight: 700
          }}>
            Scroll
          </div>
          <div style={{ color: "#000", fontSize: 20 }}>↓</div>
        </div>
      )}

      {/* ── Progress bar ──────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 4, background: "rgba(0,0,0,0.05)", zIndex: 20,
      }}>
        <div style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: "#000",
          transition: "width 0.05s linear",
        }} />
      </div>

      <style>{`
        @keyframes floatHint {
          0%,100%{ transform:translateX(-50%) translateY(0); }
          50%    { transform:translateX(-50%) translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
