// components/home/FeaturedProducts.tsx (Server Component)
import { Product } from '@/models/Product';
import FeaturedProductCard from './FeaturedProductCard';
import { ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
  products: (Product & { _id: string })[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;
  
  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Featured Products
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Handpicked products where you can bargain for amazing deals
        </p>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <FeaturedProductCard 
            key={product._id} 
            product={product}
            index={index}
          />
        ))}
      </div>
      
      {/* View All Button */}
      <div className="text-center mt-12">
        <a 
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all shadow-lg hover:shadow-xl"
        >
          View All Products
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}