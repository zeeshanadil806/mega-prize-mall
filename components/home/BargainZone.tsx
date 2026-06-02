// components/home/BargainZone.tsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Tag,
  Zap,
  Clock,
  Smartphone,
  Headphones,
  Gamepad2,
  Battery,
  ArrowRight,
  ShoppingBag,
  Laptop,
  Watch,
  Camera,
  Wifi,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CustomerProductProps } from '@/types';

type BargainProduct = CustomerProductProps;

interface BargainStats {
  totalCustomerSavings: number;
  activeBargains: number;
  bargainValidityHours: number;
//   successRate: number;
}

interface BargainZoneProps {
  products: BargainProduct[];
}

const BargainZone = ({ products }: BargainZoneProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // Derive stats from the products passed in. Falls back to defaults when the
  // numbers come back zero so the UI never shows blank counters.
  const totalSavings = products.reduce((sum, product) => {
    if (product.discountedPrice && product.price) {
      return sum + (product.price - product.discountedPrice);
    }
    return sum;
  }, 0);

  const stats: BargainStats = {
    totalCustomerSavings: totalSavings || 2500000,
    activeBargains: products.length || 0,
    bargainValidityHours: 24,
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Mobile Accessories': <Smartphone className="h-6 w-6" />,
      'Audio & Multimedia': <Headphones className="h-6 w-6" />,
      'Gaming Accessories': <Gamepad2 className="h-6 w-6" />,
      'PC & Laptop Accessories': <Laptop className="h-6 w-6" />,
      'Power and Charging': <Battery className="h-6 w-6" />,
      'Smart Wearables': <Watch className="h-6 w-6" />,
      'Content Creation': <Camera className="h-6 w-6" />,
      'Connectivity Accessories': <Wifi className="h-6 w-6" />,
      'Mobile Cases': <Smartphone className="h-6 w-6" />,
      'Screen Protectors': <Shield className="h-6 w-6" />,
    };
    return icons[category] || <ShoppingBag className="h-6 w-6" />;
  };

  const calculateTimeLeft = (createdAt: string, validityHours: number = 24) => {
    const created = new Date(createdAt);
    const expires = new Date(created.getTime() + validityHours * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
  };

  const calculateBargainPrice = (product: BargainProduct) => {
    // If discountedPrice exists, use it as bargain price
    // Otherwise calculate 10-20% off from original price as sample bargain price
    if (product.discountedPrice) {
      return product.discountedPrice;
    }
    
    // Calculate random bargain discount between 10-30%
    const discountPercentage = 10 + Math.floor(Math.random() * 21); // 10-30%
    return Math.round(product.price * (1 - discountPercentage / 100));
  };

  // No bargain products state
  if (products.length === 0) {
    return (
      <section className="py-20 bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78] text-sm font-medium mb-4">
            <Tag className="h-4 w-4" />
            <span>No Active Bargains</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bargain Zone
          </h2>
          
          <p className="text-gray-600 mb-6">
            Check back soon for exciting bargain deals on electronics!
          </p>
          
          <Link href="/products">
            <Button>
              Explore All Products
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={ref}
      className="py-10 bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white text-sm font-medium mb-4">
            <Tag className="h-4 w-4" />
            <span>Hot Bargain Zone</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Bargain Deals on </span>
            <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
              Electronics
            </span>
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Negotiate amazing prices on premium tech accessories. Limited time bargains available now!
          </p>
        </div>

        {/* Bargain Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-lg">
            <TrendingDown className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
              Rs {Math.floor(stats.totalCustomerSavings / 1000000)}M+
            </div>
            <div className="text-sm text-gray-600">Total Customer Savings</div>
          </div> */}
          
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-lg">
            <Zap className="h-8 w-8 text-[#EAB75F] mx-auto mb-3" />
            <div className="text-2xl font-bold text-[#2E297D]">
              {stats.activeBargains}+
            </div>
            <div className="text-sm text-gray-600">Active Bargains</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-lg">
            <Clock className="h-8 w-8 text-[#A43875] mx-auto mb-3" />
            <div className="text-2xl font-bold text-[#A43875]">
              {stats.bargainValidityHours}H
            </div>
            <div className="text-sm text-gray-600">Bargain Validity</div>
          </div>
          
          {/* <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-lg">
            <Tag className="h-8 w-8 text-[#7C2C78] mx-auto mb-3" />
            <div className="text-2xl font-bold text-[#7C2C78]">
              {stats.successRate}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div> */}
        </div>

        {/* Bargain Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {products.map((product, index) => {
            const bargainPrice = calculateBargainPrice(product);
            const saving = product.price - bargainPrice;
            const timeLeft = calculateTimeLeft(product.createdAt ?? new Date().toISOString(), product.bargainValidityHours);
            
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 1, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center">
                        <div className="text-[#7C2C78]">
                          {getCategoryIcon(product.category)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeLeft}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">Original</div>
                      <div className="text-lg font-bold text-gray-400 line-through">
                        Rs {product.price.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10">
                      <div className="text-sm text-[#EAB75F] font-medium mb-1">Bargain Price</div>
                      <div className="text-2xl font-bold text-[#EAB75F]">
                        Rs {bargainPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-green-600 font-bold">
                        Save Rs {saving.toLocaleString()}
                      </span>
                    </div>
                    
                    <Link href={`/products/${product.slug}?bargain=true`}>
                      <Button className="bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A]">
                        Bargain Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/products?bargain=true">
            <Button
              size="lg"
              className="bg-linear-to-r from-[#2E297D] to-[#7C2C78] hover:from-[#1E195D] hover:to-[#6A2566] text-white px-8 py-6 text-lg"
            >
              <Tag className="h-5 w-5 mr-2" />
              View All Bargain Deals
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <p className="text-gray-600 text-sm mt-4">
            Bargain on {stats.activeBargains}+ electronics accessories. Limited time offers!
          </p>
        </div>
      </div>
    </section>
  );
};

export default BargainZone;