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
  Heart
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { ImageProps, CustomerProductProps } from '@/types';

interface ProductDetailClientProps {
  product: CustomerProductProps; // Product document from MongoDB
  userId?: string;
//   userBargainHistory?: any[];
}

export default function ProductDetailClient({ 
  product, 
//   userId, 
//   userBargainHistory 
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
    >
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <a href="/products" className="hover:text-[#7C2C78]">Products</a>
        <span className="mx-2">/</span>
        <a href={`/products?category=${product.category}`} className="hover:text-[#7C2C78]">
          {product.category}
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImageIndex]?.url}
                  alt={images[selectedImageIndex]?.alt || product.name}
                  className="h-full w-full object-contain p-4"
                />
                
                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(
                        selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-linear-to-r from-[#EAB75F] to-[#A43875] text-white border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-linear-to-r from-[#7C2C78] to-[#2E297D] text-white border-0">
                      #1 Best Seller
                    </Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="bg-green-500 text-white border-0">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                  {product.bargainEnabled && (
                    <Badge variant="outline" className="border-[#EAB75F] text-[#EAB75F] bg-white/90">
                      Bargain Available
                    </Badge>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleWishlist}
                    className={`h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
                      isWishlisted ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                <div className="text-gray-400">
                  <svg className="h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((image: ImageProps, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`shrink-0 h-20 w-20 rounded-lg border-2 overflow-hidden ${
                    selectedImageIndex === index
                      ? 'border-[#7C2C78]'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Product view ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          {/* Product Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-gray-600">Brand: {product.brand}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(42 reviews)</span>
                  </div>
                </div>
              </div>
              
              {/* Stock Status */}
              <div className="text-right">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">In Stock</span>
                    {product.stock <= 10 && (
                      <span className="text-sm text-orange-600">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600 font-medium">Out of Stock</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Price Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-baseline gap-4 mb-4">
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-gray-900">
                  {formatCurrency(finalPrice)}
                </div>
                {product.discountedPrice && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge className="bg-green-500 text-white">
                      Save {formatCurrency(product.price - product.discountedPrice)}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Purchase Count */}
              {product.purchaseCount && product.purchaseCount > 0 && (
                <div className="text-sm text-gray-600">
                  <div className="font-semibold">{product.purchaseCount}+</div>
                  <div>purchased</div>
                </div>
              )}
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-lg font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                    disabled={quantity >= (product.stock || 10)}
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  {product.stock || 10} units available
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <AddToCartButton 
                product={formattedProduct}
                variant="default"
                size="lg"
                className="w-full py-6 text-lg bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A]"
              />
              
              {product.bargainEnabled && (
                <BargainButton 
                  product={formattedProduct}
                  className="w-full"
                />
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="py-6">
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" size="lg" className="py-6">
                  <Package className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
            
            {/* Already in Cart Notification */}
            {cartItem && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Already in Cart ({cartItem.quantity})</span>
                  </div>
                  <a href="/cart">
                    <Button variant="ghost" size="sm" className="text-blue-700">
                      View Cart →
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {/* Features & Services */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
              <Truck className="h-6 w-6 mx-auto text-[#7C2C78] mb-2" />
              <div className="text-sm font-medium">Free Shipping</div>
              <div className="text-xs text-gray-600">Over Rs 1000</div>
            </div>
            <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
              <RotateCcw className="h-6 w-6 mx-auto text-[#7C2C78] mb-2" />
              <div className="text-sm font-medium">10-Day Returns</div>
              <div className="text-xs text-gray-600">Easy returns</div>
            </div>
            <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
              <Shield className="h-6 w-6 mx-auto text-[#7C2C78] mb-2" />
              <div className="text-sm font-medium">1 Year Warranty</div>
              <div className="text-xs text-gray-600">Full coverage</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid grid-cols-4 lg:w-auto mb-8">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews (42)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-4">
            <div className="prose prose-lg max-w-none">
              <h3>Product Description</h3>
              <p>{product.description}</p>
              {product.shortDescription && (
                <p className="text-gray-600">{product.shortDescription}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b">
                  <span className="font-medium text-gray-700">{key}</span>
                  <span className="text-gray-900">{value as string}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid gap-3">
              {(product.features || []).map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            {/* Reviews will be implemented separately */}
            <div className="text-center py-12 text-gray-500">
              Reviews feature coming soon!
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* FAQ Accordion */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is bargaining available on this product?</AccordionTrigger>
            <AccordionContent>
              {product.bargainEnabled 
                ? `Yes! You can bargain for this product. You have ${product.maxBargainRounds} attempts to negotiate a better price. Accepted offers generate 24-hour coupons.`
                : 'No, bargaining is not available for this product at the moment.'
              }
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>What is the return policy?</AccordionTrigger>
            <AccordionContent>
              We offer a 10-day return policy for unused products in original packaging. Return shipping is free for defective items.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How long does shipping take?</AccordionTrigger>
            <AccordionContent>
              Standard shipping takes 3-5 business days. Express shipping (Rs 300) delivers in 1-2 business days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Can I use bargain coupons with other discounts?</AccordionTrigger>
            <AccordionContent>
              Bargain coupons are product-specific and cannot be combined with other coupons. However, you can use points (10% max) along with bargain coupons.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </motion.div>
  );
}