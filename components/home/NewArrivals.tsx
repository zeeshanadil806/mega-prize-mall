// components/home/NewArrivals.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import {
  Clock,
  ShoppingBag,
  Tag,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
  Eye,
  //   Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountedPrice?: number;
  images: Array<{
    id?: string;
    url: string;
    alt?: string;
  }>;
  isNewArrival: boolean;
  bargainEnabled: boolean;
  brand: string;
  stock: number;
  description?: string;
  createdAt: Date;
}

const NewArrivals = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch new arrival products
  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        setLoading(true);
        setError(null);

        // Fetch products with isNewArrival = true
        const response = await fetch("/api/products?new=true&limit=8");

        if (!response.ok) {
          throw new Error("Failed to fetch new arrivals");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError("Unable to load new arrivals");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNewArrivals();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 1, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

//   const getArrivalTime = (createdAt: Date) => {
//     const now = new Date();
//     const created = new Date(createdAt);
//     const diffMs = now.getTime() - created.getTime();
//     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

//     if (diffHours < 1) return "Just arrived";
//     if (diffHours < 24) return `${diffHours} hours ago`;
//     return `${Math.floor(diffHours / 24)} days ago`;
//   };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: Record<string, string> = {
      "Mobile Accessories": "📱",
      "Gaming Accessories": "🎮",
      "Audio & Multimedia": "🎧",
      "PC & Laptop Accessories": "💻",
      "Smart Wearables": "⌚",
      "Content Creation": "🎥",
      "TV Accessories": "📺",
      "Connectivity Accessories": "🔌",
      "Mobile Cases": "📱",
      "Screen Protectors": "🛡️",
      "Power and Charging": "⚡",
      "Mobile Holders": "📱",
      "Other Accessories": "🛍️",
    };
    return categoryIcons[category] || "📱";
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-6 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Header Skeleton */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
            <div className="mb-6 lg:mb-0">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-56 rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-red-100 to-red-50 text-red-600 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Unable to load new arrivals</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h2>

          <p className="text-gray-600 mb-6">{error}. Please try again later.</p>

          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="py-20 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-4">
            <Clock className="h-4 w-4" />
            <span>No New Arrivals Yet</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h2>

          <p className="text-gray-600 mb-6">
            Check back soon for exciting new products!
          </p>

          <Link href="/products">
            <Button>Explore All Products</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-10 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible" // <--- Add this
          viewport={{ once: true, amount: 0.1 }} // <--- Add this
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12"
        >
          <div className="mb-6 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              <span>Fresh Arrivals</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-gray-900">Hot </span>
              <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
                New Arrivals
              </span>
            </h2>

            <p className="text-gray-600">
              Discover the latest products just added to our collection
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Updated daily</span>
            </div>

            <Link href="/products?new=true">
              <Button
                variant="ghost"
                className="text-[#7C2C78] hover:text-[#6A2566] hover:bg-[#7C2C78]/10"
              >
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* New Arrivals Grid */}
        <motion.div
  variants={containerVariants}
  initial="hidden"
  animate={inView ? "visible" : "hidden"}
  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
>
  {products.slice(0, 5).map((product) => {
    const discountPercentage = product.discountedPrice
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) *
            100
        )
      : 0;

    return (
      <motion.div
        key={product._id}
        variants={itemVariants}
        whileHover="hover"
        className="group h-full"
      >
        <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
          {/* New Badge */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 z-10">
            <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#2E297D] to-[#7C2C78] text-white text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="hidden xs:inline h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden xs:inline">NEW</span>
              <span className="xs:hidden">NEW</span>
            </div>
          </div>

          {/* Bargain Badge */}
          {product.bargainEnabled && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 z-10">
              <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5 sm:gap-1">
                <Tag className="hidden xs:inline h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="hidden xs:inline">Bargain</span>
                <span className="xs:hidden">B</span>
              </div>
            </div>
          )}

          {/* Product Image */}
          <Link
            href={`/products/${product.slug}`}
            className="shrink-0"
          >
            <div className="relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 overflow-hidden bg-gray-100">
              {product.images?.[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
              ) : (
                <div
                  className={`absolute inset-0 flex items-center justify-center`}
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl">
                    {getCategoryIcon(product.category)}
                  </div>
                </div>
              )}

              {/* Quick View Overlay - Only show on desktop */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  Quick View
                </Button>
              </div>
            </div>
          </Link>

          {/* Product Info */}
          <div className="p-2 sm:p-3 md:p-4 grow flex flex-col">
            {/* Category */}
            <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 truncate">
              {product.category}
            </div>

            {/* Product Name */}
            <Link
              href={`/products/${product.slug}`}
              className="mb-1 sm:mb-1.5 md:mb-2"
            >
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base line-clamp-1 sm:line-clamp-2 hover:text-[#7C2C78] transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4 mt-auto">
              <span className="text-sm sm:text-base md:text-lg font-bold text-[#A43875]">
                {formatCurrency(
                  product.discountedPrice || product.price
                )}
              </span>
              {product.discountedPrice && (
                <>
                  <span className="text-xs sm:text-sm md:text-base text-gray-400 line-through hidden sm:block">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-linear-to-r from-[#EAB75F]/20 to-[#FF9F45]/20 text-[#EAB75F] text-[10px] sm:text-xs font-bold">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                <div
                  className={`h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 rounded-full ${
                    product.stock > 10
                      ? "bg-green-500"
                      : product.stock > 0
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                  {product.stock > 10
                    ? "In Stock"
                    : product.stock > 0
                    ? product.stock <= 5 
                      ? `${product.stock} left`
                      : `Only ${product.stock} left`
                    : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 sm:gap-2 mt-auto">
              <Button
                size="sm"
                className="flex-1 text-[10px] sm:text-xs md:text-sm bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white h-7 sm:h-8 md:h-9 lg:h-10"
                disabled={product.stock === 0}
              >
                <ShoppingBag className="hidden xs:inline h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 mr-1" />
                <span className="hidden xs:inline">Add to Cart</span>
                <span className="xs:hidden">Cart</span>
              </Button>

              {product.bargainEnabled && (
                <Link
                  href={`/products/${product.slug}?bargain=true`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] sm:text-xs md:text-sm border-[#2E297D] text-[#2E297D] hover:bg-[#2E297D]/10 h-7 sm:h-8 md:h-9 lg:h-10"
                  >
                    <Tag className="hidden xs:inline h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 mr-1" />
                    <span className="hidden xs:inline">Bargain</span>
                    <span className="xs:hidden">Deal</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  })}
</motion.div>

        {/* View More Button if more than 4 products */}
        {products.length > 4 && (
          <div className="text-center mt-8">
            <Link href="/products?new=true">
              <Button
                variant="outline"
                className="border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78] hover:text-white"
              >
                View {products.length - 4} More New Arrivals
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
