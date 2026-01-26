// components/home/FeaturedProducts.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useAnimation,
  useInView,
  Variants,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerProductProps } from "@/types";
import ProductCard from "../products/ProductCard";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<CustomerProductProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerSlide, setItemsPerSlide] = useState(1);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
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


  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex(
      (prev) => (prev + 1) % Math.ceil(products.length / itemsPerSlide),
    );
    setSwipeDirection("left");
    setTimeout(() => setSwipeDirection(null), 300);
  }, [products.length, itemsPerSlide]);

  const prevSlide = useCallback(() => {
    if (products.length === 0) return;
    setCurrentIndex(
      (prev) =>
        (prev - 1 + Math.ceil(products.length / itemsPerSlide)) %
        Math.ceil(products.length / itemsPerSlide),
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

    // setIsSwiping(true);

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
    // setTimeout(() => setIsSwiping(false), 300);
  };

  // Get visible products based on current index
  const visibleProducts = products.slice(
    currentIndex * itemsPerSlide,
    (currentIndex + 1) * itemsPerSlide,
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
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
            {/* <span className="text-gray-900">Hot </span> */}
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
              <>
                <ProductCard key={product._id.toString()} product={product} />
              </>
            ))}
          </motion.div>
        </div>

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
      </div>
    </section>
  );
};

export default FeaturedProducts;
