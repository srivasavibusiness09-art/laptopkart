import React, { useState, useEffect } from 'react';
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
  Bell
} from 'lucide-react';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = Math.min(MAX_WIDTH / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        } else {
          reject(new Error('Canvas context error'));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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
  ram: "8GB" | "16GB" | "32GB";
  storage: string;
  badge: "Best Seller" | "Gaming" | "Value Deal" | "Top Rated";
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
const DEFAULT_PRODUCTS: Product[] = [
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

const DEFAULT_ACCESSORIES: AccessoryProduct[] = [
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

const DEFAULT_BANNERS: Banner[] = [
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'accessories' | 'banners'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Search filter states
  const [productSearch, setProductSearch] = useState('');
  const [accessorySearch, setAccessorySearch] = useState('');

  // Alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

  // Modals status
  const [productModal, setProductModal] = useState<{ open: boolean, mode: 'add' | 'edit', item?: Product }>({ open: false, mode: 'add' });
  const [accessoryModal, setAccessoryModal] = useState<{ open: boolean, mode: 'add' | 'edit', item?: AccessoryProduct }>({ open: false, mode: 'add' });
  const [bannerModal, setBannerModal] = useState<{ open: boolean }>({ open: false });

  // Form states - Product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', brand: 'Dell', category: 'Business', price: 0, mrp: 0,
    condition: 'Refurbished', grade: 'A+', warranty: '1 Year Warranty',
    specs: '', img: '', processor: '', ram: '8GB', storage: '256GB SSD', badge: 'Top Rated'
  });

  // Form states - Accessory
  const [accessoryForm, setAccessoryForm] = useState<Partial<AccessoryProduct>>({
    name: '', category: 'Monitors', price: 0, mrp: 0, brand: 'Dell', specs: '', img: ''
  });

  // Form states - Banner
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    src: '', badge: 'Offers', title: '', desc: '', target: 'listing'
  });

  // Load from local storage
  useEffect(() => {
    const p = localStorage.getItem('laptopkart_products');
    const a = localStorage.getItem('laptopkart_accessories');
    const b = localStorage.getItem('laptopkart_banners');

    if (p) setProducts(JSON.parse(p));
    else {
      localStorage.setItem('laptopkart_products', JSON.stringify(DEFAULT_PRODUCTS));
      setProducts(DEFAULT_PRODUCTS);
    }

    if (a) setAccessories(JSON.parse(a));
    else {
      localStorage.setItem('laptopkart_accessories', JSON.stringify(DEFAULT_ACCESSORIES));
      setAccessories(DEFAULT_ACCESSORIES);
    }

    if (b) setBanners(JSON.parse(b));
    else {
      localStorage.setItem('laptopkart_banners', JSON.stringify(DEFAULT_BANNERS));
      setBanners(DEFAULT_BANNERS);
    }
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
      promises.push(compressImage(files[i]));
    }

    try {
      const base64s = await Promise.all(promises);
      const newImages = [...currentImages, ...base64s].slice(0, 5);
      
      setProductForm(prev => ({
        ...prev,
        images: newImages,
        img: prev.img || newImages[0] || ''
      }));
      triggerAlert('success', `Loaded ${base64s.length} local images.`);
    } catch (err) {
      console.error("Error compressing images: ", err);
      triggerAlert('danger', 'Error loading local images.');
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
  };

  const handleAccessoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const base64 = await compressImage(files[0]);
      setAccessoryForm(prev => ({
        ...prev,
        img: base64
      }));
      triggerAlert('success', 'Accessory image uploaded successfully.');
    } catch (err) {
      console.error(err);
      triggerAlert('danger', 'Error uploading accessory image.');
    }
  };

  interface Order {
    orderId: string;
    date: string;
    items: { id: number; name: string; price: number; qty: number; img: string }[];
    total: number;
    address: { name: string; phone: string; pincode: string; city: string; state: string; street: string };
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

  // Poll for new orders from local storage
  useEffect(() => {
    const loadOrders = () => {
      const stored = localStorage.getItem("laptopkart_orders");
      if (stored) {
        const parsed: Order[] = JSON.parse(stored);
        if (orders.length > 0 && parsed.length > orders.length) {
          const latestOrder = parsed[0];
          setNewOrderAlert(latestOrder);
          // Play mock audio or visual blink
          setTimeout(() => setNewOrderAlert(null), 7000);
        }
        setOrders(parsed);
      }
    };

    loadOrders();
    const timer = setInterval(loadOrders, 2500);
    return () => clearInterval(timer);
  }, [orders.length]);

  // Sync back to local storage
  const saveProducts = (newList: Product[]) => {
    setProducts(newList);
    localStorage.setItem('laptopkart_products', JSON.stringify(newList));
  };

  const saveAccessories = (newList: AccessoryProduct[]) => {
    setAccessories(newList);
    localStorage.setItem('laptopkart_accessories', JSON.stringify(newList));
  };

  const saveBanners = (newList: Banner[]) => {
    setBanners(newList);
    localStorage.setItem('laptopkart_banners', JSON.stringify(newList));
  };

  // Product CRUD Handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(productForm.price) || 0;
    const mrp = Number(productForm.mrp) || 0;
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const pData: Product = {
      id: productModal.mode === 'edit' ? productModal.item!.id : Date.now(),
      name: productForm.name || 'Generic Laptop',
      brand: productForm.brand || 'Dell',
      category: productForm.category || 'Business',
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
      ram: productForm.ram as "8GB" | "16GB" | "32GB" || '8GB',
      storage: productForm.storage || '256GB SSD',
      badge: productForm.badge as "Best Seller" | "Gaming" | "Value Deal" | "Top Rated" || 'Top Rated',
    };

    if (productForm.condition === 'Refurbished') {
      pData.grade = productForm.grade as "A+" | "A" | "B+";
    }

    if (productModal.mode === 'add') {
      saveProducts([pData, ...products]);
      triggerAlert('success', 'Product added successfully!');
    } else {
      saveProducts(products.map(item => item.id === pData.id ? pData : item));
      triggerAlert('success', 'Product updated successfully!');
    }
    setProductModal({ open: false, mode: 'add' });
  };

  const handleProductEdit = (item: Product) => {
    setProductForm({ ...item });
    setProductModal({ open: true, mode: 'edit', item });
  };

  const handleProductDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      saveProducts(products.filter(item => item.id !== id));
      triggerAlert('success', 'Product deleted successfully!');
    }
  };

  // Accessory CRUD Handlers
  const handleAccessorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(accessoryForm.price) || 0;
    const mrp = Number(accessoryForm.mrp) || 0;

    const aData: AccessoryProduct = {
      id: accessoryModal.mode === 'edit' ? accessoryModal.item!.id : Date.now(),
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

    if (accessoryModal.mode === 'add') {
      saveAccessories([aData, ...accessories]);
      triggerAlert('success', 'Accessory added successfully!');
    } else {
      saveAccessories(accessories.map(item => item.id === aData.id ? aData : item));
      triggerAlert('success', 'Accessory updated successfully!');
    }
    setAccessoryModal({ open: false, mode: 'add' });
  };

  const handleAccessoryEdit = (item: AccessoryProduct) => {
    setAccessoryForm({ ...item });
    setAccessoryModal({ open: true, mode: 'edit', item });
  };

  const handleAccessoryDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this accessory?')) {
      saveAccessories(accessories.filter(item => item.id !== id));
      triggerAlert('success', 'Accessory deleted successfully!');
    }
  };

  // Banner CRUD Handlers
  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bData: Banner = {
      src: bannerForm.src || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&auto=format&fit=crop',
      badge: bannerForm.badge || 'Contest',
      title: bannerForm.title || 'Special Promotion',
      desc: bannerForm.desc || 'Details of contest and reward prizes.',
      target: bannerForm.target || 'listing',
    };
    saveBanners([...banners, bData]);
    triggerAlert('success', 'Offer banner published successfully!');
    setBannerForm({ src: '', badge: 'Offers', title: '', desc: '', target: 'listing' });
    setBannerModal({ open: false });
  };

  const handleBannerDelete = (idx: number) => {
    if (confirm('Are you sure you want to delete this slide banner?')) {
      saveBanners(banners.filter((_, i) => i !== idx));
      triggerAlert('success', 'Banner removed successfully!');
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
                { label: 'Mock Profit (Monthly)', val: `₹${(products.length * 12500).toLocaleString('en-IN')}`, icon: <TrendingUp size={20} color="#10B981" />, bg: 'rgba(16,185,129,0.1)' },
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
                      <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>Connected (Listening on LocalStorage)</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    <div>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, display: 'block' }}>Refurbishment Quality Inspection Engine:</span>
                      <span style={{ fontSize: 12, color: '#8B9BBE' }}>72 points benchmark checklist loaded</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    <div>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, display: 'block' }}>Accessories Filter Category Set:</span>
                      <span style={{ fontSize: 12, color: '#8B9BBE' }}>Monitors, Docks, Keyboards, Power, Bags</span>
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
                      <div key={ord.orderId} style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(56,189,248,0.06)',
                        borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
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
                          <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '2px 6px', borderRadius: 100, display: 'inline-block', marginTop: 2 }}>Paid</span>
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
                    specs: '', img: '', processor: '', ram: '8GB', storage: '256GB SSD', badge: 'Top Rated'
                  });
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
                onClick={() => setBannerModal({ open: true })}
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
                        onClick={() => handleBannerDelete(idx)}
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
              
              <div>
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Product Name</label>
                <input
                  type="text" required placeholder="e.g. Dell Latitude 5400"
                  value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="form-input"
                />
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
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Category</label>
                <select
                  value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                  className="form-input" style={{ background: '#0d1117' }}
                >
                  {['Business', 'Gaming', 'MacBooks', 'Ultrabooks', 'Workstations'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Processor Details</label>
                <input
                  type="text" placeholder="e.g. Intel Core i5 8265U"
                  value={productForm.processor} onChange={e => setProductForm({ ...productForm, processor: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>RAM Size</label>
                <select
                  value={productForm.ram} onChange={e => setProductForm({ ...productForm, ram: e.target.value as any })}
                  className="form-input" style={{ background: '#0d1117' }}
                >
                  <option value="8GB">8GB RAM</option>
                  <option value="16GB">16GB RAM</option>
                  <option value="32GB">32GB RAM</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Storage Size</label>
                <input
                  type="text" placeholder="e.g. 512GB SSD"
                  value={productForm.storage} onChange={e => setProductForm({ ...productForm, storage: e.target.value })}
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
              </div>

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
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
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
                    value={accessoryForm.category} onChange={e => setAccessoryForm({ ...accessoryForm, category: e.target.value })}
                    className="form-input" style={{ background: '#0d1117' }}
                  >
                    {['Monitors', 'Docking Stations', 'Mice & Keyboards', 'Chargers & Power', 'Bags & Sleeves'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

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
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
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
                <label style={{ display: 'block', color: '#8B9BBE', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Slide Poster Image URL</label>
                <input
                  type="text" placeholder="Paste slide background image link..."
                  value={bannerForm.src} onChange={e => setBannerForm({ ...bannerForm, src: e.target.value })}
                  className="form-input"
                />
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

    </div>
  );
}
