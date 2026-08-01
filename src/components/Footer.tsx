"use client";

import { useState } from "react";
import { Shield, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FooterProps { setPage: (p: string) => void }

const shopLinks = ["Laptops", "Desktops", "MacBooks", "Gaming", "Accessories", "Offers"];
const companyLinks = ["About Us", "Blog", "Careers"];
const supportLinks = ["Warranty", "Returns", "Contact", "FAQs", "Shipping", "Track Order"];

const social = [
  { icon: <FaFacebook size={14} />, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61552204101896" },
  { icon: <FaInstagram size={14} />, label: "Instagram", href: "https://www.instagram.com/svbs_laptops/" },
  { icon: <FaLinkedin size={14} />, label: "LinkedIn", href: "https://www.linkedin.com/company/sri-vasavi-business-systems-salem/?originalSubdomain=in" },
  {
    icon: <span style={{ fontSize: 10, fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>iM</span>,
    label: "IndiaMart",
    href: "https://www.indiamart.com/srivasavi-business-systems/profile.html?srsltid=AfmBOorrv1vQ7krai6fcOQJ1QmPLGjGMZQeZ_Vk85Bcka_EYvlAl-fdh"
  },
];

export default function Footer({ setPage }: FooterProps) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setStatus("loading");
    setErrorMsg("");
    try {
      const subscriberId = cleanEmail.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
      await setDoc(doc(db, "subscribers", subscriberId), {
        email: cleanEmail,
        subscribedAt: new Date().toISOString()
      });
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      console.error("Footer subscribe failed:", err);
      setErrorMsg("Failed to subscribe.");
      setStatus("error");
    }
  };

  const getFooterLinkTarget = (link: string): string => {
    const l = link.toLowerCase().trim();
    if (l === "laptops") return "listing:Laptops";
    if (l === "desktops") return "listing:Desktops";
    if (l === "macbooks") return "listing:MacBooks";
    if (l === "gaming") return "listing:Gaming";
    if (l === "accessories") return "accessories";
    if (l === "about us" || l === "careers") return "about";
    if (l === "blog") return "blog";
    if (l === "contact") return "contact";
    if (l === "sell laptop" || l === "resell laptop") return "resell";
    if (l === "track order") return "profile";
    if (l === "warranty" || l === "returns" || l === "faqs" || l === "shipping") return "why-refurbished";
    return "home";
  };

  const col = (title: string, links: string[]) => (
    <div>
      <div style={{
        color: "var(--text)", fontWeight: 700, fontSize: 13,
        marginBottom: 18, letterSpacing: "0.02em",
        fontFamily: "'Sora', sans-serif",
      }}>{title}</div>
      {links.map((link) => (
        <div
          key={link}
          onClick={() => setPage(getFooterLinkTarget(link))}
          style={{
            color: "var(--text-2)", fontSize: 13, marginBottom: 10,
            cursor: "pointer", transition: "color 0.15s",
            display: "flex", alignItems: "center", gap: 4,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = COLORS.green; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = "var(--text-2)"; }}
        >
          {link}
        </div>
      ))}
    </div>
  );

  return (
    <footer style={{
      background: "var(--bg-footer)",
      borderTop: "1px solid var(--border)",
      padding: isMobile ? "32px 18px 20px" : "72px 40px 32px",
      marginTop: 0,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr 1.2fr",
          gap: isMobile ? 28 : 48,
          marginBottom: isMobile ? 28 : 48,
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
                backgroundImage: "linear-gradient(135deg, var(--accent), #6366F1)",
              }}>Laptopkart</span>
            </div>
            <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
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
                  color: "var(--text-2)", fontSize: 12, marginBottom: 8,
                }}>
                  {icon}{text}
                </div>
              ))}
            </div>
            {/* Social */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {social.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8, width: 34, height: 34,
                    cursor: "pointer", color: "var(--text-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLAnchorElement;
                    b.style.color = "var(--accent-2)";
                    b.style.borderColor = "var(--border-focus)";
                    b.style.background = "var(--bg-active)";
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLAnchorElement;
                    b.style.color = "var(--text-2)";
                    b.style.borderColor = "var(--border)";
                    b.style.background = "var(--bg)";
                  }}
                >{icon}</a>
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
                color: "var(--text)", fontWeight: 700, fontSize: 13,
                marginBottom: 12, fontFamily: "'Sora', sans-serif",
              }}>Stay Updated</div>
              <p style={{ color: "var(--text-2)", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                Get exclusive deals and tech news delivered to you.
              </p>
              <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8, padding: "10px 12px",
                    color: "var(--text)", fontSize: 13, outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{
                    background: "linear-gradient(135deg, var(--accent-2), var(--accent))", color: "var(--text-inverse)",
                    border: "none", borderRadius: 8,
                    padding: "10px 16px", fontWeight: 700,
                    fontSize: 13, cursor: "pointer",
                    fontFamily: "'Sora', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}
                >
                  {status === "loading" ? "Subscribing..." : <>Subscribe <ArrowRight size={13} /></>}
                </button>
                {status === "success" && (
                  <span style={{ color: COLORS.green, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                    Subscribed successfully!
                  </span>
                )}
                {status === "error" && (
                  <span style={{ color: "var(--error)", fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                    {errorMsg || "Failed to subscribe."}
                  </span>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ color: "var(--text-2)", fontSize: 12 }}>
              © 2026 Laptopkart. All Rights Reserved.
            </div>
            <div style={{ color: "var(--text-2)", fontSize: 11, fontWeight: 500 }}>
              Developed by <a href="https://www.d2devs.co.in/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-2)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; }}>D²Devs</a>
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", gap: 20 }}>
              {([
                ["Privacy Policy", "privacy-policy"],
                ["Terms of Use", "terms-of-use"],
                ["Refund Policy", "refund-policy"],
              ] as [string, string][]).map(([label, page]) => (
                <span key={label} onClick={() => setPage(page)} style={{
                  color: "var(--text-2)", fontSize: 12, cursor: "pointer",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "var(--text)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = "var(--text-2)"; }}
                >{label}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            {["VISA", "MC", "UPI"].map((p) => (
              <span key={p} style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 6, padding: "4px 9px",
                color: "var(--text-2)", fontSize: 10, fontWeight: 800,
                letterSpacing: "0.03em",
              }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
