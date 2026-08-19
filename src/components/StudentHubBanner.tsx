"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useIsMobile } from "@/lib/hooks";
import { GraduationCap, ArrowRight, Gift, Trophy } from "lucide-react";
import Reveal from "./Reveal";

interface StudentHubBannerProps {
  setPage: (p: string) => void;
}

export default function StudentHubBanner({ setPage }: StudentHubBannerProps) {
  const isMobile = useIsMobile();
  const [giveaway, setGiveaway] = useState<any>({});
  const [lastWinner, setLastWinner] = useState<any>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time remaining calculator
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (giveaway.deadline) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(giveaway.deadline).getTime() - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeRemaining({ days: 0, hours: 0, mins: 0, secs: 0 });
        } else {
          setTimeRemaining({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            secs: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [giveaway.deadline]);

  useEffect(() => {
    async function fetchData() {
      try {
        const gwSnap = await getDoc(doc(db, "giveaway", "current"));
        if (gwSnap.exists()) setGiveaway(gwSnap.data());

        const winnerSnap = await getDoc(doc(db, "giveaway", "lastWinner"));
        if (winnerSnap.exists()) setLastWinner(winnerSnap.data());

        const blogsSnap = await getDocs(collection(db, "blogs"));
        const byEmail: Record<string, { email: string; name: string; articles: number; reads: number; photo: string }> = {};

        blogsSnap.forEach((doc) => {
          const b = doc.data();
          if (b.approved === false) return;
          const email = (b.authorEmail || "").toLowerCase();
          if (!email) return;
          if (!byEmail[email]) byEmail[email] = { email, name: b.authorName || b.author || email.split('@')[0], articles: 0, reads: 0, photo: b.authorPhoto || "" };
          byEmail[email].articles += 1;
          byEmail[email].reads += (b.reads || 0);
        });

        const sorted = Object.values(byEmail).sort((a, b) => b.reads !== a.reads ? b.reads - a.reads : b.articles - a.articles);
        setLeaderboard(sorted.slice(0, 3)); // Top 3
      } catch (error) {
        console.error("Error fetching Student Hub data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: isMobile ? "24px 18px" : "40px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ height: isMobile ? 600 : 380, borderRadius: 24, background: "rgba(255,255,255,0.03)", animation: "pulse 2s infinite" }} />
      </div>
    );
  }

  // Fallback defaults if no data
  const gwTitle = giveaway.prizeTitle || "Win a Bluetooth Neckband";
  const gwImage = giveaway.prizeImage || "https://m.media-amazon.com/images/I/51bAHez1bDL._AC_SL1500_.jpg";

  return (
    <section style={{ padding: isMobile ? "40px 18px" : "60px 24px", background: "var(--bg-2)" }}>
      <Reveal>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(135deg, #4F46E5, #3B82F6)", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)" }}>
              <GraduationCap size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                LAPTOPKART STUDENT HUB
              </h2>
              <p style={{ color: "var(--text-2)", fontSize: 13, margin: "2px 0 0", fontWeight: 600 }}>Learn. Write. Win.</p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.9fr 0.9fr",
            gap: 24,
            background: "rgba(255,255,255,0.01)",
            borderRadius: 24,
            padding: isMobile ? 16 : 24,
            border: "1px solid var(--border)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}>

            {/* Section 1: Giveaway */}
            <div style={{ background: "#ffffff", borderRadius: 20, padding: isMobile ? 24 : 32, position: "relative", overflow: "hidden", display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: 320, gap: 20 }}>
              
              {/* Left content: text and timer */}
              <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ color: "#4F46E5", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>This Week's Giveaway</span>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", color: "#111827", fontSize: isMobile ? 28 : 34, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.1, textTransform: "uppercase" }}>
                    {gwTitle}
                  </h3>
                  {giveaway.topic && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', padding: '6px 12px', borderRadius: 20, color: '#4F46E5', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                      Topic: {giveaway.topic}
                    </div>
                  )}
                  <p style={{ color: "#4B5563", fontSize: 14, fontWeight: 600, margin: "0 0 24px" }}>Write. Submit. Win.</p>
                  
                  {/* Timer */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
                    {[
                      { label: "Days", value: timeRemaining.days },
                      { label: "Hrs", value: timeRemaining.hours },
                      { label: "Mins", value: timeRemaining.mins },
                      { label: "Secs", value: timeRemaining.secs }
                    ].map((t, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                        <div style={{ background: "#F3F4F6", width: 46, height: 50, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E5E7EB" }}>
                          <span style={{ color: "#111827", fontSize: 20, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{t.value.toString().padStart(2, '0')}</span>
                        </div>
                        <span style={{ color: "#6B7280", fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginTop: 6, letterSpacing: "0.05em" }}>{t.label}</span>
                        {i < 3 && <span style={{ position: "absolute", right: -8, top: 16, color: "#9CA3AF", fontWeight: 800 }}>:</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setPage("write-blog")}
                    style={{ background: "#4F46E5", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "transform 0.2s", boxShadow: "0 8px 16px rgba(79, 70, 229, 0.3)", zIndex: 10, alignSelf: "flex-start" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    SUBMIT YOUR BLOG <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Right content: Image */}
              <div style={{ flex: isMobile ? "none" : 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, minHeight: isMobile ? 180 : 0 }}>
                <img src={gwImage} alt="Prize" style={{ width: "100%", height: "100%", maxHeight: 260, objectFit: "contain", mixBlendMode: "multiply", filter: "drop-shadow(-10px 20px 20px rgba(0,0,0,0.15))" }} />
              </div>

              {/* Gift Icon Top Right */}
              <div style={{ position: "absolute", right: 24, top: 24, background: "rgba(79, 70, 229, 0.1)", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <Gift size={20} color="#4F46E5" />
              </div>
            </div>

            {/* Section 2: Last Week's Winner */}
            <div style={{ background: "#ffffff", borderRadius: 20, padding: isMobile ? 24 : 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <span style={{ color: "#4F46E5", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 24 }}>Last Week's Winner</span>

              {lastWinner?.name ? (
                <>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #3B82F6)", padding: 4, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {lastWinner.photo ? (
                        <img src={lastWinner.photo} alt="Winner" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #fff" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid #fff", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 32, fontWeight: 800, color: "#9CA3AF" }}>{lastWinner.name.substring(0, 1).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ position: "absolute", bottom: -8, right: -8, background: "#F59E0B", color: "#fff", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                      <Trophy size={16} />
                    </div>
                  </div>

                  <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
                    {lastWinner.name}
                  </h4>
                  <p style={{ color: "#6B7280", fontSize: 12, margin: "0 0 24px", fontWeight: 600 }}>{lastWinner.city}</p>

                  <div style={{ flex: 1 }}>
                    <p 
                      onClick={() => lastWinner.blogId ? setPage(`blog-detail-${lastWinner.blogId}`) : setPage("blog")}
                      title="Read Winning Blog"
                      style={{ color: "#111827", fontSize: 16, fontWeight: 700, margin: "0 0 24px", fontStyle: "italic", lineHeight: 1.5, cursor: "pointer", textDecoration: "underline", textDecorationColor: "rgba(79, 70, 229, 0.4)" }}
                    >
                      "{lastWinner.blogTitle}"
                    </p>
                  </div>

                  <button
                    onClick={() => lastWinner.blogId ? setPage(`blog-detail-${lastWinner.blogId}`) : setPage("blog")}
                    style={{ background: "transparent", color: "#4F46E5", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "10px 0" }}
                  >
                    Read winning article <ArrowRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trophy size={36} color="#9CA3AF" />
                    </div>
                  </div>

                  <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
                    To Be Announced
                  </h4>
                  <p style={{ color: "#6B7280", fontSize: 12, margin: "0 0 24px", fontWeight: 600 }}>The next winner could be you!</p>

                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "#9CA3AF", fontSize: 14, fontWeight: 600, margin: "0 0 24px", lineHeight: 1.5 }}>
                      Submit your tech blog to enter the competition and win amazing prizes.
                    </p>
                  </div>

                  <button
                    onClick={() => setPage("write-blog")}
                    style={{ background: "transparent", color: "#4F46E5", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "10px 0" }}
                  >
                    Start writing now <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>

            {/* Section 3: Top Contributors */}
            <div style={{ background: "#ffffff", borderRadius: 20, padding: isMobile ? 24 : 32 }}>
              <span style={{ color: "#4F46E5", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 24, display: "block", textAlign: "center" }}>Top Contributors (This Month)</span>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {leaderboard.length > 0 ? (
                  leaderboard.map((user, idx) => (
                    <div key={user.email} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: idx === 0 ? "#4F46E5" : "#9CA3AF", width: 24, textAlign: "center" }}>{idx + 1}</span>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3F4F6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {user.photo ? (
                          <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#6B7280" }}>{user.name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#111827", fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>{user.name}</p>
                        <p style={{ color: "#6B7280", fontSize: 11, margin: 0, fontWeight: 600 }}>Articles: {user.articles} | Reads: {user.reads >= 1000 ? (user.reads / 1000).toFixed(1) + 'K' : user.reads}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map((_, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#9CA3AF", width: 24, textAlign: "center" }}>{idx + 1}</span>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#6B7280" }}>?</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ width: 100, height: 14, background: "#F3F4F6", borderRadius: 4, marginBottom: 6 }} />
                        <div style={{ width: 140, height: 10, background: "#F3F4F6", borderRadius: 4 }} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ textAlign: "center", marginTop: 28, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
                <button
                  onClick={() => setPage("blog")}
                  style={{ background: "transparent", color: "#4F46E5", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", width: "100%" }}
                >
                  VIEW LEADERBOARD <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </Reveal>
    </section>
  );
}
