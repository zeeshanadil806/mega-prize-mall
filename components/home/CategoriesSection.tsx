// components/home/CategoriesSection.tsx (Client Component)
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Category {
  name: string;
  count: number;
  image: string;
  color: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

const defaultCategories: Category[] = [
  { name: 'Electronics', count: 120, image: '/categories/electronics.jpg', color: 'from-blue-500 to-purple-600' },
  { name: 'Fashion', count: 85, image: '/categories/fashion.jpg', color: 'from-pink-500 to-rose-600' },
  { name: 'Home & Living', count: 65, image: '/categories/home.jpg', color: 'from-green-500 to-emerald-600' },
  { name: 'Beauty', count: 45, image: '/categories/beauty.jpg', color: 'from-yellow-500 to-orange-600' },
  { name: 'Sports', count: 55, image: '/categories/sports.jpg', color: 'from-red-500 to-pink-600' },
  { name: 'Books', count: 75, image: '/categories/books.jpg', color: 'from-indigo-500 to-blue-600' },
  { name: 'Toys', count: 35, image: '/categories/toys.jpg', color: 'from-cyan-500 to-teal-600' },
  { name: 'Grocery', count: 95, image: '/categories/grocery.jpg', color: 'from-lime-500 to-green-600' },
];

export default function CategoriesSection({ categories = defaultCategories }: CategoriesSectionProps) {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Shop by Category
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse through our wide range of categories and find what you need
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <Link href={`/products?category=${category.name}`}>
              {/* Category Card */}
              <div className="relative h-48 rounded-2xl overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`} />
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ 
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {category.name}
                    </h3>
                    <div className="text-white/80 text-sm">
                      {category.count} products
                    </div>
                  </div>
                  
                  {/* Arrow Icon */}
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                    className="inline-flex items-center text-white font-medium"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </div>
                
                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}