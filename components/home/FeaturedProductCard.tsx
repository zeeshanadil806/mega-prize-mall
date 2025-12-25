// components/home/FeaturedProductCard.tsx (Client Component)
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Product } from '@/models/Product';
import { formatCurrency } from '@/lib/bargain-utils';
import { Tag, Star } from 'lucide-react';
import { useState } from 'react';

interface FeaturedProductCardProps {
  product: Product & { _id: string };
  index: number;
}

export default function FeaturedProductCard({ product, index }: FeaturedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const finalPrice = product.discountedPrice || product.price;
  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  const mainImage = product.images?.[0]?.url || '/placeholder-product.jpg';
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width - 0.5) * 20;
    const y = ((e.clientY - top) / height - 0.5) * 20;
    setMousePosition({ x, y });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative group"
    >
      {/* 3D Card Effect */}
      <motion.div
        animate={{
          rotateY: isHovered ? mousePosition.x : 0,
          rotateX: isHovered ? -mousePosition.y : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
      >
        {/* Product Image */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <motion.img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Bargain Badge */}
          {product.bargainEnabled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-3 right-3"
            >
              <div className="px-3 py-1 bg-gradient-to-r from-[#EAB75F] to-[#A43875] text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                <Tag className="h-3 w-3" />
                BARGAIN
              </div>
            </motion.div>
          )}
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
              {discountPercentage}% OFF
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-5">
          {/* Category */}
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
            {product.category}
          </div>
          
          {/* Product Name */}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12">
            <Link 
              href={`/products/${product.slug}`}
              className="hover:text-[#7C2C78] transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          
          {/* Price & Rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(finalPrice)}
              </span>
              {product.discountedPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">(42)</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              height: isHovered ? 'auto' : 0 
            }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
              <Link 
                href={`/products/${product.slug}`}
                className="px-3 py-2 text-sm font-medium text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Details
              </Link>
              <button className="px-3 py-2 text-sm font-medium text-center bg-gradient-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all">
                Quick Add
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}