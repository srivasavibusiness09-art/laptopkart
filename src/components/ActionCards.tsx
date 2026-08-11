"use client";

import { useState } from "react";
import { Sparkles, MessageSquareText, RefreshCw, Laptop, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/lib/hooks";
import RequestProductModal from "./RequestProductModal";

interface ActionCardsProps {
  setPage: (p: string) => void;
}

export default function ActionCards({ setPage }: ActionCardsProps) {
  const isMobile = useIsMobile();
  const [requestOpen, setRequestOpen] = useState(false);

  const cards = [
    {
      icon: <Sparkles size={22} />,
      title: "Smart Finder",
      subtitle: "Answer 4 quick questions and we'll match you with the perfect laptop.",
      cta: "Find My Laptop",
      bg: "linear-gradient(135deg, #0062FF 0%, #3B82F6 100%)",
      onClick: () => {
        document.getElementById("smart-finder-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    },
    {
      icon: <MessageSquareText size={22} />,
      title: "Tell Us What You Need",
      subtitle: "Can't find the exact model? Tell us and we'll source it for you.",
      cta: "Request a Product",
      bg: "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)",
      onClick: () => setRequestOpen(true),
    },
    {
      icon: <RefreshCw size={22} />,
      title: "Exchange Your Old Laptop",
      subtitle: "Get the best value for your old laptop when you upgrade to a new one.",
      cta: "Calculate Value",
      bg: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      onClick: () => setPage("resell"),
    },
    {
      icon: <Laptop size={22} />,
      title: "Brand New Laptops",
      subtitle: "Shop sealed, brand new laptops from top brands with full warranty.",
      cta: "Shop Brand New",
      bg: "linear-gradient(135deg, #0F172A 0%, #334155 100%)",
      onClick: () => setPage("listing"),
    },
  ];

  return (
    <>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "8px 18px 56px" : "16px 24px 72px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gap: isMobile ? 12 : 20,
        }}
      >
        {cards.map((card, i) => (
          <div
            key={card.title}
            onClick={card.onClick}
            style={{
              background: card.bg,
              borderRadius: 20,
              padding: isMobile ? "20px 16px" : "28px 24px",
              color: "#FFFFFF",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: isMobile ? 8 : 10,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s",
              animation: `fadeUp 0.5s ease ${i * 0.07}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(15, 23, 42, 0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(15, 23, 42, 0.12)";
            }}
          >
            <div
              style={{
                width: isMobile ? 38 : 44,
                height: isMobile ? 38 : 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: isMobile ? 2 : 6,
              }}
            >
              {card.icon}
            </div>
            <div
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: isMobile ? 15 : 17,
                letterSpacing: "-0.01em",
              }}
            >
              {card.title}
            </div>
            <div style={{ fontSize: isMobile ? 12 : 13, lineHeight: 1.5, opacity: 0.85, flex: 1 }}>
              {card.subtitle}
            </div>
            <div
              style={{
                marginTop: isMobile ? 4 : 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#FFFFFF",
                color: "#0F172A",
                fontWeight: 800,
                fontSize: isMobile ? 11 : 12,
                padding: isMobile ? "8px 14px" : "10px 16px",
                borderRadius: 100,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              {card.cta}
              <ArrowRight size={13} />
            </div>
          </div>
        ))}
      </div>
      <RequestProductModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}
