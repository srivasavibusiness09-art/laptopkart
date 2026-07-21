"use client";

import { useState, useEffect } from "react";
import { COLORS, products, accessoriesList, initialBanners } from "@/data/products";
import type { Product } from "@/data/products";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import LandingPage from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Homepage from "@/components/Homepage";
import ProductListing from "@/components/ProductListing";
import ProductDetail from "@/components/ProductDetail";
import CartPage from "@/components/CartPage";
import CheckoutPage from "@/components/CheckoutPage";
import WishlistPage from "@/components/WishlistPage";
import ProfilePage from "@/components/ProfilePage";
import SellLaptopPage from "@/components/SellLaptopPage";
import {
  ComparePage,
  AboutPage,
  BlogPage,
  ContactPage,
  LoginPage,
  WhyRefurbishedPage,
  WriteBlogPage,
  BlogDetail,
  AccessoriesPage,
  PrivacyPolicyPage,
  RefundPolicyPage,
  TermsOfUsePage,
} from "@/components/OtherPages";

import { BadgeCheck, Heart, Shield, Star } from "lucide-react";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CartItem extends Product {
  qty: number;
}

function AccessoryDetailPage({
  accessory,
  setPage,
  onAddToCart,
  onWishlist,
  wishlist,
}: {
  accessory: any | null;
  setPage: (p: string) => void;
  onAddToCart: (p: any) => void;
  onWishlist: (id: number) => void;
  wishlist: number[];
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!accessory) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "32px 14px" : "64px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", color: COLORS.text, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          Accessory not found
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 20 }}>Please go back to the accessories catalog and try again.</p>
        <button
          onClick={() => setPage("accessories")}
          style={{ background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 800, cursor: "pointer" }}
        >
          Back to Accessories
        </button>
      </div>
    );
  }

  const isWished = wishlist.includes(accessory.id);
  const savings = accessory.mrp - accessory.price;

  return (
    <main style={{ background: COLORS.darkBg, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: isMobile ? "16px 18px 44px" : "24px 24px 72px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => setPage("accessories")}
            style={{ background: "transparent", border: `1px solid ${COLORS.cardBorder}`, color: COLORS.muted, borderRadius: 100, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
          >
            ← Accessories
          </button>
          <span style={{ color: COLORS.muted, fontSize: 12 }}>Accessories</span>
          <span style={{ color: COLORS.muted, fontSize: 12 }}>/</span>
          <span style={{ color: COLORS.text, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 420 }}>
            {accessory.name}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 44, alignItems: "start" }}>
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 24, overflow: "hidden", background: COLORS.background, border: `1px solid ${COLORS.cardBorder}`, aspectRatio: "4/3" }}>
              <img src={accessory.img} alt={accessory.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(56,189,248,0.08)", color: COLORS.green, border: "1px solid rgba(56,189,248,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>
                {accessory.brand}
              </span>
              <span style={{ background: "rgba(16,185,129,0.10)", color: "#10B981", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>
                {accessory.category}
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Accessory Detail
              </span>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>Small, clean, same-store design</span>
            </div>

            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: isMobile ? 26 : 38, fontWeight: 800, color: COLORS.text, lineHeight: 1.12, margin: "0 0 10px" }}>
              {accessory.name}
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>
              {accessory.specs}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= Math.floor(accessory.rating) ? "#FBBF24" : "transparent"} color={s <= Math.floor(accessory.rating) ? "#FBBF24" : "rgba(255,255,255,0.15)"} />
                ))}
              </div>
              <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{accessory.rating}</span>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>({accessory.reviews} reviews)</span>
            </div>

            <div style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 18, padding: "18px 20px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>
                  ₹{accessory.price.toLocaleString("en-IN")}
                </span>
                <span style={{ color: COLORS.muted, fontSize: 15, textDecoration: "line-through", marginBottom: 4 }}>
                  ₹{accessory.mrp.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 100 }}>
                  You save ₹{savings.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <BadgeCheck size={16} color={COLORS.green} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>Verified accessory with matching quality checks and clean retail presentation.</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Shield size={16} color={COLORS.green} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>Compatible for work, home, or mobile setups depending on the product category.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
              <button
                onClick={() => onAddToCart(accessory)}
                style={{ background: "linear-gradient(135deg, #3B82F6, #38BDF8)", color: "#000", border: "none", borderRadius: 14, padding: "12px 18px", fontWeight: 800, cursor: "pointer", minWidth: 160, fontFamily: "'Sora', sans-serif" }}
              >
                Add to Cart
              </button>
              <button
                onClick={() => onWishlist(accessory.id)}
                style={{ background: isWished ? "rgba(239,68,68,0.12)" : COLORS.cardBg, color: isWished ? "#EF4444" : COLORS.text, border: `1px solid ${isWished ? "rgba(239,68,68,0.3)" : COLORS.cardBorder}`, borderRadius: 14, padding: "12px 18px", fontWeight: 700, cursor: "pointer", minWidth: 160, fontFamily: "'Sora', sans-serif" }}
              >
                <Heart size={14} fill={isWished ? "#EF4444" : "transparent"} style={{ display: "inline", marginRight: 8 }} />
                {isWished ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 18, padding: 18 }}>
              <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Key Specs
              </div>
              <div style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.7 }}>{accessory.specs}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  /* Show landing intro first; after user enters store, show main app */
  const [showLanding, setShowLanding] = useState(true);
  const [page, setPage] = useState("home");
  const [listingCategory, setListingCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [viewAccessory, setViewAccessory] = useState<any | null>(null);

  /* Dynamic Admin Data States (hydrated from Firestore) */
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [accessories, setAccessories] = useState<any[]>(accessoriesList);
  const [banners, setBanners] = useState<any[]>(initialBanners);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);

  const [storeAlert, setStoreAlert] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);

  const triggerStoreAlert = (type: "success" | "warning" | "error", message: string) => {
    setStoreAlert({ type, message });
    setTimeout(() => {
      setStoreAlert((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  /* Track whether Firestore has responded at least once */
  const [firestoreReady, setFirestoreReady] = useState(false);

  // Sync state with Firestore on client mount
  useEffect(() => {
    let productsReady = false;
    let accessoriesReady = false;
    let bannersReady = false;

    const checkAllReady = () => {
      if (productsReady && accessoriesReady && bannersReady) {
        setFirestoreReady(true);
      }
    };

    // 1. Subscribe to Products
    const productsQuery = query(collection(db, "products"));
    const unsubscribeProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id as any, ...doc.data() } as Product);
        });
        setProductsList(list);
        console.log(`[Firestore] ✅ Products loaded: ${list.length} items`);
        productsReady = true;
        checkAllReady();
      },
      (error) => {
        console.error("[Firestore] ❌ Products read failed:", error.code, error.message);
        setProductsList(products); // safe static fallback on error
        productsReady = true;
        checkAllReady();
      }
    );

    // 2. Subscribe to Accessories
    const accessoriesQuery = query(collection(db, "accessories"));
    const unsubscribeAccessories = onSnapshot(
      accessoriesQuery,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id as any, ...doc.data() });
        });
        setAccessories(list);
        console.log(`[Firestore] ✅ Accessories loaded: ${list.length} items`);
        accessoriesReady = true;
        checkAllReady();
      },
      (error) => {
        console.error("[Firestore] ❌ Accessories read failed:", error.code, error.message);
        setAccessories(accessoriesList); // safe static fallback on error
        accessoriesReady = true;
        checkAllReady();
      }
    );

    // 3. Subscribe to Banners
    const bannersQuery = query(collection(db, "banners"));
    const unsubscribeBanners = onSnapshot(
      bannersQuery,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        setBanners(list);
        console.log(`[Firestore] ✅ Banners loaded: ${list.length} items`);
        bannersReady = true;
        checkAllReady();
      },
      (error) => {
        console.error("[Firestore] ❌ Banners read failed:", error.code, error.message);
        setBanners(initialBanners); // safe static fallback on error
        bannersReady = true;
        checkAllReady();
      }
    );

    // 4. Subscribe to Reviews
    const reviewsQuery = query(collection(db, "reviews"));
    const unsubscribeReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Sort by date (descending)
        list.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setCustomerReviews(list);
        console.log(`[Firestore] ✅ Reviews loaded: ${list.length} items`);
      },
      (error) => {
        console.error("[Firestore] ❌ Reviews read failed:", error.code, error.message);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeAccessories();
      unsubscribeBanners();
      unsubscribeReviews();
    };
  }, []);

  const handleNavigate = (pageStr: string) => {
    let targetPage = pageStr;
    if (pageStr.startsWith("listing:")) {
      const cat = pageStr.split(":")[1];
      setListingCategory(cat);
      targetPage = "listing";
    } else {
      if (pageStr === "listing") {
        setListingCategory("All");
      } else {
        setSearchQuery("");
      }
    }

    setPage(targetPage);
    if (typeof window !== "undefined") {
      if (window.history.state?.page !== targetPage) {
        window.history.pushState({ page: targetPage }, "", `#${targetPage}`);
      }
    }
  };

  // Sync state with Popstate events (Browser Back / Forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setPage(event.state.page);
      } else {
        setPage("home");
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("popstate", handlePopState);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("popstate", handlePopState);
      }
    };
  }, []);

  /* Global authentication states */
  const [user, setUser] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [statusNotification, setStatusNotification] = useState<any>(null);

  // Sync and persist Firebase Auth session state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for order status updates to show floating toast notifications to client
  useEffect(() => {
    if (!user?.email) return;

    const prevStatuses: Record<string, string> = {};

    const q = query(
      collection(db, "orders"),
      where("email", "==", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const orderData = change.doc.data();
        const orderId = orderData.orderId;
        const newStatus = orderData.status || "Pending";
        const oldStatus = prevStatuses[orderId];

        if (change.type === "added") {
          prevStatuses[orderId] = newStatus;
        } else if (change.type === "modified") {
          if (oldStatus && oldStatus !== newStatus) {
            setStatusNotification({
              orderId,
              status: newStatus,
              partner: orderData.courierPartner,
              trackingId: orderData.trackingId,
              trackingUrl: orderData.trackingUrl
            });
            prevStatuses[orderId] = newStatus;
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  // Automatically scroll to top on any page transition
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [page]);

  // Automatically unlock scroll when storefront is active
  useEffect(() => {
    if (!showLanding && typeof document !== "undefined") {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
  }, [showLanding]);

  // Check if user has already entered the store in this session (skips landing on refresh)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isCallback = urlParams.has("payment_status");

      if (isCallback) {
        setShowLanding(false);
        setPage("checkout");
      } else {
        const hasVisited = sessionStorage.getItem("laptopkart_has_visited");
        if (hasVisited === "true") {
          setShowLanding(false);
        }
      }
    }
  }, []);

  // Redirect guest users away from protected pages safely using useEffect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("payment_status")) {
        return; // Bypass auth redirect when displaying payment receipts
      }
    }
    if (!user) {
      if (page === "checkout") {
        setPendingAction({ type: "checkout" });
        handleNavigate("login");
      } else if (page === "write-blog") {
        setPendingAction({ type: "write-blog" });
        handleNavigate("login");
      } else if (page === "profile") {
        setPendingAction({ type: "profile" });
        handleNavigate("login");
      }
    }
  }, [page, user]);

  const handleEnterStore = () => {
    setShowLanding(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("laptopkart_has_visited", "true");
      window.history.replaceState({ page: "home" }, "", "#home");
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof document !== "undefined") {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setPendingAction({ type: "cart", payload: product });
      handleNavigate("login");
      return;
    }
    const limit = product.stock !== undefined ? product.stock : 1;
    if (limit <= 0) {
      triggerStoreAlert("error", "Sorry, this item is out of stock.");
      return;
    }
    setCart((c) => {
      const existing = c.find((i) => i.id === product.id);
      if (existing) {
        const nextQty = (existing.qty || 1) + 1;
        if (nextQty > limit) {
          triggerStoreAlert("warning", `Sorry, only ${limit} unit(s) of this item are available in stock.`);
          return c;
        }
        triggerStoreAlert("success", `Added another unit of ${product.name} to cart.`);
        return c.map((i) =>
          i.id === product.id ? { ...i, qty: nextQty } : i
        );
      }
      triggerStoreAlert("success", `${product.name} added to cart!`);
      return [...c, { ...product, qty: 1 }];
    });
  };

  const handleWishlist = (id: number) => {
    if (!user) {
      setPendingAction({ type: "wishlist", payload: id });
      handleNavigate("login");
      return;
    }
    setWishlist((w) =>
      w.includes(id) ? w.filter((i) => i !== id) : [...w, id]
    );
  };

  const handleLogin = (loggedInUser: any) => {
    setUser(loggedInUser);
    if (pendingAction) {
      if (pendingAction.type === "cart") {
        const product = pendingAction.payload;
        setCart((c) => {
          const existing = c.find((i) => i.id === product.id);
          if (existing)
            return c.map((i) => i.id === product.id ? { ...i, qty: (i.qty || 1) + 1 } : i);
          return [...c, { ...product, qty: 1 }];
        });
        handleNavigate("cart");
      } else if (pendingAction.type === "wishlist") {
        const id = pendingAction.payload;
        setWishlist((w) => w.includes(id) ? w : [...w, id]);
        handleNavigate("wishlist");
      } else if (pendingAction.type === "checkout") {
        handleNavigate("checkout");
      } else if (pendingAction.type === "profile") {
        handleNavigate("profile");
      } else if (pendingAction.type === "write-blog") {
        handleNavigate("write-blog");
      }
      setPendingAction(null);
    } else {
      handleNavigate("home");
    }
  };

  const handleViewProduct = (product: Product) => {
    setViewProduct(product);
    handleNavigate("product");
  };

  const handleViewAccessory = (accessory: any) => {
    setViewAccessory(accessory);
    handleNavigate("accessory-detail");
  };

  /* ── Landing experience ─────────────────────────────── */
  if (showLanding) {
    return <LandingPage onEnterStore={handleEnterStore} />;
  }

  /* ── Main store experience ──────────────────────────── */
  return (
    <div
      style={{
        fontFamily: "'Sora', 'Inter', sans-serif",
        background: COLORS.darkBg,
        minHeight: "100vh",
        color: COLORS.text,
        overflowX: "hidden",
      }}
    >
      <Navbar
        setPage={handleNavigate}
        cart={cart}
        wishlist={wishlist}
        user={user}
        onSearch={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            handleNavigate("listing");
          }
        }}
        searchQuery={searchQuery}
      />

      {page === "home" && (
        <Homepage
          products={productsList}
          banners={banners}
          setPage={handleNavigate}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
          accessories={accessories}
          customerReviews={customerReviews}
          user={user}
          triggerAlert={triggerStoreAlert}
        />
      )}
      {page === "listing" && (
        <ProductListing
          products={productsList}
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
          initialCategory={listingCategory}
          initialSearch={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
      {page === "product" && (
        <ProductDetail
          product={viewProduct}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
          setPage={handleNavigate}
          onViewProduct={handleViewProduct}
          productsList={productsList}
          triggerAlert={triggerStoreAlert}
        />
      )}
      {page === "cart" && (
        <CartPage cart={cart} setCart={setCart} setPage={handleNavigate} triggerAlert={triggerStoreAlert} />
      )}
      {page === "checkout" && user && (
        <CheckoutPage cart={cart} setPage={handleNavigate} setCart={setCart} user={user} />
      )}
      {page === "wishlist" && (
        <WishlistPage
          wishlist={wishlist}
          onAddToCart={handleAddToCart}
          setPage={handleNavigate}
          onWishlist={handleWishlist}
        />
      )}
      {page === "compare" && <ComparePage productsList={productsList} />}
      {page === "about" && <AboutPage />}
      {page.startsWith("blog-") && (
        <BlogDetail postId={page.replace("blog-", "")} setPage={handleNavigate} />
      )}
      {page === "blog" && (
        <BlogPage user={user} setPage={handleNavigate} />
      )}{page === "contact" && <ContactPage />}
      {page === "resell" && <SellLaptopPage setPage={handleNavigate} user={user} triggerAlert={triggerStoreAlert} />}
      {page === "login" && <LoginPage setPage={handleNavigate} onLogin={handleLogin} triggerAlert={triggerStoreAlert} />}
      {page === "profile" && user && (
        <ProfilePage user={user} setUser={setUser} setPage={handleNavigate} triggerAlert={triggerStoreAlert} />
      )}
      {page === "why-refurbished" && <WhyRefurbishedPage />}
      {page === "write-blog" && user && (
        <WriteBlogPage setPage={handleNavigate} />
      )}
      {page === "privacy-policy" && <PrivacyPolicyPage setPage={handleNavigate} />}
      {page === "refund-policy" && <RefundPolicyPage setPage={handleNavigate} />}
      {page === "terms-of-use" && <TermsOfUsePage setPage={handleNavigate} />}
      {page === "accessories" && (
        <AccessoriesPage
          accessories={accessories}
          setPage={handleNavigate}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
          onViewAccessory={handleViewAccessory}
        />
      )}
      {page === "accessory-detail" && (
        <AccessoryDetailPage
          accessory={viewAccessory}
          setPage={handleNavigate}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          wishlist={wishlist}
        />
      )}

      <Footer setPage={handleNavigate} />

      {/* Real-time Order Status Update Toast Notification */}
      {statusNotification && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 11000,
          background: "linear-gradient(135deg, #131a24, #0d1117)",
          border: "2px solid #38BDF8", borderRadius: 20, padding: 20,
          boxShadow: "0 20px 50px rgba(56,189,248,0.25)", width: "90%", maxWidth: 380,
          display: "flex", flexDirection: "column", gap: 10,
          color: "#E8EDF5", animation: "fadeIn 0.3s ease",
          fontFamily: "'Sora', sans-serif"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38BDF8", fontWeight: 800, fontSize: 12, letterSpacing: "0.05em" }}>
              📢 ORDER UPDATE RECEIVED
            </div>
            <button onClick={() => setStatusNotification(null)} style={{ background: "transparent", border: "none", color: "#8B9BBE", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            Your Order <strong>#{statusNotification.orderId}</strong> status has been updated to <span style={{ color: "#38BDF8", fontWeight: 700 }}>{statusNotification.status}</span>.
          </div>
          {statusNotification.status === "Shipped" && statusNotification.trackingId && (
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 10, fontSize: 11, color: "#8B9BBE", margin: "4px 0" }}>
              📦 Shipped via <strong>{statusNotification.partner}</strong><br />
              AWB Tracking ID: <code>{statusNotification.trackingId}</code>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4, justifyContent: "flex-end" }}>
            {statusNotification.status === "Shipped" && statusNotification.trackingId ? (
              <a
                href={statusNotification.trackingUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setStatusNotification(null)}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.green}, #38BDF8)`,
                  color: "#000", border: "none", borderRadius: 8,
                  padding: "6px 12px", fontSize: 11, fontWeight: 850,
                  cursor: "pointer", textDecoration: "none", display: "inline-flex",
                  alignItems: "center", gap: 4
                }}
              >
                Track Shipment ↗
              </a>
            ) : null}
            <button
              onClick={() => {
                handleNavigate("profile");
                setStatusNotification(null);
              }}
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700,
                cursor: "pointer"
              }}
            >
              View Order History
            </button>
          </div>
        </div>
      )}
      {/* Dynamic Store Toast Alert Notification */}
      {storeAlert && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 12000,
          background: storeAlert.type === "success" ? "linear-gradient(135deg, #10B981, #059669)"
                    : storeAlert.type === "warning" ? "linear-gradient(135deg, #F59E0B, #D97706)"
                    : "linear-gradient(135deg, #EF4444, #DC2626)",
          color: "#fff", padding: "14px 28px", borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 13,
          fontFamily: "'Sora', sans-serif", border: "1px solid rgba(255,255,255,0.12)",
          animation: "slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <span style={{ fontSize: 16 }}>
            {storeAlert.type === "success" ? "✓" 
             : storeAlert.type === "warning" ? "⚠" 
             : "✕"}
          </span>
          <span>{storeAlert.message}</span>
          <button 
            onClick={() => setStoreAlert(null)} 
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", marginLeft: 10, fontSize: 12 }}
          >✕</button>
        </div>
      )}

      {/* Global Animation Styles */}
      <style>{`
        @keyframes slideDown {
          0% { transform: translate(-50%, -20px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
