import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ClientTestimonialCard from "@/components/common/ClientTestimonialCard";
import { useIsMobile } from "@/lib/hooks";
import { ArrowLeft, Building2, Quote, ShieldCheck, Star } from "lucide-react";

interface ClientProfilePageProps {
  clientId: string;
  setPage: (page: string) => void;
}

const resolveAuthorImage = (t: any) =>
  (t && (t.authorImage || t.authorImageUrl || t.imageUrl || t.image)) || "";

export default function ClientProfilePage({ clientId, setPage }: ClientProfilePageProps) {
  const isMobile = useIsMobile();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchClient = async () => {
      try {
        const docRef = doc(db, "clients", clientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClient({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching client:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (loading) {
    return (
      <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 18 }}>Loading client details...</div>
      </main>
    );
  }

  if (error || !client) {
    return (
      <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Building2 size={44} color="rgba(56,189,248,0.3)" style={{ marginBottom: 16 }} />
        <h1 style={{ color: "var(--text)", fontSize: 24, marginBottom: 16 }}>Client Not Found</h1>
        <button
          onClick={() => setPage("home")}
          style={{
            background: "none", border: "none", color: "var(--accent)",
            textDecoration: "none", cursor: "pointer", fontSize: 16,
            display: "inline-flex", alignItems: "center", gap: 6
          }}
        >
          <ArrowLeft size={15} /> Back to Home
        </button>
      </main>
    );
  }

  const testimonial = client.testimonial || {};
  const authorImage = resolveAuthorImage(testimonial);
  const initials = (client.name || "?")
    .split(" ")
    .map((w: string) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hasTestimonialSection = !!testimonial.quote || !!authorImage || !!testimonial.authorName;

  return (
    <main style={{ display: "flex", flexDirection: "column", minHeight: "80vh" }}>
      <div style={{ flex: 1, padding: isMobile ? "40px 18px 60px" : "80px 40px 80px", maxWidth: 920, margin: "0 auto", width: "100%" }}>
        {/* Back button */}
        <button
          onClick={() => setPage("clients")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
            marginBottom: 36, fontSize: 14, fontWeight: 600
          }}
        >
          <ArrowLeft size={15} /> Back to Partners
        </button>

        {/* Client header */}
        <div style={{ display: "flex", gap: 22, alignItems: "center", marginBottom: 48, flexWrap: "wrap" }}>
          {client.logoUrl ? (
            <div style={{
              background: "#fff", borderRadius: 20,
              padding: "14px 22px", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
            }}>
              <img src={client.logoUrl} alt={client.name} style={{ height: isMobile ? 48 : 64, maxWidth: 180, objectFit: "contain" }} />
            </div>
          ) : (
            <div style={{
              width: isMobile ? 72 : 88, height: isMobile ? 72 : 88,
              borderRadius: 20, flexShrink: 0,
              background: "linear-gradient(135deg, #3B82F6, #38BDF8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#000", fontWeight: 800, fontSize: isMobile ? 24 : 30
            }}>
              {initials}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38BDF8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
              <ShieldCheck size={14} /> Trusted Partner
            </div>
            <h1 style={{ color: "var(--text)", fontSize: isMobile ? 30 : 44, fontWeight: 800, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.12, wordBreak: "break-word" }}>
              {client.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill="#FBBF24" color="#FBBF24" />
                ))}
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
                Trusted by our team
              </span>
            </div>
          </div>
        </div>

        {/* What We Delivered */}
        {client.deliverableDescription && (
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: "rgba(56,189,248,0.12)", color: "#38BDF8"
              }}>
                <Building2 size={16} />
              </span>
              <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 800, margin: 0 }}>
                What We Delivered
              </h2>
            </div>
            <div style={{
              color: "var(--text-muted)",
              fontSize: isMobile ? 15.5 : 16.5,
              lineHeight: 1.8,
              background: "var(--card-bg)",
              padding: isMobile ? "22px 18px" : 30,
              borderRadius: 18,
              border: "1px solid var(--border)",
              borderLeft: "3px solid #38BDF8"
            }}>
              {client.deliverableDescription.split('\n').map((line: string, i: number) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Client Experience */}
        {hasTestimonialSection && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, borderRadius: 9,
                background: "rgba(159,141,246,0.15)", color: "#9F8DF6"
              }}>
                <Quote size={16} />
              </span>
              <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 800, margin: 0 }}>
                Client Experience
              </h2>
            </div>
            <ClientTestimonialCard
              quote={testimonial.quote}
              authorName={testimonial.authorName}
              authorPosition={testimonial.authorPosition}
              authorImageUrl={authorImage}
            />
          </div>
        )}
      </div>
    </main>
  );
}