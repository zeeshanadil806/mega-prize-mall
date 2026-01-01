// components/home/HowItWorks.tsx
'use client';

import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HowItWorks = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const steps = [
    {
      number: '01',
      icon: <Search className="h-8 w-8" />,
      title: 'Find Your Product',
      description: 'Browse our premium collection and select any product with the bargain badge.',
      color: 'from-[#2E297D] to-[#7C2C78]',
      features: ['Bargain-enabled products', 'Real-time price display', 'Stock availability'],
      delay: 0.1,
    },
    {
      number: '02',
      icon: <Tag className="h-8 w-8" />,
      title: 'Start Bargaining',
      description: 'Click the bargain button and make your offer. Our AI-powered system responds instantly.',
      color: 'from-[#7C2C78] to-[#A43875]',
      features: ['AI-powered negotiation', '3 bargaining rounds', 'Instant price response'],
      delay: 0.2,
    },
    {
      number: '03',
      icon: <Handshake className="h-8 w-8" />,
      title: 'Seal The Deal',
      description: 'Accept the final bargained price. Get a unique coupon code valid for 24 hours.',
      color: 'from-[#A43875] to-[#EAB75F]',
      features: ['24-hour coupon validity', 'One-time use coupon', 'Secure transaction'],
      delay: 0.3,
    },
    {
      number: '04',
      icon: <Gift className="h-8 w-8" />,
      title: 'Win Prizes',
      description: 'Every purchase enters you into our lucky draw. Win iPhones, laptops, and cash prizes!',
      color: 'from-[#EAB75F] to-[#FF9F45]',
      features: ['Automatic lucky draw entry', 'Weekly prize draws', 'Multiple winners'],
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }
    }
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 0.3,
      scale: 1,
      transition: { duration: 0.6 }
    },
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
          className="text-center mb-10 sm:mb-14 md:mb-16"
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
            Experience shopping like never before. Bargain for better prices and win amazing prizes with every purchase.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-[#2E297D] via-[#7C2C78] to-[#EAB75F] transform -translate-y-1/2 z-0" />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 z-10"
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
                  variants={glowVariants}
                  className={`absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-linear-to-r ${step.color} blur-lg sm:blur-xl opacity-0 group-hover:opacity-20 sm:group-hover:opacity-30 transition-opacity duration-300 -z-10`}
                />
                
                {/* Step Card */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-5 md:p-6 lg:p-8 shadow-md sm:shadow-lg hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  {/* Step Number */}
                  <div className={`absolute -top-3 -left-3 sm:-top-3.5 sm:-left-3.5 md:-top-4 md:-left-4 lg:-top-4 lg:-left-4 h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-2xl bg-linear-to-r ${step.color} flex items-center justify-center shadow-lg sm:shadow-xl lg:shadow-2xl z-20`}>
                    <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  
                  {/* Step Icon */}
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-2xl bg-linear-to-r ${step.color} flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 ml-auto shadow-md sm:shadow-lg`}
                  >
                    <div className="text-white">
                      {React.cloneElement(step.icon, {
                        className: "h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-8 xl:w-8"
                      })}
                    </div>
                  </motion.div>
                  
                  {/* Step Content */}
                  <div className="grow">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-3 leading-tight">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4 md:mb-4 lg:mb-5 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Features List */}
                    <ul className="space-y-1.5 sm:space-y-1.5 md:space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-xs md:text-sm text-gray-700 leading-tight sm:leading-normal">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Connecting Lines - Desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <div className="h-0.5 w-8 bg-linear-to-r from-gray-300 to-transparent" />
                    </div>
                  )}
                  
                  {/* Connecting Dots - Mobile & Tablet */}
                  <div className="block lg:hidden absolute -bottom-2 sm:-bottom-2.5 md:-bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full bg-linear-to-r ${step.color}`} />
                    {index < steps.length - 1 && (
                      <div className="absolute top-2 sm:top-2.5 md:top-3 left-1/2 transform -translate-x-1/2 h-4 sm:h-5 md:h-6 w-0.5 bg-linear-to-b from-gray-300 to-transparent" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
                  transition={{ type: 'spring', delay: 0.7 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-4 sm:mb-5 md:mb-6"
                >
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Limited Time Opportunity</span>
                </motion.div>
                
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Ready to Start Bargaining?
                </h3>
                
                <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-7 md:mb-8 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl mx-auto">
                  Join thousands of smart shoppers who are saving big and winning amazing prizes every day.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/products?bargain=true" className="w-full sm:w-auto">
                    <Button
                      size="default"
                      className="w-full sm:w-auto bg-white text-[#7C2C78] hover:bg-gray-100 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg font-bold"
                    >
                      Start Bargaining Now
                      <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>
                  
                  <Link href="/how-it-works" className="w-full sm:w-auto">
                    <Button
                      size="default"
                      variant="outline"
                      className="w-full sm:w-auto border border-white sm:border-2 text-white hover:bg-white/10 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg backdrop-blur-sm"
                    >
                      Watch Demo Video
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8"
            >
              <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-linear-to-r from-[#EAB75F] to-[#FF9F45] opacity-20 blur-lg sm:blur-xl" />
            </motion.div>
            
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8"
            >
              <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 rounded-full bg-linear-to-r from-[#2E297D] to-[#7C2C78] opacity-20 blur-lg sm:blur-xl" />
            </motion.div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <div className="text-center">
            <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-[#2E297D]/10 to-[#7C2C78]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[#2E297D]" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Secure & Safe</h4>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
              Bank-level encryption ensures your transactions and personal data are always protected.
            </p>
          </div>
          
          <div className="text-center">
            <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[#7C2C78]" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">24/7 Available</h4>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
              Our AI bargaining system works round the clock. Bargain anytime, from anywhere.
            </p>
          </div>
          
          <div className="text-center sm:col-span-2 lg:col-span-1">
            <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-[#A43875]/10 to-[#EAB75F]/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-[#A43875]" />
            </div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Community Driven</h4>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 px-4 sm:px-0">
              Join thousands of bargain hunters sharing tips and celebrating wins together.
            </p>
          </div>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full bg-linear-to-r from-[#2E297D]/5 to-transparent blur-xl sm:blur-2xl md:blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-linear-to-l from-[#EAB75F]/5 to-transparent blur-xl sm:blur-2xl md:blur-3xl -z-10" />
      </div>
    </section>
  );
};

export default HowItWorks;