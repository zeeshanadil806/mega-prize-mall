// components/home/HeroSection.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HeroBannerSlide {
  id: number;
  title: string;
  imageSrc: string;
  href: string;
  alt: string;
}

export const BRAND_HERO_SLIDES: HeroBannerSlide[] = [
  {
    id: 1,
    title: "Flagship AMOLED Smartwatches & Luxury 6-in-1 Gift Sets",
    imageSrc: "/hero-banner-smartwatches.jpg",
    href: "/products?category=Smart%20Watches",
    alt: "Mega Prize Mall Flagship AMOLED Smartwatches & Luxury Gift Sets - Titanium Endurance, Bluetooth Calling & Interchangeable Straps",
  },
  {
    id: 2,
    title: "Pro Esports & Gaming Accessories - Keyboards, Mice & Headsets",
    imageSrc: "/hero-banner-gaming.jpg",
    href: "/products?category=Gaming%20Accessories",
    alt: "Mega Prize Mall Pro Gaming Gear - 4K HDMI Game Sticks, RGB Mechanical Keyboards and Precision Ergonomic Mice",
  },
  {
    id: 3,
    title: "Signature Wireless Audio - Over-Ear Studio Headphones & TWS",
    imageSrc: "/hero-banner-audio-v3.jpg",
    href: "/products?category=Earphones%20and%20Headphones",
    alt: "Mega Prize Mall Signature Wireless Audio - Active Noise Cancelling Headphones, Glowing TWS Earbuds & Bluetooth Speakers",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<number>(0);

  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const mouseStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % BRAND_HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide(
      (prev) => (prev - 1 + BRAND_HERO_SLIDES.length) % BRAND_HERO_SLIDES.length
    );
  }, []);

  // Auto advance every 5.5 seconds when not paused/hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  // Touch Swipe Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger swipe only if horizontal delta exceeds vertical and is > 35px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || mouseStartXRef.current === null) return;
    const deltaX = e.clientX - mouseStartXRef.current;
    isDraggingRef.current = false;
    mouseStartXRef.current = null;

    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    isDraggingRef.current = false;
    mouseStartXRef.current = null;
  };

  const slide = BRAND_HERO_SLIDES[currentSlide];

  return (
    <section
      className="group relative w-full aspect-[16/9] overflow-hidden bg-[#011b54] select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      aria-label="Promotional Hero Banners"
    >
      {/* Animated Banner Slide with AnimatePresence */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.id}
          initial={{
            opacity: 0,
            x: direction !== 0 ? direction * 50 : 0,
          }}
          animate={{ opacity: 1, x: 0 }}
          exit={{
            opacity: 0,
            x: direction !== 0 ? direction * -50 : 0,
          }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Link
            href={slide.href}
            className="block relative w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label={slide.title}
            draggable={false}
          >
            <Image
              src={slide.imageSrc}
              alt={slide.alt}
              fill
              priority={currentSlide === 0}
              loading={currentSlide === 0 ? "eager" : "lazy"}
              sizes="100vw"
              className="object-contain object-center pointer-events-none"
              draggable={false}
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Navigation Arrow Controls (< and >) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous Slide"
        className="absolute left-2.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#011b54]/65 hover:bg-[#011b54] text-white flex items-center justify-center border border-white/25 shadow-lg backdrop-blur-md opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next Slide"
        className="absolute right-2.5 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#011b54]/65 hover:bg-[#011b54] text-white flex items-center justify-center border border-white/25 shadow-lg backdrop-blur-md opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Bottom Center Pagination Pill Dots */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/45 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-md">
        {BRAND_HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirection(idx > currentSlide ? 1 : -1);
              setCurrentSlide(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx
                ? "w-5 sm:w-7 bg-linear-to-r from-amber-400 to-white"
                : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
