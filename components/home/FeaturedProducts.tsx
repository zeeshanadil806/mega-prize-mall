// components/home/FeaturedProducts.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
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
import { CustomerProductProps } from "@/types";
import ProductCard from "../products/ProductCard";

interface FeaturedProductsProps {
  products: CustomerProductProps[];
}

function getItemsPerSlideSnapshot(): number {
  if (typeof window === "undefined") return 1;
  const width = window.innerWidth;
  if (width < 640) return 2; // Mobile
  if (width < 768) return 2; // Small tablet
  if (width < 1024) return 3; // Tablet
  if (width < 1280) return 4; // Small desktop
  return 5; // Large desktop
}

function subscribeResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = useSyncExternalStore(
    subscribeResize,
    getItemsPerSlideSnapshot,
    () => 1
  );
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

  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  const nextSlide = useCallback(() => {
    setSwipeDirection("left");
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setSwipeDirection("right");
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!inView) return;
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inView, nextSlide, prevSlide]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const visibleProducts = products.slice(
    currentIndex * itemsPerSlide,
    (currentIndex + 1) * itemsPerSlide,
  );

  // Compact empty state
  if (!products || products.length === 0) {
    return (
      <section className="py-8 sm:py-10 bg-linear-to-b from-gray-50 via-white to-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Featured Collection</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
            Featured Products
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            New featured products are being curated. Check back soon!
          </p>
          <Link href="/products">
            <Button size="default" className="text-xs sm:text-sm bg-[#011b54] hover:bg-[#022b82] text-white">
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
      className="py-4 sm:py-7 md:py-9 bg-linear-to-b from-gray-50 via-white to-gray-50/80 border-t border-gray-150/70 overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header: Split Layout with Integrated Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3 mb-3 sm:mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-[11px] sm:text-xs font-bold mb-1 shadow-2xs">
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              <span>Handpicked Collection</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
              Featured{" "}
              <span className="bg-gradient-to-r from-[#011b54] via-[#022b82] to-[#011b54] bg-clip-text text-transparent">
                Products
              </span>
            </h2>

            <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 max-w-md">
              Discover our handpicked selection of premium gadgets at unbeatable prices.
            </p>
          </div>

          {/* Desktop & Tablet Navigation Controls */}
          {products.length > itemsPerSlide && (
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {/* Pagination Dots */}
              <div className="flex gap-1.5">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-6 bg-[#011b54]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={prevSlide}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-gray-200 hover:border-[#011b54] hover:bg-[#011b54]/5 text-gray-700 hover:text-[#011b54] transition-colors"
                  aria-label="Previous products"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  onClick={nextSlide}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-gray-200 hover:border-[#011b54] hover:bg-[#011b54]/5 text-gray-700 hover:text-[#011b54] transition-colors"
                  aria-label="Next products"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View: Horizontal Peek Swipe */}
        <div className="flex sm:hidden overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-3 px-4 pt-1 pb-3 gap-3.5 items-stretch scroll-pl-4 scroll-pr-4">
          {products.map((product, idx) => (
            <ProductCard
              key={product._id.toString()}
              product={product}
              priority={idx < 2}
              className="w-[78vw] max-w-[285px] shrink-0 snap-start"
            />
          ))}
        </div>

        {/* Desktop View: Multi-column Slider */}
        <div
          ref={carouselRef}
          className="hidden sm:block relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            key={currentIndex}
            initial={{
              opacity: 0,
              x:
                swipeDirection === "left"
                  ? 40
                  : swipeDirection === "right"
                    ? -40
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
            exit={{ opacity: 0, x: swipeDirection === "left" ? -40 : 40 }}
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 items-stretch"
            variants={containerVariants}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {visibleProducts.map((product, idx) => (
              <ProductCard
                key={product._id.toString()}
                product={product}
                priority={currentIndex === 0 && idx < itemsPerSlide}
              />
            ))}
          </motion.div>
        </div>

        {/* Mobile View All Button */}
        <div className="sm:hidden mt-3 text-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#011b54] bg-white border border-[#011b54]/25 shadow-xs active:bg-gray-50 transition-colors"
          >
            <span>Explore All Featured Products</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
