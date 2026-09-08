import React, { useState } from "react";
import { useIsMobile } from "@/lib/hooks";

interface ClientTestimonialCardProps {
  quote?: string;
  authorName?: string;
  authorPosition?: string;
  companyLogoUrl?: string;
  authorImageUrl?: string;
}

export default function ClientTestimonialCard({
  quote,
  authorName,
  authorPosition,
  companyLogoUrl,
  authorImageUrl,
}: ClientTestimonialCardProps) {
  const isMobile = useIsMobile();
  const [imgError, setImgError] = useState(false);
  const showImage = !!authorImageUrl && !imgError;

  const initials = (authorName || "C")
    .split(" ")
    .map((w: string) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const photo = (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        overflow: "hidden",
        border: isMobile ? "3px solid #FFFFFF" : "6px solid #FFFFFF",
        boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
        background: "linear-gradient(135deg, #90E0D0, #48D6B8)",
      }}
    >
      {showImage ? (
        <img
          src={authorImageUrl}
          alt={authorName || "Client"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0B1115",
            fontWeight: 800,
            fontSize: isMobile ? 18 : 26,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #9F8DF6 0%, #7C6BF0 100%)",
        borderRadius: 20,
        padding: isMobile ? "34px 22px 30px" : "40px 60px 40px 40px",
        minHeight: isMobile ? "auto" : 220,
        display: "flex",
        alignItems: "center",
        boxShadow: "0 16px 40px rgba(159,141,246,0.28)",
        maxWidth: 800,
        margin: "40px auto",
        width: "100%",
      }}
    >
      {/* Decorative quote mark (watermark) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: isMobile ? 8 : 30,
          left: isMobile ? 10 : 22,
          fontSize: isMobile ? 96 : 130,
          lineHeight: 1,
          color: "rgba(144,224,208,0.85)",
          fontFamily: "Georgia, serif",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        “
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingLeft: isMobile ? 0 : 56,
          paddingRight: isMobile ? 0 : 140,
          marginTop: isMobile ? 30 : 0,
          flex: 1,
          minWidth: 0,
        }}
      >
        {quote && (
          <p
            style={{
              color: "#FFFFFF",
              fontSize: isMobile ? 16 : 20,
              lineHeight: 1.65,
              fontFamily: "Georgia, serif",
              margin: "0 0 22px 0",
            }}
          >
            {quote}
          </p>
        )}

        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 60, height: 60, flexShrink: 0 }}>{photo}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 15 }}>
                {authorName || "Verified Client"}
              </div>
              {authorPosition && (
                <div style={{ color: "#E4DCFA", fontSize: 13, marginTop: 2 }}>
                  {authorPosition}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 80, height: 80, flexShrink: 0 }}>{photo}</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 18 }}>
                {authorName || "Verified Client"}
              </div>
              {authorPosition && (
                <div style={{ color: "#E4DCFA", fontSize: 15, marginTop: 4 }}>
                  {authorPosition}
                </div>
              )}
            </div>
          </div>
        )}

        {companyLogoUrl && (
          <div style={{ marginTop: 18 }}>
            <img
              src={companyLogoUrl}
              alt="Company Logo"
              style={{
                height: 30,
                maxWidth: 160,
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}