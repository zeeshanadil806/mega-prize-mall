// components/home/HeroSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import { ArrowRight, Sparkles, ChevronRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const HeroSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [isMobile, setIsMobile] = useState(false);

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <section
      ref={ref}
      className="
        relative w-full 
        h-auto
        lg:h-screen lg:min-h-[600px] py-4
        flex items-center overflow-hidden bg-gray-900
      "
    >
      {/* 1. BACKGROUND IMAGES - Different for mobile and desktop */}
      <div className="absolute inset-0 z-0">
        {/* Mobile Background Image */}
        <div className="lg:hidden absolute inset-0 w-full h-full">
          <Image
            src="/hero-mobile.jpeg" // Your mobile-specific banner
            alt="Mega Prize Mall - Shop and Win"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={90}
          />
          {/* Mobile Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-white/30 via-white/50 to-white/60" />
        </div>

        {/* Desktop Background Image */}
        <div className="hidden lg:block absolute inset-0 w-full h-full">
          <Image
            src="/hero-banner-win.png" // Your desktop-specific banner
            alt="Mega Prize Mall - Shop and Win"
            fill
            className="object-cover object-right"
            priority
            sizes="100vw"
            quality={90}
          />
          {/* Desktop Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/50 to-transparent" />
        </div>

        {/* Fallback background for image loading */}
        {/* <div className="absolute inset-0 bg-linear-to-br from-[#7C2C78] to-[#2E297D]" /> */}
      </div>

      {/* 2. CONTENT */}
      <div className="container relative z-10 mx-auto px-4 h-full flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
          {/* LEFT COLUMN */}
          <motion.div
            initial="hidden"
            animate={controls}
            variants={textVariants}
            className={`
              space-y-6 sm:space-y-8 max-w-2xl 
              text-center lg:text-left 
              mx-auto lg:mx-0
              ${isMobile ? 'mt-4' : ''}
            `}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-sm font-bold text-[#7C2C78] shadow-sm mx-auto lg:mx-0">
              <Sparkles className="h-4 w-4 fill-current" />
              <span>Pakistan&apos;s #1 Shop & Win Platform</span>
            </div>

            {/* Title */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-gray-900">
                <span className="block">Shop Your Favorites</span>
                <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
                  Win Your Dreams
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-700 font-medium max-w-lg leading-relaxed mx-auto lg:mx-0">
                Buy premium tech accessories and get automatic entries into our
                exclusive lucky draws. No extra fees, just extra rewards.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link href="/products" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white px-6 sm:px-8 py-6 sm:py-7 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* RIGHT COLUMN (Desktop Only) */}
          <div className="hidden lg:flex flex-col items-end justify-center h-full pointer-events-none">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-20 mr-10"
            >
              <div className="glass bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-5">
                <div className="bg-linear-to-br from-[#EAB75F] to-[#d4a048] p-4 rounded-full text-white shadow-lg">
                  <Gift className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-[#EAB75F] font-bold text-lg">
                    Next Grand Prize
                  </div>
                  <div className="text-[#EAB75F]/90 text-sm">
                    Announced Soon
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator (Desktop Only) */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block text-gray-500/80"
        >
          <ChevronRight className="h-8 w-8 rotate-90" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;