// components/home/HowItWorks.tsx
"use client"
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Trophy } from 'lucide-react';

const steps = [
  {
    icon: ShoppingBag,
    title: 'Shop Products',
    description: 'Browse our amazing collection and add products to your cart',
    color: 'from-[#7C2C78] to-[#A43875]',
  },
  {
    icon: Tag,
    title: 'Bargain & Save',
    description: 'Negotiate for better prices and get exclusive bargain coupons',
    color: 'from-[#EAB75F] to-[#D9A64E]',
  },
  {
    icon: ShoppingBag,
    title: 'Earn Points',
    description: 'Get 1 point for every Rs 10 spent. Redeem for discounts',
    color: 'from-[#2E297D] to-[#3A35A8]',
  },
  {
    icon: Trophy,
    title: 'Win Prizes',
    description: 'Automatic lucky draw entries with every purchase',
    color: 'from-[#34D399] to-[#10B981]',
  },
];

export default function HowItWorks() {
  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How Mega Prize Mall Works
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience shopping like never before with our gamified platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="relative"
          >
            {/* Connecting Line (Desktop only) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
            )}
            
            {/* Step Card */}
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-lg font-bold text-gray-700 shadow-lg">
                0{index + 1}
              </div>
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6`}>
                <step.icon className="h-8 w-8 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
              
              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-transparent"
                animate={{
                  borderColor: ['#7C2C78', '#EAB75F', '#2E297D', '#34D399', '#7C2C78'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  background: 'linear-gradient(90deg, #7C2C78, #EAB75F, #2E297D, #34D399) border-box',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}