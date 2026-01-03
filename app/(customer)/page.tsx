// app/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorks from "@/components/home/HowItWorks";
import LuckyDrawPopup from "@/components/home/LuckyDrawPopup";

// Dynamically import heavy components for better performance
const FeaturedProducts = dynamic(
  () => import("@/components/home/FeaturedProducts"),
  {
    loading: () => <FeaturedProductsSkeleton />,
    ssr: true,
  }
);

const NewArrivals = dynamic(() => import("@/components/home/NewArrivals"), {
  loading: () => <ProductsGridSkeleton />,
  ssr: true,
});

// const BestSellers = dynamic(() => import('@/components/home/BestSellers'), {
//   loading: () => <ProductsGridSkeleton />,
//   ssr: true,
// });

const BargainZone = dynamic(() => import("@/components/home/BargainZone"), {
  loading: () => <BargainZoneSkeleton />,
  ssr: true,
});

// const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), {
//   loading: () => <TestimonialsSkeleton />,
//   ssr: true, // Client-side only for carousel
// });

// const NewsletterSection = dynamic(() => import('@/components/home/NewsletterSection'), {
//   loading: () => <NewsletterSkeleton />,
//   ssr: true,
// });

export const metadata: Metadata = {
  title: "Mega Prize Mall - Mobile Accessories with Bargain & Lucky Draw | Shop Now",
  description: "India's first mobile accessories store where you can bargain prices & win prizes! Shop phone cases, chargers, earbuds, screen protectors. Negotiate deals, earn lucky draw entries on every purchase. Free shipping across India.",
  keywords: "mobile accessories, bargain shopping, lucky draw, phone cases, wireless earbuds, chargers, screen protectors, online shopping India, price negotiation, shopping rewards",
  
  // Open Graph
  openGraph: {
    title: "Mega Prize Mall - Bargain Prices & Win Prizes on Mobile Accessories",
    description: "Shop mobile accessories with unique bargain feature! Make offers, win lucky draw entries. Best prices on phone cases, chargers & more.",
    type: "website",
    url: "https://megaprizemall.com",
    siteName: "Mega Prize Mall",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Mega Prize Mall - Mobile Accessories with Bargain Feature",
      },
    ],
    locale: "en_IN",
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Mega Prize Mall - Bargain & Win Mobile Accessories",
    description: "Unique shopping experience: Negotiate prices & earn lucky draw entries on mobile accessories!",
    images: ["/twitter-home.jpg"],
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
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical
  alternates: {
    canonical: "https://megaprizemall.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      
      <LuckyDrawPopup /> {/* Add this line */}
      {/* Hero Section - Above the fold */}
      <HeroSection />
      {/* Categories */}
      <CategoriesSection />
      {/* Featured Products */}
      <FeaturedProducts />
      {/* How It Works */}
      <HowItWorks />
      {/* New Arrivals */}
      <NewArrivals />
      {/* Best Sellers */}
      {/* <BestSellers /> */}
      {/* Bargain Zone */}
      <BargainZone />
      {/* Testimonials */}
      {/* <TestimonialsSection /> */}
      {/* Newsletter */}
      {/* <NewsletterSection /> */}
    </div>
  );
}

// Skeleton Components
function FeaturedProductsSkeleton() {
  return (
    <section className="py-16 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="h-12 w-64 bg-gray-200 rounded-lg mb-8 animate-pulse mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsGridSkeleton() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="h-12 w-64 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BargainZoneSkeleton() {
  return (
    <section className="py-16 bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5">
      <div className="container mx-auto px-4">
        <div className="h-12 w-64 bg-gray-200 rounded-lg mb-8 animate-pulse mx-auto"></div>
        <div className="h-64 bg-linear-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
      </div>
    </section>
  );
}

// function TestimonialsSkeleton() {
//   return (
//     <section className="py-16 bg-gray-50">
//       <div className="container mx-auto px-4">
//         <div className="h-12 w-64 bg-gray-200 rounded-lg mb-8 animate-pulse mx-auto"></div>
//         <div className="flex space-x-4 overflow-hidden">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div key={i} className="shrink-0 w-full md:w-1/2 lg:w-1/3 p-4">
//               <div className="h-48 bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
//                 <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
//                 <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
//                 <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function NewsletterSkeleton() {
//   return (
//     <section className="py-16 bg-linear-to-r from-[#2E297D]/10 to-[#7C2C78]/10">
//       <div className="container mx-auto px-4">
//         <div className="h-12 w-64 bg-gray-200 rounded-lg mb-4 animate-pulse mx-auto"></div>
//         <div className="h-6 w-96 bg-gray-200 rounded mb-8 animate-pulse mx-auto"></div>
//         <div className="h-12 w-96 bg-gray-200 rounded-lg animate-pulse mx-auto"></div>
//       </div>
//     </section>
//   );
// }
