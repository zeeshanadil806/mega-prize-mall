// components/home/NewArrivals.tsx
"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Clock, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "../products/ProductCard";
import { CustomerProductProps } from "@/types";

interface NewArrivalsProps {
  products: CustomerProductProps[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

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

  // Compact empty state
  if (!products || products.length === 0) {
    return (
      <section className="py-8 sm:py-10 bg-linear-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-xs font-semibold mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>New Arrivals</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
            Fresh Arrivals
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            New products are currently being added. Check back shortly!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#011b54] hover:bg-[#022b82] text-white text-xs font-bold transition-all shadow-xs"
          >
            Explore All Products
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="py-6 sm:py-8 md:py-10 bg-linear-to-b from-white to-gray-50/80 border-t border-gray-150/70 overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header: Balanced Split Layout */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-[11px] sm:text-xs font-bold mb-1.5 shadow-2xs">
              <Clock className="h-3 w-3 text-blue-600" />
              <span>Fresh Arrivals</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
              New{" "}
              <span className="bg-gradient-to-r from-[#011b54] via-[#022b82] to-[#011b54] bg-clip-text text-transparent">
                Arrivals
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md">
              Discover the latest authentic tech gadgets just added to our collection.
            </p>
          </div>

          {/* Desktop & Tablet Header Controls */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span>Updated daily</span>
            </div>

            <Link
              href="/products?new=true"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#011b54] hover:text-white bg-[#011b54]/5 hover:bg-[#011b54] border border-[#011b54]/20 transition-all duration-200 shadow-2xs group"
            >
              <span>View All ({products.length})</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Mobile: Smooth Horizontal Peek Swipe */}
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

        {/* Desktop / Tablet Grid: 4-5 Columns in 1 Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 items-stretch"
        >
          {products.map((product, idx) => (
            <ProductCard
              key={product._id.toString()}
              product={product}
              priority={idx < 5}
            />
          ))}
        </motion.div>

        {/* Mobile View All Button */}
        <div className="sm:hidden mt-3 text-center">
          <Link
            href="/products?new=true"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#011b54] bg-white border border-[#011b54]/25 shadow-xs active:bg-gray-50 transition-colors"
          >
            <span>Browse All New Arrivals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
