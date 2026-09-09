import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, getDoc, updateDoc, increment } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./lib/firebase";
import { uploadProductImage, uploadVideoToCloudinary } from "./lib/storage";
import { deleteCloudinaryAssets } from "./lib/cloudinaryDelete";
import AdminLogin from "./components/AdminLogin";
import CollegesTab from "./components/CollegesTab";
import ClientsTab from "./components/ClientsTab";
import SettingsTab from "./components/SettingsTab";
import {
  LayoutDashboard,
  Laptop,
  Keyboard,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Search,
  X,
  Sparkles,
  CheckCircle,
  Clock,
  FileText,
  Bell,
  Truck,
  BookOpen,
  Video,
  Mail,
  Send,
  RefreshCw,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Cpu,
  User,
  Menu,
  Tag,
  ClipboardList,
  LogOut,
  Package,
  AlertTriangle,
  PackageX,
  PackagePlus,
  ArrowUpRight,
  Layers,
  Award,
  ChevronRight,
  Calendar,
  Target,
  Settings as SettingsIcon,
  Briefcase
} from 'lucide-react';

// compressImage removed (using storage.ts module)

// Reverting Coupon to any since it has dynamically varying fields in the codebase
type Coupon = any;

interface ProductRequest {
  id: string;
  deviceType: string;
  brand: string;
  specs: string;
  budget: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviews: number;
  grade?: "A+" | "A" | "B+";
  condition?: "Refurbished" | "Brand New";
  warranty: string;
  specs: string;
  img: string;
  images?: string[];
  description?: string;
  boxContents?: string;
  processor: string;
  ram: string;
  availableRams?: string[];
  storage: string;
  availableStorages?: string[];
  badge: "Best Seller" | "Gaming" | "Value Deal" | "Top Rated";
  stock?: number;
  deviceType?: "Laptop" | "Desktop";
  amazon_url?: string;
  flipkart_url?: string;
  croma_url?: string;
  imagePublicId?: string;
  imagePublicIds?: string[];
}

interface AccessoryProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  img: string;
  brand: string;
  specs: string;
  imagePublicId?: string;
}

interface Banner {
  src: string;
  badge: string;
  title: string;
  desc: string;
  target: string;
  imagePublicId?: string;
}

// Initial defaults to populate storage if empty
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 11,
    name: "Apple MacBook Air M3 (Brand New)",
    brand: "Apple",
    category: "Ultrabooks",
    price: 104900,
    mrp: 114900,
    discount: 9,
    rating: 4.8,
    reviews: 125,
    condition: "Brand New",
    warranty: "1 Year Apple Warranty",
    specs: "Apple M3 Chip • 8GB RAM • 256GB SSD",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&auto=format&fit=crop",
    processor: "Apple M3 8-Core CPU",
    ram: "8GB",
    storage: "256GB SSD",
    badge: "Top Rated",
  },
  {
    id: 1,
    name: "Dell Latitude 5400",
    brand: "Dell",
    category: "Business",
    price: 27999,
    mrp: 54999,
    discount: 49,
    rating: 4.6,
    reviews: 842,
    grade: "A+",
    warranty: "1 Year",
    specs: "Intel i5 8th Gen • 8GB RAM • 256GB SSD",
    img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i5 8265U",
    ram: "8GB",
    storage: "256GB SSD",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "HP EliteBook 840 G5",
    brand: "HP",
    category: "Business",
    price: 29999,
    mrp: 59999,
    discount: 50,
    rating: 4.5,
    reviews: 610,
    grade: "A",
    warranty: "1 Year",
    specs: "Intel i5 8th Gen • 16GB RAM • 512GB SSD",
    img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i5 8250U",
    ram: "16GB",
    storage: "512GB SSD",
    badge: "Top Rated",
  }
];

export const DEFAULT_ACCESSORIES: AccessoryProduct[] = [
  {
    id: 101,
    name: "Dell UltraSharp U2419H 24\" Monitor",
    category: "Monitors",
    price: 9999,
    mrp: 18999,
    rating: 4.6,
    reviews: 142,
    img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80&auto=format&fit=crop",
    brand: "Dell",
    specs: "Full HD 1080p • IPS Panel • Ultra-Thin Bezel",
  },
  {
    id: 102,
    name: "Lenovo ThinkPad USB-C Dock Gen 2",
    category: "Docking Stations",
    price: 4999,
    mrp: 14999,
    rating: 4.5,
    reviews: 88,
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&q=80&auto=format&fit=crop",
    brand: "Lenovo",
    specs: "4K Display Output • 90W Power Delivery • USB-C",
  }
];

export const DEFAULT_BANNERS: Banner[] = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&auto=format&fit=crop",
    badge: "Blog Contest",
    title: "Write a Tech Blog, Get Selected",
    desc: "Share your guides or review articles on our Tech Blog. Win rewards!",
    target: "blog",
  },
  {
    src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80&auto=format&fit=crop",
    badge: "Direct Savings",
    title: "Weekly Direct Deals: Flat 10% Off",
    desc: "Use coupon LAPTOP10 at checkout to get instant 10% discount on business series laptops.",
    target: "listing",
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'accessories' | 'banners' | 'hero_posters' | 'orders' | 'blogs' | 'video' | 'subscribers' | 'sell_requests' | 'coupons' | 'product_requests' | 'student_hub' | 'users' | 'colleges' | 'clients' | 'settings'>('overview');
  const [ordersFilter, setOrdersFilter] = useState<'active' | 'completed' | 'unpaid'>('active');
  const [ordersPage, setOrdersPage] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setIsMobile(window.innerWidth < 992);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const [admin, setAdmin] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdmin(null);
        setAuthChecked(true);
        return;
      }

      // Automatically expire session after 24 hours
      const lastSignInTime = new Date(user.metadata.lastSignInTime || '').getTime();
      const currentTime = new Date().getTime();
      if (currentTime - lastSignInTime > 24 * 60 * 60 * 1000) {
        await signOut(auth);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "admins", user.uid));
        const data = snap.data();
        if (snap.exists() && data && data.role === "admin") {
          setAdmin({ uid: user.uid, email: user.email, name: data.name || "Admin" });
          setAuthError(null);
        } else {
          await signOut(auth);
          setAuthError("Access Denied: this account is not an authorized administrator.");
        }
      } catch (err) {
        console.error("[Auth] Admin verification failed:", err);
        setAuthError("Could not verify admin access. Please try again.");
      } finally {
        setAuthChecked(true);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [heroPosters, setHeroPosters] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Student Hub state
  const [giveawayConfig, setGiveawayConfig] = useState<{ prizeTitle: string, prizeImage: string, secondPrizeTitle?: string, secondPrizeImage?: string, startTime: string, deadline: string, topic: string, nextWeekTopic?: string, prizeImagePublicId?: string, secondPrizeImagePublicId?: string }>({ prizeTitle: '', prizeImage: '', secondPrizeTitle: '', secondPrizeImage: '', startTime: '', deadline: '', topic: '', nextWeekTopic: '' });
  const [lastWinnerData, setLastWinnerData] = useState<any>(null);
  const [secondWinnerData, setSecondWinnerData] = useState<any>(null);
  const [hubSaving, setHubSaving] = useState(false);
  const [hubImageUploading, setHubImageUploading] = useState(false);
  const [hubLeaderboard, setHubLeaderboard] = useState<{ email: string; name: string; articles: number; reads: number }[]>([]);
  const [hubBlogsLoaded, setHubBlogsLoaded] = useState(false);

  // Users tab state
  const [usersData, setUsersData] = useState<any[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Record<string, any[]>>({});

  // Search filter states
  const [productSearch, setProductSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
  const [accessorySearch, setAccessorySearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');
  const [blogContestFilter, setBlogContestFilter] = useState(false);

  // Alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Modals status
  const [blogReviewModal, setBlogReviewModal] = useState<{ open: boolean, item?: any }>({ open: false });
  const [productModal, setProductModal] = useState<{ open: boolean, mode: 'add' | 'edit', item?: Product }>({ open: false, mode: 'add' });
  const [accessoryModal, setAccessoryModal] = useState<{ open: boolean, mode: 'add' | 'edit', item?: AccessoryProduct }>({ open: false, mode: 'add' });
  const [subscribersSearch, setSubscribersSearch] = useState('');
  const [sellRequests, setSellRequests] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [sellSearch, setSellSearch] = useState('');
  const [sellStatusFilter, setSellStatusFilter] = useState('all');
  const [sellDetailModal, setSellDetailModal] = useState<{ open: boolean, item?: any }>({ open: false });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotationDeg, setRotationDeg] = useState(0);

  // Newsletter broadcast states
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [bannerModal, setBannerModal] = useState<{ open: boolean }>({ open: false });
  const [heroPosterModal, setHeroPosterModal] = useState<{ open: boolean }>({ open: false });

  // Form states - Product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', brand: 'Dell', category: 'Business', price: 0, mrp: 0,
    rating: 4.8, reviews: 125,
    condition: 'Refurbished', grade: 'A+', warranty: '1 Year Warranty',
    specs: '', img: '', processor: '', ram: '8GB', storage: '256GB SSD', badge: 'Top Rated', stock: 1,
    deviceType: 'Laptop', amazon_url: '', flipkart_url: '', croma_url: ''
  });
  const [galleryLinksText, setGalleryLinksText] = useState("");
  const [modalTab, setModalTab] = useState<'basic' | 'specs' | 'media'>('basic');
  const [selectedRamOptions, setSelectedRamOptions] = useState<{ [key: string]: { enabled: boolean; offset: number } }>({
    '8GB': { enabled: true, offset: 0 },
    '16GB': { enabled: false, offset: 0 },
    '32GB': { enabled: false, offset: 0 },
    '64GB': { enabled: false, offset: 0 },
  });
  const [selectedStorageOptions, setSelectedStorageOptions] = useState<{ [key: string]: { enabled: boolean; offset: number } }>({
    '128GB SSD': { enabled: false, offset: 0 },
    '256GB SSD': { enabled: true, offset: 0 },
    '512GB SSD': { enabled: false, offset: 0 },
    '1TB SSD': { enabled: false, offset: 0 },
    '2TB SSD': { enabled: false, offset: 0 },
  });

  // Form states - Accessory
  const [accessoryForm, setAccessoryForm] = useState<Partial<AccessoryProduct>>({
    name: '', category: 'Monitors', price: 0, mrp: 0, brand: 'Dell', specs: '', img: ''
  });
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

  // Form states - Banner
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    src: '',
    badge: 'Offers',
    title: '',
    desc: '',
    target: 'listing',
  });

  // Form states - Hero Poster
  const [heroPosterForm, setHeroPosterForm] = useState<{ src: string; mobileSrc?: string; title: string; target: string; imagePublicId?: string; mobileSrcPublicId?: string; }>({
    src: '', mobileSrc: '', title: '', target: 'listing'
  });

  // Form states - Promo Video
  const [videoTitle, setVideoTitle] = useState("Explore Laptopkart in Action");
  const [videoSubtitle, setVideoSubtitle] = useState("Watch our certified refurbishment process and see why thousands trust us.");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPublicId, setVideoPublicId] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPoster, setVideoPoster] = useState("");
  const [videoPosterPublicId, setVideoPosterPublicId] = useState("");
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [videoOrientation, setVideoOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [videoEyebrow, setVideoEyebrow] = useState("Introduction");

  // Form states - Coupons
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState<"flat" | "percentage">("flat");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponMaxDiscount, setCouponMaxDiscount] = useState("");
  const [couponMinCartValue, setCouponMinCartValue] = useState("");
  const [couponMaxUses, setCouponMaxUses] = useState("");

  // Live snapshot database listeners for Products, Accessories, Banners, and Orders
  useEffect(() => {
    if (!admin) return;

    // 1. Subscribe to Products
    const unsubscribeProducts = onSnapshot(
      query(collection(db, "products")),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id as any, ...doc.data() } as Product);
        });
        setProducts(list);
      },
      (error) => {
        console.error("[Firestore] Products read failed:", error.code, error.message);
        triggerAlert('danger', `Firebase Error (products): ${error.code} — Check Firestore Security Rules.`);
        setProducts([]);
      }
    );

    // 2. Subscribe to Accessories
    const unsubscribeAccessories = onSnapshot(
      query(collection(db, "accessories")),
      (snapshot) => {
        const list: AccessoryProduct[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id as any, ...doc.data() } as AccessoryProduct);
        });
        setAccessories(list);
      },
      (error) => {
        console.error("[Firestore] Accessories read failed:", error.code, error.message);
        triggerAlert('danger', `Firebase Error (accessories): ${error.code} — Check Firestore Security Rules.`);
        setAccessories([]);
      }
    );

    // 3. Subscribe to Banners
    const unsubscribeBanners = onSnapshot(
      query(collection(db, "banners")),
      (snapshot) => {
        const list: Banner[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Banner);
        });
        setBanners(list);
      },
      (error) => {
        console.error("[Firestore] Banners read failed:", error.code, error.message);
        triggerAlert('danger', `Firebase Error (banners): ${error.code} — Check Firestore Security Rules.`);
        setBanners([]);
      }
    );

    // 4. Subscribe to Hero Posters
    const unsubscribeHeroPosters = onSnapshot(
      query(collection(db, "heroPosters")),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ docId: doc.id, ...doc.data() });
        });
        setHeroPosters(list);
      },
      (error) => console.error("[Firestore] Hero Posters read failed:", error)
    );

    // 5. Subscribe to Blogs
    const unsubscribeBlogs = onSnapshot(
      query(collection(db, "blogs")),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setBlogs(list);
      },
      (error) => {
        console.error("[Firestore] Blogs read failed:", error.code, error.message);
        setBlogs([]);
      }
    );

    // 5. Fetch Promo Video Settings
    const unsubscribeVideo = onSnapshot(
      doc(db, "homepage_settings", "video"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.title) setVideoTitle(data.title);
          if (data.subtitle) setVideoSubtitle(data.subtitle);
          if (data.videoUrl) setVideoUrl(data.videoUrl);
          if (data.videoPublicId) setVideoPublicId(data.videoPublicId);
          if (data.posterUrl) setVideoPoster(data.posterUrl);
          if (data.videoPosterPublicId) setVideoPosterPublicId(data.videoPosterPublicId);
          if (data.orientation) setVideoOrientation(data.orientation);
          if (data.eyebrow) setVideoEyebrow(data.eyebrow);
        }
      },
      (error) => {
        console.error("[Firestore] Video settings read failed:", error);
      }
    );

    // 6. Subscribe to Newsletter Subscribers
    const unsubscribeSubscribers = onSnapshot(
      query(collection(db, "subscribers")),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => new Date(b.subscribedAt || 0).getTime() - new Date(a.subscribedAt || 0).getTime());
        setSubscribers(list);
      },
      (error) => {
        console.error("[Firestore] Subscribers read failed:", error);
      }
    );

    // 7. Subscribe to Sell / Resell Requests
    const unsubscribeSellRequests = onSnapshot(
      query(collection(db, "sell_requests")),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setSellRequests(list);
      },
      (error) => {
        console.error("[Firestore] Sell requests read failed:", error);
      }
    );

    // 8. Subscribe to Coupons
    const unsubscribeCoupons = onSnapshot(
      query(collection(db, "coupons")),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setCoupons(list);
      },
      (error) => console.error("[Firestore] Coupons read failed:", error)
    );

    const unsubProductRequests = onSnapshot(query(collection(db, "product_requests")), snap => {
      setProductRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductRequest)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeAccessories();
      unsubscribeBanners();
      unsubscribeHeroPosters();
      unsubscribeBlogs();
      unsubscribeVideo();
      unsubscribeSubscribers();
      unsubscribeSellRequests();
      unsubscribeCoupons();
      unsubProductRequests();
    };
  }, [admin]);

  const triggerAlert = (type: 'success' | 'danger', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Reusable FCM Registration function
  const registerFCM = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    try {
      const { getMessaging, getToken } = await import('firebase/messaging');
      const { app } = await import('./lib/firebase');
      const messaging = getMessaging(app);

      // Register service worker explicitly
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Get registration token
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        console.log('FCM Token registered:', currentToken);
        const tokenDocId = currentToken.substring(0, 32);
        await setDoc(doc(db, "admin_fcm_tokens", tokenDocId), {
          token: currentToken,
          updatedAt: new Date().toISOString()
        });
        triggerAlert('success', 'Mobile notifications setup successfully!');
      } else {
        console.warn('No registration token available.');
      }
    } catch (error) {
      console.error('Error during FCM setup:', error);
    }
  };

  // Interactive notification permission request
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        await registerFCM();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Foreground notification handler & Quiet auto-registration on mount if already granted
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!admin) return;

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        registerFCM();
      }
    }

    if (!('serviceWorker' in navigator)) return;

    const setupFCMListener = async () => {
      try {
        const { getMessaging, onMessage } = await import('firebase/messaging');
        const { app } = await import('./lib/firebase');
        const messaging = getMessaging(app);

        // Foreground Message Handler (Lucide alert/toast + Native notification bar)
        onMessage(messaging, (payload) => {
          console.log('Message received in foreground: ', payload);
          if (payload.notification) {
            // 1. Show custom in-app HTML alert banner
            triggerAlert('success', `[Alert] ${payload.notification.title}: ${payload.notification.body}`);

            // 2. Trigger native notification in the mobile status/notification bar
            if (Notification.permission === 'granted') {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(payload.notification?.title || "Laptopkart Alert", {
                  body: payload.notification?.body || "",
                  icon: '/logo.png',
                  badge: '/logo.png',
                  tag: 'admin-notification',
                  renotify: true,
                  data: payload.data
                } as any);
              }).catch(err => {
                console.error("SW showNotification error, using standard Notification API:", err);
                new Notification(payload.notification?.title || "Laptopkart Alert", {
                  body: payload.notification?.body || "",
                  icon: '/logo.png',
                });
              });
            }
          }
        });
      } catch (error) {
        console.error('Error setting up foreground messaging listener:', error);
      }
    };

    setupFCMListener();
  }, [admin]);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const promises: Promise<{ url: string; publicId: string }>[] = [];
    const currentImages = productForm.images || [];
    const currentPublicIds = productForm.imagePublicIds || [];
    const maxFiles = Math.min(files.length, 5 - currentImages.length);

    for (let i = 0; i < maxFiles; i++) {
      promises.push(uploadProductImage(files[i]));
    }

    try {
      const results = await Promise.all(promises);
      const urls = results.map(r => r.url);
      const publicIds = results.map(r => r.publicId);
      const newImages = [...currentImages, ...urls].slice(0, 5);
      const newPublicIds = [...currentPublicIds, ...publicIds].slice(0, 5);

      setProductForm(prev => ({
        ...prev,
        images: newImages,
        img: prev.img || newImages[0] || '',
        imagePublicIds: newPublicIds,
        imagePublicId: prev.imagePublicId || newPublicIds[0] || ''
      }));
      setGalleryLinksText(newImages.join(', '));
      triggerAlert('success', `Uploaded ${urls.length} images successfully to Cloudinary.`);
    } catch (err) {
      console.error("Error uploading images: ", err);
      triggerAlert('danger', 'Error uploading images.');
    }
  };

  const handleRemoveProductImage = (idx: number) => {
    const currentImages = productForm.images || [];
    const currentPublicIds = productForm.imagePublicIds || [];
    const newImages = currentImages.filter((_, i) => i !== idx);
    const newPublicIds = currentPublicIds.filter((_, i) => i !== idx);
    setProductForm(prev => ({
      ...prev,
      images: newImages,
      img: prev.img === currentImages[idx] ? (newImages[0] || '') : prev.img,
      imagePublicIds: newPublicIds,
      imagePublicId: prev.imagePublicId === currentPublicIds[idx] ? (newPublicIds[0] || '') : prev.imagePublicId
    }));
    setGalleryLinksText(newImages.join(', '));
  };

  const handleAccessoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const { url, publicId } = await uploadProductImage(files[0]);
      setAccessoryForm(prev => ({
        ...prev,
        img: url,
        imagePublicId: publicId
      }));
      triggerAlert('success', 'Accessory image uploaded successfully to Cloudinary.');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error uploading accessory image.');
    }
  };

  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingBanner(true);
    try {
      const { url, publicId } = await uploadProductImage(files[0]);
      setBannerForm(prev => ({
        ...prev,
        src: url,
        imagePublicId: publicId
      }));
      triggerAlert('success', 'Banner image uploaded successfully.');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error uploading banner image.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const [uploadingHeroPoster, setUploadingHeroPoster] = useState(false);
  const [uploadingHeroPosterMobile, setUploadingHeroPosterMobile] = useState(false);

  const handleHeroPosterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHeroPoster(true);
    try {
      const { url, publicId } = await uploadProductImage(files[0]);
      setHeroPosterForm(prev => ({
        ...prev,
        src: url,
        imagePublicId: publicId
      }));
      triggerAlert('success', 'Hero poster image uploaded successfully.');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error uploading hero poster image.');
    } finally {
      setUploadingHeroPoster(false);
    }
  };

  const handleHeroPosterMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHeroPosterMobile(true);
    try {
      const { url, publicId } = await uploadProductImage(files[0]);
      setHeroPosterForm(prev => ({
        ...prev,
        mobileSrc: url,
        mobileSrcPublicId: publicId
      }));
      triggerAlert('success', 'Mobile hero poster image uploaded successfully.');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error uploading mobile hero poster image.');
    } finally {
      setUploadingHeroPosterMobile(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingVideo(true);
    try {
      triggerAlert('success', 'Starting video upload to Cloudinary... Please wait.');
      const { url, publicId } = await uploadVideoToCloudinary(files[0]);
      setVideoUrl(url);
      setVideoPublicId(publicId);
      triggerAlert('success', 'Video uploaded successfully to Cloudinary!');
    } catch (err: any) {
      console.error(err);
      triggerAlert('danger', err.message || 'Error uploading video file.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoPosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingPoster(true);
    try {
      const { url, publicId } = await uploadProductImage(files[0]);
      setVideoPoster(url);
      setVideoPosterPublicId(publicId);
      triggerAlert('success', 'Poster image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      triggerAlert('danger', err.message || 'Error uploading poster image.');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return triggerAlert('danger', 'Please enter a title.');
    if (!videoUrl.trim()) return triggerAlert('danger', 'Please enter a video URL or upload a file.');

    try {
      await setDoc(doc(db, "homepage_settings", "video"), {
        title: videoTitle.trim(),
        subtitle: videoSubtitle.trim(),
        videoUrl: videoUrl.trim(),
        videoPublicId: videoPublicId,
        posterUrl: videoPoster.trim(),
        videoPosterPublicId: videoPosterPublicId,
        orientation: videoOrientation,
        eyebrow: videoEyebrow.trim(),
        updatedAt: new Date().toISOString()
      });
      triggerAlert('success', 'Promo video settings updated successfully!');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error updating video settings.');
    }
  };

  const handleVideoDelete = async () => {
    if (!confirm('Are you sure you want to delete the promo video section? This will remove the video from the homepage.')) return;
    try {
      const videoDoc = await getDoc(doc(db, "homepage_settings", "video"));
      if (videoDoc.exists()) {
        const data = videoDoc.data();
        if (data.videoPublicId) await deleteCloudinaryAssets([data.videoPublicId], "video");
        if (data.videoPosterPublicId) await deleteCloudinaryAssets([data.videoPosterPublicId], "image");
      }
      await deleteDoc(doc(db, "homepage_settings", "video"));
      setVideoTitle("Explore Laptopkart in Action");
      setVideoSubtitle("Watch our certified refurbishment process and see why thousands trust us.");
      setVideoUrl("");
      setVideoPublicId("");
      setVideoPoster("");
      setVideoPosterPublicId("");
      setVideoOrientation("landscape");
      setVideoEyebrow("Introduction");
      triggerAlert('success', 'Promo video deleted successfully!');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error deleting promo video.');
    }
  };

  interface Order {
    orderId: string;
    createdAt?: string;
    items: { id: number; name: string; price: number; qty: number; img: string }[];
    total: number;
    address: { name: string; phone: string; pincode: string; city: string; state: string; street: string };
    status?: string;
    paymentMethod?: string;
    email?: string;
    uid?: string;
    trackingId?: string;
    trackingUrl?: string;
    courierPartner?: string;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const orderStatusesRef = useRef<Record<string, string>>({});

  // Fetch current Student Hub contest and last winner
  useEffect(() => {
    if (!admin) return;

    const fetchGiveawayData = async () => {
      try {
        const currentDoc = await getDoc(doc(db, "giveaway", "current"));
        if (currentDoc.exists()) {
          setGiveawayConfig(currentDoc.data() as any);
        }

        const lastWinnerDoc = await getDoc(doc(db, "giveaway", "lastWinner"));
        if (lastWinnerDoc.exists()) {
          setLastWinnerData(lastWinnerDoc.data());
        }

        const secondWinnerDoc = await getDoc(doc(db, "giveaway", "secondWinner"));
        if (secondWinnerDoc.exists()) {
          setSecondWinnerData(secondWinnerDoc.data());
        }
      } catch (err) {
        console.error("Error fetching giveaway data:", err);
      }
    };

    fetchGiveawayData();
  }, [admin]);

  // Subscribe to live order checkouts (WebSockets)
  useEffect(() => {
    if (!admin) return;

    let isInitial = true;
    const unsubscribeOrders = onSnapshot(query(collection(db, "orders")), (snapshot) => {
      const list: Order[] = [];
      let newOrder: Order | null = null;

      snapshot.docChanges().forEach((change) => {
        if (change.type === "removed") return;

        const ord = change.doc.data() as Order;
        const prevStatus = orderStatusesRef.current[ord.orderId];
        const newStatus = ord.status || 'Pending';

        if (!isInitial) {
          const isRealOrder = newStatus !== "Pending Payment" && newStatus !== "Failed" && newStatus !== "Cancelled";
          const wasRealOrder = prevStatus && prevStatus !== "Pending Payment" && prevStatus !== "Failed" && prevStatus !== "Cancelled";

          // Trigger alert if:
          // 1. It is a new order (added) and is already paid or COD (i.e. not Pending Payment or Failed or Cancelled)
          // 2. Or it was modified, and its status transitioned from 'Pending Payment' to 'Paid' (or any non-pending/non-failed/non-cancelled state)
          if (isRealOrder && !wasRealOrder) {
            newOrder = ord;
          }
        }

        // Update the ref map
        orderStatusesRef.current[ord.orderId] = newStatus;
      });

      snapshot.forEach((doc) => {
        list.push(doc.data() as Order);
      });

      // Sort orders descending by createdAt timestamp
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      if (newOrder) {
        setNewOrderAlert(newOrder);
        // Clear new order alert toast after 8 seconds
        setTimeout(() => setNewOrderAlert(null), 8000);
      }
      setOrders(list);
      isInitial = false;
    }, (error) => {
      console.error("[Firestore] Orders read failed:", error);
    });

    return () => unsubscribeOrders();
  }, [admin]);

  const handleAutoFillSpecs = () => {
    const name = productForm.name || "";
    if (!name.trim()) {
      triggerAlert('danger', 'Please enter a Product Name first to auto-fill.');
      return;
    }

    const update: Partial<Product> = { ...productForm };

    // 1. Detect Brand
    const brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'];
    for (const brand of brands) {
      if (new RegExp('\\b' + brand + '\\b', 'i').test(name)) {
        update.brand = brand;
        break;
      }
    }

    // 2. Detect Processor
    let processor = 'Intel Core i5';
    if (/i3/i.test(name)) processor = 'Intel Core i3';
    else if (/i5/i.test(name)) processor = 'Intel Core i5';
    else if (/i7/i.test(name)) processor = 'Intel Core i7';
    else if (/i9/i.test(name)) processor = 'Intel Core i9';
    else if (/m1/i.test(name)) processor = 'Apple M1';
    else if (/m2/i.test(name)) processor = 'Apple M2';
    else if (/m3/i.test(name)) processor = 'Apple M3';
    else if (/ryzen\s*3/i.test(name)) processor = 'AMD Ryzen 3';
    else if (/ryzen\s*5/i.test(name)) processor = 'AMD Ryzen 5';
    else if (/ryzen\s*7/i.test(name)) processor = 'AMD Ryzen 7';
    else if (/ryzen\s*9/i.test(name)) processor = 'AMD Ryzen 9';
    else if (/celeron/i.test(name)) processor = 'Intel Celeron';
    else if (/pentium/i.test(name)) processor = 'Intel Pentium';

    // Detect Gen if available
    const genMatch = name.match(/(\d+)(?:th|rd|nd|st)\s*Gen/i);
    if (genMatch) {
      processor += ` ${genMatch[1]}th Gen`;
    }
    update.processor = processor;

    // 3. Detect RAM
    let ramSize = '8GB';
    const ramMatch = name.match(/\b(\d+)\s*(?:GB|G)\b/i);
    if (ramMatch) {
      ramSize = `${ramMatch[1]}GB`;
    }

    // 4. Detect Storage
    let storageSize = '256GB SSD';
    const ssdMatch = name.match(/\b(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|NVMe)?\b/i);
    if (ssdMatch) {
      const rawNum = parseInt(ssdMatch[1], 10);
      const isTb = /TB/i.test(ssdMatch[0]) || (rawNum === 1 || rawNum === 2);
      const unit = isTb ? 'TB' : 'GB';
      const type = /HDD/i.test(name) ? 'HDD' : 'SSD';
      // Make sure it doesn't match the RAM size
      if (rawNum !== parseInt(ramSize, 10)) {
        storageSize = `${rawNum}${unit} ${type}`;
      }
    }

    // Update checkboxes/offsets
    const newRamOptions = { ...selectedRamOptions };
    Object.keys(newRamOptions).forEach(k => {
      newRamOptions[k] = { enabled: k === ramSize, offset: 0 };
    });
    setSelectedRamOptions(newRamOptions);

    const newStorageOptions = { ...selectedStorageOptions };
    Object.keys(newStorageOptions).forEach(k => {
      newStorageOptions[k] = { enabled: k === storageSize, offset: 0 };
    });
    setSelectedStorageOptions(newStorageOptions);

    // 5. Specs Tagline
    update.specs = `${processor} • ${ramSize} RAM • ${storageSize}`;

    // 6. Defaults based on Condition
    const isRefurbished = update.condition !== 'Brand New';
    update.warranty = isRefurbished ? '6 Months Warranty' : '1 Year Brand Warranty';
    update.boxContents = isRefurbished
      ? 'Refurbished Laptop, Compatible Power Charger Adapter, Bubble wrap packing box'
      : 'Original Sealed Box Brand New Laptop, Original OEM Charger Adapter, Power cord, Manuals';

    // Grade detection for refurbished
    if (isRefurbished) {
      if (/a\+/i.test(name)) update.grade = 'A+';
      else if (/grade\s*a/i.test(name) || /\ba\b/i.test(name)) update.grade = 'A';
      else if (/b\+/i.test(name)) update.grade = 'B+';
      else update.grade = 'A+'; // Default
    }

    setProductForm(update);
    triggerAlert('success', `⚡ Auto-filled details successfully: ${update.brand} ${processor} / ${ramSize} / ${storageSize}`);
  };

  // Product CRUD Handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(productForm.price) || 0;
    const mrp = Number(productForm.mrp) || 0;
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const docId = productModal.mode === 'edit' ? String(productModal.item!.id) : doc(collection(db, "products")).id;

    // Build RAM string
    const ramString = Object.entries(selectedRamOptions)
      .filter(([_, opt]) => opt.enabled)
      .map(([size, opt]) => {
        return opt.offset !== 0 ? `${size} (+${opt.offset})` : size;
      })
      .join(', ') || '8GB';

    // Build Storage string
    const storageString = Object.entries(selectedStorageOptions)
      .filter(([_, opt]) => opt.enabled)
      .map(([size, opt]) => {
        return opt.offset !== 0 ? `${size} (+${opt.offset})` : size;
      })
      .join(', ') || '256GB SSD';

    const pData: Product = {
      id: docId as any,
      name: productForm.name || 'Generic Product',
      brand: productForm.brand || 'Dell',
      category: productForm.category || 'Business',
      deviceType: productForm.deviceType || 'Laptop',
      price,
      mrp,
      discount,
      rating: Number(productForm.rating) || 4.5,
      reviews: Number(productForm.reviews) || 10,
      condition: productForm.condition || 'Refurbished',
      warranty: productForm.warranty || '1 Year Warranty',
      specs: productForm.specs || 'N/A',
      img: productForm.img || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80&auto=format&fit=crop',
      images: productForm.images || [],
      description: productForm.description || '',
      boxContents: productForm.boxContents || '',
      processor: productForm.processor || 'Intel Core i5',
      ram: ramString,
      availableRams: ramString.split(',').map(s => s.trim()).filter(Boolean),
      storage: storageString,
      availableStorages: storageString.split(',').map(s => s.trim()).filter(Boolean),
      badge: productForm.badge as "Best Seller" | "Gaming" | "Value Deal" | "Top Rated" || 'Top Rated',
      stock: productForm.stock !== undefined ? Number(productForm.stock) : 1,
      amazon_url: productForm.amazon_url || '',
      flipkart_url: productForm.flipkart_url || '',
      croma_url: productForm.croma_url || '',
      imagePublicId: productForm.imagePublicId || '',
      imagePublicIds: productForm.imagePublicIds || [],
    };

    if (productForm.condition === 'Refurbished') {
      pData.grade = productForm.grade as "A+" | "A" | "B+";
    }

    setDoc(doc(db, "products", docId), pData)
      .then(() => {
        triggerAlert('success', productModal.mode === 'add' ? 'Product added successfully!' : 'Product updated successfully!');
      })
      .catch((err) => {
        console.error(err);
        triggerAlert('danger', 'Error saving product.');
      });

    setProductModal({ open: false, mode: 'add' });
  };

  const handleProductEdit = (item: Product) => {
    setProductForm({ ...item });
    setGalleryLinksText(item.images?.join(', ') || '');
    setModalTab('basic');

    // Parse RAM options: e.g. "8GB, 16GB (+5000)"
    const ramMap: { [key: string]: { enabled: boolean; offset: number } } = {
      '8GB': { enabled: false, offset: 0 },
      '16GB': { enabled: false, offset: 0 },
      '32GB': { enabled: false, offset: 0 },
      '64GB': { enabled: false, offset: 0 },
    };
    if (item.ram) {
      item.ram.split(',').forEach(opt => {
        const match = opt.match(/\(\s*([+-]?)\s*([0-9]+)\s*\)/);
        const size = opt.replace(/\s*\(\s*[+-]?\s*[0-9]+\s*\)/, '').trim();
        if (size) {
          let offset = 0;
          if (match) {
            offset = parseInt(match[2], 10);
            if (match[1] === '-') offset = -offset;
          }
          ramMap[size] = { enabled: true, offset };
        }
      });
    }
    setSelectedRamOptions(ramMap);

    // Parse Storage options: e.g. "256GB SSD, 512GB SSD (+4000)"
    const storageMap: { [key: string]: { enabled: boolean; offset: number } } = {
      '128GB SSD': { enabled: false, offset: 0 },
      '256GB SSD': { enabled: false, offset: 0 },
      '512GB SSD': { enabled: false, offset: 0 },
      '1TB SSD': { enabled: false, offset: 0 },
      '2TB SSD': { enabled: false, offset: 0 },
    };
    if (item.storage) {
      item.storage.split(',').forEach(opt => {
        const match = opt.match(/\(\s*([+-]?)\s*([0-9]+)\s*\)/);
        const size = opt.replace(/\s*\(\s*[+-]?\s*[0-9]+\s*\)/, '').trim();
        if (size) {
          let offset = 0;
          if (match) {
            offset = parseInt(match[2], 10);
            if (match[1] === '-') offset = -offset;
          }
          storageMap[size] = { enabled: true, offset };
        }
      });
    }
    setSelectedStorageOptions(storageMap);

    setProductModal({ open: true, mode: 'edit', item });
  };

  const handleProductDelete = async (id: any) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const product = products.find(p => p.id === id);
    if (product) {
      const ids = [
        product.imagePublicId,
        ...(product.imagePublicIds || []),
      ].filter(Boolean) as string[];
      await deleteCloudinaryAssets(ids);
    }

    deleteDoc(doc(db, "products", String(id)))
      .then(() => triggerAlert('success', 'Product deleted successfully!'))
      .catch(() => triggerAlert('danger', 'Failed to delete product.'));
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const prevSnap = await getDoc(orderRef);
      const prevStatus = prevSnap.exists() ? prevSnap.data().status : undefined;

      await setDoc(orderRef, { status: newStatus }, { merge: true });

      // Auto-restore stock when an order is cancelled
      if (newStatus === 'Cancelled' && prevStatus !== 'Cancelled' && prevSnap.exists()) {
        const orderData = prevSnap.data();
        const items: { id: number; qty: number }[] = orderData.items || [];
        let restocked = 0;
        for (const item of items) {
          const productRef = doc(db, "products", String(item.id));
          const productSnap = await getDoc(productRef);
          if (productSnap.exists() && productSnap.data().stock !== undefined) {
            await updateDoc(productRef, { stock: increment(item.qty || 1) });
            restocked += item.qty || 1;
          }
        }
        triggerAlert('success', `Order #${orderId} cancelled. ${restocked} unit(s) returned to stock.`);
        return;
      }

      triggerAlert('success', `Order #${orderId} status set to "${newStatus}"`);
    } catch (err) {
      console.error("Error updating order status:", err);
      triggerAlert('danger', "Failed to update order status.");
    }
  };

  const LOW_STOCK_THRESHOLD = 3;

  const getStockStatus = (stock?: number): 'in' | 'low' | 'out' => {
    const qty = stock === undefined ? 5 : stock;
    if (qty <= 0) return 'out';
    if (qty <= LOW_STOCK_THRESHOLD) return 'low';
    return 'in';
  };

  const handleQuickStockUpdate = async (productId: any, newStock: number) => {
    const qty = Math.max(0, Number(newStock) || 0);
    try {
      await setDoc(doc(db, "products", String(productId)), { stock: qty }, { merge: true });
      triggerAlert('success', `Stock updated to ${qty} unit(s).`);
    } catch (err) {
      console.error("Error updating stock:", err);
      triggerAlert('danger', "Failed to update stock.");
    }
  };

  const handleSaveTracking = async (orderId: string, partner: string, awb: string) => {
    let trackingUrl = '';
    const cleanAwb = awb.trim();
    if (cleanAwb) {
      const lowerPartner = partner.toLowerCase();
      if (lowerPartner.includes('delhivery')) {
        trackingUrl = `https://www.delhivery.com/track/package/${cleanAwb}`;
      } else if (lowerPartner.includes('dtdc')) {
        trackingUrl = `https://www.dtdc.in/tracking/tracking_results.asp?pinno=${cleanAwb}`;
      } else if (lowerPartner.includes('bluedart')) {
        trackingUrl = `https://www.bluedart.com/tracking?awb=${cleanAwb}`;
      } else if (lowerPartner.includes('speedpost')) {
        trackingUrl = `https://www.indiapost.gov.in/VAS/Pages/trackconsignment.aspx`;
      } else if (lowerPartner.includes('shiprocket')) {
        trackingUrl = `https://shiprocket.co/tracking/${cleanAwb}`;
      } else if (lowerPartner.includes('st courier') || lowerPartner.includes('stcourier')) {
        trackingUrl = `https://stcourier.com/`;
      } else {
        trackingUrl = `https://www.google.com/search?q=track+package+${cleanAwb}`;
      }
    }

    try {
      await setDoc(doc(db, "orders", orderId), {
        courierPartner: partner,
        trackingId: cleanAwb,
        trackingUrl: trackingUrl
      }, { merge: true });
      triggerAlert('success', `Tracking saved for Order #${orderId}`);
    } catch (err) {
      console.error("Error saving tracking info:", err);
      triggerAlert('danger', "Failed to save tracking details.");
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete Order #${orderId} permanently?`)) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      triggerAlert('success', `Order #${orderId} deleted successfully.`);
    } catch (err) {
      console.error(err);
      triggerAlert('danger', `Error deleting Order #${orderId}.`);
    }
  };

  const triggerWhatsAppAlert = (ord: Order) => {
    const rawPhone = ord.address?.phone || "";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

    const text = `Hello ${ord.address?.name || "Customer"},\n\n` +
      `Your Laptopkart order *#${ord.orderId}* status has been updated to *${ord.status || 'Pending'}*! 📦\n\n` +
      (ord.trackingId ? `🚚 Courier: *${ord.courierPartner}*\n🔢 AWB Consignment: *${ord.trackingId}*\n🔗 Track Shipment: ${ord.trackingUrl}\n\n` : "") +
      `Thank you for shopping with Laptopkart! ⚡`;

    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Accessory CRUD Handlers
  const handleAccessorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(accessoryForm.price) || 0;
    const mrp = Number(accessoryForm.mrp) || 0;

    const docId = accessoryModal.mode === 'edit' ? String(accessoryModal.item!.id) : doc(collection(db, "accessories")).id;

    const aData: AccessoryProduct = {
      id: docId as any,
      name: accessoryForm.name || 'Generic Accessory',
      brand: accessoryForm.brand || 'Dell',
      category: accessoryForm.category || 'Monitors',
      price,
      mrp,
      rating: accessoryModal.mode === 'edit' ? accessoryModal.item!.rating : 4.5,
      reviews: accessoryModal.mode === 'edit' ? accessoryModal.item!.reviews : 5,
      specs: accessoryForm.specs || 'N/A',
      img: accessoryForm.img || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80&auto=format&fit=crop',
      imagePublicId: accessoryForm.imagePublicId || '',
    };

    setDoc(doc(db, "accessories", docId), aData)
      .then(() => {
        triggerAlert('success', accessoryModal.mode === 'add' ? 'Accessory added successfully!' : 'Accessory updated successfully!');
      })
      .catch((err) => {
        console.error(err);
        triggerAlert('danger', 'Error saving accessory.');
      });

    setAccessoryModal({ open: false, mode: 'add' });
  };

  const handleAccessoryEdit = (item: AccessoryProduct) => {
    setAccessoryForm({ ...item });
    const predefinedAccessoryCategories = ['Monitors', 'Docking Stations', 'Mice & Keyboards', 'Chargers & Power', 'Bags & Sleeves'];
    if (!predefinedAccessoryCategories.includes(item.category || '')) {
      setShowCustomCategoryInput(true);
    } else {
      setShowCustomCategoryInput(false);
    }
    setAccessoryModal({ open: true, mode: 'edit', item });
  };

  const handleAccessoryDelete = async (id: any) => {
    if (!confirm('Are you sure you want to delete this accessory?')) return;

    const acc = accessories.find((a: any) => a.id === id);
    if (acc?.imagePublicId) await deleteCloudinaryAssets([acc.imagePublicId]);

    deleteDoc(doc(db, "accessories", String(id)))
      .then(() => triggerAlert('success', 'Accessory deleted successfully!'))
      .catch(() => triggerAlert('danger', 'Failed to delete accessory.'));
  };

  // Banner CRUD Handlers
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerForm.title?.trim()) {
      return triggerAlert('danger', 'Banner title is required');
    }
    if (!bannerForm.src?.trim()) {
      return triggerAlert('danger', 'Please upload or provide a banner image');
    }

    const docId = bannerForm.title
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase()
      .trim() || doc(collection(db, "banners")).id;

    const bData: Banner = {
      src: bannerForm.src,
      badge: bannerForm.badge || 'Offers',
      title: bannerForm.title.trim(),
      desc: bannerForm.desc?.trim() || '',
      target: bannerForm.target || 'listing',
      imagePublicId: bannerForm.imagePublicId || '',
    };

    try {
      await setDoc(doc(db, "banners", docId), bData);
      triggerAlert('success', 'Banner published successfully!');

      // Reset form
      setBannerForm({
        src: '',
        badge: 'Offers',
        title: '',
        desc: '',
        target: 'listing',
      });
      setBannerModal({ open: false });
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error publishing banner.');
    }
  };

  const handleHeroPosterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!heroPosterForm.title?.trim()) {
      return triggerAlert('danger', 'Poster title is required');
    }
    if (!heroPosterForm.src?.trim()) {
      return triggerAlert('danger', 'Please upload or provide a poster image');
    }

    const docId = heroPosterForm.title
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase()
      .trim() || doc(collection(db, "heroPosters")).id;

    const hData = {
      src: heroPosterForm.src,
      mobileSrc: heroPosterForm.mobileSrc || '',
      title: heroPosterForm.title.trim(),
      target: heroPosterForm.target || 'listing',
      imagePublicId: heroPosterForm.imagePublicId || '',
      mobileSrcPublicId: heroPosterForm.mobileSrcPublicId || '',
    };

    try {
      await setDoc(doc(db, "heroPosters", docId), hData);
      triggerAlert('success', 'Hero poster published successfully!');

      setHeroPosterForm({ src: '', mobileSrc: '', title: '', target: 'listing' });
      setHeroPosterModal({ open: false });
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error publishing hero poster.');
    }
  };

  const handleDeleteHeroPoster = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this hero poster?')) return;

    const poster = heroPosters.find((p: any) => p.id === docId || p.title?.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() === docId);
    if (poster) {
      const ids = [poster.imagePublicId, poster.mobileSrcPublicId].filter(Boolean) as string[];
      await deleteCloudinaryAssets(ids);
    }

    deleteDoc(doc(db, "heroPosters", docId))
      .then(() => triggerAlert('success', 'Hero poster deleted!'))
      .catch(() => triggerAlert('danger', 'Failed to delete hero poster.'));
  };

  const handleBannerDelete = async (title: string) => {
    if (!confirm('Are you sure you want to delete this slide banner?')) return;

    const docId = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const banner = banners.find((b: any) => b.title === title);
    if (banner?.imagePublicId) await deleteCloudinaryAssets([banner.imagePublicId]);

    deleteDoc(doc(db, "banners", docId))
      .then(() => triggerAlert('success', 'Banner removed successfully!'))
      .catch(() => triggerAlert('danger', 'Error removing banner.'));
  };

  const handleBlogDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      deleteDoc(doc(db, "blogs", id))
        .then(() => triggerAlert('success', 'Blog post deleted successfully!'))
        .catch(() => triggerAlert('danger', 'Failed to delete blog post.'));
    }
  };

  const handleToggleBlogApproval = async (id: string, currentApproved: boolean) => {
    try {
      const isApproved = currentApproved === undefined || currentApproved === true ? false : true;
      await setDoc(doc(db, "blogs", id), { approved: isApproved }, { merge: true });
      triggerAlert('success', `Blog status updated successfully!`);
    } catch (err) {
      console.error("Error updating blog status:", err);
      triggerAlert('danger', 'Failed to update blog status.');
    }
  };

  const handleDeleteWinner = async (rank: 1 | 2 = 1) => {
    if (!window.confirm(`Are you sure you want to remove the currently announced ${rank === 1 ? '1st' : '2nd'} prize winner?`)) return;
    try {
      if (rank === 1) {
        await deleteDoc(doc(db, 'giveaway', 'lastWinner'));
        setLastWinnerData(null);
      } else {
        await deleteDoc(doc(db, 'giveaway', 'secondWinner'));
        setSecondWinnerData(null);
      }
      triggerAlert('success', `${rank === 1 ? '1st' : '2nd'} Prize Winner removed successfully.`);
    } catch (err) {
      console.error("Error removing winner:", err);
      triggerAlert('danger', 'Failed to remove winner.');
    }
  };

  const handleMakeWinner = async (blog: any, rank: 1 | 2 = 1) => {
    if (!window.confirm(`Make ${blog.author || blog.authorName || 'User'} the ${rank === 1 ? '1st' : '2nd'} prize winner for this week's contest?`)) return;
    try {
      const docName = rank === 1 ? 'lastWinner' : 'secondWinner';
      await setDoc(doc(db, 'giveaway', docName), {
        blogId: blog.id,
        name: blog.authorName || blog.author || (blog.authorEmail ? blog.authorEmail.split('@')[0] : 'Unknown'),
        city: blog.collegeId || 'Student',
        blogTitle: blog.title,
        photo: blog.authorPhoto || '',
        announcedAt: new Date().toISOString()
      });
      triggerAlert('success', `${rank === 1 ? '1st' : '2nd'} Prize Winner announced and saved to Firestore!`);
    } catch (err) {
      console.error("Error setting winner:", err);
      triggerAlert('danger', 'Failed to announce winner.');
    }
  };

  // Filter lists
  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())) &&
    (stockFilter === 'all' || getStockStatus(p.stock) === stockFilter)
  );

  const filteredAccessories = accessories.filter(a =>
    a.name.toLowerCase().includes(accessorySearch.toLowerCase()) ||
    a.brand.toLowerCase().includes(accessorySearch.toLowerCase())
  );

  const filteredBlogs = blogs.filter(b => {
    if (blogContestFilter) {
      const isContest = b.isContestEntry === true || (b.category && b.category.includes("Weekly Contest")) || !!b.contestTopic;
      if (!isContest) return false;
    }
    return (
      (b.title || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
      (b.authorEmail || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
      (b.category || '').toLowerCase().includes(blogSearch.toLowerCase())
    );
  });

  // Newsletter Actions
  const handleSubscriberDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this subscriber email?")) return;
    try {
      await deleteDoc(doc(db, "subscribers", id));
      triggerAlert('success', 'Subscriber removed successfully.');
    } catch (err) {
      console.error("Delete subscriber failed:", err);
      triggerAlert('danger', 'Failed to remove subscriber.');
    }
  };

  const handleBccMailto = () => {
    if (subscribers.length === 0) {
      return triggerAlert('danger', 'No subscribers available to email.');
    }
    const bccList = subscribers.map(s => s.email).join(',');
    const subject = encodeURIComponent(broadcastSubject || "Special Offers from Laptopkart!");
    const body = encodeURIComponent(broadcastBody || "");
    const url = `mailto:srivasavibusiness09@gmail.com?bcc=${bccList}&subject=${subject}&body=${body}`;
    window.open(url, "_blank");
  };

  const handleCopyEmails = () => {
    if (subscribers.length === 0) {
      return triggerAlert('danger', 'No email addresses to copy.');
    }
    const emailList = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    triggerAlert('success', 'All subscriber email addresses copied!');
  };

  // Sell Requests Actions
  const handleSellStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await setDoc(doc(db, "sell_requests", id), { status: newStatus }, { merge: true });
      triggerAlert('success', `Status updated to ${newStatus}`);
      if (sellDetailModal.open && sellDetailModal.item?.id === id) {
        setSellDetailModal(prev => ({ ...prev, item: { ...prev.item, status: newStatus } }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      triggerAlert('danger', 'Failed to update status.');
    }
  };

  const handleSellDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sell request?")) return;
    try {
      await deleteDoc(doc(db, "sell_requests", id));
      triggerAlert('success', 'Sell request deleted successfully.');
      if (sellDetailModal.open && sellDetailModal.item?.id === id) {
        setSellDetailModal({ open: false });
      }
    } catch (err) {
      console.error("Failed to delete sell request:", err);
      triggerAlert('danger', 'Failed to delete sell request.');
    }
  };

  // Coupon Actions
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponDiscount) {
      return triggerAlert('danger', 'Coupon Code and Discount are required.');
    }
    const code = couponCode.trim().toUpperCase();
    const minVal = Number(couponMinCartValue);
    const uses = Number(couponMaxUses);
    const disc = Number(couponDiscount);
    const maxDisc = Number(couponMaxDiscount);

    try {
      await setDoc(doc(db, "coupons", code), {
        code,
        discountType: couponDiscountType,
        discount: disc,
        maxDiscountAmount: maxDisc > 0 ? maxDisc : null,
        minCartValue: minVal > 0 ? minVal : 0,
        maxUses: uses > 0 ? uses : null,
        usedCount: 0,
        usedBy: [],
        createdAt: new Date().toISOString()
      });
      triggerAlert('success', `Coupon ${code} created successfully.`);
      setCouponCode("");
      setCouponDiscount("");
      setCouponMaxDiscount("");
      setCouponMinCartValue("");
      setCouponMaxUses("");
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Failed to create coupon.');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    try {
      await deleteDoc(doc(db, "coupons", code));
      triggerAlert('success', 'Coupon deleted.');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Failed to delete coupon.');
    }
  };

  const handleSendAutomatedBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribers.length === 0) {
      return triggerAlert('danger', 'No subscribers to broadcast to.');
    }
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      return triggerAlert('danger', 'Please enter a Subject and Message Body.');
    }

    setSendingBroadcast(true);
    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: broadcastSubject,
          body: broadcastBody
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('success', 'Newsletter email broadcast sent successfully!');
        setBroadcastSubject('');
        setBroadcastBody('');
      } else {
        triggerAlert('danger', `Broadcast failed: ${data.message || 'Unknown backend error'}`);
      }
    } catch (err) {
      console.error("Automated broadcast failed:", err);
      triggerAlert('danger', 'Automated email service is currently unavailable.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("[Auth] Logout failed:", err);
    }
  };

  const orderStats = {
    total: orders.length,
    today: orders.filter(ord => ord.createdAt && new Date(ord.createdAt).toDateString() === new Date().toDateString()).length,
    active: orders.filter(ord => {
      const s = ord.status || 'Pending';
      return s !== 'Completed' && s !== 'Cancelled' && s !== 'Pending Payment' && s !== 'Failed';
    }).length,
    completed: orders.filter(ord => (ord.status || 'Pending') === 'Completed').length,
    unpaid: orders.filter(ord => {
      const s = ord.status || 'Pending';
      return s === 'Pending Payment' || s === 'Failed';
    }).length,
    revenue: orders.filter(ord => {
      const s = ord.status || 'Pending';
      return s !== 'Cancelled' && s !== 'Pending (COD)' && s !== 'Pending Payment' && s !== 'Failed';
    }).reduce((sum, ord) => sum + ord.total, 0),
  };

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#38BDF8', fontFamily: 'Sora', fontSize: 14, fontWeight: 700 }}>
          <span style={{ width: 18, height: 18, border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Verifying session...
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin error={authError} onClearError={() => setAuthError(null)} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>

      {/* ── Mobile Sidebar Overlay ── */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
        />
      )}

      {/* ── Left Sidebar ── */}
      <aside className="thin-scrollbar" style={{
        width: 260,
        background: '#131a24',
        borderRight: '1px solid rgba(56, 189, 248, 0.12)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        overflowY: 'auto',
        ...(isMobile ? {
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: isSidebarOpen ? 0 : -260,
          zIndex: 50,
          transition: 'left 0.3s ease'
        } : {
          position: 'sticky',
          top: 0,
          height: '100vh'
        })
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'linear-gradient(135deg, #3B82F6, #38BDF8)',
            width: 32, height: 32, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontWeight: 800
          }}>
            LK
          </div>
          <span style={{
            fontFamily: 'Sora', fontSize: 18, fontWeight: 800,
            background: 'linear-gradient(135deg, #fff, #38BDF8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Laptopkart Admin
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            {
              group: 'Main Dashboard', items: [
                { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> }
              ]
            },
            {
              group: 'Sales & Requests', items: [
                { id: 'orders', label: 'Customer Orders', icon: <FileText size={18} />, count: orders.filter(ord => !['Completed', 'Cancelled', 'Pending Payment', 'Failed'].includes(ord.status || 'Pending')).length },
                { id: 'sell_requests', label: 'Sell Requests', icon: <RefreshCw size={18} />, count: sellRequests.filter(r => (r.status || 'Pending Review') === 'Pending Review').length },
                { id: 'product_requests', label: 'Product Requests', icon: <ClipboardList size={18} />, count: productRequests.filter(req => req.status === 'Pending').length },
              ]
            },
            {
              group: 'Catalog Management', items: [
                { id: 'products', label: 'Laptops & PCs', icon: <Laptop size={18} /> },
                { id: 'accessories', label: 'Accessories', icon: <Keyboard size={18} /> },
              ]
            },
            {
              group: 'Marketing & Storefront', items: [
                { id: 'banners', label: 'Banners', icon: <ImageIcon size={18} /> },
                { id: 'hero_posters', label: 'Hero Posters', icon: <ImageIcon size={18} /> },
                { id: 'video', label: 'Promo Video', icon: <Video size={18} /> },
                { id: 'coupons', label: 'Coupons', icon: <Tag size={18} /> },
              ]
            },
            {
              group: 'Content & Community', items: [
                { id: 'student_hub', label: 'Student Hub', icon: <Sparkles size={18} /> },
                { id: 'blogs', label: 'Tech Blogs', icon: <BookOpen size={18} /> },
                { id: 'subscribers', label: 'Newsletter', icon: <Mail size={18} /> },
                { id: 'colleges', label: 'College QRs', icon: <Target size={18} /> },
                { id: 'clients', label: 'Clients & Collaborators', icon: <Briefcase size={18} /> },
              ]
            },
            {
              group: 'Administration', items: [
                { id: 'users', label: 'Users', icon: <User size={18} /> },
                { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
              ]
            }
          ].map(section => (
            <div key={section.group} style={{ marginBottom: 12 }}>
              <div style={{ color: '#8B9BBE', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, padding: '0 16px', marginBottom: 8, opacity: 0.6 }}>
                {section.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {section.items.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between',
                      background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                      color: activeTab === tab.id ? '#38BDF8' : '#8B9BBE',
                      border: activeTab === tab.id ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
                      borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                      fontFamily: 'Outfit'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {tab.icon}
                      {tab.label}
                    </div>
                    {(tab as any).count > 0 && (
                      <span style={{
                        background: '#EF4444',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 100,
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)'
                      }}>
                        {(tab as any).count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>



        {/* Footer info */}
        <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
            <Sparkles size={12} /> Local Sync Active
          </div>
          <p style={{ color: '#8B9BBE', fontSize: 11, lineHeight: 1.4 }}>
            Any changes written here will reflect immediately on client storefront pages.
          </p>
        </div>

        {/* Admin session */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#E8EDF5', fontSize: 12, fontWeight: 700, fontFamily: 'Sora', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {admin?.email || 'Admin'}
            </div>
            <div style={{ color: '#8B9BBE', fontSize: 11 }}>Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', padding: 8, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main style={{ flex: 1, padding: isMobile ? '20px 16px' : '40px 32px', overflowY: 'auto', overflowX: 'hidden' }}>

        {/* Mobile Header Toggle */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'rgba(56,189,248,0.1)', border: 'none', color: '#38BDF8', padding: 8, borderRadius: 8, cursor: 'pointer' }}>
              <Menu size={20} />
            </button>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Sora' }}>Laptopkart Admin</div>
          </div>
        )}

        {/* Push Notification Setup Banner */}
        {notificationPermission !== 'granted' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#F59E0B',
                padding: 10,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bell size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0, fontFamily: 'Sora' }}>
                  {notificationPermission === 'denied' ? 'Notification Bar Blocked' : 'Enable Mobile Notifications'}
                </h4>
                <p style={{ color: '#8B9BBE', fontSize: 12, margin: '4px 0 0 0', lineHeight: 1.4, fontFamily: 'Outfit' }}>
                  {notificationPermission === 'denied'
                    ? 'Browser notifications are blocked. Please reset site permissions in your Chrome browser settings to receive order alerts in your mobile notification bar.'
                    : 'Get real-time order alerts pushed directly to your phone\'s notification bar, even when the browser is closed.'}
                </p>
              </div>
            </div>
            {notificationPermission !== 'denied' && (
              <button
                onClick={requestNotificationPermission}
                style={{
                  background: '#F59E0B',
                  color: '#0d1117',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Outfit',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              >
                Enable Notifications
              </button>
            )}
          </div>
        )}

        {/* Alert Banner */}
        {alertMsg && (
          <div style={{
            position: 'fixed', top: 24, right: 32, zIndex: 1000,
            background: alertMsg.type === 'success' ? '#10B981' : '#EF4444',
            color: '#fff', padding: '12px 24px', borderRadius: 12,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontWeight: 700, fontSize: 14,
            animation: 'fadeIn 0.25s ease'
          }}>
            <CheckCircle size={16} /> {alertMsg.text}
          </div>
        )}

        {/* Real-time Order Popup notification */}
        {newOrderAlert && (
          <div style={{
            position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 11000,
            background: 'linear-gradient(135deg, #131a24, #0d1117)',
            border: '2px solid #38BDF8', borderRadius: 20, padding: '20px 24px',
            boxShadow: '0 20px 50px rgba(56,189,248,0.25)', width: '90%', maxWidth: 460,
            display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.3s ease',
            color: '#E8EDF5'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em' }}>
                <Bell size={16} className="shake" /> NEW STORE ORDER RECEIVED!
              </div>
              <button onClick={() => setNewOrderAlert(null)} style={{ background: 'transparent', border: 'none', color: '#8B9BBE', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 10 }}>
              <img src={newOrderAlert.items[0]?.img} style={{ width: 60, height: 45, borderRadius: 6, objectFit: 'cover' }} />
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{newOrderAlert.items[0]?.name}</div>
                <div style={{ color: '#8B9BBE', fontSize: 11, marginTop: 2 }}>Order ID: #{newOrderAlert.orderId} • Total: ₹{newOrderAlert.total.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#8B9BBE', textAlign: 'right' }}>
              Shipping to: <strong>{newOrderAlert.address?.name}</strong>, {newOrderAlert.address?.city}
            </div>
          </div>
        )}

        {/* ── Tab: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              Overview Dashboard
            </h1>
            <p style={{ color: '#8B9BBE', fontSize: 15, marginBottom: 32 }}>
              Real-time analytics and inventory statistics.
            </p>

            {/* Order Statistics */}
            <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#38BDF8" /> Order Statistics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Total Orders Received', val: orderStats.total.toLocaleString('en-IN'), icon: <FileText size={20} color="#38BDF8" />, bg: 'rgba(56,189,248,0.1)' },
                { label: 'New Orders Today', val: orderStats.today.toLocaleString('en-IN'), icon: <Sparkles size={20} color="#10B981" />, bg: 'rgba(16,185,129,0.1)' },
                { label: 'Active Orders', val: orderStats.active.toLocaleString('en-IN'), icon: <Truck size={20} color="#8B5CF6" />, bg: 'rgba(139,92,246,0.1)' },
                { label: 'Completed Orders', val: orderStats.completed.toLocaleString('en-IN'), icon: <CheckCircle size={20} color="#10B981" />, bg: 'rgba(16,185,129,0.1)' },
                { label: 'Unpaid / Pending Payment', val: orderStats.unpaid.toLocaleString('en-IN'), icon: <Clock size={20} color="#F59E0B" />, bg: 'rgba(245,158,11,0.1)' },
                { label: 'Total Sales Revenue', val: `₹${orderStats.revenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={20} color="#06B6D4" />, bg: 'rgba(6,182,212,0.1)' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                  borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 20
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ color: '#8B9BBE', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, fontFamily: 'Sora' }}>{stat.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Catalog Overview */}
            <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Laptop size={18} color="#38BDF8" /> Catalog Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Total Products', val: products.length, icon: <Laptop size={20} color="#38BDF8" />, bg: 'rgba(56,189,248,0.1)' },
                { label: 'Accessories Listed', val: accessories.length, icon: <Keyboard size={20} color="#8B5CF6" />, bg: 'rgba(139,92,246,0.1)' },
                { label: 'Active Banner Slides', val: banners.length, icon: <ImageIcon size={20} color="#EF4444" />, bg: 'rgba(239,68,68,0.1)' },
                { label: 'Hero Posters', val: heroPosters.length, icon: <ImageIcon size={20} color="#06B6D4" />, bg: 'rgba(6,182,212,0.1)' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                  borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', gap: 20
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ color: '#8B9BBE', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, fontFamily: 'Sora' }}>{stat.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stock & Inventory Overview */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(6,182,212,0.04))',
              border: '1px solid rgba(16,185,129,0.18)',
              borderRadius: 24, padding: 28, marginBottom: 32,
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(6,182,212,0.15))',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981'
                  }}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Sora', fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                      Stock & Inventory Overview
                    </h2>
                    <p style={{ color: '#8B9BBE', fontSize: 12, margin: '2px 0 0' }}>
                      {(() => {
                        const totalProducts = products.length;
                        const soldOut = products.filter(p => getStockStatus(p.stock) === 'out').length;
                        return `${totalProducts} products tracked • ${soldOut} currently sold out`;
                      })()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  style={{
                    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                    color: '#38BDF8', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 800,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Sora',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; }}
                >
                  Manage Inventory <ArrowUpRight size={15} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
                {[
                  {
                    label: 'In Stock', sub: 'products',
                    val: products.filter(p => getStockStatus(p.stock) === 'in').length.toLocaleString('en-IN'),
                    icon: <CheckCircle size={20} color="#10B981" />,
                    accent: '#10B981', grad: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))',
                    glow: '0 0 30px rgba(16,185,129,0.12)'
                  },
                  {
                    label: 'Low Stock', sub: 'needs attention',
                    val: products.filter(p => getStockStatus(p.stock) === 'low').length.toLocaleString('en-IN'),
                    icon: <AlertTriangle size={20} color="#F59E0B" />,
                    accent: '#F59E0B', grad: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05))',
                    glow: '0 0 30px rgba(245,158,11,0.12)'
                  },
                  {
                    label: 'Sold Out', sub: 'need restock',
                    val: products.filter(p => getStockStatus(p.stock) === 'out').length.toLocaleString('en-IN'),
                    icon: <PackageX size={20} color="#EF4444" />,
                    accent: '#EF4444', grad: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.05))',
                    glow: '0 0 30px rgba(239,68,68,0.12)'
                  },
                  {
                    label: 'Total Units', sub: 'available now',
                    val: products.reduce((sum, p) => sum + (p.stock === undefined ? 0 : p.stock), 0).toLocaleString('en-IN'),
                    icon: <Package size={20} color="#06B6D4" />,
                    accent: '#06B6D4', grad: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.05))',
                    glow: '0 0 30px rgba(6,182,212,0.12)'
                  },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: '#131a24',
                    border: `1px solid ${stat.accent}26`,
                    borderTop: `3px solid ${stat.accent}`,
                    borderRadius: 18, padding: '22px 20px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                    boxShadow: stat.glow,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative', overflow: 'hidden'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = stat.glow; }}
                  >
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: stat.grad, pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.grad, border: `1px solid ${stat.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stat.icon}
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.accent, boxShadow: `0 0 12px ${stat.accent}`, opacity: 0.9 }} />
                    </div>
                    <div>
                      <div style={{ color: '#8B9BBE', fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{stat.label}</div>
                      <div style={{ color: '#fff', fontSize: 26, fontWeight: 850, fontFamily: 'Sora', lineHeight: 1.1 }}>{stat.val}</div>
                      <div style={{ color: stat.accent, fontSize: 11, fontWeight: 600, marginTop: 4 }}>{stat.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Distribution bar */}
              {(() => {
                const total = Math.max(1, products.length);
                const inCount = products.filter(p => getStockStatus(p.stock) === 'in').length;
                const lowCount = products.filter(p => getStockStatus(p.stock) === 'low').length;
                const outCount = products.filter(p => getStockStatus(p.stock) === 'out').length;
                return (
                  <div style={{ background: 'rgba(13,17,23,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory Health</span>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>
                        {Math.round(((inCount + lowCount) / total) * 100)}% sellable
                      </span>
                    </div>
                    <div style={{ display: 'flex', height: 10, borderRadius: 100, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', marginBottom: 12 }}>
                      <div style={{ width: `${(inCount / total) * 100}%`, background: 'linear-gradient(90deg, #10B981, #34D399)', transition: 'width 0.4s' }} />
                      <div style={{ width: `${(lowCount / total) * 100}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', transition: 'width 0.4s' }} />
                      <div style={{ width: `${(outCount / total) * 100}%`, background: 'linear-gradient(90deg, #EF4444, #F87171)', transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {[
                        { label: 'In Stock', count: inCount, color: '#34D399' },
                        { label: 'Low Stock', count: lowCount, color: '#FBBF24' },
                        { label: 'Sold Out', count: outCount, color: '#F87171' },
                      ].map(item => (
                        <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8B9BBE' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                          {item.label}: <strong style={{ color: '#fff', marginLeft: 2 }}>{item.count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Incoming Customer Orders Section */}
            <div style={{
              background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
              borderRadius: 20, padding: 24
            }}>
              <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#38BDF8" /> Incoming Customer Orders
              </h2>
              {orders.length === 0 ? (
                <p style={{ color: '#8B9BBE', fontSize: 13, fontStyle: 'italic' }}>
                  No customer orders placed yet. Place an order on the checkout page to see it here.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                  {orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.orderId}
                      onClick={() => { setActiveTab('orders'); setOrdersFilter('active'); }}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(56,189,248,0.06)',
                        borderRadius: 12, padding: 12,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.18)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.06)';
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img src={ord.items[0]?.img} style={{ width: 44, height: 33, borderRadius: 4, objectFit: 'cover' }} />
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Order #{ord.orderId}</div>
                          <div style={{ color: '#8B9BBE', fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ord.items.map(it => `${it.name} (x${it.qty})`).join(', ')}
                          </div>
                          <div style={{ color: '#38BDF8', fontSize: 10 }}>By {ord.address.name} • {ord.address.city}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#38BDF8', fontWeight: 850, fontSize: 13 }}>₹{ord.total.toLocaleString('en-IN')}</div>
                        {(() => {
                          const status = ord.status || 'Pending';
                          let bg = 'rgba(56,189,248,0.1)';
                          let color = '#38BDF8';
                          if (status === 'Cancelled') {
                            bg = 'rgba(239,68,68,0.1)';
                            color = '#EF4444';
                          } else if (status === 'Pending (COD)') {
                            bg = 'rgba(245,158,11,0.1)';
                            color = '#F59E0B';
                          } else if (status === 'Completed') {
                            bg = 'rgba(16,185,129,0.1)';
                            color = '#10B981';
                          }
                          return (
                            <span style={{
                              fontSize: 9,
                              background: bg,
                              color: color,
                              padding: '2px 6px',
                              borderRadius: 100,
                              display: 'inline-block',
                              marginTop: 2,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em'
                            }}>
                              {status}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: PRODUCTS MANAGER ── */}
        {activeTab === 'products' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Laptops & Desktops Catalog
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Manage store listings, grade parameters, specs, and price metrics.
                </p>
              </div>

              <button
                onClick={() => {
                  setProductForm({
                    name: '', brand: 'Dell', category: 'Business', price: 0, mrp: 0,
                    rating: 4.8, reviews: 125,
                    condition: 'Refurbished', grade: 'A+', warranty: '1 Year Warranty',
                    specs: '', img: '', processor: '', ram: '8GB', storage: '256GB SSD', badge: 'Top Rated',
                    deviceType: 'Laptop'
                  });
                  setGalleryLinksText('');
                  setSelectedRamOptions({
                    '8GB': { enabled: true, offset: 0 },
                    '16GB': { enabled: false, offset: 0 },
                    '32GB': { enabled: false, offset: 0 },
                    '64GB': { enabled: false, offset: 0 },
                  });
                  setSelectedStorageOptions({
                    '128GB SSD': { enabled: false, offset: 0 },
                    '256GB SSD': { enabled: true, offset: 0 },
                    '512GB SSD': { enabled: false, offset: 0 },
                    '1TB SSD': { enabled: false, offset: 0 },
                    '2TB SSD': { enabled: false, offset: 0 },
                  });
                  setModalTab('basic');
                  setProductModal({ open: true, mode: 'add' });
                }}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000',
                  border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora'
                }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
              <input
                type="text" placeholder="Search catalog by name or brand..."
                value={productSearch} onChange={e => setProductSearch(e.target.value)}
                className="form-input" style={{ paddingLeft: 44 }}
              />
            </div>

            {/* Stock Filter Chips */}
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 8, width: 'fit-content'
            }}>
              {[
                { id: 'all' as const, label: 'All', color: '#38BDF8', icon: <Layers size={13} /> },
                { id: 'in' as const, label: 'In Stock', color: '#10B981', icon: <CheckCircle size={13} /> },
                { id: 'low' as const, label: 'Low Stock', color: '#F59E0B', icon: <AlertTriangle size={13} /> },
                { id: 'out' as const, label: 'Sold Out', color: '#EF4444', icon: <PackageX size={13} /> },
              ].map(opt => {
                const active = stockFilter === opt.id;
                const count = opt.id === 'all' ? products.length : products.filter(p => getStockStatus(p.stock) === opt.id).length;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setStockFilter(opt.id)}
                    style={{
                      background: active ? `${opt.color}1F` : 'transparent',
                      border: `1px solid ${active ? `${opt.color}55` : 'transparent'}`,
                      color: active ? opt.color : '#8B9BBE',
                      borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Sora',
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      boxShadow: active ? `0 0 18px ${opt.color}22` : 'none'
                    }}
                  >
                    {opt.icon}
                    {opt.label}
                    <span style={{
                      background: active ? opt.color : 'rgba(255,255,255,0.08)',
                      color: active ? '#0d1117' : '#8B9BBE',
                      borderRadius: 100, minWidth: 18, height: 18, padding: '0 5px',
                      fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Table Grid */}
            <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Condition</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Price / MRP</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Stock</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Specs</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: getStockStatus(p.stock) === 'out' ? 'rgba(239,68,68,0.03)' : 'transparent'
                    }}>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={p.img} alt={p.name} style={{ width: 44, height: 33, borderRadius: 6, objectFit: 'cover' }} />
                          <div>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                            <div style={{ color: '#38BDF8', fontSize: 11, fontWeight: 600 }}>{p.brand} • {p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        {p.condition === 'Brand New' ? (
                          <span style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 100, border: '1px solid rgba(139,92,246,0.2)' }}>Brand New</span>
                        ) : (
                          <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 100 }}>Refurbished (G: {p.grade})</span>
                        )}
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>₹{p.price.toLocaleString('en-IN')}</div>
                        <div style={{ color: '#8B9BBE', fontSize: 12, textDecoration: 'line-through' }}>₹{p.mrp.toLocaleString('en-IN')}</div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        {(() => {
                          const st = getStockStatus(p.stock);
                          const cfg = st === 'in'
                            ? { color: '#10B981', dot: '#10B981', bg: 'rgba(16,185,129,0.12)' }
                            : st === 'low'
                              ? { color: '#F59E0B', dot: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
                              : { color: '#EF4444', dot: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
                          const cap = 20;
                          const pct = Math.min(100, Math.max(0, ((p.stock === undefined ? 5 : p.stock) / cap) * 100));
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', minWidth: 96 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                                <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>
                                  {p.stock === undefined ? '—' : p.stock}
                                </span>
                                <span style={{ color: '#8B9BBE', fontSize: 10, fontWeight: 500 }}>units</span>
                              </div>
                              <div style={{ width: '100%', height: 5, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 100, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.dot})`, transition: 'width 0.3s' }} />
                              </div>
                              <span style={{
                                background: cfg.bg, color: cfg.color,
                                fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 100,
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                textTransform: 'uppercase', letterSpacing: '0.03em'
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}`, animation: 'pulse 1.6s ease-in-out infinite' }} />
                                {st === 'in' ? 'In Stock' : st === 'low' ? 'Low Stock' : 'Sold Out'}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 13, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.specs}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, 0)}
                            disabled={getStockStatus(p.stock) === 'out'}
                            title="Mark as Sold Out"
                            style={{
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                              color: '#EF4444', borderRadius: 8, width: 32, height: 32,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: getStockStatus(p.stock) === 'out' ? 'not-allowed' : 'pointer',
                              opacity: getStockStatus(p.stock) === 'out' ? 0.35 : 1,
                              transition: 'all 0.2s', flexShrink: 0
                            }}
                            onMouseEnter={e => { if (getStockStatus(p.stock) !== 'out') e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                          ><PackageX size={15} /></button>
                          <button
                            onClick={() => {
                              const currentStock = p.stock === undefined ? 0 : Number(p.stock);
                              const input = window.prompt(`Restock quantity for "${p.name}"`, String(currentStock + LOW_STOCK_THRESHOLD + 1));
                              if (input !== null) handleQuickStockUpdate(p.id, Number(input));
                            }}
                            title="Restock units"
                            style={{
                              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                              color: '#10B981', borderRadius: 8, width: 32, height: 32,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; }}
                          ><PackagePlus size={15} /></button>
                          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)' }} />
                          <button onClick={() => handleProductEdit(p)} style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', padding: 6 }} title="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => handleProductDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 6 }} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <PackageX size={28} color="#38BDF8" style={{ opacity: 0.6 }} />
                          </div>
                          <div>
                            <p style={{ color: '#E8EDF5', fontSize: 14, fontWeight: 700, margin: 0 }}>No products found</p>
                            <p style={{ color: '#8B9BBE', fontSize: 12, margin: '4px 0 0' }}>
                              Try adjusting the search text or stock filter.
                            </p>
                          </div>
                          <button
                            onClick={() => { setProductSearch(''); setStockFilter('all'); }}
                            style={{
                              background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                              color: '#38BDF8', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'Sora', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; }}
                          >Clear Filters</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: ACCESSORIES MANAGER ── */}
        {activeTab === 'accessories' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Accessories Catalog
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Manage peripherals, chargers, docks, and workspace items.
                </p>
              </div>

              <button
                onClick={() => {
                  setAccessoryForm({
                    name: '', category: 'Monitors', price: 0, mrp: 0, brand: 'Dell', specs: '', img: ''
                  });
                  setShowCustomCategoryInput(false);
                  setAccessoryModal({ open: true, mode: 'add' });
                }}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000',
                  border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora'
                }}
              >
                <Plus size={16} /> Add Accessory
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
              <input
                type="text" placeholder="Search accessories catalog..."
                value={accessorySearch} onChange={e => setAccessorySearch(e.target.value)}
                className="form-input" style={{ paddingLeft: 44 }}
              />
            </div>

            {/* Grid Table */}
            <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Item</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Specs</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccessories.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={a.img} alt={a.name} style={{ width: 44, height: 33, borderRadius: 6, objectFit: 'cover' }} />
                          <div>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                            <div style={{ color: '#38BDF8', fontSize: 11, fontWeight: 600 }}>{a.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px', color: '#fff', fontSize: 13 }}>
                        {a.category}
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>₹{a.price.toLocaleString('en-IN')}</div>
                        <div style={{ color: '#8B9BBE', fontSize: 12, textDecoration: 'line-through' }}>₹{a.mrp.toLocaleString('en-IN')}</div>
                      </td>
                      <td style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 13, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.specs}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleAccessoryEdit(a)} style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => handleAccessoryDelete(a.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAccessories.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#8B9BBE', fontSize: 14 }}>
                        No accessories listed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: BANNERS MANAGER ── */}
        {activeTab === 'banners' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Offers & Contest Banners
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Manage the homepage auto-sliding offer slides.
                </p>
              </div>

              <button
                onClick={() => {
                  setBannerForm({
                    src: '',
                    badge: 'Offers',
                    title: '',
                    desc: '',
                    target: 'listing',
                  });
                  setBannerModal({ open: true });
                }}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000',
                  border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora'
                }}
              >
                <Plus size={16} /> Add Banner Slide
              </button>
            </div>

            {/* Grid display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {banners.map((b, idx) => (
                <div key={idx} style={{
                  background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                  borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                    <img src={b.src} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute', top: 12, left: 12,
                      background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)',
                      color: '#38BDF8', fontSize: 10, fontWeight: 800, padding: '4px 10px',
                      borderRadius: 100, textTransform: 'uppercase'
                    }}>{b.badge}</span>
                  </div>
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontFamily: 'Sora', fontSize: 18, color: '#fff', margin: '0 0 6px' }}>{b.title}</h3>
                    <p style={{ color: '#8B9BBE', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>{b.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
                      <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 600 }}>Target view: {b.target.toUpperCase()}</span>
                      <button
                        onClick={() => handleBannerDelete(b.title)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: HERO POSTERS MANAGER ── */}
        {activeTab === 'hero_posters' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Hero Posters
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Manage the main homepage carousel slider images.
                </p>
              </div>

              <button
                onClick={() => {
                  setHeroPosterForm({
                    src: '',
                    title: '',
                    target: 'listing',
                  });
                  setHeroPosterModal({ open: true });
                }}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000',
                  border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora'
                }}
              >
                <Plus size={16} /> Add Hero Poster
              </button>
            </div>

            {/* Grid display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 24 }}>
              {heroPosters.map((hp) => (
                <div key={hp.docId} style={{
                  background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                  borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ height: 250, overflow: 'hidden', position: 'relative' }}>
                    <img src={hp.src} alt={hp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Sora', fontSize: 18, color: '#fff', margin: '0 0 6px' }}>{hp.title}</h3>
                      <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 600 }}>Target view: {hp.target?.toUpperCase()}</span>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDeleteHeroPoster(hp.docId)}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {heroPosters.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#8B9BBE' }}>
                  No hero posters uploaded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: CUSTOMER ORDERS MANAGER ── */}
        {activeTab === 'orders' && (() => {
          const activeOrders = orders.filter(ord => {
            const status = ord.status || 'Pending';
            return status !== 'Completed' && status !== 'Cancelled' && status !== 'Pending Payment' && status !== 'Failed';
          });
          const completedOrders = orders.filter(ord => {
            const status = ord.status || 'Pending';
            return status === 'Completed' || status === 'Cancelled';
          });
          const unpaidOrders = orders.filter(ord => {
            const status = ord.status || 'Pending';
            return status === 'Pending Payment' || status === 'Failed';
          });
          const displayedOrders =
            ordersFilter === 'active' ? activeOrders :
              ordersFilter === 'completed' ? completedOrders : unpaidOrders;

          const PAGE_SIZE = 20;
          const totalPages = Math.ceil(displayedOrders.length / PAGE_SIZE);
          const paginatedOrders = displayedOrders.slice(ordersPage * PAGE_SIZE, (ordersPage + 1) * PAGE_SIZE);

          const getStatusStyle = (status: string) => {
            switch (status) {
              case 'Completed': return { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.25)' };
              case 'Cancelled': return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.25)' };
              case 'Shipped': return { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: 'rgba(139,92,246,0.25)' };
              case 'Pending (COD)': return { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' };
              case 'Pending Payment': return { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' };
              case 'Failed': return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.25)' };
              case 'Paid (Simulated)': return { bg: 'rgba(6,182,212,0.12)', color: '#06B6D4', border: 'rgba(6,182,212,0.25)' };
              case 'Paid':
              default: return { bg: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: 'rgba(56,189,248,0.25)' };
            }
          };

          return (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                    Customer Orders Registry
                  </h1>
                  <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                    Manage incoming store transactions, delivery addresses, and shipping statuses.
                  </p>
                </div>
              </div>

              {/* Segmented Filter Control */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
                <button
                  onClick={() => { setOrdersFilter('active'); setOrdersPage(0); }}
                  style={{
                    background: ordersFilter === 'active' ? 'rgba(56,189,248,0.1)' : 'transparent',
                    border: `1px solid ${ordersFilter === 'active' ? 'rgba(56,189,248,0.25)' : 'transparent'}`,
                    borderRadius: 12, padding: '10px 20px',
                    color: ordersFilter === 'active' ? '#38BDF8' : '#8B9BBE',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'Sora', display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  Active Orders
                  <span style={{
                    background: ordersFilter === 'active' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)',
                    color: ordersFilter === 'active' ? '#38BDF8' : '#8B9BBE',
                    borderRadius: 100, fontSize: 11, padding: '2px 8px', fontWeight: 800
                  }}>
                    {activeOrders.length}
                  </span>
                </button>
                <button
                  onClick={() => { setOrdersFilter('completed'); setOrdersPage(0); }}
                  style={{
                    background: ordersFilter === 'completed' ? 'rgba(16,185,129,0.1)' : 'transparent',
                    border: `1px solid ${ordersFilter === 'completed' ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
                    borderRadius: 12, padding: '10px 20px',
                    color: ordersFilter === 'completed' ? '#10B981' : '#8B9BBE',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'Sora', display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  Completed & Archived
                  <span style={{
                    background: ordersFilter === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                    color: ordersFilter === 'completed' ? '#10B981' : '#8B9BBE',
                    borderRadius: 100, fontSize: 11, padding: '2px 8px', fontWeight: 800
                  }}>
                    {completedOrders.length}
                  </span>
                </button>
                <button
                  onClick={() => { setOrdersFilter('unpaid'); setOrdersPage(0); }}
                  style={{
                    background: ordersFilter === 'unpaid' ? 'rgba(239,68,68,0.1)' : 'transparent',
                    border: `1px solid ${ordersFilter === 'unpaid' ? 'rgba(239,68,68,0.25)' : 'transparent'}`,
                    borderRadius: 12, padding: '10px 20px',
                    color: ordersFilter === 'unpaid' ? '#EF4444' : '#8B9BBE',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'Sora', display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  Unpaid & Failed
                  <span style={{
                    background: ordersFilter === 'unpaid' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                    color: ordersFilter === 'unpaid' ? '#EF4444' : '#8B9BBE',
                    borderRadius: 100, fontSize: 11, padding: '2px 8px', fontWeight: 800
                  }}>
                    {unpaidOrders.length}
                  </span>
                </button>
              </div>

              {/* Orders List container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {paginatedOrders.length === 0 ? (
                  <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
                    <FileText size={48} color="#8B9BBE" style={{ marginBottom: 16, opacity: 0.5 }} />
                    <p style={{ color: '#8B9BBE', fontSize: 15, margin: 0 }}>
                      {ordersFilter === 'active'
                        ? 'No active customer orders to process. All set!'
                        : ordersFilter === 'completed'
                          ? 'No completed or archived customer orders found.'
                          : 'No unpaid or failed checkouts found.'}
                    </p>
                  </div>
                ) : (
                  paginatedOrders.map((ord) => (
                    <div key={ord.orderId} style={{
                      background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                      borderRadius: 24, padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                    }}>
                      {/* Header Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontFamily: 'Sora', color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>
                            Order #{ord.orderId}
                          </h3>
                          <span style={{ color: '#8B9BBE', fontSize: 12 }}>
                            Placed on: {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {((ord.status || 'Pending') === 'Completed' || (ord.status || 'Pending') === 'Cancelled' || (ord.status || 'Pending') === 'Failed' || (ord.status || 'Pending') === 'Pending Payment') && (
                            <button
                              onClick={() => handleOrderDelete(ord.orderId)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#EF4444',
                                borderRadius: 10,
                                padding: '6px 12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: 11,
                                fontWeight: 700,
                                fontFamily: 'Sora'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                              }}
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          )}
                          <span style={{ color: '#8B9BBE', fontSize: 12, fontWeight: 650 }}>Status:</span>
                          {(() => {
                            const currentStatus = ord.status || 'Pending';
                            const stStyle = getStatusStyle(currentStatus);
                            return (
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleOrderStatusChange(ord.orderId, e.target.value)}
                                  style={{
                                    background: stStyle.bg,
                                    color: stStyle.color,
                                    border: `1px solid ${stStyle.border}`,
                                    borderRadius: 100,
                                    padding: '6px 28px 6px 14px',
                                    fontSize: 11,
                                    fontWeight: 800,
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'Sora',
                                    letterSpacing: '0.03em',
                                    textTransform: 'uppercase',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <option value="Paid" style={{ background: '#131a24', color: '#fff' }}>Paid</option>
                                  <option value="Pending Payment" style={{ background: '#131a24', color: '#fff' }}>Pending Payment</option>
                                  <option value="Pending (COD)" style={{ background: '#131a24', color: '#fff' }}>Pending (COD)</option>
                                  <option value="Paid (Simulated)" style={{ background: '#131a24', color: '#fff' }}>Paid (Simulated)</option>
                                  <option value="Shipped" style={{ background: '#131a24', color: '#fff' }}>Shipped</option>
                                  <option value="Completed" style={{ background: '#131a24', color: '#fff' }}>Completed</option>
                                  <option value="Cancelled" style={{ background: '#131a24', color: '#fff' }}>Cancelled</option>
                                  <option value="Failed" style={{ background: '#131a24', color: '#fff' }}>Failed</option>
                                </select>
                                <span style={{
                                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                  pointerEvents: 'none', color: stStyle.color, display: 'flex', alignItems: 'center'
                                }}>
                                  <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Inline Courier Tracking Input Form for Shipped orders */}
                      {(ord.status === 'Shipped' || ord.status === 'Completed') && (
                        <div style={{
                          background: 'rgba(56,189,248,0.02)',
                          border: '1px solid rgba(56,189,248,0.12)',
                          borderRadius: 20, padding: 20, marginBottom: 24,
                          display: 'flex', flexDirection: 'column', gap: 16,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                        }}>
                          {/* Top Row with Header Icon and Auto Save status */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8', fontWeight: 800, fontSize: 12, fontFamily: 'Sora', letterSpacing: '0.04em' }}>
                              <Truck size={14} /> COURIER DISPATCH METADATA
                            </div>
                            <span style={{ fontSize: 10, color: '#8B9BBE', fontStyle: 'italic' }}>
                              {ord.trackingId ? '🟢 Details synchronized' : '⚡ Auto-saves on input blur'}
                            </span>
                          </div>

                          {/* Controls Row */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
                            {/* Courier selector */}
                            <div style={{ flex: 1, minWidth: 160 }}>
                              <label style={{ display: 'block', color: '#8B9BBE', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Courier Partner</label>
                              <div style={{ position: 'relative' }}>
                                <select
                                  value={ord.courierPartner || 'Delhivery'}
                                  onChange={(e) => handleSaveTracking(ord.orderId, e.target.value, ord.trackingId || '')}
                                  style={{
                                    width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer',
                                    appearance: 'none', WebkitAppearance: 'none'
                                  }}
                                >
                                  <option value="Delhivery">Delhivery</option>
                                  <option value="DTDC">DTDC</option>
                                  <option value="BlueDart">BlueDart</option>
                                  <option value="ST Courier">ST Courier</option>
                                  <option value="SpeedPost">India Post (Speed Post)</option>
                                  <option value="Shiprocket">Shiprocket</option>
                                  <option value="Custom">Custom Courier</option>
                                </select>
                                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#38BDF8', display: 'flex', alignItems: 'center' }}>
                                  <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              </div>
                            </div>

                            {/* Tracking ID */}
                            <div style={{ flex: 1.5, minWidth: 220 }}>
                              <label style={{ display: 'block', color: '#8B9BBE', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>AWB Tracking / Waybill Number</label>
                              <input
                                type="text"
                                placeholder="Enter AWB consignment code..."
                                defaultValue={ord.trackingId || ''}
                                onBlur={(e) => handleSaveTracking(ord.orderId, ord.courierPartner || 'Delhivery', e.target.value)}
                                style={{
                                  width: '100%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            {/* Tracking shortcut link button */}
                            {ord.trackingId && (
                              <a
                                href={ord.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                                  color: '#38BDF8', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                                  cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                                  fontFamily: 'Sora', transition: 'all 0.2s', height: 38, boxSizing: 'border-box'
                                }}
                              >
                                Test Tracking Link ↗
                              </a>
                            )}

                            {/* Send WhatsApp Alert button */}
                            <button
                              onClick={() => triggerWhatsAppAlert(ord)}
                              style={{
                                background: '#25D366', border: 'none',
                                color: '#000', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 800,
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                                fontFamily: 'Sora', transition: 'all 0.2s', height: 38, boxSizing: 'border-box'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#20ba5a'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.79-4.024c1.667.988 3.3 1.494 5.207 1.495 5.568 0 10.099-4.522 10.101-10.086.002-2.697-1.042-5.232-2.942-7.136S14.717 1.378 12.015 1.378c-5.57 0-10.107 4.524-10.109 10.092-.001 1.93.526 3.513 1.503 5.176l-.988 3.606 3.693-.972zm11.722-7.93c-.322-.162-1.905-.94-2.202-1.048-.297-.108-.514-.162-.73.162-.217.324-.838 1.048-1.027 1.265-.19.217-.378.243-.7.08-1.637-.818-2.775-1.433-3.886-3.333-.292-.5-.102-.77.06-.931.144-.144.322-.378.484-.567.162-.19.216-.324.324-.54.108-.217.054-.405-.027-.567-.08-.162-.73-1.76-1.002-2.411-.266-.64-.532-.553-.73-.563-.19-.009-.407-.01-.622-.01s-.567.08-.865.405c-.297.324-1.136 1.109-1.136 2.703s1.163 3.136 1.325 3.353c.162.217 2.291 3.5 5.55 4.908.775.334 1.38.533 1.85.682.78.248 1.49.213 2.05.129.624-.093 1.905-.779 2.176-1.495.271-.716.271-1.33.19-1.458-.08-.129-.297-.216-.62-.378z" />
                              </svg>
                              Send WhatsApp Alert
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Details Column Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.5fr 1fr', gap: 24, flexWrap: 'wrap' }}>
                        {/* Left: Ordered Items */}
                        <div>
                          <h4 style={{ color: '#8B9BBE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Items Purchased</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {ord.items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <img src={item.img} alt={item.name} style={{ width: 44, height: 33, borderRadius: 6, objectFit: 'cover', background: '#0d1117' }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }} title={item.name}>
                                    {item.name}
                                  </div>
                                  <div style={{ color: '#8B9BBE', fontSize: 11 }}>
                                    ₹{item.price.toLocaleString('en-IN')} × {item.qty}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Middle: Customer Details & Shipping Address */}
                        <div>
                          <h4 style={{ color: '#8B9BBE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Shipping & Customer Info</h4>
                          <div style={{ color: '#fff', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div>
                              <strong style={{ color: '#38BDF8' }}>Name:</strong> {ord.address.name || 'N/A'}
                            </div>
                            <div>
                              <strong style={{ color: '#38BDF8' }}>Phone:</strong> {ord.address.phone || 'N/A'}
                            </div>
                            {ord.email && (
                              <div>
                                <strong style={{ color: '#38BDF8' }}>Email:</strong> {ord.email}
                              </div>
                            )}
                            <div>
                              <strong style={{ color: '#38BDF8' }}>Address:</strong> {ord.address.street || 'N/A'}, {ord.address.city || 'N/A'}, {ord.address.state || 'N/A'} - {ord.address.pincode || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Right: Payment Method & Total */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', textAlign: isMobile ? 'left' : 'right' }}>
                          <div>
                            <h4 style={{ color: '#8B9BBE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Summary</h4>
                            <div style={{ color: '#8B9BBE', fontSize: 12, marginBottom: 4 }}>
                              Payment Method: <span style={{ color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>{ord.paymentMethod || 'Razorpay'}</span>
                            </div>
                          </div>
                          <div>
                            <div style={{ color: '#8B9BBE', fontSize: 12, marginBottom: 2 }}>Grand Total</div>
                            <div style={{ color: '#10B981', fontSize: 24, fontWeight: 850, fontFamily: 'Sora' }}>
                              ₹{ord.total.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
                  <button
                    disabled={ordersPage === 0}
                    onClick={() => setOrdersPage(p => Math.max(0, p - 1))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: ordersPage === 0 ? '#4b5563' : '#fff',
                      borderRadius: 10, padding: '8px 16px',
                      cursor: ordersPage === 0 ? 'not-allowed' : 'pointer',
                      fontFamily: 'Sora', fontWeight: 600, fontSize: 13
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ color: '#8B9BBE', fontSize: 13, fontWeight: 700, fontFamily: 'Sora' }}>
                    Page {ordersPage + 1} of {totalPages}
                  </span>
                  <button
                    disabled={ordersPage >= totalPages - 1}
                    onClick={() => setOrdersPage(p => Math.min(totalPages - 1, p + 1))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: ordersPage >= totalPages - 1 ? '#4b5563' : '#fff',
                      borderRadius: 10, padding: '8px 16px',
                      cursor: ordersPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      fontFamily: 'Sora', fontWeight: 600, fontSize: 13
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Tab: BLOGS MANAGER ── */}
        {activeTab === 'blogs' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Tech Blogs Moderator
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Review blog submissions, verify contest authors, and toggle visibility.
                </p>
              </div>
            </div>

            {/* Search Input & Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, maxWidth: 600 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
                <input
                  type="text" placeholder="Search by title, category, or author..."
                  value={blogSearch} onChange={e => setBlogSearch(e.target.value)}
                  className="form-input" style={{ paddingLeft: 44 }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B9BBE', fontSize: 14, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={blogContestFilter}
                  onChange={e => setBlogContestFilter(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Show Contest Entries Only
              </label>
            </div>

            {/* Blogs List Grid Table */}
            <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Article</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Author</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Views</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Review Status</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((b, idx) => {
                    const isApproved = b.approved !== false;
                    return (
                      <tr key={b.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '18px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={b.coverUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'} alt={b.title} style={{ width: 50, height: 35, borderRadius: 6, objectFit: 'cover' }} />
                            <div>
                              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{b.title}</div>
                              <div style={{ color: '#8B9BBE', fontSize: 11, marginTop: 2 }}>{b.reads || 0} views • {b.readTime || '3 min read'} • {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', color: '#fff', fontSize: 13 }}>
                          {b.category || 'Buying Guide'}
                        </td>
                        <td style={{ padding: '18px 24px', color: '#10B981', fontSize: 13, fontWeight: 700 }}>
                          <div>{b.author || 'Contest Writer'}</div>
                          {b.authorEmail && (
                            <div style={{ color: '#8B9BBE', fontSize: 11, fontWeight: 400, marginTop: 2 }}>{b.authorEmail}</div>
                          )}
                        </td>
                        <td style={{ padding: '18px 24px', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Eye size={14} color="#8B5CF6" /> {b.reads || 0}
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px' }}>
                          <button
                            onClick={() => handleToggleBlogApproval(b.id, b.approved)}
                            style={{
                              background: isApproved ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                              color: isApproved ? '#10B981' : '#EF4444',
                              border: `1px solid ${isApproved ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                              borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 800,
                              cursor: 'pointer', textTransform: 'uppercase'
                            }}
                          >
                            {isApproved ? 'Approved' : 'Hidden'}
                          </button>
                        </td>
                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                            {(b.isContestEntry === true || (b.category && b.category.includes("Weekly Contest")) || !!b.contestTopic) && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  onClick={() => handleMakeWinner(b, 1)}
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.1))', border: '1px solid rgba(245,158,11,0.3)',
                                    color: '#F59E0B', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'Sora', display: 'flex', alignItems: 'center', gap: 4
                                  }}
                                  title="Set as 1st Prize Winner"
                                >
                                  <Award size={8} /> 1st Prize
                                </button>
                                <button
                                  onClick={() => handleMakeWinner(b, 2)}
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(148,163,184,0.1), rgba(100,116,139,0.1))', border: '1px solid rgba(148,163,184,0.3)',
                                    color: '#94A3B8', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'Sora', display: 'flex', alignItems: 'center', gap: 4
                                  }}
                                  title="Set as 2nd Prize Winner"
                                >
                                  <Award size={8} /> 2nd Prize
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => setBlogReviewModal({ open: true, item: b })}
                              style={{
                                background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                                color: '#38BDF8', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'Sora'
                              }}
                            >
                              Review
                            </button>
                            <button onClick={() => handleBlogDelete(b.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', marginLeft: 4 }} title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBlogs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#8B9BBE', fontSize: 14 }}>
                        No blogs matched the search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: PROMO VIDEO MANAGER ── */}
        {activeTab === 'video' && (
          <div className="fade-in">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Promo Video Manager
              </h1>
              <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                Configure the promotional video shown on the homepage. You can input a direct link or upload a local video.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 32 }}>
              {/* Form Settings */}
              <div style={{
                background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                borderRadius: 24, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}>
                <form onSubmit={handleVideoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Section Title</label>
                    <input
                      type="text" required placeholder="e.g. Explore Laptopkart in Action"
                      value={videoTitle} onChange={e => setVideoTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Section Subtitle</label>
                    <input
                      type="text" placeholder="e.g. Watch our certified refurbishment process and see why thousands trust us."
                      value={videoSubtitle} onChange={e => setVideoSubtitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Video Link / Source URL</label>
                    <input
                      type="text" required placeholder="e.g. https://www.youtube.com/watch?v=... or direct Cloudinary link"
                      value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Video Display Orientation</label>
                    <select
                      value={videoOrientation} onChange={e => setVideoOrientation(e.target.value as any)}
                      className="form-input" style={{ background: '#0d1117', color: '#fff' }}
                    >
                      <option value="landscape">Landscape (Horizontal - 16:9)</option>
                      <option value="portrait">Portrait (Vertical - 9:16)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Section Eyebrow Label</label>
                    <input
                      type="text" placeholder="e.g. Introduction"
                      value={videoEyebrow} onChange={e => setVideoEyebrow(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Thumbnail / Poster Image (Optional)</label>
                    <input
                      type="text" placeholder="https://... or leave empty to auto-detect from a YouTube link"
                      value={videoPoster} onChange={e => setVideoPoster(e.target.value)}
                      className="form-input"
                    />
                    <div style={{ marginTop: 10 }}>
                      <input
                        type="file" accept="image/*" id="admin-poster-file-input"
                        onChange={handleVideoPosterUpload} style={{ display: 'none' }}
                        disabled={uploadingPoster}
                      />
                      <label
                        htmlFor="admin-poster-file-input"
                        style={{
                          display: 'inline-block', background: 'rgba(56,189,248,0.12)',
                          color: '#38BDF8', padding: '10px 20px', borderRadius: 10,
                          fontSize: 13, fontWeight: 700, cursor: uploadingPoster ? 'not-allowed' : 'pointer',
                          border: '1px solid rgba(56,189,248,0.2)'
                        }}
                      >
                        {uploadingPoster ? "Uploading poster..." : "Upload Poster Image"}
                      </label>
                      {videoPoster && (
                        <span style={{ color: '#8B9BBE', fontSize: 11, marginLeft: 12 }}>Poster set ✓</span>
                      )}
                    </div>
                  </div>

                  {/* Local file upload option */}
                  <div style={{
                    border: '1px dashed rgba(56,189,248,0.24)', borderRadius: 16,
                    padding: 24, background: 'rgba(56,189,248,0.02)', textAlign: 'center'
                  }}>
                    <Video size={36} color="#38BDF8" style={{ marginBottom: 12 }} />
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Upload Local Video File</div>
                    <p style={{ color: '#8B9BBE', fontSize: 12, margin: '0 0 16px' }}>Select an mp4 video to host it on Cloudinary automatically.</p>
                    <input
                      type="file" accept="video/*" id="admin-video-file-input"
                      onChange={handleVideoUpload} style={{ display: 'none' }}
                      disabled={uploadingVideo}
                    />
                    <label
                      htmlFor="admin-video-file-input"
                      style={{
                        display: 'inline-block', background: 'rgba(56,189,248,0.12)',
                        color: '#38BDF8', padding: '10px 20px', borderRadius: 10,
                        fontSize: 13, fontWeight: 700, cursor: uploadingVideo ? 'not-allowed' : 'pointer',
                        border: '1px solid rgba(56,189,248,0.2)'
                      }}
                    >
                      {uploadingVideo ? "Uploading video..." : "Choose Local Video"}
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        background: '#38BDF8', color: '#0d1117', border: 'none',
                        borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 800,
                        cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: 'Sora', textTransform: 'uppercase', letterSpacing: '0.03em'
                      }}
                    >
                      Save Changes
                    </button>
                    {videoUrl && (
                      <button
                        type="button"
                        onClick={handleVideoDelete}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 800,
                          cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: 'Sora', textTransform: 'uppercase', letterSpacing: '0.03em'
                        }}
                      >
                        Delete Video
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Video Preview */}
              <div style={{
                background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column',
                gap: 16, justifyContent: 'center'
              }}>
                <h3 style={{ fontFamily: 'Sora', fontSize: 18, color: '#fff', fontWeight: 800, margin: 0 }}>
                  Live Preview
                </h3>
                {videoUrl ? (
                  <div style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#000',
                    aspectRatio: videoOrientation === 'portrait' ? '9/16' : '16/9',
                    maxWidth: videoOrientation === 'portrait' ? '280px' : '100%',
                    margin: '0 auto',
                    width: '100%'
                  }}>
                    {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.includes("vimeo.com") ? (
                      <iframe
                        src={videoUrl.includes("youtube.com/watch")
                          ? `https://www.youtube.com/embed/${videoUrl.match(/[?&]v=([^&#]+)/)?.[1] || ''}`
                          : videoUrl.includes("youtu.be/")
                            ? `https://www.youtube.com/embed/${videoUrl.split("youtu.be/")[1]?.split("?")[0] || ''}`
                            : videoUrl
                        }
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allowFullScreen
                      />
                    ) : (
                      <video src={videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}
                  </div>
                ) : (
                  <div style={{
                    border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 16,
                    aspectRatio: videoOrientation === 'portrait' ? '9/16' : '16/9',
                    maxWidth: videoOrientation === 'portrait' ? '280px' : '100%',
                    margin: '0 auto',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#8B9BBE', fontSize: 14,
                    width: '100%'
                  }}>
                    No video URL set. Paste a URL or upload a file.
                  </div>
                )}
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{videoTitle || "Untitled Section"}</div>
                  <div style={{ color: '#8B9BBE', fontSize: 13, marginTop: 4 }}>{videoSubtitle || "No subtitle configured"}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: NEWSLETTER SUBSCRIBERS ── */}
        {activeTab === 'subscribers' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Newsletter Subscribers
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Manage subscriber email lists and compose newsletter broadcasts.
                </p>
              </div>

              <button
                onClick={handleCopyEmails}
                style={{
                  background: 'rgba(56,189,248,0.1)', color: '#38BDF8',
                  border: '1px solid rgba(56,189,248,0.25)', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Sora'
                }}
              >
                Copy All Emails
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1.2fr', gap: 32 }}>
              {/* Left Column: Subscribers Registry */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ position: 'relative', maxWidth: 400 }}>
                  <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
                  <input
                    type="text" placeholder="Search email registry..."
                    value={subscribersSearch} onChange={e => setSubscribersSearch(e.target.value)}
                    className="form-input" style={{ paddingLeft: 44 }}
                  />
                </div>

                <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                        <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Email Address</th>
                        <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Subscribed On</th>
                        <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers
                        .filter(s => (s.email || '').toLowerCase().includes(subscribersSearch.toLowerCase()))
                        .map(s => (
                          <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '18px 24px', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                              {s.email}
                            </td>
                            <td style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 13 }}>
                              {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </td>
                            <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleSubscriberDelete(s.id)}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                title="Remove Subscriber"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                      {subscribers.filter(s => (s.email || '').toLowerCase().includes(subscribersSearch.toLowerCase())).length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ padding: '36px', textAlign: 'center', color: '#8B9BBE', fontSize: 14 }}>
                            No subscribers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Broadcast Composer */}
              <div style={{
                background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                borderRadius: 24, padding: 28, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', height: 'fit-content'
              }}>
                <h3 style={{ fontFamily: 'Sora', color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
                  Compose Broadcast
                </h3>
                <p style={{ color: '#8B9BBE', fontSize: 13, lineHeight: 1.5, marginBottom: 24 }}>
                  Draft an offer or tech insights update. Open in your local email app (BCC) to send immediately for free, or click Send Automated Email (requires nodemailer API backend).
                </p>

                <form onSubmit={handleSendAutomatedBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Email Subject</label>
                    <input
                      type="text" required placeholder="Mega Weekend Offer: Flat 20% Off Refurbished ThinkPads! 🚀"
                      value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Message Body (HTML Supported)</label>
                    <textarea
                      required placeholder="Write your newsletter text or paste HTML body here..."
                      value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)}
                      className="form-input" style={{ minHeight: 180, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={handleBccMailto}
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000',
                        border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 800,
                        cursor: 'pointer', fontFamily: 'Sora', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                    >
                      <Send size={15} /> Open in Local Mail App (BCC)
                    </button>

                    <button
                      type="submit"
                      disabled={sendingBroadcast}
                      style={{
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        color: '#10B981',
                        borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'Sora', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                      }}
                    >
                      {sendingBroadcast ? 'Sending...' : 'Send Automated Email'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: SELL REQUESTS ── */}
        {activeTab === 'sell_requests' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Sell & Trade-In Requests
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Review customer submissions for old laptops, hardware configurations, and attached device photos.
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              <div style={{ background: '#131a24', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 18, padding: 20 }}>
                <div style={{ color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Total Submissions</div>
                <div style={{ fontFamily: 'Sora', fontSize: 28, fontWeight: 800, color: '#fff' }}>{sellRequests.length}</div>
              </div>
              <div style={{ background: '#131a24', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 18, padding: 20 }}>
                <div style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Pending Review</div>
                <div style={{ fontFamily: 'Sora', fontSize: 28, fontWeight: 800, color: '#F59E0B' }}>
                  {sellRequests.filter(r => (r.status || 'Pending Review') === 'Pending Review').length}
                </div>
              </div>
              <div style={{ background: '#131a24', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 18, padding: 20 }}>
                <div style={{ color: '#38BDF8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>In Review</div>
                <div style={{ fontFamily: 'Sora', fontSize: 28, fontWeight: 800, color: '#38BDF8' }}>
                  {sellRequests.filter(r => r.status === 'In Review').length}
                </div>
              </div>
              <div style={{ background: '#131a24', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 18, padding: 20 }}>
                <div style={{ color: '#10B981', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Completed</div>
                <div style={{ fontFamily: 'Sora', fontSize: 28, fontWeight: 800, color: '#10B981' }}>
                  {sellRequests.filter(r => r.status === 'Completed').length}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: isMobile ? '100%' : 340 }}>
                <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
                <input
                  type="text"
                  placeholder="Search by customer, brand, model..."
                  value={sellSearch}
                  onChange={e => setSellSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 44 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {['all', 'Pending Review', 'In Review', 'Completed', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setSellStatusFilter(status)}
                    style={{
                      background: sellStatusFilter === status ? 'rgba(56,189,248,0.12)' : 'transparent',
                      border: `1px solid ${sellStatusFilter === status ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      color: sellStatusFilter === status ? '#38BDF8' : '#8B9BBE',
                      borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      textTransform: 'capitalize', whiteSpace: 'nowrap'
                    }}
                  >
                    {status === 'all' ? 'All Submissions' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions Table */}
            <div style={{ background: '#131a24', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Date & Req ID</th>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Customer Info</th>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Laptop Configuration</th>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Condition</th>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Expected Price</th>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Photos</th>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 20px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellRequests
                    .filter(r => {
                      const matchSearch =
                        (r.userName || '').toLowerCase().includes(sellSearch.toLowerCase()) ||
                        (r.userEmail || '').toLowerCase().includes(sellSearch.toLowerCase()) ||
                        (r.userPhone || '').toLowerCase().includes(sellSearch.toLowerCase()) ||
                        (r.brand || '').toLowerCase().includes(sellSearch.toLowerCase()) ||
                        (r.model || '').toLowerCase().includes(sellSearch.toLowerCase()) ||
                        (r.requestId || '').toLowerCase().includes(sellSearch.toLowerCase());
                      const matchStatus = sellStatusFilter === 'all' || (r.status || 'Pending Review') === sellStatusFilter;
                      return matchSearch && matchStatus;
                    })
                    .map(item => {
                      const imageCount = Array.isArray(item.images) ? item.images.length : 0;
                      const statusVal = item.status || 'Pending Review';
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>#{item.requestId || item.id.substring(0, 8)}</div>
                            <div style={{ color: '#8B9BBE', fontSize: 11, marginTop: 2 }}>
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{item.userName || 'Anonymous'}</div>
                            <div style={{ color: '#8B9BBE', fontSize: 12, marginTop: 2 }}>{item.userPhone}</div>
                            <div style={{ color: '#8B9BBE', fontSize: 11 }}>{item.city}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ color: '#38BDF8', fontSize: 13, fontWeight: 700 }}>{item.brand} {item.model}</div>
                            <div style={{ color: '#8B9BBE', fontSize: 12, marginTop: 2 }}>
                              {item.processor} • {item.ram} • {item.storage}
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              background: item.condition?.includes('A+') ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)',
                              color: item.condition?.includes('A+') ? '#10B981' : '#38BDF8',
                              border: `1px solid ${item.condition?.includes('A+') ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.2)'}`,
                              borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, display: 'inline-block'
                            }}>
                              {item.condition || 'Standard'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#10B981', fontSize: 14, fontWeight: 800 }}>
                            {item.expectedPrice ? `₹${Number(item.expectedPrice).toLocaleString('en-IN')}` : 'Not Specified'}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              background: imageCount > 0 ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.04)',
                              color: imageCount > 0 ? '#38BDF8' : '#8B9BBE',
                              borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700
                            }}>
                              📷 {imageCount} Photo{imageCount === 1 ? '' : 's'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <select
                              value={statusVal}
                              onChange={e => handleSellStatusUpdate(item.id, e.target.value)}
                              style={{
                                background: '#0d1117',
                                border: '1px solid rgba(56,189,248,0.2)',
                                color: statusVal === 'Completed' ? '#10B981' : statusVal === 'In Review' ? '#38BDF8' : statusVal === 'Rejected' ? '#EF4444' : '#F59E0B',
                                borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              <option value="Pending Review">Pending Review</option>
                              <option value="In Review">In Review</option>
                              <option value="Completed">Completed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  setActiveImageIndex(0);
                                  setSellDetailModal({ open: true, item });
                                }}
                                style={{
                                  background: 'rgba(56,189,248,0.1)', color: '#38BDF8',
                                  border: '1px solid rgba(56,189,248,0.25)', borderRadius: 8,
                                  padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 6
                                }}
                              >
                                <Eye size={14} /> Inspect Details
                              </button>
                              <button
                                onClick={() => handleSellDelete(item.id)}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                                title="Delete Request"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {sellRequests.filter(r => sellStatusFilter === 'all' || (r.status || 'Pending Review') === sellStatusFilter).length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#8B9BBE', fontSize: 14 }}>
                        No sell requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="fade-in">
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Coupon Manager
              </h1>
              <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                Create discount codes with usage limits tied securely to customer mobile numbers.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 32 }}>
              {/* Left Column: Coupon Registry */}
              <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflowX: 'auto', height: 'fit-content' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                      <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Coupon Code</th>
                      <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Discount</th>
                      <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Usage</th>
                      <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '18px 24px', color: '#fff', fontSize: 14, fontWeight: 800 }}>{c.code}</td>
                        <td style={{ padding: '18px 24px' }}>
                          <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                            {c.discountType === 'percentage' ? `${c.discount}% OFF` : `₹${c.discount.toLocaleString('en-IN')}`}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 13 }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{c.usedCount || 0} {c.maxUses ? `/ ${c.maxUses}` : 'Uses'}</div>
                          {c.minCartValue ? <div style={{ fontSize: 11, marginTop: 4 }}>Min: ₹{c.minCartValue.toLocaleString('en-IN')}</div> : null}
                        </td>
                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, padding: 8, cursor: 'pointer' }}
                            title="Delete Coupon"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#8B9BBE', fontSize: 14 }}>
                          No active coupons.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Right Column: Create Coupon Form */}
              <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, padding: 32, height: 'fit-content' }}>
                <h2 style={{ fontFamily: 'Sora', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Plus size={20} color="#38BDF8" /> Create Coupon
                </h2>
                <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Coupon Code (e.g. SAVE10)</label>
                    <input
                      type="text" required value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="form-input" placeholder="Enter alphanumeric code"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Type</label>
                      <select value={couponDiscountType} onChange={e => setCouponDiscountType(e.target.value as 'flat' | 'percentage')} className="form-input" style={{ width: '100%' }}>
                        <option value="flat">Flat Amount (₹)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{couponDiscountType === 'flat' ? 'Amount (₹)' : 'Percentage (%)'}</label>
                      <input
                        type="number" required value={couponDiscount} onChange={e => setCouponDiscount(e.target.value)}
                        className="form-input" placeholder={couponDiscountType === 'flat' ? "e.g. 500" : "e.g. 10"}
                      />
                    </div>
                  </div>

                  {couponDiscountType === 'percentage' && (
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Max Discount Cap (₹) (Optional)</label>
                      <input
                        type="number" value={couponMaxDiscount} onChange={e => setCouponMaxDiscount(e.target.value)}
                        className="form-input" placeholder="e.g. 2000"
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Min Cart Value (₹)</label>
                      <input
                        type="number" value={couponMinCartValue} onChange={e => setCouponMinCartValue(e.target.value)}
                        className="form-input" placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Max Total Uses</label>
                      <input
                        type="number" value={couponMaxUses} onChange={e => setCouponMaxUses(e.target.value)}
                        className="form-input" placeholder="Optional"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#fff', border: 'none',
                      padding: '16px 0', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer',
                      marginTop: 10, fontFamily: 'Sora'
                    }}
                  >
                    Generate Coupon
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: PRODUCT REQUESTS ── */}
        {activeTab === 'product_requests' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  Product Requests
                </h1>
                <p style={{ color: '#8B9BBE', fontSize: 15 }}>
                  Customer requests for products not found on the store.
                </p>
              </div>
            </div>

            <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Device & Budget</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Specs & Notes</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {productRequests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{req.name}</div>
                        <div style={{ color: '#8B9BBE', fontSize: 12 }}>{req.phone}</div>
                        {req.email && <div style={{ color: '#8B9BBE', fontSize: 12 }}>{req.email}</div>}
                        <div style={{ color: '#8B9BBE', fontSize: 11, marginTop: 4 }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{req.deviceType}</div>
                        {req.brand && <div style={{ color: '#38BDF8', fontSize: 12 }}>Brand: {req.brand}</div>}
                        <div style={{ color: '#10B981', fontSize: 13, marginTop: 4, fontWeight: 700 }}>{req.budget}</div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ color: '#fff', fontSize: 13, marginBottom: 4 }}>{req.specs}</div>
                        {req.notes && <div style={{ color: '#8B9BBE', fontSize: 12, fontStyle: 'italic', maxWidth: 250 }}>"{req.notes}"</div>}
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{
                          background: req.status === 'Resolved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: req.status === 'Resolved' ? '#10B981' : '#F59E0B',
                          padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={async () => {
                              try {
                                await setDoc(doc(db, "product_requests", req.id), { status: req.status === 'Pending' ? 'Resolved' : 'Pending' }, { merge: true });
                              } catch (e) { console.error(e); }
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
                              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            Mark {req.status === 'Pending' ? 'Resolved' : 'Pending'}
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this request?')) {
                                try {
                                  await deleteDoc(doc(db, "product_requests", req.id));
                                } catch (e) { console.error(e); }
                              }
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 6
                            }}
                            title="Delete Request"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {productRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#8B9BBE', fontSize: 14 }}>
                        No product requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Modal: Product Form ── */}
        {productModal.open && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <div className="fade-in" style={{
              background: '#131a24', border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: 24, width: '100%', maxWidth: 700, padding: 32,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              maxHeight: '90vh', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Sora', fontSize: 22, color: '#fff', fontWeight: 800 }}>
                  {productModal.mode === 'add' ? 'Add Laptop / Desktop' : 'Edit Product'}
                </h2>
                <button onClick={() => setProductModal({ open: false, mode: 'add' })} style={{ background: 'transparent', border: 'none', color: '#8B9BBE', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleProductSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>

                {/* Form Navigation Tabs */}
                <div style={{
                  display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)',
                  paddingBottom: 16, marginBottom: 12, gridColumn: isMobile ? 'span 1' : 'span 2'
                }}>
                  {(['basic', 'specs', 'media'] as const).map(tab => (
                    <button
                      key={tab} type="button"
                      onClick={() => setModalTab(tab)}
                      style={{
                        background: modalTab === tab ? 'rgba(56,189,248,0.1)' : 'transparent',
                        border: `1px solid ${modalTab === tab ? 'rgba(56,189,248,0.25)' : 'transparent'}`,
                        borderRadius: 12, padding: '10px 20px',
                        color: modalTab === tab ? '#38BDF8' : '#8B9BBE',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: 'Sora'
                      }}
                    >
                      {tab === 'basic' && '📦 Basic Details'}
                      {tab === 'specs' && '⚙️ Specs & Upgrades'}
                      {tab === 'media' && '🔗 Media & Retail Links'}
                    </button>
                  ))}
                </div>

                {modalTab === 'basic' && (
                  <>
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Product Name</label>
                        <input
                          type="text" required placeholder="e.g. Dell Latitude 5400"
                          value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillSpecs}
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 12,
                          height: 44,
                          padding: '0 16px',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          fontFamily: 'Sora',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Sparkles size={14} /> ⚡ Auto-Fill Details
                      </button>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Brand</label>
                      <select
                        value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                        className="form-input" style={{ background: '#0d1117' }}
                      >
                        {['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Device Type</label>
                      <select
                        value={productForm.deviceType || 'Laptop'}
                        onChange={e => {
                          const type = e.target.value as any;
                          setProductForm({
                            ...productForm,
                            deviceType: type,
                            category: type === 'Desktop' ? 'Desktops' : 'Business'
                          });
                        }}
                        className="form-input" style={{ background: '#0d1117' }}
                      >
                        <option value="Laptop">Laptop</option>
                        <option value="Desktop">Desktop</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Category</label>
                      <select
                        value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                        className="form-input" style={{ background: '#0d1117' }}
                      >
                        {productForm.deviceType === 'Desktop'
                          ? ['Desktops', 'Workstations', 'Gaming'].map(opt => <option key={opt} value={opt}>{opt}</option>)
                          : ['Business', 'Gaming', 'MacBooks', 'Ultrabooks', 'Workstations'].map(opt => <option key={opt} value={opt}>{opt}</option>)
                        }
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Condition</label>
                      <select
                        value={productForm.condition} onChange={e => setProductForm({ ...productForm, condition: e.target.value as any })}
                        className="form-input" style={{ background: '#0d1117' }}
                      >
                        <option value="Refurbished">Refurbished</option>
                        <option value="Brand New">Brand New</option>
                      </select>
                    </div>

                    {productForm.condition === 'Refurbished' && (
                      <div>
                        <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Quality Grade</label>
                        <select
                          value={productForm.grade} onChange={e => setProductForm({ ...productForm, grade: e.target.value as any })}
                          className="form-input" style={{ background: '#0d1117' }}
                        >
                          <option value="A+">Grade A+</option>
                          <option value="A">Grade A</option>
                          <option value="B+">Grade B+</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Product Badge</label>
                      <select
                        value={productForm.badge} onChange={e => setProductForm({ ...productForm, badge: e.target.value as any })}
                        className="form-input" style={{ background: '#0d1117' }}
                      >
                        {['Best Seller', 'Gaming', 'Value Deal', 'Top Rated'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Listing Price (₹)</label>
                      <input
                        type="number" required placeholder="e.g. 29999"
                        value={productForm.price || ''} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Rating (out of 5)</label>
                      <input
                        type="number" required step="0.1" min="1" max="5" placeholder="e.g. 4.8"
                        value={productForm.rating || ''} onChange={e => setProductForm({ ...productForm, rating: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Reviews Count</label>
                      <input
                        type="number" required min="0" placeholder="e.g. 125"
                        value={productForm.reviews || ''} onChange={e => setProductForm({ ...productForm, reviews: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Original MRP (₹)</label>
                      <input
                        type="number" required placeholder="e.g. 59999"
                        value={productForm.mrp || ''} onChange={e => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Warranty Duration</label>
                      <input
                        type="text" placeholder="e.g. 1 Year Warranty"
                        value={productForm.warranty} onChange={e => setProductForm({ ...productForm, warranty: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Stock Quantity</label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(13, 17, 23, 0.7)',
                        border: '1px solid rgba(56, 189, 248, 0.15)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        height: 44
                      }}>
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, stock: Math.max(0, (prev.stock === undefined ? 1 : prev.stock) - 1) }))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: 'none',
                            color: '#8B9BBE',
                            width: 44,
                            height: '100%',
                            cursor: 'pointer',
                            fontSize: 20,
                            fontWeight: 'bold',
                            transition: 'background 0.2s',
                            outline: 'none'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        >−</button>
                        <input
                          type="number"
                          min="0"
                          required
                          value={productForm.stock === undefined ? 1 : productForm.stock}
                          onChange={e => setProductForm({ ...productForm, stock: Math.max(0, Number(e.target.value)) })}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            outline: 'none',
                            width: '100%',
                            padding: 0
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, stock: (prev.stock === undefined ? 1 : prev.stock) + 1 }))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: 'none',
                            color: '#8B9BBE',
                            width: 44,
                            height: '100%',
                            cursor: 'pointer',
                            fontSize: 20,
                            fontWeight: 'bold',
                            transition: 'background 0.2s',
                            outline: 'none'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                        >+</button>
                      </div>
                    </div>
                  </>
                )}

                {modalTab === 'specs' && (
                  <>
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Processor Details</label>
                      <input
                        type="text" placeholder="e.g. Intel Core i5 8265U"
                        value={productForm.processor} onChange={e => setProductForm({ ...productForm, processor: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Specifications Tagline</label>
                      <input
                        type="text" placeholder="e.g. Intel i5 8th Gen • 16GB RAM • 512GB SSD"
                        value={productForm.specs} onChange={e => setProductForm({ ...productForm, specs: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    {/* RAM Custom Visual Toggle & Offset Input */}
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', background: '#0d1117', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 18, padding: 18 }}>
                      <label style={{ display: 'block', color: '#38BDF8', fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>Memory Configuration (RAM Options)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {Object.entries(selectedRamOptions).map(([size, opt]) => (
                          <div key={size} style={{
                            background: opt.enabled ? 'rgba(56,189,248,0.03)' : 'rgba(255,255,255,0.01)',
                            border: `1px solid ${opt.enabled ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: 14, padding: 12, transition: 'all 0.2s'
                          }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRamOptions(prev => ({
                                  ...prev,
                                  [size]: { ...prev[size], enabled: !prev[size].enabled }
                                }));
                              }}
                              style={{
                                width: '100%', textTransform: 'none', background: 'transparent', border: 'none',
                                color: opt.enabled ? '#38BDF8' : '#8B9BBE', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', cursor: 'pointer', outline: 'none', padding: 0
                              }}
                            >
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{size}</span>
                              <div style={{
                                width: 14, height: 14, borderRadius: 4,
                                background: opt.enabled ? '#38BDF8' : 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#000', fontWeight: 'bold'
                              }}>
                                {opt.enabled && '✓'}
                              </div>
                            </button>
                            {opt.enabled && (
                              <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 10, marginBottom: 4 }}>Price Upgrade Cost (₹)</label>
                                <input
                                  type="number"
                                  placeholder="Upgrade Price addition..."
                                  value={opt.offset || ''}
                                  onChange={e => {
                                    const val = Number(e.target.value) || 0;
                                    setSelectedRamOptions(prev => ({
                                      ...prev,
                                      [size]: { ...prev[size], offset: val }
                                    }));
                                  }}
                                  className="form-input"
                                  style={{ height: 34, padding: '4px 8px', fontSize: 12 }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Storage Custom Visual Toggle & Offset Input */}
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', background: '#0d1117', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 18, padding: 18 }}>
                      <label style={{ display: 'block', color: '#38BDF8', fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>Storage Configuration Options</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {Object.entries(selectedStorageOptions).map(([size, opt]) => (
                          <div key={size} style={{
                            background: opt.enabled ? 'rgba(56,189,248,0.03)' : 'rgba(255,255,255,0.01)',
                            border: `1px solid ${opt.enabled ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: 14, padding: 12, transition: 'all 0.2s'
                          }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStorageOptions(prev => ({
                                  ...prev,
                                  [size]: { ...prev[size], enabled: !prev[size].enabled }
                                }));
                              }}
                              style={{
                                width: '100%', textTransform: 'none', background: 'transparent', border: 'none',
                                color: opt.enabled ? '#38BDF8' : '#8B9BBE', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', cursor: 'pointer', outline: 'none', padding: 0
                              }}
                            >
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{size}</span>
                              <div style={{
                                width: 14, height: 14, borderRadius: 4,
                                background: opt.enabled ? '#38BDF8' : 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#000', fontWeight: 'bold'
                              }}>
                                {opt.enabled && '✓'}
                              </div>
                            </button>
                            {opt.enabled && (
                              <div style={{ marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 10, marginBottom: 4 }}>Price Upgrade Cost (₹)</label>
                                <input
                                  type="number"
                                  placeholder="Upgrade Price addition..."
                                  value={opt.offset || ''}
                                  onChange={e => {
                                    const val = Number(e.target.value) || 0;
                                    setSelectedStorageOptions(prev => ({
                                      ...prev,
                                      [size]: { ...prev[size], offset: val }
                                    }));
                                  }}
                                  className="form-input"
                                  style={{ height: 34, padding: '4px 8px', fontSize: 12 }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {modalTab === 'media' && (
                  <>
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Custom Description (Optional, overrides auto-template)</label>
                      <textarea
                        placeholder="e.g. This laptop features high performance with dual channel RAM..."
                        value={productForm.description || ''} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                        className="form-input" style={{ minHeight: 70, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Custom Box Contents (Optional, comma-separated)</label>
                      <input
                        type="text" placeholder="e.g. Refurbished Grade A+ Laptop, Original Power Adapter, Certification Booklet"
                        value={productForm.boxContents || ''} onChange={e => setProductForm({ ...productForm, boxContents: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                        Product Images Gallery (Max 5, Drag & Drop or Click to Select)
                      </label>

                      {/* Previews Grid */}
                      {(productForm.images && productForm.images.length > 0) && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                          {productForm.images.map((imgUrl, i) => (
                            <div key={i} style={{ position: 'relative', width: 90, height: 68, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                              <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={() => handleRemoveProductImage(i)}
                                style={{
                                  position: 'absolute', top: 4, right: 4,
                                  background: '#EF4444', color: '#fff', border: 'none',
                                  borderRadius: '50%', width: 18, height: 18,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', fontSize: 10, fontWeight: 'bold',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        onClick={() => document.getElementById('product-file-input')?.click()}
                        style={{
                          background: 'rgba(26, 34, 53, 0.4)',
                          border: '2px dashed rgba(56,189,248,0.25)',
                          borderRadius: 16,
                          padding: '24px 20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#38BDF8';
                          e.currentTarget.style.background = 'rgba(56,189,248,0.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)';
                          e.currentTarget.style.background = 'rgba(26, 34, 53, 0.4)';
                        }}
                      >
                        <ImageIcon size={30} color="#38BDF8" style={{ marginBottom: 8 }} />
                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Browse local computer files</div>
                        <div style={{ color: '#8B9BBE', fontSize: 11 }}>Supports up to 5 images • Auto compressed</div>
                        <input
                          id="product-file-input"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          disabled={(productForm.images?.length || 0) >= 5}
                          style={{ display: 'none' }}
                        />
                      </div>

                      <span style={{ color: '#8B9BBE', fontSize: 11 }}>
                        {(productForm.images?.length || 0)}/5 images uploaded. {(productForm.images?.length || 0) >= 5 ? "Max image limit reached." : ""}
                      </span>

                      <div style={{ marginTop: 10 }}>
                        <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, marginBottom: 6 }}>Or manually enter thumbnail URL:</label>
                        <input
                          type="text" placeholder="Paste direct image link..."
                          value={productForm.img} onChange={e => setProductForm({ ...productForm, img: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, marginBottom: 6 }}>Or manually enter gallery image URLs (comma-separated):</label>
                        <textarea
                          placeholder="Paste direct image links separated by commas... e.g. https://link1.com, https://link2.com"
                          value={galleryLinksText}
                          onChange={e => {
                            const text = e.target.value;
                            setGalleryLinksText(text);

                            const urls = text.split(',')
                              .map(url => url.trim())
                              .filter(url => url.length > 0);

                            setProductForm(prev => ({
                              ...prev,
                              images: urls,
                              img: prev.img ? prev.img : (urls[0] || '')
                            }));
                          }}
                          className="form-input"
                          style={{ minHeight: 60, resize: 'vertical', background: '#0d1117', color: '#fff', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 10, padding: 10 }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button" onClick={() => setProductModal({ open: false, mode: 'add' })}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8B9BBE', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 600 }}
                  >Cancel</button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000', border: 'none', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 800 }}
                  >
                    {productModal.mode === 'add' ? 'Save Product' : 'Update Product'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Accessory Form ── */}
        {accessoryModal.open && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <div className="fade-in" style={{
              background: '#131a24', border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: 24, width: '100%', maxWidth: 550, padding: 32,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              maxHeight: '90vh', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Sora', fontSize: 22, color: '#fff', fontWeight: 800 }}>
                  {accessoryModal.mode === 'add' ? 'Add Store Accessory' : 'Edit Accessory'}
                </h2>
                <button onClick={() => setAccessoryModal({ open: false, mode: 'add' })} style={{ background: 'transparent', border: 'none', color: '#8B9BBE', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAccessorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Accessory Name</label>
                  <input
                    type="text" required placeholder="e.g. Logitech MX Master Mouse"
                    value={accessoryForm.name} onChange={e => setAccessoryForm({ ...accessoryForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Brand</label>
                    <input
                      type="text" required placeholder="e.g. Logitech"
                      value={accessoryForm.brand} onChange={e => setAccessoryForm({ ...accessoryForm, brand: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Category</label>
                    <select
                      value={['Monitors', 'Docking Stations', 'Mice & Keyboards', 'Chargers & Power', 'Bags & Sleeves'].includes(accessoryForm.category || '') ? (accessoryForm.category || '') : 'Other'}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setShowCustomCategoryInput(true);
                          setAccessoryForm({ ...accessoryForm, category: '' });
                        } else {
                          setShowCustomCategoryInput(false);
                          setAccessoryForm({ ...accessoryForm, category: val });
                        }
                      }}
                      className="form-input" style={{ background: '#0d1117' }}
                    >
                      {['Monitors', 'Docking Stations', 'Mice & Keyboards', 'Chargers & Power', 'Bags & Sleeves', 'Other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                {showCustomCategoryInput && (
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Custom Category Name</label>
                    <input
                      type="text" required placeholder="e.g. Adapters or Cooling Pads"
                      value={accessoryForm.category || ''}
                      onChange={e => setAccessoryForm({ ...accessoryForm, category: e.target.value })}
                      className="form-input"
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Selling Price (₹)</label>
                    <input
                      type="number" required placeholder="e.g. 3999"
                      value={accessoryForm.price || ''} onChange={e => setAccessoryForm({ ...accessoryForm, price: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Original MRP (₹)</label>
                    <input
                      type="number" required placeholder="e.g. 5999"
                      value={accessoryForm.mrp || ''} onChange={e => setAccessoryForm({ ...accessoryForm, mrp: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Short Specifications</label>
                  <input
                    type="text" placeholder="e.g. 8K DPI • Wireless Bluetooth • Ergonomic Layout"
                    value={accessoryForm.specs} onChange={e => setAccessoryForm({ ...accessoryForm, specs: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                    Accessory Image (Drag & Drop or Click to Select)
                  </label>

                  {/* Preview Thumbnail */}
                  {accessoryForm.img && (
                    <div style={{ position: 'relative', width: 90, height: 68, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                      <img src={accessoryForm.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setAccessoryForm(prev => ({ ...prev, img: '' }))}
                        style={{
                          position: 'absolute', top: 4, right: 4,
                          background: '#EF4444', color: '#fff', border: 'none',
                          borderRadius: '50%', width: 18, height: 18,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: 10, fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div
                    onClick={() => document.getElementById('accessory-file-input')?.click()}
                    style={{
                      background: 'rgba(26, 34, 53, 0.4)',
                      border: '2px dashed rgba(56,189,248,0.25)',
                      borderRadius: 16,
                      padding: '24px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#38BDF8';
                      e.currentTarget.style.background = 'rgba(56,189,248,0.04)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)';
                      e.currentTarget.style.background = 'rgba(26, 34, 53, 0.4)';
                    }}
                  >
                    <ImageIcon size={28} color="#38BDF8" style={{ marginBottom: 8 }} />
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Browse local computer files</div>
                    <div style={{ color: '#8B9BBE', fontSize: 11 }}>Choose 1 image • Auto compressed</div>
                    <input
                      id="accessory-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAccessoryImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, marginBottom: 6 }}>Or manually enter image URL:</label>
                    <input
                      type="text" placeholder="Paste direct image link..."
                      value={accessoryForm.img} onChange={e => setAccessoryForm({ ...accessoryForm, img: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button" onClick={() => setAccessoryModal({ open: false, mode: 'add' })}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8B9BBE', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 600 }}
                  >Cancel</button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000', border: 'none', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 800 }}
                  >
                    {accessoryModal.mode === 'add' ? 'Save Accessory' : 'Update Accessory'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Hero Poster Form ── */}
        {heroPosterModal.open && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}>
            <div className="fade-in" style={{
              background: '#131a24', border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: 24, width: '100%', maxWidth: 550, padding: 32,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Sora', fontSize: 22, color: '#fff', fontWeight: 800 }}>Add Hero Poster</h2>
                <button onClick={() => setHeroPosterModal({ open: false })} style={{ background: 'transparent', border: 'none', color: '#8B9BBE', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleHeroPosterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Poster Title</label>
                  <input
                    type="text" required placeholder="e.g. Diwali Mega Sale"
                    value={heroPosterForm.title} onChange={e => setHeroPosterForm({ ...heroPosterForm, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Click Destination Page</label>
                  <select
                    value={heroPosterForm.target} onChange={e => setHeroPosterForm({ ...heroPosterForm, target: e.target.value })}
                    className="form-input" style={{ background: '#0d1117' }}
                  >
                    <option value="listing">Shop Laptops</option>
                    <option value="accessories">Shop Accessories</option>
                    <option value="resell">Sell Laptop</option>
                    <option value="contact">Contact Us</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Laptop/Desktop Poster</label>
                    {heroPosterForm.src && (
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '1920/480', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)', marginBottom: 12 }}>
                        <img src={heroPosterForm.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div
                      onClick={() => { if (!uploadingHeroPoster) document.getElementById('hero-poster-file-input')?.click(); }}
                      style={{
                        background: 'rgba(26, 34, 53, 0.4)', border: '2px dashed rgba(56,189,248,0.25)',
                        borderRadius: 16, padding: '24px 20px', textAlign: 'center',
                        cursor: uploadingHeroPoster ? 'wait' : 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      <ImageIcon size={28} color="#38BDF8" style={{ marginBottom: 8 }} />
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                        {uploadingHeroPoster ? 'Uploading image...' : 'Browse files'}
                      </div>
                      <div style={{ color: '#8B9BBE', fontSize: 11, lineHeight: 1.5, marginTop: 4 }}>
                        Recommended: 1920x480px (4:1 Ratio)
                      </div>
                      <input
                        id="hero-poster-file-input" type="file" accept="image/*"
                        disabled={uploadingHeroPoster} onChange={handleHeroPosterImageUpload} style={{ display: 'none' }}
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, marginBottom: 6 }}>Or enter image URL:</label>
                      <input
                        type="text" placeholder="Paste direct image link..."
                        value={heroPosterForm.src || ''} onChange={e => setHeroPosterForm({ ...heroPosterForm, src: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Mobile Poster</label>
                    {heroPosterForm.mobileSrc && (
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)', marginBottom: 12 }}>
                        <img src={heroPosterForm.mobileSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div
                      onClick={() => { if (!uploadingHeroPosterMobile) document.getElementById('hero-poster-mobile-file-input')?.click(); }}
                      style={{
                        background: 'rgba(26, 34, 53, 0.4)', border: '2px dashed rgba(56,189,248,0.25)',
                        borderRadius: 16, padding: '24px 20px', textAlign: 'center',
                        cursor: uploadingHeroPosterMobile ? 'wait' : 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      <ImageIcon size={28} color="#38BDF8" style={{ marginBottom: 8 }} />
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                        {uploadingHeroPosterMobile ? 'Uploading image...' : 'Browse files'}
                      </div>
                      <div style={{ color: '#8B9BBE', fontSize: 11, lineHeight: 1.5, marginTop: 4 }}>
                        Recommended: 800x600px (4:3 or 3:2 Ratio)
                      </div>
                      <input
                        id="hero-poster-mobile-file-input" type="file" accept="image/*"
                        disabled={uploadingHeroPosterMobile} onChange={handleHeroPosterMobileImageUpload} style={{ display: 'none' }}
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, marginBottom: 6 }}>Or enter image URL:</label>
                      <input
                        type="text" placeholder="Paste direct image link..."
                        value={heroPosterForm.mobileSrc || ''} onChange={e => setHeroPosterForm({ ...heroPosterForm, mobileSrc: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="button" onClick={() => setHeroPosterModal({ open: false })} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8B9BBE', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 600 }}>Cancel</button>
                  <button type="submit" disabled={uploadingHeroPoster} style={{ background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', border: 'none', color: '#000', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 800 }}>Save Poster</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Tab: STUDENT HUB ── */}
        {activeTab === 'student_hub' && (() => {
          // Build leaderboard from blogs state
          if (!hubBlogsLoaded && blogs.length > 0) {
            const byEmail: Record<string, { email: string; name: string; articles: number; reads: number }> = {};
            blogs.forEach((b: any) => {
              const email = (b.authorEmail || '').toLowerCase();
              if (!email) return;
              if (!byEmail[email]) byEmail[email] = { email, name: b.authorName || b.author || email.split('@')[0], articles: 0, reads: 0 };
              byEmail[email].articles += 1;
              byEmail[email].reads += (b.reads || 0);
            });
            const board = Object.values(byEmail).sort((a, b) => b.reads !== a.reads ? b.reads - a.reads : b.articles - a.articles);
            if (board.length !== hubLeaderboard.length) {
              setHubLeaderboard(board);
              setHubBlogsLoaded(true);
            }
          }

          const handleSaveGiveaway = async () => {
            if (!giveawayConfig.prizeTitle.trim()) return triggerAlert('danger', 'Prize title is required.');
            setHubSaving(true);
            try {
              await setDoc(doc(db, 'giveaway', 'current'), {
                ...giveawayConfig,
                updatedAt: new Date().toISOString()
              });
              triggerAlert('success', 'Giveaway config saved to Firestore!');
            } catch (err) {
              triggerAlert('danger', 'Failed to save giveaway config.');
            } finally {
              setHubSaving(false);
            }
          };

          const handleDeleteGiveaway = async () => {
            if (!window.confirm("Are you sure you want to clear the current contest?")) return;
            setHubSaving(true);
            try {
              if (giveawayConfig.prizeImagePublicId) {
                await deleteCloudinaryAssets([giveawayConfig.prizeImagePublicId]);
              }
              if (giveawayConfig.secondPrizeImagePublicId) {
                await deleteCloudinaryAssets([giveawayConfig.secondPrizeImagePublicId]);
              }
              await deleteDoc(doc(db, 'giveaway', 'current'));
              setGiveawayConfig({ prizeTitle: '', prizeImage: '', secondPrizeTitle: '', secondPrizeImage: '', startTime: '', deadline: '', topic: '' });
              triggerAlert('success', 'Giveaway contest cleared!');
            } catch (err) {
              triggerAlert('danger', 'Failed to clear contest.');
            } finally {
              setHubSaving(false);
            }
          };


          const handlePrizeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            setHubImageUploading(true);
            try {
              const { url, publicId } = await uploadProductImage(files[0]);
              setGiveawayConfig(p => ({ ...p, prizeImage: url, prizeImagePublicId: publicId }));
              triggerAlert('success', 'Prize image uploaded successfully.');
            } catch (err) {
              console.error(err);
              triggerAlert('danger', 'Error uploading prize image.');
            } finally {
              setHubImageUploading(false);
              if (e.target) e.target.value = '';
            }
          };

          const handleSecondPrizeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            setHubImageUploading(true);
            try {
              const { url, publicId } = await uploadProductImage(files[0]);
              setGiveawayConfig(p => ({ ...p, secondPrizeImage: url, secondPrizeImagePublicId: publicId }));
              triggerAlert('success', 'Second prize image uploaded successfully.');
            } catch (err) {
              console.error(err);
              triggerAlert('danger', 'Error uploading second prize image.');
            } finally {
              setHubImageUploading(false);
              if (e.target) e.target.value = '';
            }
          };

          const contestBlogs = blogs.filter((b: any) => b.approved !== false);

          return (
            <div className="fade-in">
              <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Student Hub Management
              </h1>
              <p style={{ color: '#8B9BBE', fontSize: 15, marginBottom: 32 }}>
                Manage the weekly blog contest giveaway, leaderboard, and contest submissions.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 32 }}>

                {/* Giveaway Config Card */}
                <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 24, padding: 28 }}>
                  <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#F59E0B" /> Current Giveaway Prize
                  </h2>
                  <p style={{ color: '#8B9BBE', fontSize: 13, marginBottom: 20 }}>Saved to Firestore <code style={{ color: '#38BDF8' }}>giveaway/current</code></p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>1st Prize Title</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Win a Bluetooth Neckband"
                        value={giveawayConfig.prizeTitle}
                        onChange={e => setGiveawayConfig(p => ({ ...p, prizeTitle: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>2nd Prize Title (Optional)</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Smart Watch"
                        value={giveawayConfig.secondPrizeTitle || ''}
                        onChange={e => setGiveawayConfig(p => ({ ...p, secondPrizeTitle: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Contest Topic</label>
                      <input
                        className="form-input"
                        placeholder="e.g. AI in College"
                        value={giveawayConfig.topic || ''}
                        onChange={e => setGiveawayConfig(p => ({ ...p, topic: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Next Week's Topic (Teaser)</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Future of Wearables"
                        value={giveawayConfig.nextWeekTopic || ''}
                        onChange={e => setGiveawayConfig(p => ({ ...p, nextWeekTopic: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Prize Image</label>
                      {giveawayConfig.prizeImage && (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)', marginBottom: 12 }}>
                          <img src={giveawayConfig.prizeImage} alt="Prize preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={async () => {
                              setHubImageUploading(true);
                              try {
                                if (giveawayConfig.prizeImagePublicId) {
                                  await deleteCloudinaryAssets([giveawayConfig.prizeImagePublicId]);
                                }
                                await setDoc(doc(db, 'giveaway', 'current'), { prizeImage: '', prizeImagePublicId: '' }, { merge: true });
                                triggerAlert('success', 'Prize image removed.');
                              } catch (err) {
                                console.error(err);
                                triggerAlert('danger', 'Failed to remove prize image.');
                              } finally {
                                setHubImageUploading(false);
                              }
                              setGiveawayConfig(p => ({ ...p, prizeImage: '', prizeImagePublicId: '' }));
                            }}
                            title="Remove image"
                            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      <div
                        onClick={() => { if (!hubImageUploading) document.getElementById('prize-file-input')?.click(); }}
                        style={{
                          background: 'rgba(26, 34, 53, 0.4)',
                          border: '2px dashed rgba(56,189,248,0.25)',
                          borderRadius: 16,
                          padding: '20px 16px',
                          textAlign: 'center',
                          cursor: hubImageUploading ? 'wait' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          if (!hubImageUploading) {
                            e.currentTarget.style.borderColor = '#38BDF8';
                            e.currentTarget.style.background = 'rgba(56,189,248,0.04)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!hubImageUploading) {
                            e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)';
                            e.currentTarget.style.background = 'rgba(26, 34, 53, 0.4)';
                          }
                        }}
                      >
                        <ImageIcon size={26} color="#38BDF8" style={{ marginBottom: 6 }} />
                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                          {hubImageUploading ? 'Uploading image...' : 'Upload prize image'}
                        </div>
                        <div style={{ color: '#8B9BBE', fontSize: 11 }}>Click to browse files (JPG / PNG)</div>
                        <input
                          id="prize-file-input"
                          type="file"
                          accept="image/*"
                          disabled={hubImageUploading}
                          onChange={handlePrizeImageUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(139,155,190,0.2)' }} />
                        <span style={{ color: '#8B9BBE', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>or paste a URL</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(139,155,190,0.2)' }} />
                      </div>
                      <input
                        className="form-input"
                        placeholder="https://..."
                        value={giveawayConfig.prizeImage}
                        onChange={e => setGiveawayConfig(p => ({ ...p, prizeImage: e.target.value }))}
                        style={{ marginTop: 10 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>2nd Prize Image (Optional)</label>
                      {giveawayConfig.secondPrizeImage && (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)', marginBottom: 12 }}>
                          <img src={giveawayConfig.secondPrizeImage} alt="Second prize preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={async () => {
                              setHubImageUploading(true);
                              try {
                                if (giveawayConfig.secondPrizeImagePublicId) {
                                  await deleteCloudinaryAssets([giveawayConfig.secondPrizeImagePublicId]);
                                }
                                await setDoc(doc(db, 'giveaway', 'current'), { secondPrizeImage: '', secondPrizeImagePublicId: '' }, { merge: true });
                                triggerAlert('success', 'Second prize image removed.');
                              } catch (err) {
                                console.error(err);
                                triggerAlert('danger', 'Failed to remove second prize image.');
                              } finally {
                                setHubImageUploading(false);
                              }
                              setGiveawayConfig(p => ({ ...p, secondPrizeImage: '', secondPrizeImagePublicId: '' }));
                            }}
                            title="Remove image"
                            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      <div
                        onClick={() => { if (!hubImageUploading) document.getElementById('second-prize-file-input')?.click(); }}
                        style={{
                          background: 'rgba(26, 34, 53, 0.4)',
                          border: '2px dashed rgba(56,189,248,0.25)',
                          borderRadius: 16,
                          padding: '20px 16px',
                          textAlign: 'center',
                          cursor: hubImageUploading ? 'wait' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          if (!hubImageUploading) {
                            e.currentTarget.style.borderColor = '#38BDF8';
                            e.currentTarget.style.background = 'rgba(56,189,248,0.04)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!hubImageUploading) {
                            e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)';
                            e.currentTarget.style.background = 'rgba(26, 34, 53, 0.4)';
                          }
                        }}
                      >
                        <ImageIcon size={26} color="#38BDF8" style={{ marginBottom: 6 }} />
                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                          {hubImageUploading ? 'Uploading image...' : 'Upload 2nd prize image'}
                        </div>
                        <input
                          id="second-prize-file-input"
                          type="file"
                          accept="image/*"
                          disabled={hubImageUploading}
                          onChange={handleSecondPrizeImageUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <input
                        className="form-input"
                        placeholder="https://..."
                        value={giveawayConfig.secondPrizeImage || ''}
                        onChange={e => setGiveawayConfig(p => ({ ...p, secondPrizeImage: e.target.value }))}
                        style={{ marginTop: 10 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Contest Start Time</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ position: "relative" }}>
                          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                            <Calendar size={16} color="#8B9BBE" />
                          </div>
                          <input
                            type="date"
                            value={giveawayConfig.startTime ? giveawayConfig.startTime.split("T")[0] : ""}
                            onChange={(e) => {
                              const date = e.target.value;
                              const time = giveawayConfig.startTime && giveawayConfig.startTime.includes("T")
                                ? giveawayConfig.startTime.split("T")[1]
                                : "00:00";
                              setGiveawayConfig(p => ({ ...p, startTime: `${date}T${time}` }));
                            }}
                            style={{
                              width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "12px 14px 12px 40px", color: "#e6edf3", outline: "none", fontSize: 13, colorScheme: "dark", boxSizing: "border-box", transition: "border-color 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#38BDF8"}
                            onBlur={e => e.target.style.borderColor = "#30363d"}
                          />
                        </div>
                        <div style={{ position: "relative" }}>
                          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                            <Clock size={16} color="#8B9BBE" />
                          </div>
                          <input
                            type="time"
                            value={giveawayConfig.startTime && giveawayConfig.startTime.includes("T") ? giveawayConfig.startTime.split("T")[1] : ""}
                            onChange={(e) => {
                              const time = e.target.value;
                              const date = giveawayConfig.startTime ? giveawayConfig.startTime.split("T")[0] : new Date().toISOString().split("T")[0];
                              setGiveawayConfig(p => ({ ...p, startTime: `${date}T${time}` }));
                            }}
                            style={{
                              width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "12px 14px 12px 40px", color: "#e6edf3", outline: "none", fontSize: 13, colorScheme: "dark", boxSizing: "border-box", transition: "border-color 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#38BDF8"}
                            onBlur={e => e.target.style.borderColor = "#30363d"}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Contest Deadline</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ position: "relative" }}>
                          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                            <Calendar size={16} color="#8B9BBE" />
                          </div>
                          <input
                            type="date"
                            value={giveawayConfig.deadline ? giveawayConfig.deadline.split("T")[0] : ""}
                            onChange={(e) => {
                              const date = e.target.value;
                              const time = giveawayConfig.deadline && giveawayConfig.deadline.includes("T")
                                ? giveawayConfig.deadline.split("T")[1]
                                : "12:00";
                              setGiveawayConfig(p => ({ ...p, deadline: `${date}T${time}` }));
                            }}
                            style={{
                              width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "12px 14px 12px 40px", color: "#e6edf3", outline: "none", fontSize: 13, colorScheme: "dark", boxSizing: "border-box", transition: "border-color 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#38BDF8"}
                            onBlur={e => e.target.style.borderColor = "#30363d"}
                          />
                        </div>
                        <div style={{ position: "relative" }}>
                          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
                            <Clock size={16} color="#8B9BBE" />
                          </div>
                          <input
                            type="time"
                            value={giveawayConfig.deadline && giveawayConfig.deadline.includes("T") ? giveawayConfig.deadline.split("T")[1] : ""}
                            onChange={(e) => {
                              const time = e.target.value;
                              const date = giveawayConfig.deadline ? giveawayConfig.deadline.split("T")[0] : new Date().toISOString().split("T")[0];
                              setGiveawayConfig(p => ({ ...p, deadline: `${date}T${time}` }));
                            }}
                            style={{
                              width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "12px 14px 12px 40px", color: "#e6edf3", outline: "none", fontSize: 13, colorScheme: "dark", boxSizing: "border-box", transition: "border-color 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#38BDF8"}
                            onBlur={e => e.target.style.borderColor = "#30363d"}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={handleSaveGiveaway}
                        disabled={hubSaving}
                        style={{ flex: 1, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#000', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 800, fontFamily: 'Sora', cursor: 'pointer', fontSize: 14 }}
                      >
                        {hubSaving ? 'Saving...' : 'Save Giveaway Config'}
                      </button>
                      <button
                        onClick={handleDeleteGiveaway}
                        disabled={hubSaving}
                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 0', fontWeight: 800, fontFamily: 'Sora', cursor: 'pointer', fontSize: 14 }}
                      >
                        Clear Contest
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
                  {lastWinnerData ? (
                    <div style={{ background: '#1a2235', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 24, padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Award size={18} color="#F59E0B" /> 1st Prize Winner
                        </h2>
                        <button
                          onClick={() => handleDeleteWinner(1)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
                        >
                          Remove
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {lastWinnerData.photo ? (
                          <img src={lastWinnerData.photo} alt={lastWinnerData.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F59E0B' }} />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, border: '2px solid rgba(245,158,11,0.5)' }}>
                            {lastWinnerData.name?.substring(0, 2).toUpperCase() || "W"}
                          </div>
                        )}
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{lastWinnerData.name}</div>
                          <div style={{ color: '#8B9BBE', fontSize: 13, marginBottom: 4 }}>{lastWinnerData.city}</div>
                          <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 600 }}>{lastWinnerData.blogTitle}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 24, padding: '28px', textAlign: 'center' }}>
                      <Award size={24} color="#8B9BBE" style={{ opacity: 0.5, marginBottom: 8 }} />
                      <h3 style={{ color: '#8B9BBE', fontSize: 14, fontWeight: 600, margin: 0 }}>No 1st Prize Winner</h3>
                      <p style={{ color: 'rgba(139, 155, 190, 0.6)', fontSize: 12, margin: '4px 0 0' }}>Select from submissions.</p>
                    </div>
                  )}

                  {secondWinnerData ? (
                    <div style={{ background: '#1a2235', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 24, padding: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Award size={18} color="#94A3B8" /> 2nd Prize Winner
                        </h2>
                        <button
                          onClick={() => handleDeleteWinner(2)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
                        >
                          Remove
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {secondWinnerData.photo ? (
                          <img src={secondWinnerData.photo} alt={secondWinnerData.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #94A3B8' }} />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #94A3B8, #64748B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, border: '2px solid rgba(148,163,184,0.5)' }}>
                            {secondWinnerData.name?.substring(0, 2).toUpperCase() || "W"}
                          </div>
                        )}
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{secondWinnerData.name}</div>
                          <div style={{ color: '#8B9BBE', fontSize: 13, marginBottom: 4 }}>{secondWinnerData.city}</div>
                          <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>{secondWinnerData.blogTitle}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 24, padding: '28px', textAlign: 'center' }}>
                      <Award size={24} color="#8B9BBE" style={{ opacity: 0.5, marginBottom: 8 }} />
                      <h3 style={{ color: '#8B9BBE', fontSize: 14, fontWeight: 600, margin: 0 }}>No 2nd Prize Winner</h3>
                      <p style={{ color: 'rgba(139, 155, 190, 0.6)', fontSize: 12, margin: '4px 0 0' }}>Select from submissions.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Leaderboard Preview */}
              <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 24, padding: 28, marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color="#38BDF8" /> Leaderboard Preview
                </h2>
                <p style={{ color: '#8B9BBE', fontSize: 13, marginBottom: 20 }}>Ranked by total reads, then article count. Derived from the <code style={{ color: '#38BDF8' }}>blogs</code> collection.</p>
                {hubLeaderboard.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#8B9BBE', fontSize: 13 }}>No blog data yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {hubLeaderboard.slice(0, 10).map((entry, idx) => (
                      <div key={entry.email} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 16px' }}>
                        <span style={{ fontSize: 16, width: 30, textAlign: 'center', flexShrink: 0 }}>{['🥇', '🥈', '🥉'][idx] || `#${idx + 1}`}</span>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                          {entry.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</div>
                          <div style={{ color: '#8B9BBE', fontSize: 11 }}>{entry.email}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: 14 }}>{entry.reads.toLocaleString('en-IN')} reads</div>
                          <div style={{ color: '#8B9BBE', fontSize: 11 }}>{entry.articles} articles</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contest Blog Submissions */}
              <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 24, padding: 28 }}>
                <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color="#10B981" /> Contest Blog Submissions
                </h2>
                <p style={{ color: '#8B9BBE', fontSize: 13, marginBottom: 20 }}>{contestBlogs.length} published / approved articles in the contest</p>
                {contestBlogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#8B9BBE', fontSize: 13 }}>No approved blog submissions yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {contestBlogs.slice(0, 20).map((blog: any) => (
                      <div key={blog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title || 'Untitled'}</div>
                          <div style={{ color: '#8B9BBE', fontSize: 11, marginTop: 2 }}>{blog.authorName || blog.author} · {(blog.reads || 0).toLocaleString('en-IN')} reads</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleToggleBlogApproval(blog.id, blog.approved)}
                            style={{ background: blog.approved !== false ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${blog.approved !== false ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`, color: blog.approved !== false ? '#EF4444' : '#10B981', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >
                            {blog.approved !== false ? 'Disapprove' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setBlogReviewModal({ open: true, item: blog })}
                            style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38BDF8', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Tab: USERS ── */}
        {activeTab === 'colleges' && <CollegesTab />}
        {activeTab === 'clients' && <ClientsTab triggerAlert={triggerAlert} />}
        {activeTab === 'settings' && <SettingsTab triggerAlert={triggerAlert} />}
        {activeTab === 'users' && (() => {
          if (!usersLoaded) {
            // Load users on first tab open
            import('firebase/firestore').then(({ getDocs, collection: col }) => {
              getDocs(col(db, 'users')).then(snap => {
                const list: any[] = [];
                snap.forEach(d => list.push({ uid: d.id, ...d.data() }));
                list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                setUsersData(list);
                setUsersLoaded(true);
              });
            });
          }

          const filtered = usersData.filter(u =>
            (u.name || '').toLowerCase().includes(usersSearch.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(usersSearch.toLowerCase()) ||
            (u.phone || '').includes(usersSearch) ||
            (u.city || '').toLowerCase().includes(usersSearch.toLowerCase())
          );

          const handleExpandUser = async (uid: string, email: string) => {
            if (expandedUserId === uid) { setExpandedUserId(null); return; }
            setExpandedUserId(uid);
            if (!userOrders[uid]) {
              try {
                const { getDocs, collection: col, query: q, where: w } = await import('firebase/firestore');
                const snap = await getDocs(q(col(db, 'orders'), w('email', '==', email)));
                const list: any[] = [];
                snap.forEach(d => list.push(d.data()));
                list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                setUserOrders(prev => ({ ...prev, [uid]: list }));
              } catch (err) {
                console.error('Failed to fetch user orders:', err);
                setUserOrders(prev => ({ ...prev, [uid]: [] }));
              }
            }
          };

          return (
            <div className="fade-in">
              <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                Registered Users
              </h1>
              <p style={{ color: '#8B9BBE', fontSize: 15, marginBottom: 24 }}>
                Browse all customer accounts from the Firestore <code style={{ color: '#38BDF8' }}>users</code> collection.
              </p>

              {/* Search bar */}
              <div style={{ position: 'relative', marginBottom: 24, maxWidth: 420 }}>
                <Search size={15} color="#8B9BBE" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="form-input"
                  placeholder="Search by name, email, phone, city..."
                  value={usersSearch}
                  onChange={e => setUsersSearch(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>

              {!usersLoaded ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B9BBE', fontSize: 14 }}>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(56,189,248,0.3)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                  Loading users...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8B9BBE', fontSize: 14 }}>
                  {usersSearch ? 'No users match your search.' : 'No registered users found.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Header row */}
                  {!isMobile && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px 140px 80px', gap: 16, padding: '0 16px', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span>Name / Email</span><span>Phone</span><span>City</span><span>State</span><span>Member Since</span><span>Orders</span>
                    </div>
                  )}
                  {filtered.map(u => (
                    <div key={u.uid}>
                      <div
                        onClick={() => handleExpandUser(u.uid, u.email)}
                        style={{ display: isMobile ? 'flex' : 'grid', gridTemplateColumns: isMobile ? undefined : '1fr 1fr 120px 120px 140px 80px', flexDirection: isMobile ? 'column' : undefined, gap: 16, padding: '14px 16px', background: expandedUserId === u.uid ? 'rgba(56,189,248,0.06)' : '#1a2235', border: `1px solid ${expandedUserId === u.uid ? 'rgba(56,189,248,0.25)' : 'rgba(56,189,248,0.1)'}`, borderRadius: expandedUserId === u.uid ? '16px 16px 0 0' : 16, cursor: 'pointer', transition: 'all 0.2s', alignItems: 'center' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.photoURL ? 'transparent' : 'linear-gradient(135deg, #3B82F6, #38BDF8)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {u.photoURL ? <img src={u.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ color: '#000', fontSize: 12, fontWeight: 800 }}>{(u.name || u.email || 'U').substring(0, 2).toUpperCase()}</span>}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</div>
                            <div style={{ color: '#8B9BBE', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                          </div>
                        </div>
                        <div style={{ color: '#E8EDF5', fontSize: 13 }}>{u.phone || <span style={{ color: '#8B9BBE', fontStyle: 'italic' }}>No phone</span>}</div>
                        <div style={{ color: '#E8EDF5', fontSize: 13 }}>{u.city || '—'}</div>
                        <div style={{ color: '#E8EDF5', fontSize: 13 }}>{u.state || '—'}</div>
                        <div style={{ color: '#8B9BBE', fontSize: 12 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: 13 }}>{userOrders[u.uid]?.length ?? '—'}</span>
                          <ChevronRight size={14} color="#8B9BBE" style={{ transform: expandedUserId === u.uid ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>

                      {/* Expanded order history drawer */}
                      {expandedUserId === u.uid && (
                        <div style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(56,189,248,0.15)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '16px 20px' }}>
                          {!userOrders[u.uid] ? (
                            <div style={{ color: '#8B9BBE', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Loading orders...</div>
                          ) : userOrders[u.uid].length === 0 ? (
                            <div style={{ color: '#8B9BBE', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No orders placed by this user.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              <div style={{ color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Order History ({userOrders[u.uid].length} orders)</div>
                              {userOrders[u.uid].map((ord: any) => (
                                <div key={ord.orderId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', flexWrap: 'wrap', gap: 8 }}>
                                  <div>
                                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>#{ord.orderId}</span>
                                    <span style={{ color: '#8B9BBE', fontSize: 11, marginLeft: 10 }}>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ color: '#10B981', fontWeight: 800, fontSize: 14 }}>₹{(ord.total || 0).toLocaleString('en-IN')}</span>
                                    <span style={{ background: ord.status === 'Completed' || ord.status === 'Delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)', color: ord.status === 'Completed' || ord.status === 'Delivered' ? '#10B981' : '#38BDF8', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' }}>{ord.status || 'Pending'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

      </main>

      {/* ── Modal: Banner Form ── */}
      {bannerModal.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="fade-in" style={{
            background: '#131a24', border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: 24, width: '100%', maxWidth: 550, padding: 32,
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Sora', fontSize: 22, color: '#fff', fontWeight: 800 }}>
                Publish Offer Banner
              </h2>
              <button onClick={() => setBannerModal({ open: false })} style={{ background: 'transparent', border: 'none', color: '#8B9BBE', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleBannerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Banner Title</label>
                <input
                  type="text" required placeholder="e.g. Write a Tech Blog, Get Selected"
                  value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Description / Offer Terms</label>
                <textarea
                  required placeholder="Share your guides or review articles on our Tech Blog. Win rewards!"
                  value={bannerForm.desc} onChange={e => setBannerForm({ ...bannerForm, desc: e.target.value })}
                  className="form-input" style={{ minHeight: 80, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Badge / Offer Tag</label>
                  <input
                    type="text" placeholder="e.g. Blog Contest"
                    value={bannerForm.badge} onChange={e => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Target Page Link</label>
                  <select
                    value={bannerForm.target} onChange={e => setBannerForm({ ...bannerForm, target: e.target.value })}
                    className="form-input" style={{ background: '#0d1117' }}
                  >
                    <option value="blog">Tech Blog</option>
                    <option value="listing">Laptop Storefront</option>
                    <option value="home">Homepage</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Slide Poster Image</label>

                {bannerForm.src && (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)', marginBottom: 12 }}>
                    <img src={bannerForm.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div
                  onClick={() => { if (!uploadingBanner) document.getElementById('banner-file-input')?.click(); }}
                  style={{
                    background: 'rgba(26, 34, 53, 0.4)',
                    border: '2px dashed rgba(56,189,248,0.25)',
                    borderRadius: 16,
                    padding: '24px 20px',
                    textAlign: 'center',
                    cursor: uploadingBanner ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!uploadingBanner) {
                      e.currentTarget.style.borderColor = '#38BDF8';
                      e.currentTarget.style.background = 'rgba(56,189,248,0.04)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!uploadingBanner) {
                      e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)';
                      e.currentTarget.style.background = 'rgba(26, 34, 53, 0.4)';
                    }
                  }}
                >
                  <ImageIcon size={28} color="#38BDF8" style={{ marginBottom: 8 }} />
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                    {uploadingBanner ? 'Uploading image...' : 'Browse local computer files'}
                  </div>
                  <div style={{ color: '#8B9BBE', fontSize: 11 }}>Choose 1 image (Recommended Ratio: 3:1)</div>
                  <input
                    id="banner-file-input"
                    type="file"
                    accept="image/*"
                    disabled={uploadingBanner}
                    onChange={handleBannerImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, marginBottom: 6 }}>Or manually enter image URL:</label>
                  <input
                    type="text" placeholder="Paste direct image link..."
                    value={bannerForm.src || ''} onChange={e => setBannerForm({ ...bannerForm, src: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button" onClick={() => setBannerModal({ open: false })}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8B9BBE', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 600 }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000', border: 'none', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontFamily: 'Sora', fontWeight: 800 }}
                >
                  Publish Slide
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Review Blog Post ── */}
      {blogReviewModal.open && blogReviewModal.item && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="fade-in" style={{
            background: '#131a24', border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: 24, width: '100%', maxWidth: 700, padding: 32,
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Sora', fontSize: 20, color: '#fff', fontWeight: 800 }}>
                Review Blog Submission
              </h2>
              <button onClick={() => setBlogReviewModal({ open: false })} style={{ background: 'transparent', border: 'none', color: '#8B9BBE', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Cover Image */}
              <div style={{ height: 240, overflow: 'hidden', borderRadius: 16, position: 'relative' }}>
                <img
                  src={blogReviewModal.item.coverUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80'}
                  alt={blogReviewModal.item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Title & Metadata */}
              <div>
                <h3 style={{ fontFamily: 'Sora', fontSize: 22, color: '#fff', fontWeight: 800, margin: '0 0 10px' }}>
                  {blogReviewModal.item.title}
                </h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8', padding: '3px 10px', borderRadius: 100, fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>
                    {blogReviewModal.item.category || 'Buying Guide'}
                  </span>
                  <span style={{ color: '#8B9BBE' }}>
                    Written by: <strong style={{ color: '#10B981' }}>{blogReviewModal.item.author || 'Contest Writer'}</strong>
                    {blogReviewModal.item.authorEmail && ` (${blogReviewModal.item.authorEmail})`}
                  </span>
                  <span style={{ color: '#8B9BBE' }}>
                    • {blogReviewModal.item.createdAt ? new Date(blogReviewModal.item.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div
                style={{
                  lineHeight: 1.8,
                  color: '#d1d5db',
                  background: 'rgba(0,0,0,0.2)',
                  padding: 20,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.04)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  fontSize: 14
                }}
                dangerouslySetInnerHTML={{
                  __html: blogReviewModal.item.content
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/### (.*)/g, "<h3>$1</h3>")
                    .replace(/## (.*)/g, "<h2>$1</h2>")
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                    .replace(/^> (.*)/gm, "<blockquote>$1</blockquote>")
                    .replace(/\n/g, "<br/>")
                }}
              />

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                <button
                  onClick={() => {
                    handleToggleBlogApproval(blogReviewModal.item.id, blogReviewModal.item.approved);
                    setBlogReviewModal(prev => ({
                      ...prev,
                      item: { ...prev.item, approved: (prev.item.approved === undefined || prev.item.approved === true) ? false : true }
                    }));
                  }}
                  style={{
                    background: (blogReviewModal.item.approved !== false) ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${(blogReviewModal.item.approved !== false) ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                    color: (blogReviewModal.item.approved !== false) ? '#EF4444' : '#10B981',
                    borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Sora'
                  }}
                >
                  {(blogReviewModal.item.approved !== false) ? 'Hide / Disapprove Article' : 'Approve & Publish Article'}
                </button>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => {
                      handleBlogDelete(blogReviewModal.item.id);
                      setBlogReviewModal({ open: false });
                    }}
                    style={{
                      background: 'rgba(239,68,68,0.2)', border: 'none',
                      color: '#EF4444', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Sora'
                    }}
                  >
                    Delete Post
                  </button>
                  <button
                    onClick={() => setBlogReviewModal({ open: false })}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#8B9BBE', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Sora'
                    }}
                  >
                    Close Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Sell Request Inspection & Image Lightbox ── */}
      {sellDetailModal.open && sellDetailModal.item && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="fade-in" style={{
            background: '#131a24', border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: 24, width: '100%', maxWidth: 900, padding: 32,
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontFamily: 'Sora', fontSize: 22, color: '#fff', fontWeight: 800, margin: 0 }}>
                    {sellDetailModal.item.brand} {sellDetailModal.item.model}
                  </h2>
                  <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 800 }}>
                    #{sellDetailModal.item.requestId || sellDetailModal.item.id.substring(0, 8)}
                  </span>
                </div>
                <div style={{ color: '#8B9BBE', fontSize: 13, marginTop: 4 }}>
                  Submitted on {sellDetailModal.item.createdAt ? new Date(sellDetailModal.item.createdAt).toLocaleString('en-IN') : 'N/A'}
                </div>
              </div>
              <button
                onClick={() => setSellDetailModal({ open: false })}
                style={{ background: 'transparent', border: 'none', color: '#8B9BBE', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: 28 }}>

              {/* Left Column: Specifications Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                    <Cpu size={14} /> Hardware Configurations
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, fontSize: 13 }}>
                    <div><span style={{ color: '#8B9BBE' }}>Processor:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.processor}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>RAM:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.ram}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>Storage:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.storage}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>Graphics:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.gpu || 'N/A'}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>Condition:</span> <strong style={{ color: '#10B981' }}>{sellDetailModal.item.condition}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>Expected Price:</span> <strong style={{ color: '#10B981' }}>{sellDetailModal.item.expectedPrice ? `₹${Number(sellDetailModal.item.expectedPrice).toLocaleString('en-IN')}` : 'N/A'}</strong></div>
                  </div>
                </div>

                {/* Accessories Included */}
                {Array.isArray(sellDetailModal.item.accessories) && sellDetailModal.item.accessories.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 18 }}>
                    <div style={{ color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Included Accessories</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {sellDetailModal.item.accessories.map((acc: string) => (
                        <span key={acc} style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                          ✓ {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Battery & Fault Notes */}
                {sellDetailModal.item.notes && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 18 }}>
                    <div style={{ color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Battery Health & Fault Notes</div>
                    <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.5 }}>{sellDetailModal.item.notes}</div>
                  </div>
                )}

                {/* Customer Contact Details */}
                <div style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    <User size={14} /> Customer Contact Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, fontSize: 13 }}>
                    <div><span style={{ color: '#8B9BBE' }}>Name:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.userName}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>Phone:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.userPhone}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>Email:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.userEmail}</strong></div>
                    <div><span style={{ color: '#8B9BBE' }}>Location:</span> <strong style={{ color: '#fff' }}>{sellDetailModal.item.city} ({sellDetailModal.item.pincode || 'N/A'})</strong></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Uploaded Device Photos Lightbox */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38BDF8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <ImageIcon size={14} /> Uploaded Photos ({Array.isArray(sellDetailModal.item.images) ? sellDetailModal.item.images.length : 0})
                </div>

                {Array.isArray(sellDetailModal.item.images) && sellDetailModal.item.images.length > 0 ? (
                  <div>
                    {/* Zoom & Inspection Control Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 4))}
                          style={{ background: 'rgba(56,189,248,0.15)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                          title="Zoom In"
                        >
                          <ZoomIn size={14} /> Zoom In
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))}
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                          title="Zoom Out"
                        >
                          <ZoomOut size={14} /> Zoom Out
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotationDeg(prev => (prev + 90) % 360)}
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                          title="Rotate 90°"
                        >
                          <RotateCw size={14} /> Rotate
                        </button>
                        {(zoomScale !== 1 || rotationDeg !== 0) && (
                          <button
                            type="button"
                            onClick={() => { setZoomScale(1); setRotationDeg(0); }}
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}
                            title="Reset"
                          >
                            <Maximize2 size={14} /> Reset
                          </button>
                        )}
                      </div>
                      <span style={{ color: '#38BDF8', fontSize: 12, fontWeight: 800, fontFamily: 'monospace' }}>
                        {Math.round(zoomScale * 100)}% {rotationDeg > 0 ? `(${rotationDeg}°)` : ''}
                      </span>
                    </div>

                    {/* Main Active Image Preview with Dynamic Zoom & Click-to-Zoom */}
                    <div
                      style={{
                        borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(56,189,248,0.2)',
                        background: '#0d1117', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in'
                      }}
                      onClick={() => {
                        if (zoomScale === 1) setZoomScale(2);
                        else if (zoomScale === 2) setZoomScale(3);
                        else setZoomScale(1);
                      }}
                      title="Click to toggle zoom levels (1x -> 2x -> 3x)"
                    >
                      <img
                        src={sellDetailModal.item.images[activeImageIndex] || sellDetailModal.item.images[0]}
                        alt="Laptop Inspection Photo"
                        style={{
                          width: '100%', height: '100%', objectFit: 'contain',
                          transform: `scale(${zoomScale}) rotate(${rotationDeg}deg)`,
                          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          transformOrigin: 'center center'
                        }}
                      />
                    </div>

                    {/* Thumbnails Selection Strip */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
                      {sellDetailModal.item.images.map((imgUrl: string, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveImageIndex(idx);
                            setZoomScale(1);
                            setRotationDeg(0);
                          }}
                          style={{
                            width: 60, height: 60, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                            border: activeImageIndex === idx ? '2px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
                            opacity: activeImageIndex === idx ? 1 : 0.6, transition: 'all 0.2s', flexShrink: 0
                          }}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)', padding: 40,
                    textAlign: 'center', color: '#8B9BBE', fontSize: 13
                  }}>
                    No photos uploaded for this device.
                  </div>
                )}

                {/* Status Update Controls */}
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ display: 'block', color: '#8B9BBE', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                    Evaluation Status
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <select
                      value={sellDetailModal.item.status || 'Pending Review'}
                      onChange={e => handleSellStatusUpdate(sellDetailModal.item.id, e.target.value)}
                      className="form-input"
                      style={{ background: '#0d1117', color: '#38BDF8', fontWeight: 700 }}
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => handleSellDelete(sellDetailModal.item.id)}
                      style={{
                        background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                        border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12,
                        padding: '0 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}