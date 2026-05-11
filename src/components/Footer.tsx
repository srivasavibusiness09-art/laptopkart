"use client";

import { Shield, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";

interface FooterProps { setPage: (page: string) => void }

const footerColumns = [
  { title: "Shop",    links: ["Laptops", "Desktops", "MacBooks", "Gaming", "Accessories", "Offers"] },
  { title: "Company", links: ["About Us", "Blog", "Careers", "Press", "Partners"] },
  { title: "Support", links: ["Warranty", "Returns", "Contact", "FAQs", "Shipping", "Track Order"] },
];

const socialIcons = [
  { icon: <FaFacebook size={16} />, label: "Facebook" },
  { icon: <FaInstagram size={16} />, label: "Instagram" },
  { icon: <FaXTwitter size={16} />, label: "Twitter / X" },
  { icon: <FaYoutube size={16} />, label: "YouTube" },
  { icon: <FaLinkedin size={16} />, label: "LinkedIn" },
];

const contactItems = [
  { icon: <Phone size={13} color={COLORS.green} />, text: "+91 99999 99999" },
  { icon: <Mail size={13} color={COLORS.green} />, text: "support@laptopkart.in" },
  { icon: <Clock size={13} color={COLORS.green} />, text: "Mon - Sat: 10AM - 7PM" },
];

export default function Footer({ setPage }: FooterProps) {
  const isMobile = useIsMobile();

  return (
    <footer style={{ background: "#070C14", borderTop: `1px solid ${COLORS.cardBorder}`, padding: isMobile ? "36px 16px 20px" : "56px 20px 24px", marginTop: 60 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr 1fr",
          gap: isMobile ? 32 : 40,
          marginBottom: 40,
        }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={24} color={COLORS.green} />
              <span style={{ color: COLORS.text }}>LAPTOP</span>
              <span style={{ color: COLORS.green }}>KART</span>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              India&apos;s most trusted refurbished laptop store. Best prices, best quality, backed by warranty.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {socialIcons.map(({ icon, label }) => (
                <button key={label} aria-label={label}
                  style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 8, width: 36, height: 36, cursor: "pointer", color: COLORS.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* On mobile: show all columns stacked; on desktop: side by side */}
          {isMobile ? (
            /* Mobile: 2-column links grid */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{col.title}</div>
                  {col.links.map((link) => (
                    <div key={link} onClick={() => setPage("home")} style={{ color: COLORS.muted, fontSize: 13, marginBottom: 8, cursor: "pointer" }}>{link}</div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            /* Desktop: separate column cells */
            <>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{col.title}</div>
                  {col.links.map((link) => (
                    <div key={link} onClick={() => setPage("home")}
                      style={{ color: COLORS.muted, fontSize: 14, marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = COLORS.green; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = COLORS.muted; }}>
                      <ArrowRight size={12} style={{ flexShrink: 0 }} />{link}
                    </div>
                  ))}
                </div>
              ))}

              {/* Contact column */}
              <div>
                <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Contact</div>
                {contactItems.map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.muted, fontSize: 13, marginBottom: 12 }}>
                    {icon}{text}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Mobile contact row */}
          {isMobile && (
            <div>
              <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Contact Us</div>
              {contactItems.map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.muted, fontSize: 13, marginBottom: 10 }}>
                  {icon}{text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${COLORS.cardBorder}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ color: COLORS.muted, fontSize: 13 }}>© 2024 LaptopKart. All Rights Reserved.</div>
          {!isMobile && (
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms", "Refund Policy"].map((l) => (
                <span key={l} style={{ color: COLORS.muted, fontSize: 13, cursor: "pointer" }}>{l}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {["VISA", "MC", "UPI", "EMI"].map((p) => (
              <span key={p} style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 6, padding: "4px 8px", color: COLORS.muted, fontSize: 11, fontWeight: 700 }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
