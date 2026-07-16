"use client";

import { useState } from "react";
import { Shield, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface FooterProps { setPage: (p: string) => void }

const shopLinks = ["Laptops", "Desktops", "MacBooks", "Gaming", "Accessories", "Offers"];
const companyLinks = ["About Us", "Blog", "Careers", "Press", "Partners"];
const supportLinks = ["Warranty", "Returns", "Contact", "FAQs", "Shipping", "Track Order"];

const social = [
  { icon: <FaFacebook size={14} />, label: "Facebook" },
  { icon: <FaInstagram size={14} />, label: "Instagram" },
  { icon: <FaXTwitter size={14} />, label: "X / Twitter" },
  { icon: <FaYoutube size={14} />, label: "YouTube" },
  { icon: <FaLinkedin size={14} />, label: "LinkedIn" },
];

export default function Footer({ setPage }: FooterProps) {
  const isMobile = useIsMobile();

  const getFooterLinkTarget = (link: string): string => {
    const l = link.toLowerCase().trim();
    if (l === "laptops") return "listing:Laptops";
    if (l === "desktops") return "listing:Desktops";
    if (l === "macbooks") return "listing:MacBooks";
    if (l === "gaming") return "listing:Gaming";
    if (l === "accessories") return "accessories";
    if (l === "about us" || l === "careers" || l === "press" || l === "partners") return "about";
    if (l === "blog") return "blog";
    if (l === "contact") return "contact";
    if (l === "track order") return "profile";
    if (l === "warranty" || l === "returns" || l === "faqs" || l === "shipping") return "why-refurbished";
    return "home";
  };

  const col = (title: string, links: string[]) => (
    <div>
      <div style={{
        color: COLORS.text, fontWeight: 700, fontSize: 13,
        marginBottom: 18, letterSpacing: "0.02em",
        fontFamily: "'Sora', sans-serif",
      }}>{title}</div>
      {links.map((link) => (
        <div
          key={link}
          onClick={() => setPage(getFooterLinkTarget(link))}
          style={{
            color: COLORS.muted, fontSize: 13, marginBottom: 10,
            cursor: "pointer", transition: "color 0.15s",
            display: "flex", alignItems: "center", gap: 4,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = COLORS.green; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = COLORS.muted; }}
        >
          {link}
        </div>
      ))}
    </div>
  );

  return (
    <footer style={{
      background: "#0a0f18",
      borderTop: "1px solid rgba(56,150,240,0.10)",
      padding: isMobile ? "48px 18px 24px" : "72px 40px 32px",
      marginTop: 0,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr 1.2fr",
          gap: isMobile ? 36 : 48,
          marginBottom: 48,
        }}>

          {/* Brand column */}
          <div>
            <div onClick={() => setPage("home")} style={{
              cursor: "pointer", marginBottom: 14,
              fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22,
              letterSpacing: "-0.02em",
            }}>
              <span style={{
                color: "transparent",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundImage: "linear-gradient(135deg, #38BDF8, #6366F1)",
              }}>Laptopkart</span>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
              India's most trusted refurbished laptop store. Best prices, best quality, backed by warranty.
            </p>
            {/* Contact info */}
            <div style={{ marginBottom: 20 }}>
              {[
                { icon: <Phone size={12} color={COLORS.green} />, text: "+91 97503 31313" },
                { icon: <Mail size={12} color={COLORS.green} />, text: "srivasavibusiness09@gmail.com" },
                { icon: <Clock size={12} color={COLORS.green} />, text: "Mon–Sat: 10AM – 7PM" },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  color: COLORS.muted, fontSize: 12, marginBottom: 8,
                }}>
                  {icon}{text}
                </div>
              ))}
            </div>
            {/* Social */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {social.map(({ icon, label }) => (
                <button key={label} aria-label={label} style={{
                  background: "rgba(56,150,240,0.06)",
                  border: "1px solid rgba(56,150,240,0.12)",
                  borderRadius: 8, width: 34, height: 34,
                  cursor: "pointer", color: COLORS.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.color = COLORS.green;
                    b.style.borderColor = "rgba(56,189,248,0.28)";
                    b.style.background = "rgba(56,150,240,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.color = COLORS.muted;
                    b.style.borderColor = "rgba(56,150,240,0.12)";
                    b.style.background = "rgba(56,150,240,0.06)";
                  }}
                >{icon}</button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {isMobile ? (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px 32px",
              width: "100%",
            }}>
              <div style={{ flex: "1 1 120px" }}>{col("Shop", shopLinks)}</div>
              <div style={{ flex: "1 1 120px" }}>{col("Company", companyLinks)}</div>
              <div style={{ flex: "1 1 120px" }}>{col("Support", supportLinks)}</div>
            </div>
          ) : (
            <>
              {col("Shop", shopLinks)}
              {col("Company", companyLinks)}
              {col("Support", supportLinks)}
            </>
          )}

          {/* Newsletter mini */}
          {!isMobile && (
            <div>
              <div style={{
                color: COLORS.text, fontWeight: 700, fontSize: 13,
                marginBottom: 12, fontFamily: "'Sora', sans-serif",
              }}>Stay Updated</div>
              <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                Get exclusive deals and tech news delivered to you.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  placeholder="Your email"
                  style={{
                    background: "rgba(56,150,240,0.06)",
                    border: "1px solid rgba(56,150,240,0.12)",
                    borderRadius: 8, padding: "10px 12px",
                    color: COLORS.text, fontSize: 13, outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(56,189,248,0.35)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(56,150,240,0.12)"; }}
                />
                <button style={{
                  background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000",
                  border: "none", borderRadius: 8,
                  padding: "10px 16px", fontWeight: 700,
                  fontSize: 13, cursor: "pointer",
                  fontFamily: "'Sora', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}>
                  Subscribe <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(56,150,240,0.08)",
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ color: COLORS.muted, fontSize: 12 }}>
              © 2026 Laptopkart. All Rights Reserved.
            </div>
            <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 500 }}>
              Developed by D²Dev
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms of Use", "Refund Policy"].map((l) => (
                <span key={l} style={{
                  color: COLORS.muted, fontSize: 12, cursor: "pointer",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = COLORS.text; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = COLORS.muted; }}
                >{l}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            {["VISA", "MC", "UPI", "COD"].map((p) => (
              <span key={p} style={{
                background: "rgba(56,150,240,0.06)",
                border: "1px solid rgba(56,150,240,0.12)",
                borderRadius: 6, padding: "4px 9px",
                color: COLORS.muted, fontSize: 10, fontWeight: 800,
                letterSpacing: "0.03em",
              }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
