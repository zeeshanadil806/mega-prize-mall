// components/about/AboutPage.tsx
"use client";

import {
  ShieldCheck,
  Truck,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  RotateCcw,
  Tag,
  Star,
  MapPin,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const stats = [
    {
      value: "50,000+",
      label: "Happy Shoppers",
      sub: "Across all provinces of Pakistan",
      icon: Users,
    },
    {
      value: "Rs. 5M+",
      label: "Lucky Draw Prizes",
      sub: "Distributed to verified winners",
      icon: Trophy,
    },
    {
      value: "1,000+",
      label: "Authentic Gadgets",
      sub: "Direct from verified manufacturers",
      icon: ShieldCheck,
    },
    {
      value: "99.2%",
      label: "Satisfaction Rate",
      sub: "Safe Cash on Delivery nationwide",
      icon: Star,
    },
  ];

  const pillars = [
    {
      step: "01",
      icon: ShieldCheck,
      title: "Curated Tech Excellence",
      subtitle: "100% Genuine Gadgets Only",
      desc: "Every earbud, charger, smartwatch, and accessory is rigorously tested. No cheap clones, zero counterfeit hardware, and verified serial numbers inspected at our Lahore hub before dispatch.",
      badge: "Zero Counterfeits",
    },
    {
      step: "02",
      icon: Tag,
      title: "Interactive AI Bargaining",
      subtitle: "Negotiate Live Counter-Offers",
      desc: "Why pay fixed retail? Pakistan's first smart AI Price Engine lets you propose counter-offers in real-time, negotiate dynamic price drops, and lock in exclusive 24-hour checkout vouchers.",
      badge: "Proprietary Tech",
    },
    {
      step: "03",
      icon: Trophy,
      title: "Shop-n-Win Lucky Draws",
      subtitle: "Every Order Can Win Grand Prizes",
      desc: "Every purchase automatically qualifies you for transparent, cryptographically verifiable lucky draws. Win high-end smartphones, premium smartwatches, and cash rewards announced live on our social channels.",
      badge: "Real Winners",
    },
  ];

  const trustBadges = [
    {
      icon: CheckCircle2,
      title: "100% Original",
      desc: "Direct verified sourcing",
    },
    {
      icon: Truck,
      title: "Nationwide COD",
      desc: "Doorstep inspection",
    },
    {
      icon: RotateCcw,
      title: "10-Day Warranty",
      desc: "Hassle-free replacement",
    },
    {
      icon: MapPin,
      title: "Lahore QC Hub",
      desc: "Physical inspection",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "The Vision Born",
      desc: "Founded in Lahore with a mission to eliminate low-grade counterfeit tech accessories and bring interactive retail to Pakistan.",
    },
    {
      year: "2025",
      title: "AI Bargain Engine Rollout",
      desc: "Launched Pakistan's first live bargaining tool, giving shoppers the thrill of negotiating custom price drops and instant coupons.",
    },
    {
      year: "2026",
      title: "50,000+ Shoppers & Mega Draws",
      desc: "Expanded nationwide fulfillment, crossing 50,000 orders and distributing over Rs. 5 Million in tech prizes to our community.",
    },
  ];

  return (
    <div className="py-6 sm:py-10 bg-[#F8FAFC] text-slate-800 antialiased">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        
        {/* ═══════════════════════════════════════════════════
            BLOCK 1: COMPACT NAVY HERO & IDENTITY STRIP
        ═══════════════════════════════════════════════════ */}
        <div className="text-center max-w-3xl mx-auto pt-2 space-y-3 sm:space-y-4">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011b54]/5 text-[#011b54] text-xs font-semibold border border-[#011b54]/15 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#011b54]" />
            <span>Pakistan&apos;s First Gamified Tech Mall</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Where Premium Tech Meets{" "}
            <span className="text-[#011b54]">Unbeatable Excitement</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Mega Prize Mall combines certified, authentic mobile accessories and smart gadgets with real-time AI price bargaining and exciting lucky draws with every order.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 max-w-md mx-auto">
            <Button
              asChild
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#011b54] hover:bg-[#022b82] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Link href="/products">
                <span>Browse Authentic Tech</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-300 hover:border-[#011b54] hover:bg-[#011b54]/5 text-[#011b54] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Link href="/shop-n-win-contest">
                <Trophy className="h-4 w-4 text-[#011b54]" />
                <span>Shop & Win Details</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            BLOCK 2: HIGH-DENSITY IMPACT METRICS (4 CARDS)
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4.5 shadow-2xs hover:border-[#011b54]/30 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#011b54]/5 text-[#011b54] flex items-center justify-center shrink-0">
                  <stat.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {stat.label}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5 truncate">
                  {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════
            BLOCK 3: THE 3 CORE VALUE PILLARS
        ═══════════════════════════════════════════════════ */}
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#011b54]">
              Why Mega Prize Mall
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              The Mega Advantage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Three foundational pillars that separate us from ordinary online shopping in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:border-[#011b54]/30 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Step header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-xs font-bold text-slate-400 font-mono tracking-widest">
                      STEP {pillar.step}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-[#011b54]/5 text-[#011b54] border border-[#011b54]/15">
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-[#011b54]/5 text-[#011b54] flex items-center justify-center mb-3 shrink-0">
                    <pillar.icon className="h-5 w-5 stroke-[2]" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
                    {pillar.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#011b54] mb-2.5">
                    {pillar.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#011b54]">
                  <span>Learn more</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            BLOCK 4: TRUST GUARANTEE, MILESTONES & DIRECT ACTION
        ═══════════════════════════════════════════════════ */}
        <div className="space-y-4 sm:space-y-6">
          {/* Trust Badges Strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {trustBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 sm:gap-3 ${
                    idx > 0 ? "pt-2.5 sm:pt-0 sm:pl-4" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#011b54]/5 text-[#011b54] flex items-center justify-center shrink-0">
                    <badge.icon className="h-4 w-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {badge.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Milestone Journey */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#011b54]">
                <Clock className="h-4 w-4" />
                <span>Our Journey</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Lahore to Nationwide</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-[#011b54] bg-[#011b54]/10 px-2 py-0.5 rounded">
                      {milestone.year}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {milestone.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {milestone.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Solid Royal Navy CTA Card */}
          <div className="rounded-xl bg-[#011b54] text-white p-6 sm:p-8 text-center space-y-3.5 shadow-sm">
            <div className="space-y-1.5 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>Shop Smarter in Pakistan</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready for a Smarter Way to Shop?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Experience real-time AI bargaining on authentic mobile tech, backed by 10-day replacement warranty and free lucky draw entries.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1 max-w-md mx-auto">
              <Button
                asChild
                className="w-full sm:w-auto h-10 px-6 rounded-lg bg-white text-[#011b54] hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Link href="/products">
                  <span>Start Shopping Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-10 px-6 rounded-lg border-white/20 text-white hover:bg-white/10 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Link href="/shop-n-win-contest">
                  <Trophy className="h-4 w-4" />
                  <span>View Lucky Draws</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
