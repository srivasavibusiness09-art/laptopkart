import React from "react";
import Card from "@/components/common/Card";
import { useIsMobile } from "@/lib/hooks";
import { ArrowLeft, ArrowRight, Building2, Quote, Star, UserRound } from "lucide-react";

interface ClientsPageProps {
  clients: any[];
  setPage: (page: string) => void;
}

export default function ClientsPage({ clients, setPage }: ClientsPageProps) {
  const isMobile = useIsMobile();

  const withTestimonial = clients.filter((c) => c.testimonial?.quote);

  const renderStars = () => (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={13} fill="#FBBF24" color="#FBBF24" />
      ))}
    </div>
  );

  return (
    <main style={{ display: "flex", flexDirection: "column", minHeight: "80vh" }}>
      <div style={{ flex: 1, padding: isMobile ? "40px 18px 60px" : "80px 40px 80px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* Back button */}
        <button
          onClick={() => setPage("home")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
            marginBottom: 36, fontSize: 14, fontWeight: 600,
            transition: "color 0.2s ease"
          }}
        >
          <ArrowLeft size={15} /> Back to Home
        </button>

        {/* Hero header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: "#38BDF8", fontSize: 12, fontWeight: 800,
              textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 18,
              background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.18)",
              padding: "8px 16px", borderRadius: 100
            }}
          >
            <Building2 size={14} /> Trusted By
          </div>
          <h1 style={{ color: "var(--text)", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, margin: "0 0 18px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Organizations That Trust{" "}
            <span style={{ background: "linear-gradient(135deg, #3B82F6, #38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Laptopkart
            </span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: isMobile ? 15 : 17, maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
            Empowering educational institutions, businesses and organizations with reliable,
            affordable refurbished technology solutions.
          </p>
        </div>

        {/* Stats band */}
        {clients.length > 0 && (
          <div style={{
            display: "flex", justifyContent: "center", gap: isMobile ? 12 : 28,
            marginBottom: 56, flexWrap: "wrap"
          }}>
            <div style={{
              textAlign: "center", padding: isMobile ? "18px 22px" : "24px 40px",
              background: "var(--card-bg)", border: "1px solid var(--border)",
              borderRadius: 18, minWidth: 130
            }}>
              <div style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                {clients.length}+
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                Partners
              </div>
            </div>
            <div style={{
              textAlign: "center", padding: isMobile ? "18px 22px" : "24px 40px",
              background: "var(--card-bg)", border: "1px solid var(--border)",
              borderRadius: 18, minWidth: 130
            }}>
              <div style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                {withTestimonial.length}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                Testimonials
              </div>
            </div>
            <div style={{
              textAlign: "center", padding: isMobile ? "18px 22px" : "24px 40px",
              background: "var(--card-bg)", border: "1px solid var(--border)",
              borderRadius: 18, minWidth: 130
            }}>
              <div style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                5.0
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                Avg. Rating
              </div>
            </div>
          </div>
        )}

        {/* Rich partner grid */}
        {clients.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 24
          }}>
            {clients.map((c, i) => {
              const initials = (c.name || "?")
                .split(" ")
                .map((w: string) => w.charAt(0))
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const hasTestimonial = c.testimonial?.quote;

              return (
                <div key={i} style={{ height: "100%" }}>
                  <Card
                    hoverable
                    onClick={() => setPage(`client:${c.id}`)}
                    style={{
                      height: "100%",
                      padding: 28,
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      display: "flex", flexDirection: "column",
                      cursor: "pointer"
                    }}
                  >
                    {/* Logo + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                      {c.logoUrl ? (
                        <div style={{
                          background: "#fff", borderRadius: 14,
                          padding: "10px 16px", border: "1px solid var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <img src={c.logoUrl} alt={c.name} style={{ height: 44, maxWidth: 110, objectFit: "contain" }} />
                        </div>
                      ) : (
                        <div style={{
                          width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                          background: "linear-gradient(135deg, #3B82F6, #38BDF8)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#000", fontWeight: 800, fontSize: 22
                        }}>
                          {initials}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ color: "var(--text)", margin: 0, fontSize: 17, fontWeight: 800, lineHeight: 1.3, wordBreak: "break-word" }}>
                          {c.name || "Partner"}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                          {renderStars()}
                        </div>
                      </div>
                    </div>

                    {/* Testimonial */}
                    {hasTestimonial ? (
                      <div style={{
                        color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.7,
                        background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                        borderRadius: 14, padding: "16px 18px",
                        position: "relative", marginBottom: 18, flex: 1
                      }}>
                        <Quote size={22} color="#38BDF8" fill="rgba(56,189,248,0.2)" style={{ position: "absolute", top: 12, right: 14, opacity: 0.5 }} />
                        <p style={{ margin: 0, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.7, paddingRight: 30 }}>
                          "{c.testimonial.quote}"
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                          {c.testimonial.authorImage ? (
                            <img src={c.testimonial.authorImage} alt={c.testimonial.authorName} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(56,189,248,0.4)" }} />
                          ) : (
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(56,189,248,0.15)", border: "2px solid rgba(56,189,248,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <UserRound size={16} color="#38BDF8" />
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13 }}>
                              {c.testimonial.authorName || "Verified Client"}
                            </div>
                            {c.testimonial.authorPosition && (
                              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                {c.testimonial.authorPosition}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}

                    {/* CTA */}
                    {c.deliverableDescription && (
                      <div
                        style={{
                          color: "#38BDF8", fontSize: 13, fontWeight: 700,
                          display: "inline-flex", alignItems: "center", gap: 5,
                          marginTop: hasTestimonial ? 0 : 16
                        }}
                      >
                        View Case Study
                        <ArrowRight size={14} style={{ transition: "transform 0.2s ease" }} />
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: "center", color: "var(--text-muted)", padding: "60px 24px",
            background: "var(--card-bg)", border: "1px dashed var(--border)",
            borderRadius: 24
          }}>
            <Building2 size={48} color="rgba(56,189,248,0.25)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: "var(--text)", marginBottom: 8, fontWeight: 700 }}>No Partners Yet</h3>
            <p style={{ margin: 0 }}>Check back soon as we onboard new trusted organizations.</p>
          </div>
        )}
      </div>
    </main>
  );
}