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
  //   Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

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
    <section ref={ref} className="py-20 bg-linear-to-b from-white to-gray-50">
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
        >
          {products.slice(0, 4).map((product) => {
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
                <div className="relative bg-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  {/* New Badge */}
                  <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 z-10">
                    <div className="px-2 sm:px-3 py-1 rounded-full bg-linear-to-r from-[#2E297D] to-[#7C2C78] text-white text-xs font-bold shadow-md sm:shadow-lg flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden xs:inline">NEW</span>
                      <span className="xs:hidden">NEW</span>
                    </div>
                  </div>

                  {/* Arrival Time */}
                  {/* <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 z-10">
                    <div className="px-2 sm:px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium shadow-md sm:shadow-lg">
                      {getArrivalTime(product.createdAt)}
                    </div>
                  </div> */}

                  {/* Bargain Badge */}
                  {product.bargainEnabled && (
                    <div className="absolute top-10 sm:top-12 lg:top-14 left-2 sm:left-3 lg:left-4 z-10">
                      <div className="px-2 sm:px-3 py-1 rounded-full bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white text-xs font-bold shadow-md sm:shadow-lg flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden xs:inline">Bargain</span>
                        <span className="xs:hidden">Bargain</span>
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="shrink-0"
                  >
                    <div className="relative h-40 sm:h-44 md:h-48 lg:h-56 overflow-hidden bg-linear-to-br from-gray-100 to-gray-200">
                      {/* Image or Icon */}
                      {product.images?.[0]?.url ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                          style={{
                            backgroundImage: `url(${product.images[0].url})`,
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 rounded-xl sm:rounded-2xl bg-linear-to-br from-white to-gray-100 shadow-inner flex items-center justify-center">
                            <div className="text-2xl sm:text-3xl lg:text-4xl">
                              {getCategoryIcon(product.category)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4 lg:p-6 grow flex flex-col">
                    {/* Category */}
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 truncate">
                      {product.category}
                    </div>

                    {/* Product Name */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="mb-1 sm:mb-2"
                    >
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg line-clamp-1 hover:text-[#7C2C78] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Brand */}
                    {/* <div className="text-xs sm:text-sm text-gray-600 mb-2 lg:mb-3">
                      {product.brand}
                    </div> */}

                    {/* Rating - Hide on mobile, show on tablet+ */}
                    {/* <div className="hidden sm:flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                              i < 4
                                ? "text-[#EAB75F] fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        4.5
                      </span>
                    </div> */}

                    {/* Price */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 lg:mb-6 mt-auto">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#A43875]">
                        {formatCurrency(
                          product.discountedPrice || product.price
                        )}
                      </span>
                      {product.discountedPrice && (
                        <>
                          <span className="text-base sm:text-lg text-gray-400 line-through hidden sm:block">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="px-2 py-1 rounded bg-linear-to-r from-[#EAB75F]/20 to-[#FF9F45]/20 text-[#EAB75F] text-xs font-bold">
                            -{discountPercentage}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        size="sm"
                        className="flex-1 text-xs sm:text-sm bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white h-8 sm:h-9 lg:h-10"
                        disabled={product.stock === 0}
                      >
                        <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                        Add to Cart
                      </Button>

                      {product.bargainEnabled && (
                        <Link
                          href={`/products/${product.slug}?bargain=true`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs sm:text-sm border-[#2E297D] text-[#2E297D] hover:bg-[#2E297D]/10 h-8 sm:h-9 lg:h-10"
                          >
                            <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                            Bargain
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
