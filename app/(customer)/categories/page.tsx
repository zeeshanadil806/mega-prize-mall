// app/(customer)/categories/page.tsx
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Smartphone, 
  Headphones, 
  Gamepad2, 
  Laptop, 
  Zap,
  Tag,
  ArrowRight,
  ShoppingBag,
  Star,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Categories - TechBargain',
  description: 'Browse electronics accessories by category. Mobile accessories, audio, gaming, PC/laptop, power & charging.',
};

// Your categories from Header
const categoryData = [
  { 
    id: 'mobile-accessories',
    name: 'Mobile Accessories', 
    icon: Smartphone,
    description: 'Cases, screen protectors, chargers, stands for smartphones',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    id: 'audio-and-multimedia',
    name: 'Audio and Multimedia', 
    icon: Headphones,
    description: 'Headphones, earphones, speakers, audio accessories',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  { 
    id: 'gaming-accessories',
    name: 'Gaming Accessories', 
    icon: Gamepad2,
    description: 'Gaming controllers, headsets, keyboards, mouse pads',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  { 
    id: 'pc-and-laptop-accessories',
    name: 'PC and Laptop Accessories', 
    icon: Laptop,
    description: 'Laptop stands, cooling pads, keyboards, mice, webcams',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  { 
    id: 'power-and-charging',
    name: 'Power and Charging', 
    icon: Zap,
    description: 'Power banks, chargers, cables, adapters, wireless chargers',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
];

export default async function CategoriesPage() {
  await connectToDatabase();

  // Get product counts for each category
  const categoryCounts = await Promise.all(
    categoryData.map(async (category) => {
      const count = await ProductModel.countDocuments({ 
        category: category.name,
        isActive: true 
      });
      
      // Get featured products for this category
      const featuredProducts = await ProductModel.find({
        category: category.name,
        isActive: true,
        isFeatured: true
      })
        .select('name price discountedPrice images slug bargainEnabled')
        .limit(3)
        .lean();
      
      return {
        ...category,
        productCount: count,
        featuredProducts: featuredProducts.map(p => ({
          ...p,
          _id: p._id.toString(),
          finalPrice: p.discountedPrice || p.price,
          discountPercentage: p.discountedPrice 
            ? Math.round(((p.price - p.discountedPrice) / p.price) * 100)
            : 0
        }))
      };
    })
  );

  // Get bargain products count
  const bargainCount = await ProductModel.countDocuments({
    bargainEnabled: true,
    isActive: true
  });

  // Get total products count
  const totalProducts = await ProductModel.countDocuments({ isActive: true });

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
              <Tag className="h-3 w-3 mr-1" />
              {totalProducts.toLocaleString()} Products
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Browse by Category
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              Discover electronics accessories organized by category. 
              Find exactly what you need for your devices.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-[#7C2C78] hover:bg-white/90">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View All Products
                </Button>
              </Link>
              <Link href="/products?bargain=true">
                <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10">
                  <Tag className="h-4 w-4 mr-2" />
                  Bargain Deals ({bargainCount})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            All Categories
          </h2>
          <p className="text-gray-600">
            Select a category to browse products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categoryCounts.map((category) => (
            <div 
              key={category.id}
              className={`rounded-2xl border ${category.borderColor} ${category.bgColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`h-14 w-14 rounded-xl bg-linear-to-r ${category.color} flex items-center justify-center`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <Badge className={`bg-linear-to-r ${category.color} text-white border-0`}>
                  {category.productCount} products
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {category.name}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {category.description}
              </p>

              {/* Featured Products Preview */}
              {category.featuredProducts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </div>
                  <div className="space-y-2">
                    {category.featuredProducts.map((product) => (
                      <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                        {product.images?.[0]?.url && (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden">
                            <img 
                              src={product.images[0].url} 
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              ₹{product.finalPrice}
                            </span>
                            {product.discountPercentage > 0 && (
                              <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                {product.discountPercentage}% OFF
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                <Button className="w-full group">
                  Browse Category
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Special Collections */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Special Collections
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bargain Zone */}
            <Link href="/products?bargain=true">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-r from-[#EAB75F] via-[#F6B945] to-[#FF9F45] opacity-90 z-10" />
                <div className="absolute inset-0 bg-black/20 z-20 group-hover:opacity-0 transition-opacity" />
                <div className="relative z-30 p-8 text-white">
                  <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Tag className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Bargain Zone</h3>
                  <p className="text-white/90 mb-4">
                    Negotiate prices and get exclusive discounts
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{bargainCount} Deals</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Featured Products */}
            <Link href="/products?sortBy=popular">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] opacity-90 z-10" />
                <div className="absolute inset-0 bg-black/20 z-20 group-hover:opacity-0 transition-opacity" />
                <div className="relative z-30 p-8 text-white">
                  <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Star className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Featured Products</h3>
                  <p className="text-white/90 mb-4">
                    Curated selection of top-rated products
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Editor&apos;s Pick</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Best Sellers */}
            <Link href="/products?sortBy=popular">
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-linear-to-r from-[#2E297D] via-[#4A3FAD] to-[#7C2C78] opacity-90 z-10" />
                <div className="absolute inset-0 bg-black/20 z-20 group-hover:opacity-0 transition-opacity" />
                <div className="relative z-30 p-8 text-white">
                  <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Best Sellers</h3>
                  <p className="text-white/90 mb-4">
                    Most popular products customers love
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Top Rated</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* All Categories Stats */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Categories Overview
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {categoryCounts.map((category) => (
              <div key={category.id} className="text-center">
                <div className={`h-20 w-20 rounded-full bg-linear-to-r ${category.color} flex items-center justify-center mx-auto mb-3`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
                <p className="text-2xl font-bold text-gray-900">{category.productCount}</p>
                <p className="text-xs text-gray-500">products</p>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  Browse All Products
                </Button>
              </Link>
              <Link href="/products?search=">
                <Button size="lg" className="bg-linear-to-r from-[#7C2C78] to-[#A43875]">
                  Use Advanced Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}