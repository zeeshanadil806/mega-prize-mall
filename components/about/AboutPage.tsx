"use client";

import { motion } from "framer-motion";
import { Shield, Truck, RefreshCw, Gift, Tag, Sparkles, Star, Users, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  } as const;

  const pillars = [
    {
      icon: Shield,
      title: "100% Authentic Tech",
      desc: "We source directly from authorized manufacturers to guarantee genuine premium mobile accessories and gadgets.",
      color: "from-blue-500/10 to-cyan-500/10 text-blue-600",
    },
    {
      icon: Tag,
      title: "Pioneering Bargain System",
      desc: "Our interactive bargaining system lets you make custom offers and negotiate deals in real-time.",
      color: "from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78]",
    },
    {
      icon: Gift,
      title: "Exciting Shop-n-Win Draws",
      desc: "Every purchase above Rs. 2,000 gives you a free entry into our weekly lucky draws with massive prizes.",
      color: "from-amber-500/10 to-orange-500/10 text-amber-600",
    },
    {
      icon: Truck,
      title: "Express Delivery Pakistan-wide",
      desc: "Your orders are processed instantly and delivered to your doorstep within 3-5 business days.",
      color: "from-emerald-500/10 to-green-500/10 text-emerald-600",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "The Vision Born",
      desc: "Launched with a mission to bring high-quality tech accessories to Pakistan combined with a gamified shopping experience.",
    },
    {
      year: "2025",
      title: "Bargain Feature Launch",
      desc: "Introduced our proprietary real-time bargain system, allowing users to bid and receive direct discount coupons.",
    },
    {
      year: "2026",
      title: "Over 50,000 Happy Shoppers",
      desc: "Expanded catalog to over 1,000 products, distributing over Rs. 5 Million in lucky draw prizes to date.",
    },
  ];

  return (
    <div className="py-12 bg-linear-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78] text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Discover Mega Prize Mall
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-none"
          >
            Where Premium Tech Meets <span className="bg-linear-to-r from-[#7C2C78] to-[#A43875] bg-clip-text text-transparent">Unbeatable Excitement</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            Mega Prize Mall is Pakistan&apos;s first gamified e-commerce platform. We combine premium curated tech gadgets and accessories with live bargaining and life-changing prize draws.
          </motion.p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 sm:mb-28">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#7C2C78]">
              <Target className="h-5 w-5" />
              <span>OUR VISION & MISSION</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Redefining Online Shopping in Pakistan
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We noticed standard e-commerce platforms were plain, static, and lacked excitement. Shopping should be an interactive experience. That&apos;s why we created Mega Prize Mall. 
            </p>
            <p className="text-gray-600 leading-relaxed">
              Not only do we curate standard-setting mobile chargers, power banks, premium audio gears, and laptop accessories, but we also put power back into the customer&apos;s hands through our real-time bargaining tool. And to thank our community, we host exciting prize draws where every order has a chance to win.
            </p>
            <div className="pt-4 flex gap-4">
              <Button asChild className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white">
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button variant="outline" asChild className="border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78]/5">
                <Link href="/shop-n-win-contest">Shop & Win Details</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-linear-to-br from-[#7C2C78]/10 to-[#EAB75F]/10 flex items-center justify-center p-8 border border-gray-200 shadow-xl relative">
              <div className="absolute inset-0 bg-linear-to-tr from-[#7C2C78]/5 to-transparent mix-blend-overlay" />
              <div className="text-center relative z-10 space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
                  <Star className="h-8 w-8 text-[#7C2C78]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Why shop normal?</h3>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">
                  Negotiate your own prices, earn rewards points, and win grand tech prizes with every purchase.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pillars Grid */}
        <div className="mb-20 sm:mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Mega Advantage</h2>
            <p className="text-gray-600">Our core commitments to customer satisfaction, transparency, and product excellence.</p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                <div className={`p-3.5 rounded-xl bg-linear-to-br ${pillar.color} w-fit mb-5`}>
                  <pillar.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-600 flex-1 leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Timeline Milestones */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#7C2C78] mb-2">
              <Users className="h-5 w-5" />
              <span>OUR JOURNEY</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">How We&apos;ve Grown</h2>
          </div>

          <div className="relative border-l border-gray-200 ml-4 md:ml-32 space-y-12">
            {milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative pl-8 md:pl-12"
              >
                {/* Node indicator */}
                <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#7C2C78] shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#7C2C78]" />
                </span>
                
                {/* Year tag for larger screens */}
                <span className="hidden md:block absolute -left-36 top-1 text-right w-24 font-bold text-2xl text-[#7C2C78]">
                  {milestone.year}
                </span>

                <div className="space-y-2">
                  <span className="md:hidden inline-block px-2.5 py-0.5 rounded-full bg-[#7C2C78]/10 text-[#7C2C78] text-xs font-bold mb-1">
                    {milestone.year}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                  <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
