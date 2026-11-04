// app/(customer)/page.tsx
import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import CategoryCapsules from "@/components/home/CategoryCapsules";
import HowItWorks from "@/components/home/HowItWorks";
import LuckyDrawPopup from "@/components/home/LuckyDrawPopup";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import BargainZone from "@/components/home/BargainZone";
import {
  getFeaturedProducts,
  getNewArrivals,
  getBargainProducts,
  getCategoryStats,
} from "@/features/product/service";

// Cache the homepage for 5 minutes so MongoDB only gets hit once per window
// instead of on every visitor. Product/category mutations from admin can
// trigger revalidatePath('/') to bust the cache early.
export const revalidate = 300;

export const metadata: Metadata = {
  title:
    "Mega Prize Mall - Mobile Accessories with Bargain & Lucky Draw | Shop Now",
  description:
    "Pakistan's first mobile accessories store where you can bargain prices & win prizes! Shop phone cases, chargers, earbuds, screen protectors. Negotiate deals, earn lucky draw entries on every purchase. Free shipping across Pakistan.",
  keywords:
    "mobile accessories, bargain shopping, lucky draw, phone cases, wireless earbuds, chargers, screen protectors, online shopping Pakistan, price negotiation, shopping rewards",

  // Open Graph
  openGraph: {
    title:
      "Mega Prize Mall - Bargain Prices & Win Prizes on Mobile Accessories",
    description:
      "Shop mobile accessories with unique bargain feature! Make offers, win lucky draw entries. Best prices on phone cases, chargers & more.",
    type: "website",
    url: "https://megaprizemall.com",
    siteName: "Mega Prize Mall",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Mega Prize Mall - Mobile Accessories with Bargain Feature",
      },
    ],
    locale: "en_PK",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Mega Prize Mall - Bargain & Win Mobile Accessories",
    description:
      "Unique shopping experience: Negotiate prices & earn lucky draw entries on mobile accessories!",
    images: ["/logo.png"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical
  alternates: {
    canonical: "https://megaprizemall.com",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function HomePage() {
  // Fetch every homepage section in parallel server-side so the HTML ships
  // with real product data instead of post-hydration loading skeletons.
  const [featured, newArrivals, bargain, categoryStats] = await Promise.all([
    getFeaturedProducts(12),
    getNewArrivals(5),
    getBargainProducts(4),
    getCategoryStats(),
  ]);

  return (
    <div className="min-h-screen">
      {/* 1. Promotional Lucky Draw Overlay */}
      <LuckyDrawPopup />

      {/* 2. Ronin-style High-Tech Hero Banner Slider */}
      <HeroSection />

      {/* 3. Circular Category Capsule Bar (Quick Navigation) */}
      <CategoryCapsules categoryStats={categoryStats} />

      {/* 4. Featured Products Carousel (Instant Product Discovery - Right on First Viewport!) */}
      <FeaturedProducts products={featured} />

      {/* 5. Live Bargain Zone Showcase */}
      <BargainZone products={bargain} />

      {/* 6. Fresh New Arrivals Grid */}
      <NewArrivals products={newArrivals} />

      {/* 7. Gamification Guide - How Bargain & Lucky Draw Works */}
      <HowItWorks />
    </div>
  );
}


