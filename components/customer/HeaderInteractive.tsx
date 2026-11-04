// components/customer/HeaderInteractive.tsx
"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Headphones,
  Watch,
  Battery,
  SmartphoneCharging,
  Gamepad2,
  Package,
  Gift,
  Wallet,
  Settings,
  LogOut,
  ArrowRight,
  Sparkles,
  Flame,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Truck,
  ShieldCheck,
  Star,
} from "lucide-react";
import { STORE_CONFIG } from "@/shared/config";
import { useCartStore } from "@/stores/cart-store";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryStat, MegaMenuProduct } from "@/features/product/domain";

interface HeaderInteractiveProps {
  categoryStats?: CategoryStat[];
  megaMenuProducts?: Record<string, MegaMenuProduct[]>;
}

// Hot badge for specific categories
const HOT_CATEGORIES = ["earbuds", "gaming"];

// Category mega menu structure
const RONIN_CATEGORIES = [
  {
    id: "earbuds",
    productKey: "audio",
    name: "Earbuds & Audio",
    shortName: "Audio",
    icon: Headphones,
    color: "from-violet-500/20 to-purple-500/20",
    glowColor: "rgba(139,92,246,0.35)",
    href: "/products?category=Audio%20and%20Multimedia",
    description: "ANC, ENC & Hi-Fi audio gear",
    subcategories: [
      { name: "ANC Earbuds", href: "/products?category=Audio%20and%20Multimedia&search=ANC" },
      { name: "ENC Calling Buds", href: "/products?category=Audio%20and%20Multimedia&search=ENC" },
      { name: "Over-Ear Headphones", href: "/products?category=Earphones%20and%20Headphones" },
      { name: "Bluetooth Speakers", href: "/products?category=Audio%20and%20Multimedia&search=Speaker" },
      { name: "Gaming Earbuds", href: "/products?category=Gaming%20Accessories" },
    ],
  },
  {
    id: "smartwatches",
    productKey: "watches",
    name: "Smart Watches",
    shortName: "Watches",
    icon: Watch,
    color: "from-amber-500/20 to-yellow-500/20",
    glowColor: "rgba(234,183,95,0.35)",
    href: "/products?category=Smart%20Wearables",
    description: "AMOLED, AOD & ultra series",
    subcategories: [
      { name: "AMOLED + AOD", href: "/products?category=Smart%20Wearables&search=AMOLED" },
      { name: "Round Dial Watches", href: "/products?category=Smart%20Wearables&search=Round" },
      { name: "Ultra Series Watches", href: "/products?category=Smart%20Wearables&search=Ultra" },
      { name: "Gift Sets & Straps", href: "/products?category=Smart%20Wearables" },
    ],
  },
  {
    id: "powerbanks",
    productKey: "powerbanks",
    name: "Power Bank",
    shortName: "Power",
    icon: Battery,
    color: "from-emerald-500/20 to-green-500/20",
    glowColor: "rgba(52,211,153,0.35)",
    href: "/products?category=Power%20Banks",
    description: "10K–60K mAh fast charge",
    subcategories: [
      { name: "10,000 mAh Slim", href: "/products?category=Power%20Banks&search=10000" },
      { name: "Fast Charging Banks", href: "/products?category=Power%20Banks&search=Fast" },
      { name: "Digital Display Banks", href: "/products?category=Power%20Banks&search=Display" },
      { name: "High Capacity 60,000mAh", href: "/products?category=Power%20Banks" },
    ],
  },
  {
    id: "chargers",
    productKey: "chargers",
    name: "Chargers & Cables",
    shortName: "Chargers",
    icon: SmartphoneCharging,
    color: "from-sky-500/20 to-blue-500/20",
    glowColor: "rgba(56,189,248,0.35)",
    href: "/products?category=Chargers%20and%20Cables",
    description: "PD, Type-C & car chargers",
    subcategories: [
      { name: "Type-C Fast Chargers", href: "/products?category=Chargers%20and%20Cables&search=Type-C" },
      { name: "iPhone 20W PD Chargers", href: "/products?category=Chargers%20and%20Cables&search=PD" },
      { name: "Car Chargers & FM", href: "/products?category=Chargers%20and%20Cables&search=Car" },
      { name: "Fast Charging Cables", href: "/products?category=Chargers%20and%20Cables&search=Cable" },
    ],
  },
  {
    id: "holders",
    productKey: "holders",
    name: "Holders & Mounts",
    shortName: "Holders",
    icon: SmartphoneCharging,
    color: "from-rose-500/20 to-pink-500/20",
    glowColor: "rgba(244,63,94,0.25)",
    href: "/products?category=Mobile%20Holders",
    description: "Bike, car & magnetic grips",
    subcategories: [
      { name: "Metal Bike Mounts", href: "/products?category=Mobile%20Holders&search=Bike" },
      { name: "Car Air-Vent Mounts", href: "/products?category=Mobile%20Holders&search=Car" },
      { name: "Magnetic Phone Grips", href: "/products?category=Mobile%20Holders&search=Magnetic" },
      { name: "Selfie Lights & Stands", href: "/products?category=Mobile%20Holders&search=Light" },
    ],
  },
  {
    id: "gaming",
    productKey: "gaming",
    name: "Gaming Gear",
    shortName: "Gaming",
    icon: Gamepad2,
    color: "from-fuchsia-500/20 to-purple-600/20",
    glowColor: "rgba(217,70,239,0.35)",
    href: "/products?category=Gaming%20Accessories",
    description: "RGB, mice, keyboards & more",
    subcategories: [
      { name: "Retro HDMI Game Sticks", href: "/products?category=Gaming%20Accessories&search=Game" },
      { name: "RGB Gaming Mice", href: "/products?category=Gaming%20Accessories&search=Mouse" },
      { name: "Wireless Keyboards", href: "/products?category=Gaming%20Accessories&search=Keyboard" },
      { name: "Phone Cooling Radiators", href: "/products?category=Gaming%20Accessories&search=Cooler" },
    ],
  },
];

// Curated showcase products fallback for when categories are loading or sparsely populated
const FALLBACK_MEGA_PRODUCTS: Record<string, MegaMenuProduct[]> = {
  audio: [
    {
      id: "fallback-audio-1",
      name: "Apex ANC Pro Wireless Earbuds",
      slug: "apex-anc-pro-wireless-earbuds",
      price: 3499,
      originalPrice: 4999,
      discountPercentage: 30,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Audio",
      category: "Earbuds & Audio",
      tag: "Best Seller",
      rating: 5,
    },
    {
      id: "fallback-audio-2",
      name: "BassStorm Gaming ENC Low-Latency Buds",
      slug: "bassstorm-gaming-enc-low-latency-buds",
      price: 2799,
      originalPrice: 3999,
      discountPercentage: 30,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Audio",
      category: "Earbuds & Audio",
      tag: "New Launch",
      rating: 5,
    },
    {
      id: "fallback-audio-3",
      name: "SoundPulse Hi-Fi 360° Bluetooth Speaker",
      slug: "soundpulse-hi-fi-360-bluetooth-speaker",
      price: 4299,
      originalPrice: 5999,
      discountPercentage: 28,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Audio",
      category: "Earbuds & Audio",
      tag: "Top Rated",
      rating: 5,
    },
    {
      id: "fallback-audio-4",
      name: "AirBeat Studio Over-Ear Hi-Res Headphones",
      slug: "airbeat-studio-over-ear-hi-res-headphones",
      price: 5999,
      originalPrice: 7999,
      discountPercentage: 25,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Audio",
      category: "Earbuds & Audio",
      tag: "Save 25%",
      rating: 5,
    },
  ],
  watches: [
    {
      id: "fallback-watch-1",
      name: "Ultra AMOLED Series 9 Smart Watch",
      slug: "ultra-amoled-series-9-smart-watch",
      price: 6499,
      originalPrice: 8999,
      discountPercentage: 28,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Wear",
      category: "Smart Watches",
      tag: "AMOLED 2.0",
      rating: 5,
    },
    {
      id: "fallback-watch-2",
      name: "Classic Round BT Calling Luxury Watch",
      slug: "classic-round-bt-calling-luxury-watch",
      price: 4999,
      originalPrice: 6999,
      discountPercentage: 29,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Wear",
      category: "Smart Watches",
      tag: "Best Seller",
      rating: 5,
    },
    {
      id: "fallback-watch-3",
      name: "FitPulse Pro Health & Fitness Tracker",
      slug: "fitpulse-pro-health-fitness-tracker",
      price: 3499,
      originalPrice: 4999,
      discountPercentage: 30,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Wear",
      category: "Smart Watches",
      tag: "New Launch",
      rating: 5,
    },
    {
      id: "fallback-watch-4",
      name: "Titanium Elite Smart Edition with Dual Straps",
      slug: "titanium-elite-smart-edition-with-dual-straps",
      price: 7999,
      originalPrice: 10999,
      discountPercentage: 27,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Wear",
      category: "Smart Watches",
      tag: "Luxury",
      rating: 5,
    },
  ],
  powerbanks: [
    {
      id: "fallback-pb-1",
      name: "TurboCharge 20,000mAh 65W PD Fast Bank",
      slug: "turbocharge-20000mah-65w-pd-fast-bank",
      price: 4999,
      originalPrice: 6499,
      discountPercentage: 23,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Power",
      category: "Power Bank",
      tag: "65W PD",
      rating: 5,
    },
    {
      id: "fallback-pb-2",
      name: "SlimPocket 10,000mAh Ultra-Thin Metal Bank",
      slug: "slimpocket-10000mah-ultra-thin-metal-bank",
      price: 2999,
      originalPrice: 3999,
      discountPercentage: 25,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Power",
      category: "Power Bank",
      tag: "Pocket Slim",
      rating: 5,
    },
    {
      id: "fallback-pb-3",
      name: "MaxPower 30,000mAh Digital LED Display Bank",
      slug: "maxpower-30000mah-digital-led-display-bank",
      price: 6499,
      originalPrice: 8499,
      discountPercentage: 24,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Power",
      category: "Power Bank",
      tag: "Best Seller",
      rating: 5,
    },
    {
      id: "fallback-pb-4",
      name: "PowerStation 60,000mAh Heavy Duty Bank",
      slug: "powerstation-60000mah-heavy-duty-bank",
      price: 9999,
      originalPrice: 12999,
      discountPercentage: 23,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Power",
      category: "Power Bank",
      tag: "Mega Cap",
      rating: 5,
    },
  ],
  chargers: [
    {
      id: "fallback-ch-1",
      name: "GaN Pro 65W Dual Type-C + USB Fast Charger",
      slug: "gan-pro-65w-dual-type-c-usb-fast-charger",
      price: 3299,
      originalPrice: 4499,
      discountPercentage: 27,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Charge",
      category: "Chargers & Cables",
      tag: "GaN Tech",
      rating: 5,
    },
    {
      id: "fallback-ch-2",
      name: "20W PD iPhone Ultra-Fast Adapter",
      slug: "20w-pd-iphone-ultra-fast-adapter",
      price: 1499,
      originalPrice: 2199,
      discountPercentage: 32,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Charge",
      category: "Chargers & Cables",
      tag: "20W PD",
      rating: 5,
    },
    {
      id: "fallback-ch-3",
      name: "3-in-1 Braided Fast Charging Cable 65W",
      slug: "3-in-1-braided-fast-charging-cable-65w",
      price: 999,
      originalPrice: 1499,
      discountPercentage: 33,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Charge",
      category: "Chargers & Cables",
      tag: "Best Seller",
      rating: 5,
    },
    {
      id: "fallback-ch-4",
      name: "Dual Port Turbo Metal Car Charger 38W",
      slug: "dual-port-turbo-metal-car-charger-38w",
      price: 1299,
      originalPrice: 1799,
      discountPercentage: 28,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Charge",
      category: "Chargers & Cables",
      tag: "Car Fast",
      rating: 5,
    },
  ],
  holders: [
    {
      id: "fallback-h-1",
      name: "Vibration-Damped Heavy Metal Bike Mount",
      slug: "vibration-damped-heavy-metal-bike-mount",
      price: 1499,
      originalPrice: 1999,
      discountPercentage: 25,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Mount",
      category: "Holders & Mounts",
      tag: "Anti-Shock",
      rating: 5,
    },
    {
      id: "fallback-h-2",
      name: "360° Auto-Clamp Car Air Vent Phone Holder",
      slug: "360-auto-clamp-car-air-vent-phone-holder",
      price: 1199,
      originalPrice: 1699,
      discountPercentage: 29,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Mount",
      category: "Holders & Mounts",
      tag: "Auto-Lock",
      rating: 5,
    },
    {
      id: "fallback-h-3",
      name: "MagSafe Strong Magnetic Heavy Desk Stand",
      slug: "magsafe-strong-magnetic-heavy-desk-stand",
      price: 1899,
      originalPrice: 2499,
      discountPercentage: 24,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Mount",
      category: "Holders & Mounts",
      tag: "MagSafe",
      rating: 5,
    },
    {
      id: "fallback-h-4",
      name: "Foldable Aluminum Laptop & Tablet Riser",
      slug: "foldable-aluminum-laptop-tablet-riser",
      price: 2499,
      originalPrice: 3299,
      discountPercentage: 24,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Mount",
      category: "Holders & Mounts",
      tag: "Aluminum",
      rating: 5,
    },
  ],
  gaming: [
    {
      id: "fallback-g-1",
      name: "4K Wireless Ultra Retro TV Game Stick",
      slug: "4k-wireless-ultra-retro-tv-game-stick",
      price: 4499,
      originalPrice: 5999,
      discountPercentage: 25,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Game",
      category: "Gaming Gear",
      tag: "10,000+ Games",
      rating: 5,
    },
    {
      id: "fallback-g-2",
      name: "RGB 7200DPI Precision Optical Gaming Mouse",
      slug: "rgb-7200dpi-precision-optical-gaming-mouse",
      price: 1999,
      originalPrice: 2799,
      discountPercentage: 29,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Game",
      category: "Gaming Gear",
      tag: "RGB 7200",
      rating: 5,
    },
    {
      id: "fallback-g-3",
      name: "IceFreeze Semiconductor Mobile Gaming Cooler",
      slug: "icefreeze-semiconductor-mobile-gaming-cooler",
      price: 1799,
      originalPrice: 2499,
      discountPercentage: 28,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: true,
      brand: "Mega Game",
      category: "Gaming Gear",
      tag: "Zero Lag",
      rating: 5,
    },
    {
      id: "fallback-g-4",
      name: "RGB Mechanical Feel Backlit Gaming Keyboard",
      slug: "rgb-mechanical-feel-backlit-gaming-keyboard",
      price: 2999,
      originalPrice: 3999,
      discountPercentage: 25,
      imageUrl: "/placeholder-product.jpg",
      bargainEnabled: false,
      brand: "Mega Game",
      category: "Gaming Gear",
      tag: "RGB Glow",
      rating: 5,
    },
  ],
};

export default function HeaderInteractive({
  categoryStats = [],
  megaMenuProducts = {},
}: HeaderInteractiveProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const rawCartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const cartCount = mounted ? rawCartCount : 0;

  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const router = useRouter();

  const handleMouseEnter = (id: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close search, mobile menu, and user menu on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeCategoryData = RONIN_CATEGORIES.find((c) => c.id === activeDropdown);

  return (
    <header className="sticky top-0 z-40 text-white transition-colors header-gradient-border w-full max-w-full overflow-x-clip">
      {/* Glass dark background with gradient bottom border */}
      <div className="bg-[#08090D]/96 backdrop-blur-xl w-full max-w-full">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 w-full max-w-full">
          {/* ── Mobile Header (lg:hidden): 2 - Logo - 2 Perfectly Centered & Symmetrical Layout ── */}
          <div className="flex lg:hidden items-center justify-between h-[64px] relative w-full max-w-full">
            {/* Left 2 Controls: Menu + Search in matching frosted pill */}
            <div className="flex items-center justify-start z-10 shrink-0">
              <div className="flex items-center gap-0.5 bg-white/[0.05] border border-white/10 rounded-full p-1 backdrop-blur-sm">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    isMobileMenuOpen
                      ? "bg-white/20 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
                >
                  {isMobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
                </button>

                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    isSearchOpen
                      ? "bg-white/20 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={isSearchOpen ? "Close Search" : "Search"}
                >
                  {isSearchOpen ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Center: Brand Logo (Mathematically Dead-Center, elevated z-20 for instant taps) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-auto">
              <Link
                href="/"
                className="relative flex items-center justify-center py-2 px-3 group select-none active:scale-95 transition-transform"
                aria-label="Mega Prize Mall Home"
              >
                <div className="relative h-8 w-32">
                  <Image
                    src="/logo.png"
                    alt="Mega Prize Mall"
                    fill
                    priority
                    className="object-contain object-center"
                    sizes="128px"
                  />
                </div>
              </Link>
            </div>

            {/* Right 2 Controls: User + Cart in matching frosted pill */}
            <div className="flex items-center justify-end z-10 shrink-0">
              <div className="flex items-center gap-0.5 bg-white/[0.05] border border-white/10 rounded-full p-1 backdrop-blur-sm">
                {/* User Account */}
                <div className="relative">
                  {isLoading ? (
                    <Skeleton className="w-7 h-7 rounded-full bg-white/20 mx-1" />
                  ) : session?.user ? (
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center p-1 rounded-full hover:bg-white/10 transition-all duration-200"
                      aria-label="Account Menu"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#011b54] text-white font-black text-[10px] flex items-center justify-center shadow-sm ring-1 ring-white/30">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200 block"
                      aria-label="Login"
                    >
                      <User className="w-[18px] h-[18px]" />
                    </Link>
                  )}

                  {/* Mobile User Dropdown */}
                  {isUserMenuOpen && session?.user && (
                    <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-[#0F1219]/98 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-2 z-50 text-gray-200 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2.5 border-b border-white/10 mb-1.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#011b54] text-white font-black text-sm flex items-center justify-center shadow-sm flex-shrink-0 ring-1 ring-white/20">
                          {session.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
                        </div>
                      </div>

                      {[
                        { href: "/dashboard/orders", icon: Package, label: "My Orders", color: "" },
                        { href: "/dashboard/wallet", icon: Wallet, label: "Wallet & Points", color: "" },
                        { href: "/dashboard/lucky-draw", icon: Gift, label: "Lucky Draw Tickets", color: "text-amber-400" },
                      ].map(({ href, icon: Icon, label, color }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/8 hover:text-white transition-all group/item ${color}`}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{label}</span>
                          <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </Link>
                      ))}

                      {session.user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-white/8 text-blue-300 transition-all group/item"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                          <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </Link>
                      )}

                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all mt-1 border-t border-white/10 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#011b54] border border-white/40 text-white text-[9px] font-black flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-between h-[76px] gap-4">

            {/* ── 1. Logo ── */}
            <div className="flex items-center gap-3 shrink-0">

              <Link href="/" className="relative flex items-center group py-1" aria-label="Mega Prize Mall Home">
                <div className="relative h-8 sm:h-9 w-32 sm:w-40 transition-transform duration-200 group-hover:scale-102">
                  <Image
                    src="/logo.png"
                    alt="Mega Prize Mall"
                    fill
                    priority
                    className="object-contain object-left"
                    sizes="(max-width: 640px) 128px, 160px"
                  />
                </div>
              </Link>
            </div>

            {/* ── 2. Center Nav (Desktop) ── */}
            <nav className="hidden lg:flex items-center h-full" aria-label="Main Navigation">
              {RONIN_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeDropdown === cat.id;
                const isHot = HOT_CATEGORIES.includes(cat.id);

                return (
                  <div
                    key={cat.id}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => handleMouseEnter(cat.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={cat.href}
                      className={`
                        group relative flex flex-col items-center justify-center gap-0.5
                        px-3.5 xl:px-4 py-2 rounded-xl transition-all duration-250 select-none
                        ${isActive
                          ? "text-blue-300 font-bold"
                          : "text-gray-300 hover:text-white"
                        }
                      `}
                      style={isActive ? {
                        background: `radial-gradient(ellipse at center, ${cat.glowColor} 0%, transparent 80%)`,
                      } : undefined}
                    >
                      {/* Glow background on hover */}
                      <span
                        className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        style={{ background: `radial-gradient(ellipse at center, ${cat.glowColor} 0%, transparent 75%)` }}
                      />

                      {/* Icon */}
                      <span className="relative z-10">
                        <Icon
                          className={`w-[18px] h-[18px] stroke-[1.8] transition-all duration-200 ${
                            isActive ? "scale-110" : "group-hover:scale-110"
                          }`}
                        />
                      </span>

                      {/* Label */}
                      <span className="relative z-10 text-[10.5px] xl:text-[11px] font-semibold tracking-tight whitespace-nowrap">
                        {cat.shortName}
                      </span>

                      {/* HOT badge */}
                      {isHot && (
                        <span className="absolute -top-0.5 -right-0.5 z-20 flex items-center gap-0.5 px-1 py-px rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-[8px] font-black text-white leading-none shadow-sm">
                          <Flame className="w-2 h-2" />
                        </span>
                      )}

                      {/* Active/hover underline bar */}
                      <span
                        className={`absolute -bottom-px left-2 right-2 h-[2.5px] rounded-full transition-all duration-300 ${
                          isActive
                            ? "opacity-100 bg-gradient-to-r from-blue-400 to-white"
                            : "opacity-0 group-hover:opacity-60 bg-gradient-to-r from-blue-500 to-blue-300"
                        }`}
                      />
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* ── 3. Right Utility Cluster ── */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Bargain Zone pill */}
              <Link
                href="/products?bargain=true"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold
                  bg-white/10 hover:bg-white/20
                  border border-white/20 hover:border-white/40
                  text-white transition-all duration-200 hover:scale-105
                  shadow-[0_0_12px_rgba(1,27,84,0.3)] hover:shadow-[0_0_18px_rgba(255,255,255,0.2)]"
              >
                <span className="text-sm leading-none">💎</span>
                <span className="hidden xl:inline">Bargain Zone</span>
              </Link>

              {/* Frosted icon pill: Search + User + Cart */}
              <div className="flex items-center gap-0.5 bg-white/[0.05] border border-white/10 rounded-full px-1 py-1 backdrop-blur-sm">
                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                    isSearchOpen
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10 text-gray-400 hover:text-white"
                  }`}
                  aria-label={isSearchOpen ? "Close Search" : "Search"}
                >
                  {isSearchOpen ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
                </button>

                {/* User Account */}
                <div className="relative">
                  {isLoading ? (
                    <Skeleton className="w-7 h-7 rounded-full bg-white/20 mx-1.5" />
                  ) : session?.user ? (
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center p-1 rounded-full hover:bg-white/10 transition-all duration-200"
                      aria-label="Account Menu"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#011b54] text-white font-black text-[10px] flex items-center justify-center shadow-sm ring-1 ring-white/30">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 block"
                      aria-label="Login"
                    >
                      <User className="w-[18px] h-[18px]" />
                    </Link>
                  )}

                  {/* User Dropdown */}
                  {isUserMenuOpen && session?.user && (
                    <div className="absolute right-0 top-full mt-3 w-58 rounded-2xl bg-[#0F1219]/98 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-2 z-50 text-gray-200 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2.5 border-b border-white/10 mb-1.5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#011b54] text-white font-black text-sm flex items-center justify-center shadow-sm flex-shrink-0 ring-1 ring-white/20">
                          {session.user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
                        </div>
                      </div>

                      {[
                        { href: "/dashboard/orders", icon: Package, label: "My Orders", color: "" },
                        { href: "/dashboard/wallet", icon: Wallet, label: "Wallet & Points", color: "" },
                        { href: "/dashboard/lucky-draw", icon: Gift, label: "Lucky Draw Tickets", color: "text-amber-400" },
                      ].map(({ href, icon: Icon, label, color }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/8 hover:text-white transition-all group/item ${color}`}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{label}</span>
                          <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </Link>
                      ))}

                      {session.user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-white/8 text-blue-300 transition-all group/item"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Admin Portal</span>
                          <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </Link>
                      )}

                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all mt-1 border-t border-white/10 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#011b54] border border-white/40 text-white text-[9px] font-black flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Mega Dropdown Panel ── */}
        {activeDropdown && activeCategoryData && (
          <div
            className="absolute left-0 right-0 top-full z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => handleMouseEnter(activeDropdown)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gradient top edge */}
            <div className={`h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent`} />

            <div className="bg-[#09090F]/98 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] py-7 px-4">
              <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">

                  {/* ── Left: Category Panel ── */}
                  <div className="lg:w-56 shrink-0 flex flex-col justify-between border-r border-white/8 pr-7">
                    <div>
                      {/* Icon + Name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCategoryData.color} flex items-center justify-center border border-white/10 shadow-sm`}
                          style={{ boxShadow: `0 0 20px ${activeCategoryData.glowColor}` }}
                        >
                          {(() => {
                            const Icon = activeCategoryData.icon;
                            return <Icon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">{activeCategoryData.name}</h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">{activeCategoryData.description}</p>
                        </div>
                      </div>

                      {/* Subcategory links */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-gray-600 mb-2 px-1">
                          Collections
                        </span>
                        {activeCategoryData.subcategories.map((sub, i) => (
                          <Link
                            key={i}
                            href={sub.href}
                            className="flex items-center justify-between px-2 py-1.5 text-[11px] font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/6 group/sub transition-all duration-150 border-l-2 border-transparent hover:border-blue-400"
                          >
                            <span>{sub.name}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover/sub:opacity-100 group-hover/sub:translate-x-0.5 transition-all text-blue-300" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* View All CTA */}
                    <Link
                      href={activeCategoryData.href}
                      className="mt-5 group/cta inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs font-bold
                        bg-[#011b54] hover:bg-[#022b82] border border-white/20
                        text-white transition-all duration-200
                        shadow-[0_4px_20px_rgba(1,27,84,0.4)] hover:shadow-[0_6px_28px_rgba(1,27,84,0.6)]
                        hover:-translate-y-0.5"
                    >
                      <span>View All {activeCategoryData.shortName}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* ── Right: Beautified Featured Products Showcase ── */}
                  <div className="flex-1 min-w-0">
                    {/* Header Strip with Live Category Name & Badges */}
                    <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/8">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                          Top Rated in {activeCategoryData.name}
                        </span>
                        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#011b54] text-blue-200 border border-blue-400/30 shadow-xs">
                          ★ 100% Verified Tech
                        </span>
                      </div>
                      <Link
                        href={activeCategoryData.href}
                        className="text-xs font-bold text-blue-300 hover:text-white transition-colors flex items-center gap-1.5 group/showall"
                      >
                        <span className="group-hover/showall:underline underline-offset-2">
                          Explore All {activeCategoryData.shortName}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/showall:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Beautified Product Grid */}
                    {(() => {
                      const live = megaMenuProducts[activeCategoryData.productKey] || [];
                      const fallback = FALLBACK_MEGA_PRODUCTS[activeCategoryData.productKey] || [];
                      const itemsToShow = (live.length > 0 ? live : fallback).slice(0, 4);

                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                          {itemsToShow.map((item) => {
                            const hasDiscount = !!item.originalPrice && item.originalPrice > item.price;
                            const discountPercent =
                              item.discountPercentage ||
                              (hasDiscount
                                ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
                                : 0);

                            return (
                              <Link
                                key={item.id}
                                href={`/products/${item.slug}`}
                                className="mega-card group/card relative flex flex-col justify-between rounded-2xl p-2.5 transition-all duration-300
                                  bg-linear-to-b from-[#111625] via-[#0E131F] to-[#0A0D15]
                                  hover:from-[#172138] hover:via-[#131B2D] hover:to-[#0D1322]
                                  border border-white/10 hover:border-blue-400/50
                                  shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_36px_rgba(1,27,84,0.55)]
                                  hover:-translate-y-1.5"
                              >
                                {/* Shine sweep overlay */}
                                <span className="mega-card-shine pointer-events-none" />

                                {/* 1. Studio-Grade White Product Image Canvas */}
                                <div className="relative aspect-square w-full rounded-xl bg-white p-2.5 flex items-center justify-center overflow-hidden shadow-xs border border-gray-100 group-hover/card:shadow-md transition-all">
                                  {/* Soft studio radial vignette */}
                                  <div className="absolute inset-0 bg-radial from-transparent to-neutral-200/35 pointer-events-none" />

                                  <Image
                                    src={item.imageUrl || "/placeholder.png"}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-2 transition-transform duration-500 ease-out group-hover/card:scale-110"
                                    sizes="(max-width: 1024px) 160px, 220px"
                                  />

                                  {/* Floating Tag or Save % Badge on Top-Left */}
                                  {item.tag ? (
                                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider text-white shadow-xs bg-linear-to-r from-blue-600 to-indigo-600">
                                      {item.tag}
                                    </span>
                                  ) : discountPercent > 0 ? (
                                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider text-white shadow-xs bg-linear-to-r from-emerald-600 to-teal-600">
                                      -{discountPercent}%
                                    </span>
                                  ) : null}

                                  {/* Floating Bargain Tag on Top-Right */}
                                  {item.bargainEnabled && (
                                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-[#011b54] text-white border border-white/30 flex items-center gap-0.5 shadow-xs">
                                      <span>💎</span>
                                      <span>Bargain</span>
                                    </span>
                                  )}
                                </div>

                                {/* 2. Product Meta & Title */}
                                <div className="mt-2.5 flex flex-col flex-1 justify-between">
                                  <div>
                                    {/* Category / Brand + 5-Star Rating */}
                                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium mb-1">
                                      <span className="truncate max-w-[85px] sm:max-w-[100px]">
                                        {item.brand || item.category || "Official"}
                                      </span>
                                      <div className="flex items-center gap-0.5 text-amber-400 font-bold text-[9.5px] shrink-0">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                                        <span>5.0</span>
                                      </div>
                                    </div>

                                    {/* Product Title */}
                                    <h4 className="text-xs font-bold text-gray-100 group-hover/card:text-blue-300 transition-colors line-clamp-2 h-8 leading-snug">
                                      {item.name}
                                    </h4>
                                  </div>

                                  {/* 3. Pricing Row & High-Conversion Action Button */}
                                  <div className="mt-2.5 pt-2 border-t border-white/8 space-y-2">
                                    {/* Price Line */}
                                    <div className="flex items-baseline justify-between gap-1">
                                      <div className="flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-xs sm:text-[13px] font-black text-white tracking-tight">
                                          Rs. {item.price.toLocaleString()}
                                        </span>
                                        {hasDiscount && (
                                          <span className="text-[10px] text-gray-400 line-through">
                                            Rs. {item.originalPrice!.toLocaleString()}
                                          </span>
                                        )}
                                      </div>

                                      {discountPercent > 0 && (
                                        <span className="text-[9px] font-extrabold text-emerald-400 shrink-0">
                                          Save {discountPercent}%
                                        </span>
                                      )}
                                    </div>

                                    {/* Action Button: Buy Now */}
                                    <div className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold bg-[#011b54] group-hover/card:bg-[#022b82] text-white border border-white/15 group-hover/card:border-blue-400/50 shadow-xs flex items-center justify-center gap-1.5 transition-all duration-200">
                                      <ShoppingCart className="w-3 h-3 stroke-2" />
                                      <span>Buy Now</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. Search Bar Panel (Attached directly underneath header — zero layout shift, header NEVER blurs) ── */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
            {/* The Search Bar Drawer */}
            <div className="relative z-10 bg-[#090A0F]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] py-4 sm:py-5 px-4 sm:px-6">
              <div className="container mx-auto max-w-3xl">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="w-5 h-5 text-blue-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search earbuds, smartwatches, power banks, gaming gear..."
                    autoFocus
                    className="w-full pl-12 pr-28 sm:pr-32 py-3 sm:py-3.5 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-gray-400 text-sm sm:text-base shadow-inner focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Clear search input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#011b54] hover:bg-[#022b82] border border-white/20 text-white transition-all shadow-sm"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Popular Search Suggestions */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/8 text-xs">
                  <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">Popular:</span>
                  {[
                    { label: "Wireless Earbuds", q: "earbuds" },
                    { label: "Smart Watches", q: "watch" },
                    { label: "Power Banks", q: "power bank" },
                    { label: "Fast Chargers", q: "charger" },
                    { label: "Gaming Gear", q: "gaming" },
                  ].map((tag) => (
                    <button
                      key={tag.q}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag.label);
                        router.push(`/products?search=${encodeURIComponent(tag.q)}`);
                        setIsSearchOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/30 transition-all text-[11px] font-medium"
                    >
                      {tag.label}
                    </button>
                  ))}
                  <span className="hidden sm:inline-block ml-auto text-[11px] text-gray-400 font-medium">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[10px]">Esc</kbd> to close
                  </span>
                </div>
              </div>
            </div>

            {/* Backdrop strictly BELOW the search bar and header — header is NEVER blurred */}
            <div
              className="w-full h-screen bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              aria-label="Close search overlay"
            />
          </div>
        )}

        {/* ── 6. Mobile Slide-Over Navigation (Mounted via Portal to document.body for full viewport responsiveness) ── */}
        {mounted && isMobileMenuOpen && typeof document !== "undefined" && createPortal(
          <div className="lg:hidden fixed inset-0 z-[100] flex animate-in fade-in duration-200">
            {/* Dark blurred backdrop — 1-tap dismiss */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close mobile menu backdrop"
            />

            {/* Slide-over panel */}
            <div className="relative w-[86vw] max-w-xs sm:max-w-sm h-full bg-[#060c1d] text-white flex flex-col shadow-[12px_0_60px_rgba(0,0,0,0.85)] border-r border-white/10 z-10 animate-in slide-in-from-left duration-300 ease-out">
              {/* Top Bar: Brand Logo + Close Button */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#040814] shrink-0">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative h-8 w-36"
                  aria-label="Mega Prize Mall Home"
                >
                  <Image
                    src="/logo.png"
                    alt="Mega Prize Mall"
                    fill
                    className="object-contain object-left"
                    sizes="144px"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-4 py-4 space-y-5">
                {/* Highlight Cards: Bargain Zone & Lucky Draw (Compact & Clean) */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/products?bargain=true"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-[#011b54]/60 to-[#022b82]/30 border border-blue-400/20 active:scale-98 transition-all group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-base shrink-0">
                      💎
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black text-white group-hover:text-blue-300 transition-colors leading-tight truncate">
                        Bargain Zone
                      </h3>
                      <p className="text-[10px] text-gray-300 truncate">Make an offer</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/lucky-draw"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-[#011b54]/60 to-amber-900/20 border border-amber-400/20 active:scale-98 transition-all group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-base shrink-0">
                      🎁
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors leading-tight truncate">
                        Lucky Draw
                      </h3>
                      <p className="text-[10px] text-gray-300 truncate">Win mega prizes</p>
                    </div>
                  </Link>
                </div>

                {/* Categories Section — Clean Accordion Navigation */}
                <div>
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Product Categories
                    </span>
                    <Link
                      href="/categories"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[11px] font-bold text-blue-300 hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-1.5">
                    {RONIN_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isOpen = mobileCategoryOpen === cat.id;
                      const hasSub = cat.subcategories && cat.subcategories.length > 0;

                      return (
                        <div
                          key={cat.id}
                          className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/6 hover:border-white/12 transition-all"
                        >
                          {/* Category Header Row */}
                          <button
                            onClick={() => setMobileCategoryOpen(isOpen ? null : cat.id)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-white/[0.04] transition-colors"
                            aria-expanded={isOpen}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#011b54] text-blue-200 shrink-0 border border-white/10 shadow-xs">
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-xs font-bold text-white tracking-tight truncate">
                                {cat.name}
                              </span>
                            </div>
                            {hasSub && (
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${
                                  isOpen ? "rotate-180 text-blue-300" : ""
                                }`}
                              />
                            )}
                          </button>

                          {/* Accordion Subcategories Drawer */}
                          {isOpen && hasSub && (
                            <div className="px-3.5 pb-2.5 pt-1 border-t border-white/5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                              <Link
                                href={cat.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-between py-1.5 text-[11px] font-bold text-blue-300 hover:text-white transition-colors"
                              >
                                <span>Browse All {cat.shortName}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                              {cat.subcategories.map((sub, i) => (
                                <Link
                                  key={i}
                                  href={sub.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block py-1.5 text-[11px] text-gray-300 hover:text-white hover:translate-x-1 transition-all pl-2 border-l border-white/10"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Quick Links */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1 block mb-2">
                    Customer Services
                  </span>
                  <div className="rounded-xl bg-white/[0.03] border border-white/6 divide-y divide-white/[0.06] overflow-hidden text-xs">
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="w-3.5 h-3.5 text-blue-300" />
                        <span className="font-medium text-xs">Track My Orders</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>

                    <Link
                      href="/dashboard/wallet"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Wallet className="w-3.5 h-3.5 text-blue-300" />
                        <span className="font-medium text-xs">Wallet & Reward Points</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>

                    <a
                      href={STORE_CONFIG.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-emerald-400 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="font-medium text-xs">WhatsApp Customer Support</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400/60" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Account Footer */}
              <div className="shrink-0 px-4 pt-3.5 pb-6 border-t border-white/10 bg-[#040814]">
                {session?.user ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-[#011b54] text-white font-black text-xs flex items-center justify-center ring-2 ring-white/20 shrink-0">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{session.user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/8 hover:bg-white/12 text-xs font-bold text-white transition-all text-center"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-bold text-rose-300 transition-all text-center"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#011b54] hover:bg-[#022b82] border border-white/20 text-white text-xs font-black shadow-[0_4px_16px_rgba(1,27,84,0.4)] active:scale-98 transition-all tracking-wide uppercase"
                    >
                      <User className="w-3.5 h-3.5" />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/8 border border-white/10 text-[11px] font-semibold text-gray-300 hover:text-white transition-all text-center"
                    >
                      New customer? Create account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </header>
  );
}
