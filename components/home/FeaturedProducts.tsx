// components/home/FeaturedProducts.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useAnimation,
  useInView,
  Variants,
  PanInfo,
} from "framer-motion";
import {
  ShoppingBag,
  Tag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  images: Array<{
    id?: string;
    url: string;
    alt?: string;
    order?: number;
  }>;
  category: string;
  brand: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  bargainEnabled: boolean;
  stock: number;
  discountPercentage: number;
  finalPrice: number;
  sku: string;
  features: string[];
}

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerSlide, setItemsPerSlide] = useState(1);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Update items per slide on window resize
  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 640) return 2; // Mobile
      if (width < 768) return 2; // Small tablet
      if (width < 1024) return 3; // Tablet
      if (width < 1280) return 4; // Small desktop
      return 5; // Large desktop
    };

    // Set initial value
    setItemsPerSlide(updateItemsPerSlide());

    const handleResize = () => {
      setItemsPerSlide(updateItemsPerSlide());
      // Reset to first slide when layout changes
      setCurrentIndex(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch featured products
  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/products?featured=true&limit=12");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Unable to load featured products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 1, y: 30 },
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
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    swipeLeft: {
      x: -100,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
    swipeRight: {
      x: 100,
      opacity: 0,
      transition: {
        duration: 0.3,
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

  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex(
      (prev) => (prev + 1) % Math.ceil(products.length / itemsPerSlide)
    );
    setSwipeDirection("left");
    setTimeout(() => setSwipeDirection(null), 300);
  }, [products.length, itemsPerSlide]);

  const prevSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex(
      (prev) =>
        (prev - 1 + Math.ceil(products.length / itemsPerSlide)) %
        Math.ceil(products.length / itemsPerSlide)
    );
    setSwipeDirection("right");
    setTimeout(() => setSwipeDirection(null), 300);
  }, [products.length, itemsPerSlide]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return; // Only enable on mobile/tablet
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return; // Only enable on mobile/tablet
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (window.innerWidth >= 768) return; // Only enable on mobile/tablet
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(distance) < minSwipeDistance) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    setIsSwiping(true);

    if (distance > 0) {
      // Swipe left - go to next slide
      nextSlide();
    } else {
      // Swipe right - go to previous slide
      prevSlide();
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);

    // Reset swipe state
    setTimeout(() => setIsSwiping(false), 300);
  };

  // Mouse drag handlers for desktop (optional)
  const handleDragStart = () => {
    if (window.innerWidth >= 768) return;
    setIsSwiping(true);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (window.innerWidth >= 768) return;

    const swipeThreshold = 50;
    const velocityThreshold = 0.5;

    if (
      Math.abs(info.offset.x) > swipeThreshold ||
      Math.abs(info.velocity.x) > velocityThreshold
    ) {
      if (info.offset.x > 0 || info.velocity.x > 0) {
        // Swipe right
        prevSlide();
      } else {
        // Swipe left
        nextSlide();
      }
    }

    setTimeout(() => setIsSwiping(false), 300);
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
    return categoryIcons[category] || "🛒";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Mobile Accessories": "from-[#7C2C78]/20 to-[#A43875]/20",
      "Gaming Accessories": "from-[#2E297D]/20 to-[#7C2C78]/20",
      "Audio & Multimedia": "from-[#A43875]/20 to-[#EAB75F]/20",
      "PC & Laptop Accessories": "from-[#EAB75F]/20 to-[#FF9F45]/20",
      "Smart Wearables": "from-[#2E297D]/20 to-[#A43875]/20",
      "Content Creation": "from-[#7C2C78]/20 to-[#2E297D]/20",
      "TV Accessories": "from-[#A43875]/20 to-[#7C2C78]/20",
      "Connectivity Accessories": "from-[#EAB75F]/20 to-[#2E297D]/20",
      "Mobile Cases": "from-[#7C2C78]/20 to-[#EAB75F]/20",
      "Screen Protectors": "from-[#2E297D]/20 to-[#A43875]/20",
      "Power and Charging": "from-[#EAB75F]/20 to-[#7C2C78]/20",
      "Mobile Holders": "from-[#A43875]/20 to-[#2E297D]/20",
    };
    return colors[category] || "from-[#7C2C78]/20 to-[#EAB75F]/20";
  };

  // Get visible products based on current index
  const visibleProducts = products.slice(
    currentIndex * itemsPerSlide,
    (currentIndex + 1) * itemsPerSlide
  );
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  // Loading state
  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          {/* Section Header Skeleton */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Skeleton className="h-5 sm:h-6 md:h-7 w-32 sm:w-40 md:w-48 mx-auto mb-3" />
            <Skeleton className="h-6 sm:h-8 md:h-10 lg:h-12 w-40 sm:w-48 md:w-56 lg:w-64 mx-auto mb-3" />
            <Skeleton className="h-3 sm:h-4 w-64 sm:w-72 md:w-80 lg:w-96 mx-auto" />
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[...Array(itemsPerSlide)].map((_, index) => (
              <div key={index} className="space-y-2 sm:space-y-3">
                <Skeleton className="h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 rounded-lg sm:rounded-xl md:rounded-2xl" />
                <Skeleton className="h-3 sm:h-4 w-3/4" />
                <Skeleton className="h-3 sm:h-4 w-1/2" />
                <Skeleton className="h-8 sm:h-9 md:h-10 rounded-lg" />
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
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-red-100 to-red-50 text-red-600 text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Unable to load featured products</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Featured Products
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto">
            {error}. Please try again later.
          </p>

          <Link href="/products">
            <Button size="default" className="text-sm sm:text-base">
              Browse All Products
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Coming Soon</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Featured Products
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 max-w-md mx-auto">
            We&apos;re adding new featured products. Check back soon!
          </p>

          <Link href="/products">
            <Button size="default" className="text-sm sm:text-base">
              Explore All Products
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="pt-8 bg-linear-to-b from-gray-50 to-white overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Featured Collection</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-gray-900">Hot </span>
            <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
              Featured Products
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl mx-auto">
            Discover our handpicked selection of premium products at unbeatable
            prices
          </p>
        </motion.div>

        {/* Navigation Arrows - Desktop */}
        {products.length > itemsPerSlide && (
          <div className="hidden sm:flex items-center justify-between mb-6 md:mb-8">
            <Button
              onClick={prevSlide}
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full border border-gray-200 hover:border-[#7C2C78] hover:bg-[#7C2C78]/10"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <div className="flex gap-1.5 md:gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 sm:w-8 md:w-10 bg-linear-to-r from-[#7C2C78] to-[#A43875]"
                      : "w-1.5 sm:w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full border border-gray-200 hover:border-[#7C2C78] hover:bg-[#7C2C78]/10"
              aria-label="Next products"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        )}

        {/* Products Carousel with Swipe Support */}
        <div
          ref={carouselRef}
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe Hint for Mobile */}
          {/* {window.innerWidth < 768 && totalSlides > 1 && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                <div className="flex items-center gap-1">
                  <ChevronLeft className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Swipe</span>
                  <ChevronRight className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>
          )} */}

          {/* Products Grid/Carousel */}
          <motion.div
            key={currentIndex}
            initial={{
              opacity: 0,
              x:
                swipeDirection === "left"
                  ? 50
                  : swipeDirection === "right"
                  ? -50
                  : 0,
            }}
            animate={{
              opacity: 1,
              x: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
            }}
            exit={{ opacity: 0, x: swipeDirection === "left" ? -50 : 50 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {visibleProducts.map((product) => (
              <motion.div
                key={`${product._id}-${currentIndex}`}
                variants={cardVariants}
                whileHover="hover"
                initial="hidden"
                animate={
                  swipeDirection === "left"
                    ? "swipeLeft"
                    : swipeDirection === "right"
                    ? "swipeRight"
                    : "visible"
                }
                drag={window.innerWidth < 768 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="group h-full touch-pan-y select-none"
                style={{ cursor: isSwiping ? "grabbing" : "grab" }}
              >
                <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  {/* Product Badges - Mobile: Smaller, Desktop: Normal */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 z-10 flex flex-col gap-1">
                    {product.discountPercentage > 0 && (
                      <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#EAB75F] to-[#FF9F45] text-white text-[10px] sm:text-xs font-bold shadow-sm">
                        -{product.discountPercentage}%
                      </div>
                    )}

                    {product.bargainEnabled && (
                      <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5 sm:gap-1">
                        <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden xs:inline">Bargain</span>
                        <span className="xs:hidden">B</span>
                      </div>
                    )}

                    {product.isBestSeller && (
                      <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#2E297D] to-[#7C2C78] text-white text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5 sm:gap-1">
                        <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">Best</span>
                        <span className="sm:hidden">BS</span>
                      </div>
                    )}

                    {product.isNewArrival && (
                      <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#A43875] to-[#EAB75F] text-white text-[10px] sm:text-xs font-bold shadow-sm">
                        New
                      </div>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  {/* <button
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 z-10 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-600 hover:text-red-500" />
        </button> */}

                  {/* Product Image - Height adjusts based on screen */}
                  <Link href={`/products/${product.slug}`} className="shrink-0">
                    <div className="relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 overflow-hidden bg-gray-100">
                      {product.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                          priority={currentIndex === 0}
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 flex items-center justify-center ${getCategoryColor(
                            product.category
                          )}`}
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

                  {/* Product Info - Adjust padding and text sizes */}
                  <div className="p-2 sm:p-3 md:p-4 grow flex flex-col">
                    {/* Category & Brand - Mobile: smaller, tighter */}
                    <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate pr-1">
                        {product.category}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-[#2E297D] shrink-0">
                        {product.brand}
                      </span>
                    </div>

                    {/* Product Name - Mobile: 1 line, Desktop: 2 lines */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="mb-1 sm:mb-1.5 md:mb-2"
                    >
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base line-clamp-1 sm:line-clamp-2 hover:text-[#7C2C78] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price - Adjust text sizes */}
                    <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
                      {product.discountedPrice ? (
                        <>
                          <span className="text-sm sm:text-base md:text-lg font-bold text-[#A43875]">
                            {formatCurrency(product.discountedPrice)}
                          </span>
                          <span className="text-xs sm:text-sm md:text-base text-gray-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm sm:text-base md:text-lg font-bold text-[#A43875]">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status - Mobile: smaller */}
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

                    {/* Action Buttons - Mobile: smaller, compact */}
                    <div className="flex gap-1.5 sm:gap-2 mt-auto">
                      <Button
                        size="sm"
                        className="flex-1 text-[10px] sm:text-xs md:text-sm bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white h-7 sm:h-8 md:h-9 lg:h-10"
                        disabled={product.stock === 0}
                      >
                        <ShoppingBag className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 mr-1" />
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
              <Tag className="hidden xs:inline h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="hidden xs:inline">Bargain</span>
                            <span className="xs:hidden">Deal</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* View All Button */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 sm:mt-8 md:mt-10 lg:mt-12"
        >
          <Link href="/products?featured=true">
            <Button
              variant="outline"
              className="group text-sm sm:text-base border bg-[#2E297D] border-[#2E297D] text-[#2E297D] hover:bg-[#2E297D] hover:text-white px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 transition-all duration-300"
            >
              <span>View All Featured Products</span>
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div> */}

        {/* Mobile Navigation Dots */}
        {products.length > itemsPerSlide && (
          <div className="flex sm:hidden justify-center gap-1.5 mt-6">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 bg-linear-to-r from-[#7C2C78] to-[#A43875]"
                    : "w-1.5 bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Mobile Navigation Arrows */}
        {/* {products.length > itemsPerSlide && (
          <div className="flex sm:hidden justify-between items-center mt-6">
            <Button
              onClick={prevSlide}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-gray-200 hover:border-[#7C2C78] hover:bg-[#7C2C78]/10"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              onClick={nextSlide}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-gray-200 hover:border-[#7C2C78] hover:bg-[#7C2C78]/10"
              aria-label="Next products"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default FeaturedProducts;
