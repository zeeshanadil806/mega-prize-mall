// components/home/HowItWorks.tsx
"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, Variants, AnimatePresence } from "framer-motion";
import {
  Search,
  Tag,
  Handshake,
  Gift,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HowItWorks = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      icon: <Search />,
      title: "Find Your Product",
      description:
        "Browse our premium collection and select any product with the bargain badge.",
      color: "from-[#2E297D] to-[#7C2C78]",
      features: [
        "Bargain-enabled products",
        "Real-time price display",
        "Stock availability",
      ],
      delay: 0.1,
    },
    {
      number: "02",
      icon: <Tag />,
      title: "Start Bargaining",
      description:
        "Click the bargain button and make your offer. Our AI-powered system responds instantly.",
      color: "from-[#7C2C78] to-[#A43875]",
      features: [
        "AI-powered negotiation",
        "3 bargaining rounds",
        "Instant price response",
      ],
      delay: 0.2,
    },
    {
      number: "03",
      icon: <Handshake />,
      title: "Seal The Deal",
      description:
        "Accept the final bargained price. Get a unique coupon code valid for 24 hours.",
      color: "from-[#A43875] to-[#EAB75F]",
      features: [
        "24-hour coupon validity",
        "One-time use coupon",
        "Secure transaction",
      ],
      delay: 0.3,
    },
    {
      number: "04",
      icon: <Gift />,
      title: "Win Prizes",
      description:
        "Every purchase enters you into our lucky draw. Win iPhones, laptops, and cash prizes!",
      color: "from-[#EAB75F] to-[#FF9F45]",
      features: [
        "Automatic lucky draw entry",
        "Weekly prize draws",
        "Multiple winners",
      ],
      delay: 0.4,
    },
  ];

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

  const stepCardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
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
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };


  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <section
      ref={ref}
      className="py-12 sm:py-16 md:py-20 bg-linear-to-b from-white to-gray-50 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-14 md:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78] text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Revolutionary Shopping</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-gray-900">How </span>
            <span className="bg-linear-to-r from-[#2E297D] to-[#A43875] bg-clip-text text-transparent">
              Bargain Shopping
            </span>
            <span className="text-gray-900"> Works</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-3xl mx-auto px-2 sm:px-0">
            Experience shopping like never before. Bargain for better prices and
            win amazing prizes with every purchase.
          </p>
        </motion.div>

        {/* Mobile Carousel View (sm:hidden) */}
        <div className="sm:hidden relative">
          {/* Progress Steps (Outside Carousel) */}
          <div className="flex items-center justify-between mb-4 px-2">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <button
                  onClick={() => setActiveStep(index)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    index === activeStep
                      ? `bg-linear-to-r ${step.color} text-white shadow-lg scale-110`
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
                <span
                  className={`text-xs font-medium transition-colors ${
                    index === activeStep ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  Step {index + 1}
                </span>
              </div>
            ))}
          </div>
          {/* Carousel Container with Fixed Height */}
          <div className="relative h-[380px]">
            {" "}
            {/* Fixed height prevents layout shift */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeStep}
                custom={1}
                variants={{
                  enter: (direction: number) => ({
                    x: direction > 0 ? 300 : -300,
                    opacity: 0,
                    position: "absolute",
                    width: "100%",
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    position: "relative",
                  },
                  exit: (direction: number) => ({
                    x: direction < 0 ? 300 : -300,
                    opacity: 0,
                    position: "absolute",
                    width: "100%",
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
              >
                {/* Step Content */}
                <div className="p-6 h-full flex flex-col">
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl bg-linear-to-r ${steps[activeStep].color} flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-lg font-bold text-white">
                        {steps[activeStep].number}
                      </span>
                    </div>

                    <div
                      className={`h-10 w-10 rounded-lg bg-linear-to-r ${steps[activeStep].color} flex items-center justify-center`}
                    >
                      <div className="text-white">
                        {React.cloneElement(steps[activeStep].icon, {
                          className: "h-5 w-5",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {steps[activeStep].title}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {steps[activeStep].description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2">
                      {steps[activeStep].features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Carousel Navigation */}
            <div className="absolute top-4/4 left-3 right-3 flex justify-between -translate-y-1/2 z-20">
              <button
                onClick={prevStep}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              <button
                onClick={nextStep}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeStep
                    ? `bg-linear-to-r ${step.color} w-6`
                    : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tablet Grid View (sm:block lg:hidden) */}
        <div className="hidden sm:block lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-2 gap-4 md:gap-6"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={stepCardVariants}
                custom={index}
                whileHover="hover"
                className="relative"
              >
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-xl bg-linear-to-r ${step.color} blur-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}
                />

                {/* Compact Card */}
                <div className="relative bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  {/* Step Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`h-14 w-14 rounded-lg bg-linear-to-r ${step.color} flex items-center justify-center shadow-md`}
                    >
                      <span className="text-lg font-bold text-white">
                        {step.number}
                      </span>
                    </div>

                    <div
                      className={`h-12 w-12 rounded-lg bg-linear-to-r ${step.color} flex items-center justify-center`}
                    >
                      <div className="text-white">
                        {React.cloneElement(step.icon, {
                          className: "h-6 w-6",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">
                    {step.description}
                  </p>

                  {/* Features List (Compact) */}
                  <ul className="space-y-1.5">
                    {step.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                        <span className="text-xs text-gray-700 line-clamp-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Desktop View (lg:block) */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting Line - Desktop */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-[#2E297D] via-[#7C2C78] to-[#EAB75F] transform -translate-y-1/2 z-0" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="relative grid grid-cols-4 gap-6 lg:gap-8 z-10"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={stepCardVariants}
                  custom={index}
                  whileHover="hover"
                  className="relative h-full"
                >
                  {/* Glow Effect */}
                  <motion.div
                    variants={stepCardVariants}
                    className={`absolute inset-0 rounded-2xl lg:rounded-3xl bg-linear-to-r ${step.color} blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`}
                  />

                  {/* Step Card */}
                  <div className="relative bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    {/* Step Number */}
                    <div
                      className={`absolute -top-4 -left-4 h-16 w-16 rounded-2xl bg-linear-to-r ${step.color} flex items-center justify-center shadow-2xl z-20`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>

                    {/* Step Icon */}
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`h-20 w-20 rounded-2xl bg-linear-to-r ${step.color} flex items-center justify-center mb-6 ml-auto shadow-lg`}
                    >
                      <div className="text-white">
                        {React.cloneElement(step.icon, {
                          className: "h-8 w-8",
                        })}
                      </div>
                    </motion.div>

                    {/* Step Content */}
                    <div className="grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>

                      <p className="text-gray-600 mb-5">{step.description}</p>

                      {/* Features List */}
                      <ul className="space-y-2">
                        {step.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Connecting Lines */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <div className="h-0.5 w-8 bg-linear-to-r from-gray-300 to-transparent" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-12 sm:mt-16 md:mt-20"
        >
          <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-r from-[#2E297D] via-[#7C2C78] to-[#A43875] opacity-90" />

            {/* Content */}
            <div className="relative py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 md:px-8 text-center">
              <div className="max-w-3xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ type: "spring", delay: 0.7 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-4 sm:mb-5 md:mb-6"
                >
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Limited Time Opportunity</span>
                </motion.div>

                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Ready to Start Bargaining?
                </h3>

                <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-7 md:mb-8 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl mx-auto">
                  Join thousands of smart shoppers who are saving big and
                  winning amazing prizes every day.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/products?bargain=true"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="default"
                      className="w-full sm:w-auto bg-white text-[#7C2C78] hover:bg-gray-100 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg font-bold"
                    >
                      Start Bargaining Now
                      <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ delay: 0.8 }}
  className="mt-12 sm:mt-16 md:mt-20"
>
  {/* Mobile Horizontal Scroll View */}
  <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4">
    <div className="flex gap-4 min-w-max">
      {[
        {
          icon: <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />,
          title: 'Cash on Delivery',
          description: 'Pay cash on delivery for all bargained products. No upfront payment required.',
          gradient: 'from-[#10B981]/10 to-[#34D399]/10',
          iconColor: 'text-[#A43875]'
        },
        {
          icon: <Shield />,
          title: 'Secure & Safe',
          description: 'Bank-level encryption ensures your transactions and personal data are always protected.',
          gradient: 'from-[#2E297D]/10 to-[#7C2C78]/10',
          iconColor: 'text-[#2E297D]'
        },
        {
          icon: <Clock />,
          title: '24/7 Available',
          description: 'Our AI bargaining system works round the clock. Bargain anytime, from anywhere.',
          gradient: 'from-[#7C2C78]/10 to-[#A43875]/10',
          iconColor: 'text-[#7C2C78]'
        }
      ].map((benefit, index) => (
        <div
          key={index}
          className="min-w-[150px] bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={`h-12 w-12 rounded-lg ${benefit.gradient} flex items-center justify-center mx-auto mb-3`}>
            <div className={benefit.iconColor}>
              {React.cloneElement(benefit.icon, {
                className: "h-5 w-5"
              })}
            </div>
          </div>
          <h4 className="text-sm font-bold text-gray-900 text-center">
            {benefit.title}
          </h4>
          {/* Description hidden on mobile */}
        </div>
      ))}
    </div>
  </div>

  {/* Tablet & Desktop Grid View */}
  <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
    <div className="text-center">
      <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-[#2E297D]/10 to-[#7C2C78]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[#2E297D]" />
      </div>
      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
        Secure & Safe
      </h4>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
        Bank-level encryption ensures your transactions and personal data are always protected.
      </p>
    </div>

    <div className="text-center">
      <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[#7C2C78]" />
      </div>
      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
        24/7 Available
      </h4>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
        Our AI bargaining system works round the clock. Bargain anytime, from anywhere.
      </p>
    </div>

    <div className="text-center">
      <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-[#A43875]/10 to-[#EAB75F]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[#A43875]" />
      </div>
      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
        Community Driven
      </h4>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
        Join thousands of bargain hunters sharing tips and celebrating wins together.
      </p>
    </div>

    {/* New COD Benefit */}
    <div className="text-center">
      <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-[#10B981]/10 to-[#34D399]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[#10B981]" />
      </div>
      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
        Cash on Delivery
      </h4>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
        Pay cash on delivery for all bargained products. No upfront payment required.
      </p>
    </div>
  </div>
</motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
