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
} from "@/components/OtherPages";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CartItem extends Product {
  qty: number;
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
      const hasVisited = sessionStorage.getItem("laptopkart_has_visited");
      if (hasVisited === "true") {
        setShowLanding(false);
      }
    }
  }, []);

  // Redirect guest users away from protected pages safely using useEffect
  useEffect(() => {
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
      {page.startsWith("blog-") && user && (
        <BlogDetail postId={page.replace("blog-", "")} setPage={handleNavigate} />
      )}
      {page === "blog" && user && (
        <BlogPage user={user} setPage={handleNavigate} />
      )}{page === "contact" && <ContactPage />}
      {page === "login" && <LoginPage setPage={handleNavigate} onLogin={handleLogin} triggerAlert={triggerStoreAlert} />}
      {page === "profile" && user && (
        <ProfilePage user={user} setUser={setUser} setPage={handleNavigate} triggerAlert={triggerStoreAlert} />
      )}
      {page === "why-refurbished" && <WhyRefurbishedPage />}
      {page === "write-blog" && user && (
        <WriteBlogPage setPage={handleNavigate} />
      )}
      {page === "accessories" && (
        <AccessoriesPage
          accessories={accessories}
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
