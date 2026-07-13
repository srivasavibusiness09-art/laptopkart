export const COLORS = {
  darkBg: "#0d1117",
  background: "#131a24",
  cardBg: "#1a2235",
  cardBorder: "rgba(56,150,240,0.12)",
  text: "#E8EDF5",
  muted: "#8B9BBE",
  green: "#38BDF8",
  greenDark: "#0EA5E9",
  cyan: "#22D3EE",
  indigo: "#6366F1",
  primary: "#3B82F6",
  accent: "#F59E0B",
  badge: "#3B82F6",
  black: "#0d1117",
} as const;

export type Product = {
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
  stock?: number;
  deviceType?: "Laptop" | "Desktop";
};

export const products: Product[] = [
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
    id: 12,
    name: "Dell XPS 13 9315 (Brand New)",
    brand: "Dell",
    category: "Ultrabooks",
    price: 114999,
    mrp: 129999,
    discount: 11,
    rating: 4.7,
    reviews: 92,
    condition: "Brand New",
    warranty: "1 Year Dell Onsite Warranty",
    specs: "Intel i7 12th Gen • 16GB RAM • 512GB SSD",
    img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i7 1250U",
    ram: "16GB",
    storage: "512GB SSD",
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
  },
  {
    id: 3,
    name: "Lenovo ThinkPad T480",
    brand: "Lenovo",
    category: "Business",
    price: 26999,
    mrp: 52999,
    discount: 49,
    rating: 4.7,
    reviews: 934,
    grade: "A+",
    warranty: "1 Year",
    specs: "Intel i5 8th Gen • 8GB RAM • 256GB SSD",
    img: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i5 8350U",
    ram: "8GB",
    storage: "256GB SSD",
    badge: "Best Seller",
  },
  {
    id: 4,
    name: "Asus TUF Gaming FX505",
    brand: "Asus",
    category: "Gaming",
    price: 45999,
    mrp: 89999,
    discount: 49,
    rating: 4.4,
    reviews: 412,
    grade: "A",
    warranty: "1 Year",
    specs: "Ryzen 5 • 16GB RAM • 512GB SSD • GTX 1650",
    img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80&auto=format&fit=crop",
    processor: "AMD Ryzen 5 3550H",
    ram: "16GB",
    storage: "512GB SSD",
    badge: "Gaming",
  },
  {
    id: 5,
    name: "Apple MacBook Air 2018",
    brand: "Apple",
    category: "MacBook",
    price: 54999,
    mrp: 99999,
    discount: 45,
    rating: 4.8,
    reviews: 520,
    grade: "A+",
    warranty: "1 Year",
    specs: "Intel i5 • 8GB RAM • 128GB SSD",
    img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i5",
    ram: "8GB",
    storage: "128GB SSD",
    badge: "Top Rated",
  },
  {
    id: 6,
    name: "Dell G5 15 Gaming",
    brand: "Dell",
    category: "Gaming",
    price: 52999,
    mrp: 99999,
    discount: 47,
    rating: 4.3,
    reviews: 288,
    grade: "B+",
    warranty: "1 Year",
    specs: "Intel i7 • 16GB RAM • 512GB SSD • GTX 1660Ti",
    img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i7 8750H",
    ram: "16GB",
    storage: "512GB SSD",
    badge: "Gaming",
  },
  {
    id: 7,
    name: "HP ProBook 440 G6",
    brand: "HP",
    category: "Business",
    price: 24999,
    mrp: 47999,
    discount: 48,
    rating: 4.2,
    reviews: 365,
    grade: "A",
    warranty: "1 Year",
    specs: "Intel i5 8th Gen • 8GB RAM • 256GB SSD",
    img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i5 8265U",
    ram: "8GB",
    storage: "256GB SSD",
    badge: "Value Deal",
  },
  {
    id: 8,
    name: "Lenovo IdeaPad S540",
    brand: "Lenovo",
    category: "Ultrabook",
    price: 32999,
    mrp: 64999,
    discount: 49,
    rating: 4.4,
    reviews: 214,
    grade: "A+",
    warranty: "1 Year",
    specs: "Intel i5 10th Gen • 16GB RAM • 512GB SSD",
    img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80&auto=format&fit=crop",
    processor: "Intel Core i5 10210U",
    ram: "16GB",
    storage: "512GB SSD",
    badge: "Top Rated",
  },
];

export const categories = [
  {
    name: "Business Laptops",
    icon: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80&auto=format&fit=crop",
    count: "120+ items",
  },
  {
    name: "Gaming Laptops",
    icon: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=200&q=80&auto=format&fit=crop",
    count: "60+ items",
  },
  {
    name: "MacBooks",
    icon: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&q=80&auto=format&fit=crop",
    count: "40+ items",
  },
  {
    name: "Ultrabooks",
    icon: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=200&q=80&auto=format&fit=crop",
    count: "55+ items",
  },
  {
    name: "Workstations",
    icon: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80&auto=format&fit=crop",
    count: "35+ items",
  },
  {
    name: "Accessories",
    icon: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&q=80&auto=format&fit=crop",
    count: "80+ items",
  },
] as const;

export const reviews = [
  {
    name: "Amit Verma",
    city: "Delhi",
    rating: 5,
    text: "Laptop arrived in great condition and performs like new. Fast shipping and excellent support.",
    avatar: "AV",
  },
  {
    name: "Sneha Rao",
    city: "Bengaluru",
    rating: 5,
    text: "Amazing value for money. Battery life is solid and the device looks almost new.",
    avatar: "SR",
  },
  {
    name: "Ravi Kumar",
    city: "Hyderabad",
    rating: 4,
    text: "Great experience overall. Packaging was secure and delivery was on time.",
    avatar: "RK",
  },
  {
    name: "Neha Singh",
    city: "Pune",
    rating: 5,
    text: "Best refurbished purchase I have made. Smooth performance and clean build.",
    avatar: "NS",
  },
] as const;

export const navLinks = [
  "Offers",
  "Laptops",
  "Desktops",
  "Accessories",
  "Resell Laptop",
  "Blog",
  "About",
] as const;

export interface AccessoryProduct {
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

export const accessoriesList: AccessoryProduct[] = [
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
  },
  {
    id: 103,
    name: "Logitech MX Master 3S Wireless Mouse",
    category: "Mice & Keyboards",
    price: 3799,
    mrp: 8999,
    rating: 4.8,
    reviews: 230,
    img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80&auto=format&fit=crop",
    brand: "Logitech",
    specs: "8K DPI • Quiet Clicks • MagSpeed Scroll Wheel",
  },
  {
    id: 104,
    name: "HP Wireless Keyboard & Mouse Combo CS10",
    category: "Mice & Keyboards",
    price: 1299,
    mrp: 2999,
    rating: 4.2,
    reviews: 310,
    img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80&auto=format&fit=crop",
    brand: "HP",
    specs: "Ergonomic Layout • 2.4GHz Wireless • Long Battery Life",
  },
  {
    id: 105,
    name: "Dell 65W USB-C Power Adapter Charger",
    category: "Chargers & Power",
    price: 1899,
    mrp: 3999,
    rating: 4.4,
    reviews: 175,
    img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80&auto=format&fit=crop",
    brand: "Dell",
    specs: "65W Output • Type-C Port • Fast Charging Enabled",
  },
  {
    id: 106,
    name: "Lenovo ThinkPad Professional 15.6\" Backpack",
    category: "Bags & Sleeves",
    price: 1499,
    mrp: 3499,
    rating: 4.7,
    reviews: 95,
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80&auto=format&fit=crop",
    brand: "Lenovo",
    specs: "Water Resistant • Padded Laptop Compartment • Ergonomic Straps",
  }
];

export interface Banner {
  src: string;
  badge: string;
  title: string;
  desc: string;
  target: string;
}

export const initialBanners: Banner[] = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&auto=format&fit=crop",
    badge: "Blog Contest",
    title: "Write a Tech Blog, Get Selected",
    desc: "Share your guides or review articles on our Tech Blog. Win rewards!",
    target: "blog",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
    badge: "Exclusive Offers",
    title: "Exclusive Offers if You Win!",
    desc: "Earn high-value cashback discount coupons to redeem on top brand laptops.",
    target: "blog",
  },
  {
    src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80&auto=format&fit=crop",
    badge: "Direct Savings",
    title: "Weekly Direct Deals: Flat 10% Off",
    desc: "Use coupon LAPTOP10 at checkout to get instant 10% discount on business series laptops.",
    target: "listing",
  },
];
