// components/home/BargainZone.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { CustomerProductProps } from "@/types";
import ProductCard from "../products/ProductCard";

interface BargainZoneProps {
  products: CustomerProductProps[];
}

export default function BargainZone({ products }: BargainZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  // Empty state fallback (compact, elegant)
  if (!products || products.length === 0) {
    return (
      <section className="py-8 sm:py-10 bg-linear-to-b from-gray-50 via-white to-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-xs font-semibold mb-3">
            <Tag className="h-3.5 w-3.5" />
            <span>Bargain Zone</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
            Hot Bargain Deals
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            New bargain-eligible electronics are refreshed daily. Check back shortly!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#011b54] hover:bg-[#022b82] text-white text-xs font-bold transition-all shadow-xs"
          >
            Explore All Products
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  const displayedProducts = products.slice(0, 4);

  return (
    <section
      ref={ref}
      className="py-6 sm:py-8 md:py-10 bg-linear-to-b from-gray-50 via-white to-gray-50/80 border-t border-gray-150/70 overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Header: Left Title + Right View All CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-[11px] sm:text-xs font-bold mb-1.5 shadow-2xs">
              <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              <span>Interactive Price Deals</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
              Hot{" "}
              <span className="bg-gradient-to-r from-[#011b54] via-[#022b82] to-[#011b54] bg-clip-text text-transparent">
                Bargain Zone
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md">
              Make an offer on verified electronics and unlock instant automated discounts.
            </p>
          </div>

          {/* Desktop & Tablet Header Actions */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Instant Auto-Accept</span>
            </div>

            <Link
              href="/products?bargain=true"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#011b54] hover:text-white bg-[#011b54]/5 hover:bg-[#011b54] border border-[#011b54]/20 transition-all duration-200 shadow-2xs group"
            >
              <span>Explore All Deals</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Micro How-It-Works Strip (36px high, instant business education without clutter) */}
        <div className="hidden md:flex items-center justify-between px-4 py-2 rounded-2xl bg-white border border-gray-150 shadow-xs mb-5 text-[11px] text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#011b54] text-white text-[10px] font-black">
              1
            </span>
            <span className="font-semibold text-gray-800">Select any product below</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#011b54] text-white text-[10px] font-black">
              2
            </span>
            <span className="font-semibold text-gray-800">Submit your proposed price</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
              ✓
            </span>
            <span className="font-semibold text-emerald-800">Lock bargain price & checkout</span>
          </div>
        </div>

        {/* Mobile: 1 Card in view + Next Card peeking with native smooth swipe */}
        <div className="flex sm:hidden overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar -mx-3 px-4 pt-1 pb-3 gap-3.5 items-stretch scroll-pl-4 scroll-pr-4">
          {displayedProducts.map((product, idx) => (
            <ProductCard
              key={product._id.toString()}
              product={product}
              priority={idx < 2}
              className="w-[78vw] max-w-[285px] shrink-0 snap-start"
            />
          ))}
        </div>

        {/* Desktop / Tablet Grid: 4 Cards in 1 Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.4 }}
          className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 items-stretch"
        >
          {displayedProducts.map((product, idx) => (
            <ProductCard
              key={product._id.toString()}
              product={product}
              priority={idx < 4}
            />
          ))}
        </motion.div>

        {/* Mobile View All Button */}
        <div className="sm:hidden mt-3 text-center">
          <Link
            href="/products?bargain=true"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#011b54] bg-white border border-[#011b54]/25 shadow-xs active:bg-gray-50 transition-colors"
          >
            <span>Browse All Bargain Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
