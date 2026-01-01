// components/home/BestSellers.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  ShoppingBag,
  Tag,
  Star,
  ChevronRight,
  Zap,
  Sparkles,
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
  isBestSeller: boolean;
  isFeatured: boolean;
  bargainEnabled: boolean;
  brand: string;
  stock: number;
  purchaseCount: number;
  rating?: number;
  bargainCount: number;
  viewCount: number;
  createdAt: string;
}

const BestSellers = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSold: 0,
    // averageRating: 4.8,
    monthlySales: 0,
    happyCustomers: 98,
  });

  // Fetch best seller products and stats
  useEffect(() => {
    async function fetchBestSellers() {
      try {
        setLoading(true);
        setError(null);

        // Fetch best seller products
        const response = await fetch("/api/products?bestSellers=true&limit=8");

        if (!response.ok) {
          throw new Error("Failed to fetch best sellers");
        }

        const data = await response.json();
        setProducts(data);

        // Calculate stats
        const totalSold = data.reduce(
          (sum: number, product: Product) => sum + (product.purchaseCount || 0),
          0
        );
        const monthlySales = Math.floor(totalSold * 2000); // Estimated average price
        // const averageRating = data.length > 0
        //   ? (data.reduce((sum: number, product: Product) => sum + (product.rating || 4.5), 0) / data.length).toFixed(1)
        //   : 4.8;

        setStats({
          totalSold,
          //   averageRating: parseFloat(averageRating),
          monthlySales,
          happyCustomers: 98,
        });
      } catch (err) {
        console.error("Error fetching best sellers:", err);
        setError("Unable to load best sellers");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBestSellers();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBadgeColor = (index: number) => {
    const colors = [
      "from-[#EAB75F] to-[#FF9F45]", // #1 - Gold
      "from-[#A43875] to-[#EAB75F]", // #2 - Purple-Gold
      "from-[#7C2C78] to-[#A43875]", // #3 - Purple
      "from-[#2E297D] to-[#7C2C78]", // #4 - Blue-Purple
      "from-[#EAB75F] to-[#FF9F45]", // #5 - Gold
      "from-[#A43875] to-[#EAB75F]", // #6 - Purple-Gold
      "from-[#7C2C78] to-[#A43875]", // #7 - Purple
      "from-[#2E297D] to-[#7C2C78]", // #8 - Blue-Purple
    ];
    return colors[index] || "from-[#7C2C78] to-[#A43875]";
  };

  const getBadgeText = (index: number) => {
    const badges = [
      "Top Seller",
      "Hot Item",
      "Trending",
      "Best Value",
      "Staff Pick",
      "Fast Seller",
      "Essential",
      "Popular",
    ];
    return badges[index] || "Best Seller";
  };

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
      <section className="py-20 bg-linear-to-b from-gray-50 to-white">
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

          {/* Stats Bar Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 rounded-2xl" />
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
      <section className="py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-red-100 to-red-50 text-red-600 text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            <span>Unable to load best sellers</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Best Sellers
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
      <section className="py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            <span>No Best Sellers Yet</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Best Sellers
          </h2>

          <p className="text-gray-600 mb-6">
            Check back soon for popular products!
          </p>

          <Link href="/products">
            <Button>Explore All Products</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" />
              <span>Top Picks</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-gray-900">Best Selling </span>
              <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
                Accessories
              </span>
            </h2>

            <p className="text-gray-600">
              Most loved electronics accessories by our customers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Updated weekly</span>
            </div>

            <Link href="/products?bestSellers=true">
              <Button
                variant="ghost"
                className="text-[#7C2C78] hover:text-[#6A2566] hover:bg-[#7C2C78]/10"
              >
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
              {stats.totalSold.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600">Total Sold</div>
          </div>
          {/* <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-[#7C2C78]">
              {stats.averageRating}★ 
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div> */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-[#EAB75F]">
              {formatCurrency(stats.monthlySales).replace("PKR", "₹")}
            </div>
            <div className="text-sm text-gray-600">Monthly Sales</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-[#A43875]">
              {stats.happyCustomers}%
            </div>
            <div className="text-sm text-gray-600">Happy Customers</div>
          </div>
        </div>

        {/* Best Sellers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, index) => {
            const discountPercentage = product.discountedPrice
              ? Math.round(
                  ((product.price - product.discountedPrice) / product.price) *
                    100
                )
              : 0;
            const soldCount =
              product.purchaseCount || Math.floor(Math.random() * 500) + 100;

            return (
              <motion.div
                key={product._id}
                initial="hidden"
                whileInView="visible" // <--- Add this
                viewport={{ once: true, amount: 0.1 }} // <--- Add this
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="group"
              >
                <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div
                      className={`px-3 py-1 rounded-full bg-linear-to-r ${getBadgeColor(
                        index
                      )} text-white text-xs font-bold shadow-lg flex items-center gap-1`}
                    >
                      <Zap className="h-3 w-3" />#{index + 1}{" "}
                      {getBadgeText(index)}
                    </div>
                  </div>

                  {/* Sold Count */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium shadow-lg">
                      {soldCount.toLocaleString()} sold
                    </div>
                  </div>

                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-48 overflow-hidden bg-linear-to-br from-gray-100 to-gray-200">
                      {product.images?.[0]?.url ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                          style={{
                            backgroundImage: `url(${product.images[0].url})`,
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-32 w-32 rounded-2xl bg-linear-to-br from-white to-gray-100 shadow-inner flex items-center justify-center">
                            <div className="text-3xl">
                              {getCategoryIcon(product.category)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6">
                    {/* Category */}
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {product.category}
                    </div>

                    {/* Product Name */}
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 hover:text-[#7C2C78] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating & Reviews */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < 4 // Default rating (can add real ratings later)
                                  ? "text-[#EAB75F] fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">4.5</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        {soldCount.toLocaleString()} sold
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl font-bold text-[#A43875]">
                        {formatCurrency(
                          product.discountedPrice || product.price
                        )}
                      </span>
                      {product.discountedPrice && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="px-2 py-1 rounded bg-linear-to-r from-[#EAB75F]/20 to-[#FF9F45]/20 text-[#EAB75F] text-xs font-bold">
                            -{discountPercentage}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white text-sm"
                        disabled={product.stock === 0}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>

                      {product.bargainEnabled && (
                        <Link href={`/products/${product.slug}?bargain=true`}>
                          <Button
                            variant="outline"
                            className="border-[#2E297D] text-[#2E297D] hover:bg-[#2E297D]/10 text-sm"
                            size="sm"
                          >
                            <Tag className="h-4 w-4 mr-2" />
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
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/products?bestSellers=true">
            <Button
              size="lg"
              className="bg-linear-to-r from-[#2E297D] to-[#7C2C78] hover:from-[#1E195D] hover:to-[#6A2566] text-white px-8 py-6 text-lg"
            >
              <Trophy className="h-5 w-5 mr-2" />
              View All Best Sellers
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Performance Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <div className="bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5 rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#EAB75F] to-[#FF9F45] flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Why These Are Best Sellers
                  </h3>
                  <p className="text-gray-600">
                    Top-rated quality, excellent value, and proven customer
                    satisfaction
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
                    {/* {stats.averageRating}★ */}
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7C2C78]">98%</div>
                  <div className="text-sm text-gray-600">Recommend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#EAB75F]">30D</div>
                  <div className="text-sm text-gray-600">Warranty</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BestSellers;
