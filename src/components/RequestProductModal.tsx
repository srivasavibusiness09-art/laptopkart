"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { X, CheckCircle2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Button from "./common/Button";

interface RequestProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestProductModal({ isOpen, onClose }: RequestProductModalProps) {
  const [form, setForm] = useState({
    deviceType: "Laptop",
    brand: "",
    specs: "",
    budget: "",
    name: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme === "dark" ? "dark" : "light";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.specs || !form.budget) {
      return alert("Please fill all required fields.");
    }
    setLoading(true);

    try {
      await addDoc(collection(db, "product_requests"), {
        ...form,
        status: "Pending",
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting request: ", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "var(--bg-1)", border: "1px solid var(--border)",
    color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" as const,
    colorScheme,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div className="fade-in" style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 20, width: "100%", maxWidth: 540, padding: 32,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", position: "relative",
        maxHeight: "90vh", overflowY: "auto", colorScheme,
      }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--text-2)", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Request Received!</h2>
            <p style={{ color: "var(--text-2)", marginBottom: 24 }}>
              We have received your requirements. Our team will contact you shortly with the best options!
            </p>
            <Button variant="primary" onClick={onClose} style={{ padding: "10px 24px" }}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Request a Custom Product</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>
              Can't find exactly what you're looking for? Let us know your requirements and we'll source it for you.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Device Type</label>
                  <select
                    value={form.deviceType} onChange={e => setForm({ ...form, deviceType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Preferred Brand (Optional)</label>
                  <input
                    type="text" placeholder="e.g. Dell, HP, Apple"
                    value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Minimum Specifications</label>
                <input
                  type="text" placeholder="e.g. 16GB RAM, i5 10th Gen, 512GB SSD"
                  value={form.specs} onChange={e => setForm({ ...form, specs: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Budget Range</label>
                <input
                  type="text" placeholder="e.g. Under ₹30,000"
                  value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Name</label>
                  <input
                    type="text" placeholder="Your Name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Phone Number</label>
                  <input
                    type="tel" placeholder="Your Phone"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Email Address (Optional)</label>
                <input
                  type="email" placeholder="Your Email"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Additional Notes (Optional)</label>
                <textarea
                  placeholder="Any specific requirements for gaming, coding, editing, etc."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                />
              </div>

              <Button type="submit" variant="primary" style={{ marginTop: 8, padding: "14px 0", fontSize: 16 }} disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
