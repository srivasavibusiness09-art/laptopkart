"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import {
  GraduationCap, ArrowRight, Gift, Trophy, PenLine, BookOpen, TrendingUp,
  Crown, Medal, Award, CheckCircle2, Target, Sparkles
} from "lucide-react";
import Reveal from "./Reveal";

interface StudentHubPageProps {
  setPage: (p: string) => void;
  user: any;
  initialSection?: string | null;
}

interface LeaderboardEntry {
  email: string;
  name: string;
  articles: number;
  reads: number;
  photo?: string;
}

export default function StudentHubPage({ setPage, user, initialSection }: StudentHubPageProps) {
  const isMobile = useIsMobile();
  const [giveaway, setGiveaway] = useState<any>({});
  const [lastWinner, setLastWinner] = useState<any>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  /* ── Live countdown ── */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (giveaway.deadline) {
      timer = setInterval(() => {
        const distance = new Date(giveaway.deadline).getTime() - new Date().getTime();
        if (distance < 0) {
          clearInterval(timer);
          setTimeRemaining({ days: 0, hours: 0, mins: 0, secs: 0 });
        } else {
          setTimeRemaining({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            secs: Math.floor((distance % (1000 * 60)) / 1000),
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [giveaway.deadline]);

  /* ── Fetch hub data ── */
  useEffect(() => {
    async function fetchData() {
      try {
        const gwSnap = await getDoc(doc(db, "giveaway", "current"));
        if (gwSnap.exists()) setGiveaway(gwSnap.data());

        const winnerSnap = await getDoc(doc(db, "giveaway", "lastWinner"));
        if (winnerSnap.exists()) setLastWinner(winnerSnap.data());

        const blogsSnap = await getDocs(collection(db, "blogs"));
        const allBlogs: any[] = [];
        blogsSnap.forEach((d) => allBlogs.push({ id: d.id, ...d.data() }));

        const approved = allBlogs.filter((b) => b.approved !== false);
        setEntries(approved.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ));

        const byEmail: Record<string, LeaderboardEntry> = {};
        allBlogs.forEach((b) => {
          const email = (b.authorEmail || "").toLowerCase();
          if (!email) return;
          if (!byEmail[email]) {
            byEmail[email] = {
              email,
              name: b.authorName || b.author || email.split("@")[0],
              articles: 0,
              reads: 0,
              photo: b.authorPhoto || "",
            };
          }
          byEmail[email].articles += 1;
          byEmail[email].reads += (b.reads || 0);
        });

        const board = Object.values(byEmail).sort((a, b) =>
          b.reads !== a.reads ? b.reads - a.reads : b.articles - a.articles
        );
        setLeaderboard(board.slice(0, 10));
      } catch (error) {
        console.error("Student Hub load error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /* ── Scroll to requested section (footer links) ── */
  useEffect(() => {
    if (!initialSection) return;
    const t = setTimeout(() => {
      const el = document.getElementById(initialSection);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [initialSection, loading]);

  if (loading) {
    return (
      <div style={{ padding: isMobile ? "32px 18px" : "48px 24px", maxWidth: 1200, margin: "0 auto", minHeight: "60vh" }}>
        <div style={{ height: isMobile ? 400 : 480, borderRadius: 24, background: "rgba(255,255,255,0.03)", animation: "pulse 2s infinite" }} />
      </div>
    );
  }

  const gwTitle = giveaway.prizeTitle || "Next Giveaway Coming Soon";
  const gwImage = giveaway.prizeImage || "";
  const myEmail = user?.email?.toLowerCase() || "";
  const myRank = leaderboard.findIndex((e) => e.email === myEmail);

  const sectionTitle = (id: string, icon: React.ReactNode, title: string, sub: string) => (
    <div id={id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, scrollMarginTop: 120 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, rgba(0,98,255,0.18), rgba(56,189,248,0.18))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(0,98,255,0.3)" }}>
        {icon}
      </div>
      <div>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 20 : 26, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: "-0.01em" }}>
          {title}
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 13, margin: "2px 0 0" }}>{sub}</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: COLORS.darkBg, minHeight: "100vh" }}>
      {/* ── Hero Header ── */}
      <div style={{
        padding: isMobile ? "40px 18px 32px" : "72px 24px 48px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(0,98,255,0.14) 0%, transparent 60%), linear-gradient(180deg, rgba(0,98,255,0.06), transparent)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(135deg, #0062FF, #38BDF8)", width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,98,255,0.4)" }}>
              <GraduationCap size={28} color="#fff" />
            </div>
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 30 : 44, fontWeight: 800, color: COLORS.text, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            LAPTOPKART <span style={{ color: "#0062FF" }}>STUDENT HUB</span>
          </h1>
          <p style={{ color: COLORS.muted, fontSize: isMobile ? 14 : 16, margin: "0 auto 32px", maxWidth: 560 }}>
            Learn. Write. Win. Publish a tech blog, grow your reads, and win this week&apos;s giveaway prize.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("write-blog")}
              style={{ background: "#0062FF", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "transform 0.2s", boxShadow: "0 8px 20px rgba(0,98,255,0.35)", fontFamily: "'Sora', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              SUBMIT YOUR BLOG <ArrowRight size={16} />
            </button>
            <button
              onClick={() => document.getElementById("guidelines")?.scrollIntoView({ behavior: "smooth" })}
              style={{ background: "rgba(0,98,255,0.1)", color: "#38BDF8", border: "1px solid rgba(0,98,255,0.3)", borderRadius: 12, padding: "14px 28px", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Sora', sans-serif" }}
            >
              HOW IT WORKS
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "40px 18px" : "56px 24px" }}>
        {/* ── Current Giveaway ── */}
        <Reveal>
          {sectionTitle("giveaway", <Gift size={22} color="#0062FF" />, "This Week's Giveaway", "Write a blog before the deadline to enter")}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
            gap: 24,
            background: COLORS.cardBg,
            border: "1px solid rgba(0,98,255,0.2)",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }}>
            <div style={{ padding: isMobile ? 24 : 36, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
              <div>
                <span style={{ color: "#38BDF8", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                  Prize of the Week
                </span>
                <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: isMobile ? 26 : 34, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.15 }}>
                  {gwTitle}
                </h3>
                <p style={{ color: COLORS.muted, fontSize: 14, fontWeight: 500, margin: "0 0 24px" }}>
                  Publish one quality tech article, earn reads, and the top contributor takes it home.
                </p>
                <div style={{ display: "flex", gap: isMobile ? 8 : 12 }}>
                  {[
                    { label: "Days", value: timeRemaining.days },
                    { label: "Hrs", value: timeRemaining.hours },
                    { label: "Mins", value: timeRemaining.mins },
                    { label: "Secs", value: timeRemaining.secs },
                  ].map((t, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      <div style={{ background: "var(--bg-1)", minWidth: isMobile ? 46 : 56, height: isMobile ? 50 : 60, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                        <span style={{ color: COLORS.text, fontSize: isMobile ? 18 : 22, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{t.value.toString().padStart(2, "0")}</span>
                      </div>
                      <span style={{ color: COLORS.muted, fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginTop: 6, letterSpacing: "0.05em" }}>{t.label}</span>
                      {i < 3 && <span style={{ position: "absolute", right: -9, top: 16, color: COLORS.muted, fontWeight: 800 }}>:</span>}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setPage("write-blog")}
                style={{ background: "#0062FF", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", boxShadow: "0 8px 20px rgba(0,98,255,0.35)", fontFamily: "'Sora', sans-serif" }}
              >
                SUBMIT YOUR BLOG <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ position: "relative", background: "radial-gradient(ellipse at center, rgba(0,98,255,0.12) 0%, transparent 70%)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: isMobile ? 200 : 320 }}>
              {gwImage ? (
                <img src={gwImage} alt="Prize" style={{ width: "100%", height: "100%", maxHeight: 320, objectFit: "contain", mixBlendMode: "multiply", filter: "drop-shadow(-10px 20px 24px rgba(0,0,0,0.25))" }} />
              ) : (
                <Gift size={80} color="rgba(56,189,248,0.2)" />
              )}
              <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,98,255,0.12)", borderRadius: "50%", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={22} color="#38BDF8" />
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Leaderboard ── */}
        <Reveal delay={0.05}>
          <div style={{ marginTop: isMobile ? 56 : 72 }}>
            {sectionTitle("leaderboard", <Trophy size={22} color="#0062FF" />, "Leaderboard", "Top contributors this month by total reads")}
            <div style={{
              background: COLORS.cardBg,
              border: "1px solid var(--border)",
              borderRadius: 24,
              padding: isMobile ? 16 : 24,
              boxShadow: "0 16px 36px rgba(0,0,0,0.12)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => {
                    const isMe = entry.email === myEmail;
                    return (
                      <div key={entry.email} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: isMobile ? "12px 10px" : "14px 16px",
                        borderRadius: 14,
                        background: isMe ? "rgba(0,98,255,0.1)" : idx % 2 === 0 ? "var(--bg-hover)" : "transparent",
                        border: isMe ? "1px solid rgba(0,98,255,0.4)" : "1px solid transparent",
                      }}>
                        <span style={{ width: 32, textAlign: "center", flexShrink: 0 }}>
                          {idx === 0 ? <Crown size={22} color="#F59E0B" /> : idx === 1 ? <Medal size={22} color="#94A3B8" /> : idx === 2 ? <Medal size={22} color="#B45309" /> : <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: COLORS.muted }}>{idx + 1}</span>}
                        </span>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-1)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--border)" }}>
                          {entry.photo ? (
                            <img src={entry.photo} alt={entry.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.muted }}>{entry.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: COLORS.text, fontSize: 14, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {entry.name}
                            {isMe && <span style={{ background: "#0062FF", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 100 }}>YOU</span>}
                          </p>
                          <p style={{ color: COLORS.muted, fontSize: 11, margin: "2px 0 0" }}>
                            {entry.articles} article{entry.articles !== 1 ? "s" : ""} · {entry.reads.toLocaleString("en-IN")} reads
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#38BDF8", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                          <TrendingUp size={14} /> {entry.reads.toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 0", color: COLORS.muted }}>
                    <Trophy size={36} color={COLORS.muted} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>No contributors yet</p>
                    <p style={{ margin: 0, fontSize: 12 }}>Be the first to write a blog!</p>
                  </div>
                )}
              </div>
              {myRank >= 0 && (
                <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 14, background: "linear-gradient(135deg, rgba(0,98,255,0.12), rgba(56,189,248,0.08))", border: "1px solid rgba(0,98,255,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Award size={18} color="#38BDF8" />
                  <p style={{ color: COLORS.text, fontSize: 13, fontWeight: 700, margin: 0 }}>
                    You rank <span style={{ color: "#38BDF8" }}>#{myRank + 1}</span> of {leaderboard.length} contributors. Keep writing to climb higher!
                  </p>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── Past Winners ── */}
        <Reveal delay={0.05}>
          <div style={{ marginTop: isMobile ? 56 : 72 }}>
            {sectionTitle("past-winners", <Crown size={22} color="#0062FF" />, "Past Winners", "Celebrating our recent contest champions")}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr",
              gap: 24,
              background: COLORS.cardBg,
              border: "1px solid var(--border)",
              borderRadius: 24,
              padding: isMobile ? 24 : 32,
              alignItems: "center",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <div style={{ width: 110, height: 110, borderRadius: "50%", background: "linear-gradient(135deg, #0062FF, #38BDF8)", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {lastWinner.photo ? (
                      <img src={lastWinner.photo} alt="Winner" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--bg-1)" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "4px solid var(--bg-1)", background: "var(--bg-1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 36, fontWeight: 800, color: "#38BDF8" }}>{(lastWinner.name || "U").substring(0, 1)}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ position: "absolute", bottom: -6, right: -6, background: "#F59E0B", color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--bg-1)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                    <Trophy size={17} />
                  </div>
                </div>
                <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>
                  {lastWinner.name || "Rahul Verma"}
                </h4>
                <p style={{ color: COLORS.muted, fontSize: 12, margin: 0, fontWeight: 600 }}>
                  {lastWinner.city || "VIT, Chennai"} · Last Week&apos;s Winner
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ color: COLORS.text, fontSize: 18, fontWeight: 700, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                  &ldquo;{lastWinner.blogTitle || "10 AI Tools That Changed My College Life"}&rdquo;
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setPage("blog")}
                    style={{ background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Sora', sans-serif" }}
                  >
                    READ WINNING ARTICLE <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setPage("write-blog")}
                    style={{ background: "transparent", color: "#38BDF8", border: "1px solid rgba(0,98,255,0.3)", borderRadius: 10, padding: "11px 22px", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Sora', sans-serif" }}
                  >
                    <PenLine size={14} /> BE THE NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── How It Works ── */}
        <Reveal delay={0.05}>
          <div style={{ marginTop: isMobile ? 56 : 72 }}>
            {sectionTitle("guidelines", <Target size={22} color="#0062FF" />, "How It Works", "Three simple steps to win the weekly giveaway")}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
              {[
                { icon: <PenLine size={26} color="#0062FF" />, step: "STEP 1", title: "Write a Blog", desc: "Publish a genuinely helpful tech article on laptops, AI, gadgets, or college life." },
                { icon: <TrendingUp size={26} color="#0062FF" />, step: "STEP 2", title: "Get Reads", desc: "Share your article and grow your reads. Every read counts toward your rank." },
                { icon: <Trophy size={26} color="#0062FF" />, step: "STEP 3", title: "Win the Prize", desc: "The top contributor at the deadline wins this week's prize. New contest every week!" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: COLORS.cardBg,
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: isMobile ? 24 : 28,
                  textAlign: "center",
                  transition: "all 0.25s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,98,255,0.5)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ width: 60, height: 60, margin: "0 auto 16px", borderRadius: 18, background: "rgba(0,98,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,98,255,0.25)" }}>
                    {s.icon}
                  </div>
                  <span style={{ color: "#38BDF8", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.step}</span>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 18, fontWeight: 800, margin: "6px 0 8px" }}>{s.title}</h3>
                  <p style={{ color: COLORS.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,98,255,0.08)", border: "1px solid rgba(0,98,255,0.25)", borderRadius: 16, padding: "16px 20px" }}>
              <CheckCircle2 size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
              <p style={{ color: COLORS.muted, fontSize: 13, margin: 0 }}>
                Guidelines: Original content only · Min. 400 words · No AI-generated filler · Keep it helpful & plagiarism-free.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── Recent Contest Entries ── */}
        <Reveal delay={0.05}>
          <div style={{ marginTop: isMobile ? 56 : 72 }}>
            {sectionTitle("entries", <BookOpen size={22} color="#0062FF" />, "Recent Contest Entries", "Fresh articles from our student community")}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {entries.length > 0 ? (
                entries.slice(0, 6).map((post, idx) => (
                  <div key={post.id || idx} style={{ background: COLORS.cardBg, border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}
                    onClick={() => setPage(`blog-${post.id || idx}`)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,98,255,0.5)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
                  >
                    <div style={{ backgroundImage: `url(${post.coverUrl || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80"})`, backgroundSize: "cover", backgroundPosition: "center", height: 140, width: "100%" }} />
                    <div style={{ padding: 18 }}>
                      <span style={{ background: "rgba(0,98,255,0.12)", color: "#38BDF8", border: "1px solid rgba(0,98,255,0.25)", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 100, textTransform: "uppercase" }}>{post.cat || post.category || "Tech"}</span>
                      <h3 style={{ color: COLORS.text, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, lineHeight: 1.45, margin: "10px 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.title || "Untitled"}</h3>
                      <div style={{ color: COLORS.muted, fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <TrendingUp size={11} /> {(post.reads || 0).toLocaleString("en-IN")} reads
                        </span>
                        <span style={{ color: "#38BDF8", fontWeight: 700 }}>By {post.authorName || post.author || "Student"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: COLORS.muted, background: COLORS.cardBg, borderRadius: 20, border: "1px solid var(--border)" }}>
                  <BookOpen size={36} color={COLORS.muted} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <p style={{ margin: "0 0 16px", fontSize: 13 }}>No contest entries yet. Start the streak!</p>
                  <button onClick={() => setPage("write-blog")} style={{ background: "#0062FF", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                    WRITE FIRST BLOG
                  </button>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* ── CTA Banner ── */}
        <Reveal delay={0.05}>
          <div style={{
            marginTop: isMobile ? 56 : 72,
            borderRadius: 28,
            padding: isMobile ? "32px 24px" : "56px 48px",
            textAlign: "center",
            background: "linear-gradient(135deg, #0062FF, #0044B3)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -40, top: -40, opacity: 0.12 }}>
              <GraduationCap size={220} color="#fff" />
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
              Ready to win {gwTitle}?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: "0 auto 28px", maxWidth: 460 }}>
              Your next article could make you this week&apos;s champion. Write once, win weekly.
            </p>
            <button
              onClick={() => setPage("write-blog")}
              style={{ background: "#fff", color: "#0062FF", border: "none", borderRadius: 12, padding: "14px 30px", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Sora', sans-serif", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
            >
              WRITE YOUR BLOG NOW <ArrowRight size={16} />
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
