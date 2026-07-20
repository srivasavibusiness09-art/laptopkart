import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "./lib/firebase";
import { uploadProductImage, uploadVideoToCloudinary } from "./lib/storage";
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
  FileText,
  Bell,
  Truck,
  BookOpen,
  Video,
  Mail,
  Send
} from 'lucide-react';

// compressImage removed (using storage.ts module)

// Core Type Definitions
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
}

interface Banner {
  src: string;
  badge: string;
  title: string;
  desc: string;
  target: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'accessories' | 'banners' | 'orders' | 'blogs' | 'video' | 'subscribers'>('overview');
  const [ordersFilter, setOrdersFilter] = useState<'active' | 'completed'>('active');
  const [ordersPage, setOrdersPage] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setIsMobile(window.innerWidth < 992);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Search filter states
  const [productSearch, setProductSearch] = useState('');
  const [accessorySearch, setAccessorySearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');

  // Alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

  // Modals status
  const [blogReviewModal, setBlogReviewModal] = useState<{ open: boolean, item?: any }>({ open: false });
  const [productModal, setProductModal] = useState<{ open: boolean, mode: 'add' | 'edit', item?: Product }>({ open: false, mode: 'add' });
  const [accessoryModal, setAccessoryModal] = useState<{ open: boolean, mode: 'add' | 'edit', item?: AccessoryProduct }>({ open: false, mode: 'add' });
  const [subscribersSearch, setSubscribersSearch] = useState('');

  // Newsletter broadcast states
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [bannerModal, setBannerModal] = useState<{ open: boolean }>({ open: false });

  // Form states - Product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', brand: 'Dell', category: 'Business', price: 0, mrp: 0,
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

  // Form states - Promo Video
  const [videoTitle, setVideoTitle] = useState("Explore Laptopkart in Action");
  const [videoSubtitle, setVideoSubtitle] = useState("Watch our certified refurbishment process and see why thousands trust us.");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoOrientation, setVideoOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Live snapshot database listeners for Products, Accessories, Banners, and Orders
  useEffect(() => {
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

    // 4. Subscribe to Blogs
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
          if (data.orientation) setVideoOrientation(data.orientation);
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

    return () => {
      unsubscribeProducts();
      unsubscribeAccessories();
      unsubscribeBanners();
      unsubscribeBlogs();
      unsubscribeVideo();
      unsubscribeSubscribers();
    };
  }, []);

  const triggerAlert = (type: 'success' | 'danger', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const promises: Promise<string>[] = [];
    const currentImages = productForm.images || [];
    const maxFiles = Math.min(files.length, 5 - currentImages.length);

    for (let i = 0; i < maxFiles; i++) {
      promises.push(uploadProductImage(files[i]));
    }

    try {
      const urls = await Promise.all(promises);
      const newImages = [...currentImages, ...urls].slice(0, 5);

      setProductForm(prev => ({
        ...prev,
        images: newImages,
        img: prev.img || newImages[0] || ''
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
    const newImages = currentImages.filter((_, i) => i !== idx);
    setProductForm(prev => ({
      ...prev,
      images: newImages,
      img: prev.img === currentImages[idx] ? (newImages[0] || '') : prev.img
    }));
    setGalleryLinksText(newImages.join(', '));
  };

  const handleAccessoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const url = await uploadProductImage(files[0]);
      setAccessoryForm(prev => ({
        ...prev,
        img: url
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
      const url = await uploadProductImage(files[0]);
      setBannerForm(prev => ({
        ...prev,
        src: url
      }));
      triggerAlert('success', 'Banner image uploaded successfully.');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error uploading banner image.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingVideo(true);
    try {
      triggerAlert('success', 'Starting video upload to Cloudinary... Please wait.');
      const url = await uploadVideoToCloudinary(files[0]);
      setVideoUrl(url);
      triggerAlert('success', 'Video uploaded successfully to Cloudinary!');
    } catch (err: any) {
      console.error(err);
      triggerAlert('danger', err.message || 'Error uploading video file.');
    } finally {
      setUploadingVideo(false);
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
        orientation: videoOrientation,
        updatedAt: new Date().toISOString()
      });
      triggerAlert('success', 'Promo video settings updated successfully!');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error updating video settings.');
    }
  };

  const handleVideoDelete = async () => {
    if (confirm('Are you sure you want to delete the promo video section? This will remove the video from the homepage.')) {
      try {
        await deleteDoc(doc(db, "homepage_settings", "video"));
        setVideoTitle("Explore Laptopkart in Action");
        setVideoSubtitle("Watch our certified refurbishment process and see why thousands trust us.");
        setVideoUrl("");
        setVideoOrientation("landscape");
        triggerAlert('success', 'Promo video deleted successfully!');
      } catch (err) {
        console.error(err);
        triggerAlert('danger', 'Error deleting promo video.');
      }
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

  // Subscribe to live order checkouts (WebSockets)
  useEffect(() => {
    let isInitial = true;
    const unsubscribeOrders = onSnapshot(query(collection(db, "orders")), (snapshot) => {
      const list: Order[] = [];
      let newOrder: Order | null = null;

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const ord = change.doc.data() as Order;
          if (!isInitial) {
            newOrder = ord;
          }
        }
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
  }, []);

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
      rating: productModal.mode === 'edit' ? productModal.item!.rating : 4.5,
      reviews: productModal.mode === 'edit' ? productModal.item!.reviews : 10,
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
      stock: productForm.stock !== undefined ? productForm.stock : 1,
      amazon_url: productForm.amazon_url || '',
      flipkart_url: productForm.flipkart_url || '',
      croma_url: productForm.croma_url || '',
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

  const handleProductDelete = (id: any) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteDoc(doc(db, "products", String(id)))
        .then(() => triggerAlert('success', 'Product deleted successfully!'))
        .catch(() => triggerAlert('danger', 'Failed to delete product.'));
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await setDoc(doc(db, "orders", orderId), { status: newStatus }, { merge: true });
      triggerAlert('success', `Order #${orderId} status set to "${newStatus}"`);
    } catch (err) {
      console.error("Error updating order status:", err);
      triggerAlert('danger', "Failed to update order status.");
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

  const handleAccessoryDelete = (id: any) => {
    if (confirm('Are you sure you want to delete this accessory?')) {
      deleteDoc(doc(db, "accessories", String(id)))
        .then(() => triggerAlert('success', 'Accessory deleted successfully!'))
        .catch(() => triggerAlert('danger', 'Failed to delete accessory.'));
    }
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

  const handleBannerDelete = (title: string) => {
    if (confirm('Are you sure you want to delete this slide banner?')) {
      const docId = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      deleteDoc(doc(db, "banners", docId))
        .then(() => triggerAlert('success', 'Banner removed successfully!'))
        .catch(() => triggerAlert('danger', 'Error removing banner.'));
    }
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

  // Filter lists
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredAccessories = accessories.filter(a =>
    a.name.toLowerCase().includes(accessorySearch.toLowerCase()) ||
    a.brand.toLowerCase().includes(accessorySearch.toLowerCase())
  );

  const filteredBlogs = blogs.filter(b =>
    (b.title || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
    (b.authorEmail || '').toLowerCase().includes(blogSearch.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(blogSearch.toLowerCase())
  );

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>

      {/* ── Left Sidebar ── */}
      <aside style={{
        width: 260,
        background: '#131a24',
        borderRight: '1px solid rgba(56, 189, 248, 0.12)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
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
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
            { id: 'products', label: 'Laptops & PCs', icon: <Laptop size={18} /> },
            { id: 'accessories', label: 'Accessories', icon: <Keyboard size={18} /> },
            { id: 'banners', label: 'Offers & Contests', icon: <ImageIcon size={18} /> },
            { id: 'orders', label: 'Customer Orders', icon: <FileText size={18} /> },
            { id: 'blogs', label: 'Tech Blogs', icon: <BookOpen size={18} /> },
            { id: 'video', label: 'Promo Video', icon: <Video size={18} /> },
            { id: 'subscribers', label: 'Newsletter', icon: <Mail size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                color: activeTab === tab.id ? '#38BDF8' : '#8B9BBE',
                border: activeTab === tab.id ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
                borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                fontFamily: 'Outfit'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
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
      </aside>

      {/* ── Main Workspace ── */}
      <main style={{ flex: 1, padding: '40px 32px', overflowY: 'auto' }}>

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

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Total Products', val: products.length, icon: <Laptop size={20} color="#38BDF8" />, bg: 'rgba(56,189,248,0.1)' },
                { label: 'Accessories Listed', val: accessories.length, icon: <Keyboard size={20} color="#8B5CF6" />, bg: 'rgba(139,92,246,0.1)' },
                { label: 'Active Banner Slides', val: banners.length, icon: <ImageIcon size={20} color="#EF4444" />, bg: 'rgba(239,68,68,0.1)' },
                { label: 'Total Sales Revenue', val: `₹${orders.filter(ord => ord.status !== 'Cancelled' && ord.status !== 'Pending (COD)').reduce((sum, ord) => sum + ord.total, 0).toLocaleString('en-IN')}`, icon: <TrendingUp size={20} color="#10B981" />, bg: 'rgba(16,185,129,0.1)' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                  borderRadius: 20, padding: 24, display: 'flex', alignItems: 'center', justifyItems: 'center', gap: 20
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

            {/* Simulated Activity Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>

              <div style={{
                background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)',
                borderRadius: 20, padding: 24
              }}>
                <h2 style={{ fontFamily: 'Sora', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                  Active Systems Status
                </h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    <div>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, display: 'block' }}>Next.js Storefront Sync Bridge:</span>
                      <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>Connected (Real-time Firestore Sync)</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    <div>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, display: 'block' }}>Refurbishment Quality Inspection Engine:</span>
                      <span style={{ fontSize: 12, color: '#8B9BBE' }}>Multiple Check point benchmark checklist loaded</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    <div>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, display: 'block' }}>Accessories Filter Category Set:</span>
                      <span style={{ fontSize: 12, color: '#8B9BBE' }}>Monitors, Docks, Keyboards, Power, Bags, Mouse</span>
                    </div>
                  </div>
                </div>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                    {orders.map((ord) => (
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

            {/* Table Grid */}
            <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Condition</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Price / MRP</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Specs</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
                      <td style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 13, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.specs}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleProductEdit(p)} style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => handleProductDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#8B9BBE', fontSize: 14 }}>
                        No products found in the catalog.
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
            <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflow: 'hidden' }}>
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

        {/* ── Tab: CUSTOMER ORDERS MANAGER ── */}
        {activeTab === 'orders' && (() => {
          const activeOrders = orders.filter(ord => {
            const status = ord.status || 'Pending';
            return status !== 'Completed' && status !== 'Cancelled';
          });
          const completedOrders = orders.filter(ord => {
            const status = ord.status || 'Pending';
            return status === 'Completed' || status === 'Cancelled';
          });
          const displayedOrders = ordersFilter === 'active' ? activeOrders : completedOrders;

          const PAGE_SIZE = 20;
          const totalPages = Math.ceil(displayedOrders.length / PAGE_SIZE);
          const paginatedOrders = displayedOrders.slice(ordersPage * PAGE_SIZE, (ordersPage + 1) * PAGE_SIZE);

          const getStatusStyle = (status: string) => {
            switch (status) {
              case 'Completed': return { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.25)' };
              case 'Cancelled': return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.25)' };
              case 'Shipped': return { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: 'rgba(139,92,246,0.25)' };
              case 'Pending (COD)': return { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.25)' };
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
              </div>

              {/* Orders List container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {paginatedOrders.length === 0 ? (
                  <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
                    <FileText size={48} color="#8B9BBE" style={{ marginBottom: 16, opacity: 0.5 }} />
                    <p style={{ color: '#8B9BBE', fontSize: 15, margin: 0 }}>
                      {ordersFilter === 'active'
                        ? 'No active customer orders to process. All set!'
                        : 'No completed or archived customer orders found.'}
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
                          {((ord.status || 'Pending') === 'Completed' || (ord.status || 'Pending') === 'Cancelled') && (
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
                                  <option value="Pending (COD)" style={{ background: '#131a24', color: '#fff' }}>Pending (COD)</option>
                                  <option value="Paid (Simulated)" style={{ background: '#131a24', color: '#fff' }}>Paid (Simulated)</option>
                                  <option value="Shipped" style={{ background: '#131a24', color: '#fff' }}>Shipped</option>
                                  <option value="Completed" style={{ background: '#131a24', color: '#fff' }}>Completed</option>
                                  <option value="Cancelled" style={{ background: '#131a24', color: '#fff' }}>Cancelled</option>
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

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8B9BBE' }} />
              <input
                type="text" placeholder="Search by title, category, or author..."
                value={blogSearch} onChange={e => setBlogSearch(e.target.value)}
                className="form-input" style={{ paddingLeft: 44 }}
              />
            </div>

            {/* Blogs List Grid Table */}
            <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(56, 189, 248, 0.12)' }}>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Article</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '18px 24px', color: '#8B9BBE', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Author</th>
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
                              <div style={{ color: '#8B9BBE', fontSize: 11, marginTop: 2 }}>{b.readTime || '3 min read'} • {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A'}</div>
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
                          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
                            <button onClick={() => handleBlogDelete(b.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
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

                <div style={{ background: '#1a2235', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 20, overflow: 'hidden' }}>
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

      </main>

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

            <form onSubmit={handleProductSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Form Navigation Tabs */}
              <div style={{
                display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: 16, marginBottom: 12, gridColumn: 'span 2'
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
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
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
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Processor Details</label>
                    <input
                      type="text" placeholder="e.g. Intel Core i5 8265U"
                      value={productForm.processor} onChange={e => setProductForm({ ...productForm, processor: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Specifications Tagline</label>
                    <input
                      type="text" placeholder="e.g. Intel i5 8th Gen • 16GB RAM • 512GB SSD"
                      value={productForm.specs} onChange={e => setProductForm({ ...productForm, specs: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* RAM Custom Visual Toggle & Offset Input */}
                  <div style={{ gridColumn: 'span 2', background: '#0d1117', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 18, padding: 18 }}>
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
                  <div style={{ gridColumn: 'span 2', background: '#0d1117', border: '1px solid rgba(56,189,248,0.12)', borderRadius: 18, padding: 18 }}>
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
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Custom Description (Optional, overrides auto-template)</label>
                    <textarea
                      placeholder="e.g. This laptop features high performance with dual channel RAM..."
                      value={productForm.description || ''} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      className="form-input" style={{ minHeight: 70, resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Custom Box Contents (Optional, comma-separated)</label>
                    <input
                      type="text" placeholder="e.g. Refurbished Grade A+ Laptop, Original Power Adapter, Certification Booklet"
                      value={productForm.boxContents || ''} onChange={e => setProductForm({ ...productForm, boxContents: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 10 }}>
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

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

    </div>
  );
}
