// components/products/ProductDetailClient.tsx (Client Component)
'use client';

import { useState } from 'react';
// import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/bargain-utils';
import AddToCartButton from '@/components/cart/AddToCartButton';
import BargainButton from '@/components/bargain/BargainButton';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Shield, 
  Truck, 
  RotateCcw, 
  Star, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Minus,
  Plus
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { ImageProps, CustomerProductProps } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface ProductDetailClientProps {
  product: CustomerProductProps; // Product document from MongoDB
  userId?: string;
}

export default function ProductDetailClient({ 
  product, 
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const getItem = useCartStore((state) => state.getItem);
  
  // Format product data for components
  const formattedProduct = {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    discountedPrice: product.discountedPrice,
    bargainEnabled: product.bargainEnabled,
    minBargainPrice: product.minBargainPrice,
    maxBargainRounds: product.maxBargainRounds,
    bargainValidityHours: product.bargainValidityHours,
    images: product.images,
    stock: product.stock,
    slug: product.slug,
  };
  
  const finalPrice = product.discountedPrice || product.price;
  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  const images = product.images || [];
  const cartItem = product._id && getItem(product._id.toString());
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description?.slice(0, 100),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };
  
  const incrementQuantity = () => {
    if (quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
    } else {
      toast.error('Maximum stock reached');
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 flex items-center flex-wrap gap-1 sm:gap-2">
        <Link href="/" className="hover:text-[#7C2C78] transition-colors">Home</Link>
        <span className="text-gray-400">/</span>
        <Link href="/products" className="hover:text-[#7C2C78] transition-colors">Products</Link>
        <span className="text-gray-400">/</span>
        <Link 
          href={`/products?category=${product.category}`} 
          className="hover:text-[#7C2C78] transition-colors truncate max-w-[120px] sm:max-w-none"
        >
          {product.category}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">
          {product.name}
        </span>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
        {/* Product Images */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-xl sm:rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {images.length > 0 ? (
              <>
                <div className="relative w-full h-full">
                  <Image
                    src={images[selectedImageIndex]?.url}
                    alt={images[selectedImageIndex]?.alt || product.name}
                    fill
                    className="object-contain p-4 sm:p-6"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                  />
                </div>
                
                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
                      )}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                      )}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 flex flex-col gap-1.5 sm:gap-2 z-10">
                  {product.isFeatured && (
                    <Badge className="bg-linear-to-r from-[#EAB75F] to-[#A43875] text-white border-0 text-xs sm:text-sm py-0.5 sm:py-1">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-linear-to-r from-[#7C2C78] to-[#2E297D] text-white border-0 text-xs sm:text-sm py-0.5 sm:py-1">
                      Best Seller
                    </Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="bg-green-500 text-white border-0 text-xs sm:text-sm py-0.5 sm:py-1">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                  {product.bargainEnabled && (
                    <Badge variant="outline" className="border-[#EAB75F] text-[#EAB75F] bg-white/90 text-xs sm:text-sm py-0.5 sm:py-1">
                      Bargain
                    </Badge>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 flex gap-1.5 sm:gap-2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200"
                  >
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleWishlist}
                    className={`h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 ${
                      isWishlisted ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                <div className="text-gray-400">
                  <svg className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-2 scrollbar-thin">
              {images.map((image: ImageProps, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`shrink-0 h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all ${
                    selectedImageIndex === index
                      ? 'border-[#7C2C78] scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image.url}
                      alt={image.alt || `Product view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 56px, (max-width: 1024px) 64px, 80px"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Product Header */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2 leading-tight">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                  <span className="text-xs sm:text-sm text-gray-600">SKU: {product.sku}</span>
                  <Separator orientation="vertical" className="h-3 sm:h-4" />
                  <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none">
                    Brand: {product.brand}
                  </span>
                  <Separator orientation="vertical" className="h-3 sm:h-4 hidden sm:block" />
                  <div className="flex items-center gap-1 hidden sm:flex">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 ${
                            i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">(42 reviews)</span>
                  </div>
                </div>
              </div>
              
              {/* Stock Status */}
              <div className="self-start">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-medium text-sm sm:text-base">In Stock</span>
                    {product.stock <= 10 && (
                      <span className="text-xs sm:text-sm text-orange-600 whitespace-nowrap">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 font-medium text-sm sm:text-base">Out of Stock</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Price Section */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 sm:gap-4 mb-4 lg:mb-5">
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                  {formatCurrency(finalPrice)}
                </div>
                {product.discountedPrice && (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                    <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge className="bg-green-500 text-white text-xs sm:text-sm py-0.5 sm:py-1">
                      Save {formatCurrency(product.price - product.discountedPrice)}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Purchase Count */}
              {product.purchaseCount && product.purchaseCount > 0 && (
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
                  <div className="font-semibold">{product.purchaseCount}+</div>
                  <div>purchased</div>
                </div>
              )}
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-5 lg:mb-6">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                Quantity
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={decrementQuantity}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-base sm:text-lg font-medium min-w-[40px] sm:min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                    disabled={quantity >= (product.stock || 10)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {product.stock || 10} units available
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2.5 sm:space-y-3">
              <AddToCartButton 
                product={formattedProduct}
                variant="default"
                size="lg"
                className="w-full py-3 sm:py-4 lg:py-6 text-sm sm:text-base lg:text-lg bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] h-auto"
              />
              
              {product.bargainEnabled && (
                <BargainButton 
                  product={formattedProduct}
                  className="w-full py-3 sm:py-4 text-sm sm:text-base h-auto"
                />
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Button variant="outline" size="lg" className="py-3 sm:py-4 h-auto">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Wishlist</span>
                </Button>
                <Button variant="outline" size="lg" className="py-3 sm:py-4 h-auto">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Buy Now</span>
                </Button>
              </div>
            </div>
            
            {/* Already in Cart Notification */}
            {cartItem && (
              <div className="mt-4 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-blue-700">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-medium text-sm sm:text-base">
                      Already in Cart ({cartItem.quantity})
                    </span>
                  </div>
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="text-blue-700 text-sm sm:text-base h-auto py-1.5 sm:py-2">
                      View Cart →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Features & Services */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            <div className="text-center p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mx-auto text-[#7C2C78] mb-1 sm:mb-2" />
              <div className="text-xs sm:text-sm font-medium">Free Shipping</div>
              <div className="text-xs text-gray-600">Over Rs 1000</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mx-auto text-[#7C2C78] mb-1 sm:mb-2" />
              <div className="text-xs sm:text-sm font-medium">10-Day Returns</div>
              <div className="text-xs text-gray-600">Easy returns</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-white border border-gray-200 rounded-lg">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mx-auto text-[#7C2C78] mb-1 sm:mb-2" />
              <div className="text-xs sm:text-sm font-medium">1 Year Warranty</div>
              <div className="text-xs text-gray-600">Full coverage</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-8 sm:mt-10 lg:mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6 lg:mb-8">
            <TabsTrigger value="description" className="text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 lg:py-3">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 lg:py-3">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 lg:py-3">
              Features
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm lg:text-base py-2 sm:py-2.5 lg:py-3">
              Reviews (42)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Product Description</h3>
            <div className="text-sm sm:text-base lg:text-lg text-gray-600 space-y-2.5 sm:space-y-3">
              <p>{product.description}</p>
              {product.shortDescription && (
                <p className="text-gray-700">{product.shortDescription}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Specifications</h3>
            <div className="grid gap-2.5 sm:gap-3">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 sm:py-3 border-b">
                  <span className="font-medium text-gray-700 text-sm sm:text-base mb-1 sm:mb-0">{key}</span>
                  <span className="text-gray-900 text-sm sm:text-base">{value as string}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Key Features</h3>
            <div className="grid gap-2.5 sm:gap-3">
              {(product.features || []).map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm sm:text-base lg:text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="text-center py-8 sm:py-10 lg:py-12 text-gray-500">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-lg sm:text-xl">Reviews feature coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* FAQ Accordion */}
      <div className="mt-8 sm:mt-10 lg:mt-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-2 sm:space-y-3">
          <AccordionItem value="item-1" className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4">
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              Is bargaining available on this product?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              {product.bargainEnabled 
                ? `Yes! You can bargain for this product. You have ${product.maxBargainRounds} attempts to negotiate a better price. Accepted offers generate 24-hour coupons.`
                : 'No, bargaining is not available for this product at the moment.'
              }
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4">
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              What is the return policy?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              We offer a 10-day return policy for unused products in original packaging. Return shipping is free for defective items.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4">
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              How long does shipping take?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              Standard shipping takes 3-5 business days. Express shipping (Rs 300) delivers in 1-2 business days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4">
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              Can I use bargain coupons with other discounts?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              Bargain coupons are product-specific and cannot be combined with other coupons. However, you can use points (10% max) along with bargain coupons.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.div>
  );
}