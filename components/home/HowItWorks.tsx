// components/home/HowItWorks.tsx
"use client";

import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import {
  Search,
  Tag,
  Handshake,
  Gift,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StepItem {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const STEPS: StepItem[] = [
  {
    number: "01",
    icon: <Search className="w-5 h-5" />,
    title: "Find Your Product",
    description:
      "Browse our catalog and select any tech accessory with the live Bargain badge.",
    features: ["Bargain-enabled catalog", "Real-time stock & pricing"],
  },
  {
    number: "02",
    icon: <Tag className="w-5 h-5" />,
    title: "Make Your Offer",
    description:
      "Click Bargain and submit your target price. Our AI counter-offers in real-time.",
    features: ["AI instant response", "Up to 3 offer rounds"],
  },
  {
    number: "03",
    icon: <Handshake className="w-5 h-5" />,
    title: "Lock Your Deal",
    description:
      "Accept the final agreed price and receive an instant discounted checkout coupon.",
    features: ["Instant checkout coupon", "100% secure transaction"],
  },
  {
    number: "04",
    icon: <Gift className="w-5 h-5" />,
    title: "Win Mega Prizes",
    description:
      "Every purchase automatically earns lucky draw entries for smartphones and prizes.",
    features: ["Auto lucky draw entry", "Transparent ticket tracking"],
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={ref}
      className="py-6 sm:py-8 md:py-10 bg-gradient-to-b from-white to-gray-50/80 border-t border-gray-150/70 overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-5 sm:mb-7 md:mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-[11px] sm:text-xs font-bold mb-1.5 shadow-2xs">
            <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
            <span>Simple 4-Step Process</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mb-1.5 leading-tight">
            How{" "}
            <span className="bg-gradient-to-r from-[#011b54] via-[#022b82] to-[#011b54] bg-clip-text text-transparent">
              Bargain Shopping
            </span>{" "}
            Works
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Make your offer, negotiate with our smart AI engine, and earn free lucky draw entries with every completed order.
          </p>
        </motion.div>

        {/* 4-Step Rail: Native Mobile Horizontal Snap Rail & Desktop 4-Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pb-1 sm:pb-0 scroll-pl-3 scroll-pr-3"
        >
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="w-[78vw] max-w-[285px] sm:w-auto shrink-0 snap-start group relative flex flex-col justify-between bg-white rounded-2xl border border-gray-200/90 hover:border-[#011b54]/40 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-300"
            >
              <div>
                {/* Header row: Step Pill + Step Sequence + Modern Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#011b54]/5 border border-[#011b54]/15 text-[#011b54] text-[10px] sm:text-[11px] font-black tracking-wider">
                      STEP {step.number}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold sm:hidden">
                      {idx + 1} of 4
                    </span>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#011b54] to-[#022b82] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
                    {step.icon}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 mb-1.5 group-hover:text-[#011b54] transition-colors tracking-tight">
                  {step.title}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3 sm:line-clamp-none">
                  {step.description}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="pt-2.5 border-t border-gray-100 space-y-1.5">
                {step.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Swipe Hint Indicator */}
        <div className="sm:hidden flex items-center justify-between px-1 pt-2 pb-1 text-[11px] text-gray-400 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-4 h-1 rounded-full bg-[#011b54]" />
            <span className="w-1.5 h-1 rounded-full bg-gray-200" />
            <span className="w-1.5 h-1 rounded-full bg-gray-200" />
            <span className="w-1.5 h-1 rounded-full bg-gray-200" />
          </div>
          <span className="text-[10px] font-semibold text-gray-500">Swipe to view all 4 steps →</span>
        </div>

        {/* Compact Integrated CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mt-4 sm:mt-8 p-3.5 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#011b54] via-[#022b82] to-[#011b54] text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md items-center justify-center shrink-0 hidden sm:flex">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-black tracking-tight">
                Ready to Name Your Price?
              </h3>
              <p className="text-[11px] sm:text-sm text-blue-100/80 mt-0.5 max-w-md">
                Browse our bargain-enabled gadgets and submit your price offer in seconds.
              </p>
            </div>
          </div>

          <Link href="/products?bargain=true" className="w-full sm:w-auto shrink-0">
            <Button className="w-full sm:w-auto bg-white text-[#011b54] hover:bg-gray-100 font-black text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98">
              <span>Start Bargaining Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
