"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const phone = "919750331313";

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const encodedText = encodeURIComponent(message.trim());
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setMessage("");
    setIsOpen(false);
  };

  const handleQuickQuestion = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, fontFamily: "'Inter', sans-serif" }}>
      {/* ── Chat Window ─────────────────────────── */}
      {isOpen && (
        <div style={{
          position: "absolute",
          bottom: 76,
          right: 0,
          width: 340,
          maxWidth: "calc(100vw - 48px)",
          background: "var(--bg-2)",
          border: "1px solid var(--border-hi)",
          borderRadius: 20,
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}>
          {/* Header */}
          <div style={{
            background: "#075E54",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#FFFFFF",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.424 2.5 1.134 3.471L6.5 17.5l2.164-.86c.928.536 2.004.832 3.15.832 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.767-5.766zm3.375 8.203c-.144.404-.737.732-1.029.773-.282.039-.638.043-1.037-.086-.243-.078-.553-.195-.935-.36-1.62-.7-2.658-2.346-2.738-2.455-.08-.109-.651-.866-.651-1.653 0-.786.412-1.173.559-1.324.148-.151.32-.189.426-.189h.305c.097 0 .227-.037.355.275.132.321.452 1.102.492 1.182.04.08.067.173.013.28-.054.107-.08.22-.16.314-.08.095-.168.213-.239.294-.08.09-.163.189-.07.35.093.16.413.682.885 1.103.608.543 1.12.71 1.279.79.16.08.254.067.35-.04.095-.107.412-.48.52-.643.109-.163.217-.136.365-.08.149.056.945.446 1.107.527.162.081.27.121.31.189.039.068.039.39-.105.794z"/>
                </svg>
                <span style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#4CAF50",
                  border: "2px solid #075E54",
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Laptopkart Support</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Typically replies instantly</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: "#FFFFFF", cursor: "pointer", padding: 4, display: "flex" }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div style={{
            flex: 1,
            maxHeight: 280,
            overflowY: "auto",
            padding: 20,
            background: "color-mix(in srgb, var(--bg-1) 90%, transparent)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
            {/* System Message */}
            <div style={{
              background: "var(--bg-active)",
              color: "var(--text-2)",
              fontSize: 11,
              padding: "6px 12px",
              borderRadius: 8,
              alignSelf: "center",
              textAlign: "center",
              maxWidth: "85%",
            }}>
              Direct encrypted WhatsApp session
            </div>

            {/* Agent Message */}
            <div style={{
              background: "var(--bg-3)",
              color: "var(--text)",
              fontSize: 13,
              padding: "12px 14px",
              borderRadius: "0 16px 16px 16px",
              alignSelf: "flex-start",
              maxWidth: "80%",
              lineHeight: 1.4,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}>
              Hi there! 👋 Welcome to Laptopkart.
            </div>

            <div style={{
              background: "var(--bg-3)",
              color: "var(--text)",
              fontSize: 13,
              padding: "12px 14px",
              borderRadius: "0 16px 16px 16px",
              alignSelf: "flex-start",
              maxWidth: "80%",
              lineHeight: 1.4,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}>
              How can we help you today? You can ask about our certified stock or warranty.
            </div>

            {/* Quick Suggestions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {[
                "Looking to buy a refurbished laptop",
                "I want to sell my old laptop",
                "Question about 1 year warranty details",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickQuestion(suggestion)}
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    color: "var(--accent-2)",
                    borderRadius: 12,
                    padding: "8px 12px",
                    fontSize: 12,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-active)";
                    e.currentTarget.style.borderColor = "var(--border-focus)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-2)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: 12,
              background: "var(--bg-2)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#25D366",
                color: "#FFFFFF",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* ── Float Button ───────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: isOpen ? "var(--bg-3)" : "#25D366",
          border: isOpen ? "1px solid var(--border-hi)" : "none",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(37, 211, 102, 0.35)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isOpen ? "rotate(90deg)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = "scale(1.06) translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(37, 211, 102, 0.45)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(37, 211, 102, 0.35)";
          }
        }}
      >
        {isOpen ? <X size={24} color="var(--text)" /> : <MessageSquare size={24} />}
      </button>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
