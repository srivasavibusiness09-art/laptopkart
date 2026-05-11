export interface Product {
  id: number;
  name: string;
  specs: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviews: number;
  warranty: string;
  badge: string;
  grade: string;
  img: string;        // URL to product image
  category: string;
  brand: string;
  ram: string;
  storage: string;
  processor: string;
}

export interface Category {
  name: string;
  icon: string;       // URL to category image
  count: string;
  color: string;
}

export interface Review {
  name: string;
  rating: number;
  text: string;
  avatar: string;
  city: string;
}

/* ── Product Images (Unsplash CDN — no API key required) ── */
const IMG = {
  dellLatitude:  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80&auto=format&fit=crop",
  hpEliteBook:   "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80&auto=format&fit=crop",
  thinkPad:      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80&auto=format&fit=crop",
  dellXps:       "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80&auto=format&fit=crop",
  macbook:       "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80&auto=format&fit=crop",
  gaming:        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80&auto=format&fit=crop",
  desktop:       "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80&auto=format&fit=crop",
  hpPavilion:    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80&auto=format&fit=crop",
};

/* ── Category Images ── */
const CAT_IMG = {
  laptops:    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80&auto=format&fit=crop",
  gaming:     "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&q=80&auto=format&fit=crop",
  desktops:   "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&q=80&auto=format&fit=crop",
  macbooks:   "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80&auto=format&fit=crop",
  monitors:   "https://images.unsplash.com/photo-1527443224154-c4a573d5f5a0?w=200&q=80&auto=format&fit=crop",
  accessories:"https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&q=80&auto=format&fit=crop",
};

export const products: Product[] = [
  {
    id: 1, name: "Dell Latitude 5400", specs: "Intel i5 | 8GB | 256GB SSD",
    price: 18999, mrp: 32999, discount: 42, rating: 4.7, reviews: 324,
    warranty: "1 Year", badge: "Best Seller", grade: "A",
    img: IMG.dellLatitude, category: "laptops", brand: "Dell",
    ram: "8GB", storage: "256GB SSD", processor: "Intel i5",
  },
  {
    id: 2, name: "HP EliteBook 840 G5", specs: "Intel i5 | 8GB | 256GB SSD",
    price: 21999, mrp: 38999, discount: 44, rating: 4.6, reviews: 286,
    warranty: "1 Year", badge: "Premium", grade: "A+",
    img: IMG.hpEliteBook, category: "laptops", brand: "HP",
    ram: "8GB", storage: "256GB SSD", processor: "Intel i5",
  },
  {
    id: 3, name: "Lenovo ThinkPad T480", specs: "Intel i5 | 8GB | 256GB SSD",
    price: 18499, mrp: 34999, discount: 47, rating: 4.8, reviews: 410,
    warranty: "1 Year", badge: "Best Battery", grade: "A",
    img: IMG.thinkPad, category: "laptops", brand: "Lenovo",
    ram: "8GB", storage: "256GB SSD", processor: "Intel i5",
  },
  {
    id: 4, name: "Dell XPS 13", specs: "Intel i5 | 8GB | 256GB SSD",
    price: 41999, mrp: 75999, discount: 45, rating: 4.9, reviews: 190,
    warranty: "1 Year", badge: "Premium", grade: "A+",
    img: IMG.dellXps, category: "laptops", brand: "Dell",
    ram: "8GB", storage: "256GB SSD", processor: "Intel i5",
  },
  {
    id: 5, name: "MacBook Pro 2019", specs: "Core i7 | 16GB | 512GB SSD",
    price: 54999, mrp: 99999, discount: 45, rating: 4.9, reviews: 521,
    warranty: "1 Year", badge: "Top Rated", grade: "A+",
    img: IMG.macbook, category: "macbooks", brand: "Apple",
    ram: "16GB", storage: "512GB SSD", processor: "Core i7",
  },
  {
    id: 6, name: "Asus ROG Strix G15", specs: "Ryzen 7 | 16GB | 512GB SSD",
    price: 62999, mrp: 110000, discount: 43, rating: 4.7, reviews: 198,
    warranty: "1 Year", badge: "Gaming", grade: "A",
    img: IMG.gaming, category: "gaming", brand: "Asus",
    ram: "16GB", storage: "512GB SSD", processor: "Ryzen 7",
  },
  {
    id: 7, name: "Dell OptiPlex 7060", specs: "Intel i7 | 16GB | 512GB SSD",
    price: 24999, mrp: 45000, discount: 44, rating: 4.6, reviews: 156,
    warranty: "1 Year", badge: "Office Pick", grade: "A",
    img: IMG.desktop, category: "desktops", brand: "Dell",
    ram: "16GB", storage: "512GB SSD", processor: "Intel i7",
  },
  {
    id: 8, name: "HP Pavilion 15", specs: "Intel i3 | 8GB | 256GB SSD",
    price: 14999, mrp: 27000, discount: 44, rating: 4.4, reviews: 89,
    warranty: "1 Year", badge: "Budget Pick", grade: "B+",
    img: IMG.hpPavilion, category: "laptops", brand: "HP",
    ram: "8GB", storage: "256GB SSD", processor: "Intel i3",
  },
];

export const categories: Category[] = [
  { name: "Laptops",         icon: CAT_IMG.laptops,     count: "500+ Products",  color: "#1E3A5F" },
  { name: "Gaming Laptops",  icon: CAT_IMG.gaming,      count: "120+ Products",  color: "#2D1B4E" },
  { name: "Desktops",        icon: CAT_IMG.desktops,    count: "200+ Products",  color: "#1A3A2A" },
  { name: "MacBooks",        icon: CAT_IMG.macbooks,    count: "80+ Products",   color: "#3A1A1A" },
  { name: "Monitors",        icon: CAT_IMG.monitors,    count: "150+ Products",  color: "#1A2A3A" },
  { name: "Accessories",     icon: CAT_IMG.accessories, count: "300+ Products",  color: "#2A2A1A" },
];

export const reviews: Review[] = [
  { name: "Rohit Sharma", rating: 5, text: "Excellent quality laptop. Feels like new. Battery backup is awesome!", avatar: "RS", city: "Mumbai" },
  { name: "Priya Mehta",  rating: 5, text: "Best experience buying refurbished. Highly recommended to friends!",  avatar: "PM", city: "Delhi" },
  { name: "Amit Verma",   rating: 4, text: "Superb packaging and fast delivery. Genuine product, very happy.",    avatar: "AV", city: "Bangalore" },
  { name: "Sneha Iyer",   rating: 5, text: "Very happy with performance and warranty support. Great team!",       avatar: "SI", city: "Chennai" },
];

export const navLinks = ["Laptops", "Desktops", "Accessories", "Offers", "Resell Laptop", "Blog", "About"];

export const COLORS = {
  green:       "#22C55E",
  greenDark:   "#16A34A",
  greenLight:  "#DCFCE7",
  greenAccent: "#4ADE80",
  black:       "#0A0A0A",
  darkBg:      "#0F1117",
  cardBg:      "#161B27",
  cardBorder:  "#1E2535",
  text:        "#F0F4FF",
  muted:       "#8892A4",
  white:       "#FFFFFF",
  badge:       "#FF6B35",
  badgeBlue:   "#3B82F6",
};
