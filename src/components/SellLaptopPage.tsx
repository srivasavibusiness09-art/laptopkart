"use client";

import React, { useState } from "react";
import {
  Laptop,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Cpu,
  HardDrive,
  ShieldCheck,
  Tag,
  MapPin,
  User,
  Phone,
  Mail,
  IndianRupee,
  PackageCheck,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { COLORS } from "@/data/products";
import { useIsMobile } from "@/lib/hooks";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SellLaptopPageProps {
  setPage: (p: string) => void;
  user: any;
  triggerAlert?: (type: "success" | "warning" | "error", msg: string) => void;
}

export default function SellLaptopPage({ setPage, user, triggerAlert }: SellLaptopPageProps) {
  const isMobile = useIsMobile();

  // Form Fields State
  const [brand, setBrand] = useState("Dell");
  const [model, setModel] = useState("");
  const [processor, setProcessor] = useState("");
  const [ram, setRam] = useState("8 GB");
  const [storage, setStorage] = useState("512 GB SSD");
  const [gpu, setGpu] = useState("");
  const [condition, setCondition] = useState("Grade A (Good, minor cosmetic marks)");
  const [accessories, setAccessories] = useState<string[]>(["Original Charger"]);
  const [notes, setNotes] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");

  // Contact Info State
  const [name, setName] = useState(user?.displayName || user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Images & Uploading State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Accessories checkbox toggle helper
  const toggleAccessory = (acc: string) => {
    setAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  // Image Selection Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 5) {
      if (triggerAlert) triggerAlert("warning", "You can attach a maximum of 5 photos.");
      return;
    }

    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(newFiles);

    // Create object URLs for thumbnail previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  // Remove Selected Image
  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(updatedPreviews);
  };

  // Cloudinary Direct Uploader
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gdinjtg4";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cqy73qnu";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload photo to server.");
    }

    const data = await res.json();
    return data.secure_url;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!model.trim() || !processor.trim()) {
      if (triggerAlert) triggerAlert("warning", "Please fill in Model and Processor details.");
      return;
    }

    if (!name.trim() || !phone.trim() || !email.trim() || !city.trim()) {
      if (triggerAlert) triggerAlert("warning", "Please complete your contact details.");
      return;
    }

    setIsUploading(true);
    const uploadedImageUrls: string[] = [];

    try {
      // 1. Upload photos to Cloudinary if attached
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgressText(`Uploading laptop photo ${i + 1} of ${selectedFiles.length}...`);
          const url = await uploadImageToCloudinary(selectedFiles[i]);
          uploadedImageUrls.push(url);
        }
      }

      setUploadProgressText("Saving your request details...");

      // 2. Generate unique request ID
      const requestId = "REQ-" + Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Save payload to Firestore `sell_requests` collection
      const requestPayload = {
        requestId,
        createdAt: new Date().toISOString(),
        brand,
        model: model.trim(),
        processor: processor.trim(),
        ram,
        storage,
        gpu: gpu.trim() || "Integrated / Standard",
        condition,
        accessories,
        notes: notes.trim(),
        expectedPrice: Number(expectedPrice) || 0,
        images: uploadedImageUrls,
        userName: name.trim(),
        userPhone: phone.trim(),
        userEmail: email.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        userUid: user?.uid || null,
        status: "Pending Review"
      };

      await setDoc(doc(db, "sell_requests", requestId), requestPayload);

      // Trigger Push Notification to Admin (No emojis, per user request)
      try {
        await fetch("/api/send-admin-push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Resell Request",
            body: `${brand} ${model.trim()} submitted by ${name.trim()} for Rs. ${Number(expectedPrice) || 0}.`,
          }),
        });
      } catch (pushErr) {
        console.error("Failed to trigger admin push notification:", pushErr);
      }

      setSubmittedId(requestId);
      if (triggerAlert) triggerAlert("success", "Your laptop sell request has been submitted successfully!");
    } catch (err: any) {
      console.error("Failed to submit sell request:", err);
      if (triggerAlert) triggerAlert("error", err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const containerPadding = isMobile ? "24px 16px 64px" : "48px 24px 80px";
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: COLORS.background,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 12,
    padding: "12px 14px",
    color: COLORS.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: 8,
    display: "block",
  };

  return (
    <main style={{ background: COLORS.darkBg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: containerPadding, boxSizing: "border-box" }}>

        {/* Header Title */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 12 }}>
            <Laptop size={14} color="#38BDF8" />
            <span style={{ color: "#38BDF8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Instant Valuation & Trade-In
            </span>
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.text, margin: "0 0 10px 0" }}>
            Sell Your Old Laptop
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Fill in your laptop configuration, attach photos, and submit. Our team will review your device details in our admin portal.
          </p>
        </div>

        {/* Success State View */}
        {submittedId ? (
          <div className="fade-in" style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, padding: isMobile ? 24 : 48, textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <CheckCircle2 size={72} color={COLORS.green} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
              Request Received!
            </h2>
            <div style={{ display: "inline-block", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12, padding: "8px 16px", color: COLORS.green, fontWeight: 800, fontSize: 15, marginBottom: 20 }}>
              Reference ID: #{submittedId}
            </div>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              Your laptop configuration and photos have been successfully submitted to our team. We will inspect the details in our system and contact you shortly.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setPage("home")}
                style={{ background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}
              >
                Back to Home
              </button>
              <button
                onClick={() => {
                  setSubmittedId(null);
                  setSelectedFiles([]);
                  setFilePreviews([]);
                  setModel("");
                  setProcessor("");
                  setNotes("");
                  setExpectedPrice("");
                }}
                style={{ background: "transparent", border: `1px solid ${COLORS.cardBorder}`, color: COLORS.text, borderRadius: 12, padding: "14px 28px", fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}
              >
                Submit Another Laptop
              </button>
            </div>
          </div>
        ) : (

          /* Sell Request Form */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Section 1: Laptop Configurations */}
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, padding: isMobile ? 20 : 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                <Cpu size={20} color="#38BDF8" />
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: COLORS.text, margin: 0 }}>
                  1. Laptop Hardware Specifications
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

                <div>
                  <label style={labelStyle}>Brand</label>
                  <select value={brand} onChange={(e) => setBrand(e.target.value)} style={inputStyle}>
                    {["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "MSI", "Samsung", "Other"].map((b) => (
                      <option key={b} value={b} style={{ background: "#0d1117" }}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Model Name / Series *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ThinkPad T480 / MacBook Air M1"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Processor / CPU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Core i5 8th Gen / Ryzen 5 5500U"
                    value={processor}
                    onChange={(e) => setProcessor(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>RAM Capacity</label>
                  <select value={ram} onChange={(e) => setRam(e.target.value)} style={inputStyle}>
                    {["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"].map((r) => (
                      <option key={r} value={r} style={{ background: "#0d1117" }}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Storage Capacity</label>
                  <select value={storage} onChange={(e) => setStorage(e.target.value)} style={inputStyle}>
                    {["128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD", "1 TB HDD", "500 GB HDD", "Other"].map((s) => (
                      <option key={s} value={s} style={{ background: "#0d1117" }}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Graphics / GPU (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. NVIDIA GTX 1650 / Integrated"
                    value={gpu}
                    onChange={(e) => setGpu(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                  <label style={labelStyle}>Physical Condition Grade</label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} style={inputStyle}>
                    <option value="Grade A+ (Like New, no scratches)" style={{ background: "#0d1117" }}>Grade A+ (Like New, pristine state)</option>
                    <option value="Grade A (Good, minor cosmetic marks)" style={{ background: "#0d1117" }}>Grade A (Good condition, light scratches)</option>
                    <option value="Grade B (Noticeable scratches / wear)" style={{ background: "#0d1117" }}>Grade B (Visible wear/dents, working)</option>
                    <option value="Defective / Screen Damage / Faulty" style={{ background: "#0d1117" }}>Defective / Faulty / Broken Screen</option>
                  </select>
                </div>

                <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                  <label style={labelStyle}>Included Accessories</label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
                    {["Original Charger", "Original Box", "Purchase Bill / Invoice"].map((acc) => {
                      const isChecked = accessories.includes(acc);
                      return (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => toggleAccessory(acc)}
                          style={{
                            background: isChecked ? "rgba(56,189,248,0.12)" : COLORS.background,
                            border: `1px solid ${isChecked ? "rgba(56,189,248,0.3)" : COLORS.cardBorder}`,
                            color: isChecked ? "#38BDF8" : COLORS.muted,
                            borderRadius: 10,
                            padding: "8px 14px",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {isChecked ? "✓ " : "+ "}{acc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
                  <label style={labelStyle}>Battery Health & Fault Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Mention battery backup duration, body scratches, screen dead pixels, or any known issues..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Your Expected Selling Price (₹)</label>
                  <div style={{ position: "relative" }}>
                    <IndianRupee size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: COLORS.muted }} />
                    <input
                      type="numberic"
                      placeholder="e.g. 18000"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 38 }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Section 2: Photo Attachments */}
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, padding: isMobile ? 20 : 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <ImageIcon size={20} color="#38BDF8" />
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: COLORS.text, margin: 0 }}>
                  2. Upload Laptop Photos (Max 5 Photos)
                </h2>
              </div>
              <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>
                Attach clear photos of your laptop (front view, keyboard/screen, back, ports, or scratches). These images will be sent directly to our admin team for valuation.
              </p>

              {/* Upload Box */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                />
                <div style={{
                  border: "2px dashed rgba(56,189,248,0.25)",
                  borderRadius: 16,
                  padding: "28px 20px",
                  textAlign: "center",
                  background: "rgba(56,189,248,0.03)",
                  transition: "all 0.2s"
                }}>
                  <Upload size={32} color="#38BDF8" style={{ marginBottom: 8 }} />
                  <div style={{ color: COLORS.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    Click or Drag Photos Here to Upload
                  </div>
                  <div style={{ color: COLORS.muted, fontSize: 12 }}>
                    Supports PNG, JPG, JPEG, WEBP (Max 5 photos)
                  </div>
                </div>
              </div>

              {/* Image Previews Grid */}
              {filePreviews.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 14 }}>
                  {filePreviews.map((src, index) => (
                    <div key={index} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1/1", border: `1px solid ${COLORS.cardBorder}` }}>
                      <img src={src} alt={`Laptop photo ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: "absolute", top: 6, right: 6,
                          background: "rgba(0,0,0,0.75)", color: "#EF4444",
                          border: "none", borderRadius: "50%", width: 24, height: 24,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer"
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Contact Info */}
            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 24, padding: isMobile ? 20 : 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                <User size={20} color="#38BDF8" />
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: COLORS.text, margin: 0 }}>
                  3. Contact Information
                </h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 600001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              style={{
                background: "linear-gradient(135deg, #3B82F6, #38BDF8)",
                color: "#000",
                border: "none",
                borderRadius: 16,
                padding: "16px 32px",
                fontSize: 16,
                fontWeight: 800,
                cursor: isUploading ? "not-allowed" : "pointer",
                fontFamily: "'Sora', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 10px 30px rgba(56,189,248,0.25)",
                transition: "all 0.2s"
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{uploadProgressText || "Uploading..."}</span>
                </>
              ) : (
                <>
                  <PackageCheck size={20} />
                  <span>Submit Laptop Sell Request</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}
