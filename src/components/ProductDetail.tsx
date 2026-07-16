"use client";

import { useState, useEffect } from "react";
import {
  Heart, ShoppingCart, Star, Shield, RefreshCw, Truck, BadgeCheck,
  Share2, ChevronLeft, ChevronRight, Zap, Tag, Info, Award,
  Cpu, Database, HardDrive, Monitor, Gamepad, Laptop, Battery, Scale, Camera,
} from "lucide-react";
import { COLORS } from "@/data/products";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { useIsMobile } from "@/lib/hooks";

interface Props {
  product: Product | null;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
  setPage: (p: string) => void;
  onViewProduct: (p: Product) => void;
  productsList: Product[];
  triggerAlert: (type: "success" | "warning" | "error", msg: string) => void;
}

const specIcons: Record<string, React.ReactNode> = {
  CPU: <Cpu size={16} style={{ color: COLORS.green }} />,
  RAM: <Database size={16} style={{ color: COLORS.green }} />,
  Storage: <HardDrive size={16} style={{ color: COLORS.green }} />,
  Display: <Monitor size={16} style={{ color: COLORS.green }} />,
  GPU: <Gamepad size={16} style={{ color: COLORS.green }} />,
  OS: <Laptop size={16} style={{ color: COLORS.green }} />,
  Battery: <Battery size={16} style={{ color: COLORS.green }} />,
  Weight: <Scale size={16} style={{ color: COLORS.green }} />,
  Camera: <Camera size={16} style={{ color: COLORS.green }} />,
};

export default function ProductDetail({ product, onAddToCart, onWishlist, wishlist, setPage, onViewProduct, productsList, triggerAlert }: Props) {
  const [tab, setTab] = useState<"specs" | "why" | "reviews">("specs");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const isMobile = useIsMobile();

  // RAM configuration options
  const ramOptions = product?.availableRams && product.availableRams.length > 0
    ? product.availableRams
    : (product?.ram ? product.ram.split(",").map(r => r.trim()).filter(Boolean) : []);

  const [selectedRam, setSelectedRam] = useState(ramOptions[0] || "8GB");

  // Storage configuration options
  const storageOptions = product?.availableStorages && product.availableStorages.length > 0
    ? product.availableStorages
    : (product?.storage ? product.storage.split(",").map(s => s.trim()).filter(Boolean) : []);

  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0] || "256GB SSD");

  const getAboutText = (name: string, brand: string, cat: string, isBrandNew?: boolean) => {
    if (isBrandNew) {
      return `The brand new ${name} is a high-performance ${cat.toLowerCase()} machine engineered by ${brand} for cutting-edge speed, reliability, and modern efficiency. Factory sealed in its original packaging, this device comes with a full direct manufacturer warranty, ensuring pristine condition, peak battery runtime, and absolute peace of mind.`;
    }
    return `The certified refurbished ${name} is a high-performance ${cat.toLowerCase()} machine engineered by ${brand} for reliability, speed, and comfort. Backed by our rigorous multi-point inspection, this device delivers commercial-grade utility, robust chassis durability, and smooth multitasking performance at a fraction of the cost of new hardware.`;
  };

  // Carousel & zoom states
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transform: "scale(1)",
    transformOrigin: "center",
  });

  const productImages = product?.images && product.images.length > 0
    ? product.images.slice(0, 5)
    : [
      product?.img || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80&auto=format&fit=crop",
    ];

  // Reset page state and scroll to top when user views a related product
  useEffect(() => {
    setQty(1);
    setTab("specs");
    setAdded(false);
    setActiveImgIdx(0);
    setIsHovered(false);
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center" });

    const options = product?.availableRams && product.availableRams.length > 0
      ? product.availableRams
      : (product?.ram ? product.ram.split(",").map(r => r.trim()).filter(Boolean) : []);
    setSelectedRam(options[0] || "8GB");

    const sOptions = product?.availableStorages && product.availableStorages.length > 0
      ? product.availableStorages
      : (product?.storage ? product.storage.split(",").map(s => s.trim()).filter(Boolean) : []);
    setSelectedStorage(sOptions[0] || "256GB SSD");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [product?.id]);

  // Auto-switch images every 4 seconds when user is not hovering
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveImgIdx((prev) => (prev + 1) % productImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, productImages.length]);

  if (!product) return null;

  const isWished = wishlist.includes(product.id);
  const related = productsList.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    const customizedProduct = {
      ...product,
      ram: selectedRam,
      storage: selectedStorage,
      specs: product.specs
        .replace(/(\d+\s*GB\s*RAM)/i, `${selectedRam} RAM`)
        .replace(/(\d+\s*GB\s*Memory)/i, `${selectedRam} Memory`)
        .replace(/(\d+\s*GB\s*SSD)/i, selectedStorage)
        .replace(/(\d+\s*TB\s*SSD)/i, selectedStorage),
    };
    for (let i = 0; i < qty; i++) onAddToCart(customizedProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      transform: "scale(1.8)",
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "center",
    });
  };

  const specs = [
    ["CPU", product.processor],
    ["RAM", selectedRam],
    ["Storage", selectedStorage],
    ["Specs Detail", product.specs
      .replace(/(\d+\s*GB\s*RAM)/i, `${selectedRam} RAM`)
      .replace(/(\d+\s*GB\s*Memory)/i, `${selectedRam} Memory`)
      .replace(/(\d+\s*GB\s*SSD)/i, selectedStorage)
      .replace(/(\d+\s*TB\s*SSD)/i, selectedStorage)],
    product.condition === "Brand New"
      ? ["Condition", "100% Brand New (Original Sealed Box)"]
      : ["Cosmetic Quality", `Grade ${product.grade} (Certified Refurbished)`],
    ["Warranty Period", product.condition === "Brand New" ? product.warranty : `${product.warranty} Hardware Coverage`],
    product.condition === "Brand New"
      ? ["Battery Health", "100% Capacity (Brand New Sealed)"]
      : ["Battery Health", "80%+ Guaranteed Capacity (Diagnostic Certified)"],
    product.condition === "Brand New"
      ? ["In the Box", "Laptop, OEM Power Adapter & Charging Cord, User Manuals"]
      : ["In the Box", "Laptop, Original Compatible Power Adapter, Certificate"],
    ["System Software", "Pre-installed Operating System configured"],
  ].filter(([, v]) => v);

  const trustBadges = [
    { icon: <Shield size={14} color={COLORS.green} />, text: product.warranty ?? "1 Year Warranty" },
    { icon: <RefreshCw size={14} color={COLORS.green} />, text: "7 Day Returns" },
    product.condition === "Brand New"
      ? { icon: <Zap size={14} color={COLORS.green} />, text: "Brand New" }
      : { icon: <BadgeCheck size={14} color={COLORS.green} />, text: "Grade " + product.grade },
  ];

  // --- Layout Blocks Defined as JSX Constants for Clean Conditional Reordering ---
  const galleryJSX = (
    <div style={{ position: "relative" }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          borderRadius: 24,
          overflow: "hidden",
          background: COLORS.background,
          border: `1px solid ${COLORS.cardBorder}`,
          aspectRatio: "4/3",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          cursor: "zoom-in",
        }}
      >
        <img
          src={productImages[activeImgIdx]}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.1s ease-out",
            ...zoomStyle,
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80";
          }}
        />
        <span style={{
          position: "absolute", top: 16, left: 16,
          background: "#EF4444", color: "#fff",
          fontSize: 11, fontWeight: 800, padding: "4px 12px",
          borderRadius: 100,
          zIndex: 3,
          pointerEvents: "none",
        }}>
          {product.discount}% OFF
        </span>
        <div style={{
          position: "absolute",
          inset: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.25s ease",
          pointerEvents: isHovered ? "auto" : "none",
          zIndex: 3,
        }}>
          <button
            onClick={handlePrevImage}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "rgba(13,17,23,0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(13,17,23,0.95)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(13,17,23,0.75)"}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextImage}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "rgba(13,17,23,0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(13,17,23,0.95)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(13,17,23,0.75)"}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div style={{
          position: "absolute", bottom: 16,
          left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 6, zIndex: 3,
          pointerEvents: "none",
        }}>
          {productImages.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: activeImgIdx === idx ? 18 : 6,
                height: 6,
                borderRadius: 100,
                background: activeImgIdx === idx ? COLORS.green : "rgba(255,255,255,0.4)",
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>
      </div>
      <div style={{
        display: "flex",
        gap: 10, marginTop: 14,
        justifyContent: "center",
      }}>
        {productImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImgIdx(idx)}
            style={{
              width: 64, height: 48, borderRadius: 10,
              overflow: "hidden", border: `2px solid ${activeImgIdx === idx ? COLORS.green : "transparent"}`,
              padding: 0, background: COLORS.background, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
    </div>
  );

  const trustBadgesJSX = (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8, marginTop: 16,
    }}>
      {trustBadges.map((b) => (
        <div key={b.text} style={{
          background: COLORS.background,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 12,
          padding: "10px 8px", textAlign: "center",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>{b.icon}</div>
          <div style={{ color: COLORS.muted, fontSize: 10, fontWeight: 500 }}>{b.text}</div>
        </div>
      ))}
    </div>
  );

  const aboutCardJSX = (
    <div style={{
      marginTop: 24,
      background: "rgba(255,255,255,0.01)",
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 20,
      padding: 24,
    }}>
      <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 15, fontWeight: 700, margin: "0 0 10px" }}>
        About this Laptop
      </h3>
      <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.65, margin: "0 0 16px" }}>
        {product.description || getAboutText(product.name, product.brand, product.category, product.condition === "Brand New")}
      </p>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14 }}>
        <div style={{ color: COLORS.text, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          {product.condition === "Brand New" ? "Sealed Box Contents:" : "Certified Box Contents:"}
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {(product.boxContents
            ? product.boxContents.split(",").map((s) => s.trim())
            : (product.condition === "Brand New" ? [
              "Original Sealed Brand New Laptop",
              "Official OEM Power Adapter & Charging Cable",
              "Manufacturer Warranty Guide & Manuals",
              "Original Retail Branding Box",
            ] : [
              "Refurbished Grade A+ Laptop",
              "OEM-Compatible Power Adapter & Cord",
              "Laptopkart Certification & Warranty Card",
              "Eco-Friendly Protective Packaging Box",
            ])
          ).map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.muted }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.green }} />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const productInfoJSX = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(56,189,248,0.08)",
          border: "1px solid rgba(56,189,248,0.2)",
          borderRadius: 100, padding: "4px 12px",
        }}>
          <Award size={11} color={COLORS.green} />
          <span style={{ color: COLORS.green, fontSize: 11, fontWeight: 700 }}>
            {product.badge}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
            <span style={{
              position: "absolute", width: "100%", height: "100%",
              borderRadius: "50%", background: "#10B981", opacity: 0.75,
              animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            }} />
            <span style={{
              position: "relative", borderRadius: "50%", width: 8, height: 8,
              background: "#10B981",
            }} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981", letterSpacing: "0.02em" }}>
            Live Shop Certified
          </span>
        </div>
      </div>
      <h1 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: "clamp(22px, 3vw, 36px)",
        fontWeight: 800,
        color: COLORS.text,
        letterSpacing: "-0.025em",
        lineHeight: 1.15,
        margin: "0 0 8px",
      }}>{product.name}</h1>
      <p style={{ color: COLORS.muted, fontSize: 14, margin: "0 0 18px", lineHeight: 1.7 }}>
        {product.specs}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} fill={s <= Math.floor(product.rating) ? "#F59E0B" : "transparent"} color={s <= Math.floor(product.rating) ? "#F59E0B" : "rgba(255,255,255,0.15)"} />
          ))}
        </div>
        <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{product.rating}</span>
        <span style={{ color: COLORS.muted, fontSize: 13 }}>({product.reviews} reviews)</span>
      </div>
      <div style={{
        background: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 18, padding: "22px 24px",
        marginBottom: 22,
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 8 }}>
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 40, fontWeight: 800,
            color: COLORS.text, letterSpacing: "-0.03em",
          }}>
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span style={{ color: COLORS.muted, fontSize: 16, textDecoration: "line-through", marginBottom: 6 }}>
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{
            background: "rgba(16,185,129,0.12)", color: "#10B981",
            fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
          }}>
            You save ₹{(product.mrp - product.price).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* RAM Selection Pills */}
      {ramOptions.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.05em" }}>
            Select Memory Configuration (RAM)
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ramOptions.map((ramOpt) => {
              const isSelected = selectedRam === ramOpt;
              return (
                <button
                  key={ramOpt}
                  onClick={() => setSelectedRam(ramOpt)}
                  style={{
                    background: isSelected ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${isSelected ? "#3B82F6" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12,
                    padding: "10px 18px",
                    color: isSelected ? "#3B82F6" : COLORS.text,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    fontFamily: "'Sora', sans-serif",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                    }
                  }}
                >
                  {ramOpt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Storage Selection Pills */}
      {storageOptions.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.05em" }}>
            Select Storage Configuration
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {storageOptions.map((storeOpt) => {
              const isSelected = selectedStorage === storeOpt;
              return (
                <button
                  key={storeOpt}
                  onClick={() => setSelectedStorage(storeOpt)}
                  style={{
                    background: isSelected ? "rgba(59, 130, 246, 0.08)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${isSelected ? "#3B82F6" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12,
                    padding: "10px 18px",
                    color: isSelected ? "#3B82F6" : COLORS.text,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    fontFamily: "'Sora', sans-serif",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                      e.currentTarget.style.background = "rgba(59, 130, 246, 0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                    }
                  }}
                >
                  {storeOpt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 14, overflow: "hidden",
          opacity: (product.stock !== undefined ? product.stock : 1) <= 0 ? 0.5 : 1,
          pointerEvents: (product.stock !== undefined ? product.stock : 1) <= 0 ? "none" : "auto",
        }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
            background: "transparent", border: "none", color: COLORS.text,
            width: 44, height: 48, cursor: "pointer", fontSize: 20,
          }}>−</button>
          <span style={{ color: COLORS.text, fontWeight: 700, width: 32, textAlign: "center" }}>{qty}</span>
          <button onClick={() => {
            const limit = product.stock !== undefined ? product.stock : 1;
            if (qty + 1 > limit) {
              triggerAlert("warning", `Sorry, only ${limit} unit(s) of this item are available in stock.`);
              return;
            }
            setQty(qty + 1);
          }} style={{
            background: "transparent", border: "none", color: COLORS.text,
            width: 44, height: 48, cursor: "pointer", fontSize: 20,
          }}>+</button>
        </div>
        <button
          onClick={handleAdd}
          disabled={(product.stock !== undefined ? product.stock : 1) <= 0}
          style={{
            flex: 1, minWidth: 180,
            background: (product.stock !== undefined ? product.stock : 1) <= 0
              ? "#2A354F"
              : added ? "#10B981" : "linear-gradient(135deg, #3B82F6, #38BDF8)",
            color: (product.stock !== undefined ? product.stock : 1) <= 0 ? COLORS.muted : "#000",
            border: "none", borderRadius: 14,
            height: 48, fontWeight: 800, fontSize: 15,
            cursor: (product.stock !== undefined ? product.stock : 1) <= 0 ? "not-allowed" : "pointer",
            fontFamily: "'Sora', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            transition: "all 0.25s ease",
            boxShadow: (product.stock !== undefined ? product.stock : 1) <= 0 ? "none" : "0 0 40px rgba(56,189,248,0.22)",
          }}
        >
          {(product.stock !== undefined ? product.stock : 1) <= 0 ? (
            "Out of Stock"
          ) : added ? (
            <><span>✓</span> Added!</>
          ) : (
            <><Zap size={15} /> Add to Cart</>
          )}
        </button>
        <button
          onClick={() => onWishlist(product.id)}
          style={{
            background: isWished ? "rgba(239,68,68,0.12)" : COLORS.cardBg,
            border: `1px solid ${isWished ? "rgba(239,68,68,0.3)" : COLORS.cardBorder}`,
            borderRadius: 14, width: 48, height: 48,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <Heart size={18} fill={isWished ? "#EF4444" : "transparent"} color={isWished ? "#EF4444" : COLORS.muted} />
        </button>
      </div>
      <button
        onClick={() => {
          for (let i = 0; i < qty; i++) {
            onAddToCart(product);
          }
          setPage("checkout");
        }}
        style={{
          width: "100%", background: "transparent",
          border: "1px solid rgba(255,255,255,0.12)",
          color: COLORS.text, borderRadius: 14, height: 48,
          fontWeight: 700, fontSize: 15, cursor: "pointer",
          fontFamily: "'Sora', sans-serif",
          transition: "border-color 0.2s",
          marginBottom: 22,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
      >
        Buy Now
      </button>
      <div style={{ marginTop: 24 }}>
        <div style={{
          display: "flex", gap: 0,
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          marginBottom: 20,
        }}>
          {(["specs", "why", "reviews"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "transparent", border: "none",
              borderBottom: `2px solid ${tab === t ? COLORS.green : "transparent"}`,
              color: tab === t ? COLORS.text : COLORS.muted,
              padding: "10px 18px", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
              textTransform: "capitalize",
              transition: "all 0.2s",
            }}>
              {t === "specs" ? "Specifications" : t === "why" ? "Why Buy?" : "Reviews"}
            </button>
          ))}
        </div>
        {tab === "specs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {specs.length > 0 ? specs.map(([key, val]) => (
              <div key={key} style={{
                display: "flex", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: `1px solid ${COLORS.cardBorder}`,
              }}>
                <span style={{ color: COLORS.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                  {specIcons[key] ?? "·"} {key}
                </span>
                <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600, maxWidth: "55%", textAlign: "right" }}>
                  {val as string}
                </span>
              </div>
            )) : (
              <p style={{ color: COLORS.muted, fontSize: 13 }}>{product.specs}</p>
            )}
          </div>
        )}
        {tab === "why" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(product.condition === "Brand New" ? [
              "100% Brand New, Sealed Box Packaging",
              "Full Manufacturer Warranty (Brand Direct)",
              "Factory Sealed Accessories & Charger included",
              "Genuine Windows/macOS operating system licensed",
              "Unused keyboard, screen, and battery cells",
              "Zero defects — 100% pristine condition",
            ] : [
              "Multi-point quality diagnostics completed",
              "Original parts — no fake components",
              "Full operating system restored & verified",
              "Battery cycle count checked & disclosed",
              "1 Year warranty with nationwide service",
              "7-day return if not satisfied",
            ]).map((item) => (
              <div key={item} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <BadgeCheck size={16} color={COLORS.green} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "reviews" && (
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 16, marginBottom: 20,
              padding: "16px 20px", background: COLORS.background,
              borderRadius: 16, border: `1px solid ${COLORS.cardBorder}`,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: COLORS.text, lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
                  {product.rating}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill="#FBBF24" color="#FBBF24" />
                  ))}
                </div>
                <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>{product.reviews} reviews</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main style={{ background: COLORS.darkBg, minHeight: "100vh" }}>
      {/* ── Breadcrumb ─────────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "16px 20px" : "20px 24px",
        display: "flex", gap: 6, alignItems: "center",
      }}>
        {[
          { label: "Home", page: "home" },
          { label: "Laptops", page: "listing" },
          { label: product.name, page: null },
        ].map((b, i) => (
          <span key={b.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <ChevronRight size={12} color="#333" />}
            <span
              onClick={b.page ? () => setPage(b.page!) : undefined}
              style={{
                color: b.page ? COLORS.muted : COLORS.text,
                fontSize: 13, cursor: b.page ? "pointer" : "default",
                fontWeight: b.page ? 400 : 600,
                maxWidth: i === 2 ? 200 : "auto",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >{b.label}</span>
          </span>
        ))}
      </div>

      {/* ── Main content ───────────────────────── */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* ── Main content ───────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: isMobile ? "0 20px 48px" : "0 24px 80px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 32 : 56,
        alignItems: "start",
      }}>
        {/* 1. Image Gallery */}
        <div style={{
          order: 1,
          gridColumn: isMobile ? "1" : "1",
          gridRow: isMobile ? "auto" : "1",
        }}>
          {galleryJSX}
        </div>

        {/* 2. Product Name, Price, Rating, Cart, Buy Now, Tabs */}
        <div style={{
          order: 2,
          gridColumn: isMobile ? "1" : "2",
          gridRow: isMobile ? "auto" : "1 / span 3",
        }}>
          {productInfoJSX}
        </div>

        {/* 3. About this Laptop Card */}
        <div style={{
          order: 3,
          gridColumn: isMobile ? "1" : "1",
          gridRow: isMobile ? "auto" : "3",
          marginTop: isMobile ? 0 : 24,
        }}>
          {aboutCardJSX}
        </div>

        {/* 4. Trust Badges row */}
        <div style={{
          order: 4,
          gridColumn: isMobile ? "1" : "1",
          gridRow: isMobile ? "auto" : "2",
          marginTop: isMobile ? 0 : 16,
        }}>
          {trustBadgesJSX}
        </div>
      </div>

      {/* ── Related products ──────────────────── */}
      <div style={{
        background: COLORS.background,
        borderTop: `1px solid ${COLORS.cardBorder}`,
        padding: isMobile ? "48px 18px" : "80px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(22px, 3vw, 36px)",
            fontWeight: 800, color: COLORS.text,
            letterSpacing: "-0.025em",
            margin: "0 0 32px",
          }}>You Might Also Like</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 18,
          }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onView={onViewProduct} onAddToCart={onAddToCart} onWishlist={onWishlist} wishlist={wishlist} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
