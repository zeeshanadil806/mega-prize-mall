// components/products/ProductDetailClient.tsx (Client Component)
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
// import Image from 'next/image';
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/format";
import AddToCartButton from "@/components/cart/AddToCartButton";
import BargainButton from "@/components/bargain/BargainButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Minus,
  Plus,
  Package,
  Sparkles,
  Trophy,
  Banknote,
  Volume2,
  Radio,
  BatteryCharging,
  Mic,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { ImageProps, CustomerProductProps } from "@/types";
import Link from "next/link";
import Image from "next/image";
import ProductStructuredData from "./ProductStructuredData";
// import { useTikTokTracking } from "@/hooks/useTikTokTracking";
import { useAllTracking } from '@/hooks/useAllTracking';
import { useSession, signIn } from "next-auth/react";

function parseFeatureText(feature: string) {
  const parts = feature.split(/:\s*(.+)/);
  if (parts.length >= 2) {
    return { title: parts[0].trim(), desc: parts[1].trim() };
  }
  return { title: "", desc: feature };
}

function getFeatureIconComponent(title: string, desc: string) {
  const text = (title + " " + desc).toLowerCase();
  if (text.includes("led") || text.includes("display") || text.includes("screen")) return Sparkles;
  if (text.includes("sound") || text.includes("audio") || text.includes("bass") || text.includes("driver") || text.includes("hi-fi")) return Volume2;
  if (text.includes("bluetooth") || text.includes("connectivity") || text.includes("wireless") || text.includes("aux")) return Radio;
  if (text.includes("comfort") || text.includes("cushion") || text.includes("earcup") || text.includes("headband")) return Heart;
  if (text.includes("battery") || text.includes("playtime") || text.includes("charging") || text.includes("charge")) return BatteryCharging;
  if (text.includes("mic") || text.includes("call") || text.includes("voice")) return Mic;
  return CheckCircle;
}

interface ProductDetailClientProps {
  product: CustomerProductProps;
  userId?: string;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1); 
  const [isWishlisted, setIsWishlisted] = useState(false);
  const getItem = useCartStore((state) => state.getItem);
  const addItem = useCartStore((state) => state.addItem);
  const { trackProductView, trackAddToCart } = useAllTracking();

useEffect(() => {
  if (product._id && product.name && product.price) {
    trackProductView(
      product._id.toString(),
      product.name,
      product.discountedPrice || product.price,
      'PKR'
    );
  }
}, [product._id, product.name, product.price, product.discountedPrice, trackProductView]);

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
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100
      )
    : 0;

  const images = product.images || [];
  const imageCount = images.length;
  const visualHighlightImages = product.featureImages || [];
  const cartItem = product._id && getItem(product._id.toString());

  // Inside the component, add these refs after other state declarations
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  // Handle touch end - detect swipe direction
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - next image
      setSelectedImageIndex((prev) =>
        prev === imageCount - 1 ? 0 : prev + 1
      );
    }

    if (isRightSwipe) {
      // Swipe right - previous image
      setSelectedImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

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
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleBuyNow = async () => {
    if (product.stock !== undefined && product.stock < 1) {
      toast.error("Out of stock");
      return;
    }

    const cartItem = {
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountedPrice: product.discountedPrice,
      bargainEnabled: product.bargainEnabled,
      minBargainPrice: product.minBargainPrice,
      maxBargainRounds: product.maxBargainRounds,
      bargainValidityHours: product.bargainValidityHours,
      images: product.images,
      quantity: quantity,
    };

    addItem(cartItem);
    trackAddToCart(
      product._id.toString(),
      product.name,
      quantity,
      product.discountedPrice || product.price,
      "PKR"
    );

    if (session?.user) {
      toast.success(`Redirecting to checkout...`);
      router.push("/checkout");
    } else {
      toast.info(`Proceeding to checkout as guest...`);
      try {
        await signIn("guest", {
          callbackUrl: "/checkout",
          redirect: true,
        });
      } catch (error) {
        console.error("Guest login failed:", error);
        router.push("/checkout");
      }
    }
  };

  const buyNowIconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: [-5, 5, -5, 5, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const wishlistIconVariants: Variants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.2,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
    } else {
      toast.error("Maximum stock reached");
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
      <ProductStructuredData product={product} />
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 flex items-center flex-wrap gap-1 sm:gap-2">
        <Link href="/" className="hover:text-[#011b54] transition-colors">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href="/products"
          className="hover:text-[#011b54] transition-colors"
        >
          Products
        </Link>
        <span className="text-gray-400">/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-[#011b54] transition-colors truncate max-w-[120px] sm:max-w-none"
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
                <div
                  ref={imageContainerRef}
                  className="relative w-full h-full select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => {
                    // Optional: Add click navigation for desktop
                    if (!touchStart && !touchEnd) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const width = rect.width;

                      if (x < width / 3) {
                        // Click left third - previous image
                        setSelectedImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        );
                      } else if (x > (width / 3) * 2) {
                        // Click right third - next image
                        setSelectedImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        );
                      }
                    }
                  }}
                >
                  {/* Swipe indicator overlay */}
                  {touchStart &&
                    touchEnd &&
                    Math.abs(touchStart - touchEnd) > 10 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center z-10"
                      >
                        <div
                          className={`
              h-12 w-12 rounded-full flex items-center justify-center
              ${touchStart - touchEnd > 0 ? "bg-gray-900" : "bg-gray-900"}
            `}
                        >
                          {touchStart - touchEnd > 0 ? (
                            <ChevronRight className="h-6 w-6 text-white" />
                          ) : (
                            <ChevronLeft className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </motion.div>
                    )}

                  {/* Main Image */}
                  <motion.div
                    key={selectedImageIndex}
                    initial={{
                      opacity: 0,
                      x:
                        touchStart && touchEnd
                          ? touchStart - touchEnd > 0
                            ? 50
                            : -50
                          : 0,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={images[selectedImageIndex]?.url}
                      alt={images[selectedImageIndex]?.alt || product.name}
                      fill
                      className="object-contain p-4 sm:p-6 cursor-grab active:cursor-grabbing"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      priority
                      draggable="false"
                    />
                  </motion.div>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </div>
                </div>

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImageIndex(
                          selectedImageIndex === 0
                            ? images.length - 1
                            : selectedImageIndex - 1
                        )
                      }
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex(
                          selectedImageIndex === images.length - 1
                            ? 0
                            : selectedImageIndex + 1
                        )
                      }
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
                    <Badge className="bg-linear-to-r from-[#011b54] to-[#022b82] text-white border-0 text-xs sm:text-sm py-0.5 sm:py-1">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-linear-to-r from-[#011b54] to-[#022b82] text-white border-0 text-xs sm:text-sm py-0.5 sm:py-1">
                      Best Seller
                    </Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="bg-green-500 text-white border-0 text-xs sm:text-sm py-0.5 sm:py-1">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                  {product.bargainEnabled && (
                    <Badge
                      variant="outline"
                      className="border-[#011b54] text-[#011b54] bg-white/90 text-xs sm:text-sm py-0.5 sm:py-1"
                    >
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
                      isWishlisted ? "text-red-500" : ""
                    }`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        isWishlisted ? "fill-red-500" : ""
                      }`}
                    />
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                <div className="text-gray-400">
                  <svg
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="space-y-3 sm:space-y-4">
              {/* Mobile: Wrap grid for thumbnails */}
              <div className="block md:hidden">
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image: ImageProps, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index
                          ? "border-[#011b54] scale-105 z-10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.url}
                          alt={image.alt || `Product view ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 56px"
                        />
                      </div>
                      {/* Active indicator for mobile */}
                      {selectedImageIndex === index && (
                        <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#011b54] border border-white"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Show more indicator if many images */}
                {images.length > 8 && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">
                      {images.length} images available
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop: Horizontal scroll for thumbnails */}
              <div className="hidden md:block">
                <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-3 scrollbar-thin">
                  {images.map((image: ImageProps, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`shrink-0 h-16 w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 rounded-lg lg:rounded-xl border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index
                          ? "border-[#011b54] scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.url}
                          alt={image.alt || `Product view ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 64px, (max-width: 1280px) 80px, 96px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3.5 sm:space-y-6 lg:space-y-7">
          {/* Product Header */}
          <div>
            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-snug mb-2">
              {product.name}
            </h1>

            {/* Social Proof, Rating & Stock metadata */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
              {/* Star Rating Badge */}
              <div className="inline-flex items-center gap-1 bg-amber-50/90 border border-amber-200/90 px-2.5 py-0.5 rounded-full text-amber-900 font-bold shadow-2xs">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>4.9</span>
                <span className="text-amber-300">•</span>
                <span className="text-[11px] text-amber-800 font-medium">48 reviews</span>
              </div>

              {/* Stock Status Badge with pulse indicator */}
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {product.stock <= 10 ? `Only ${product.stock} units left — order soon!` : "In Stock • Ships in 24h"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-xs">
                  Out of Stock
                </span>
              )}

              {/* SKU & Brand */}
              <span className="text-gray-500 font-medium">SKU: {product.sku}</span>
              {product.brand && product.brand.toLowerCase() !== "generic" && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-700 font-semibold">Brand: {product.brand}</span>
                </>
              )}
            </div>
          </div>

          {/* ── High-Converting Price & Deals Box ── */}
          <div className="pt-2 sm:bg-gray-50/70 sm:border sm:border-gray-200/80 sm:rounded-2xl sm:p-5 lg:p-6 space-y-3.5 sm:space-y-4">
            {/* Price row with savings and sales velocity */}
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                  {formatCurrency(finalPrice)}
                </div>
                {product.discountedPrice && (
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="text-sm sm:text-lg text-gray-400 line-through font-medium">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs font-bold py-0.5 px-2 border-0 shadow-2xs">
                      Save {formatCurrency(product.price - product.discountedPrice)} ({discountPercentage}% OFF)
                    </Badge>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0 bg-[#011b54]/5 border border-[#011b54]/10 rounded-xl px-2.5 py-1.5">
                <div className="text-xs font-black text-[#011b54] flex items-center justify-end gap-1">
                  <span>🔥</span>
                  <span>{product.purchaseCount && product.purchaseCount > 2 ? `${product.purchaseCount}+` : "24+"} sold</span>
                </div>
                <div className="text-[10px] text-gray-500 font-medium">high demand</div>
              </div>
            </div>

            {/* AI Bargain Card — Visible on BOTH mobile and desktop */}
            {product.bargainEnabled && (
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-[#011b54]/8 via-[#011b54]/4 to-transparent border border-[#011b54]/20 shadow-2xs flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#011b54]">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
                    <span>Mega Bargain Zone • Name Your Price</span>
                  </div>
                  <p className="text-[10.5px] sm:text-xs text-gray-600 font-medium mt-0.5 leading-tight">
                    Negotiate with AI Bot to unlock an instant discount coupon!
                  </p>
                </div>
                <BargainButton
                  product={formattedProduct}
                  size="sm"
                  buttonText="Make an Offer"
                  className="shrink-0"
                />
              </div>
            )}

            {/* Lucky Draw Shop & Win Perk */}
            <div className="rounded-xl p-2.5 sm:p-3 bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-emerald-500/10 border border-amber-300/40 flex items-center gap-2.5 shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 text-amber-700">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] sm:text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span>Mega Lucky Draw Entry Included</span>
                  <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.2 rounded-full">FREE</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-600 font-medium truncate mt-0.5">
                  Every order automatically enters to win Smartwatches & Cash Prizes!
                </p>
              </div>
            </div>

            {/* Desktop-only Quantity Selector — mobile has Qty in bottom sticky bar */}
            <div className="hidden sm:flex items-center gap-3 pt-1">
              <span className="text-sm font-bold text-gray-700 shrink-0">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs">
                <motion.button
                  onClick={decrementQuantity}
                  whileTap={{ scale: 0.85 }}
                  className="w-9 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:pointer-events-none"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </motion.button>
                <span className="w-10 text-center text-sm font-bold text-gray-900">
                  {quantity}
                </span>
                <motion.button
                  onClick={incrementQuantity}
                  whileTap={{ scale: 0.85 }}
                  className="w-9 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:pointer-events-none"
                  disabled={quantity >= (product.stock || 0)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </motion.button>
              </div>
              <span className="text-xs font-medium text-gray-500">{product.stock || 0} available</span>
            </div>

            {/* Already in Cart — compact notification */}
            {cartItem && (
              <div className="px-3 py-2 bg-blue-50/90 border border-blue-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Already in cart ({cartItem.quantity} units)</span>
                </div>
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="text-blue-700 text-xs h-auto py-1 px-2.5 font-bold hover:bg-blue-100">
                    View Cart →
                  </Button>
                </Link>
              </div>
            )}

            {/* Desktop-only action buttons */}
            <div className="hidden sm:block space-y-3 pt-1">
              <AddToCartButton
                product={formattedProduct}
                variant="default"
                size="lg"
                className="w-full h-14 lg:h-16 rounded-xl text-base lg:text-lg font-bold"
              />

              <div className="grid grid-cols-2 gap-3">
                <motion.div whileHover="hover" whileTap="tap" className="w-full">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlist}
                    className={`w-full h-13 lg:h-14 flex items-center justify-center transition-all duration-300 font-bold rounded-xl ${
                      isWishlisted
                        ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-50 shadow-xs"
                        : "border-gray-200 hover:border-red-200 hover:bg-red-50/30 text-gray-700 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-red-500 text-red-500 animate-pulse" : ""}`} />
                    <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                  </Button>
                </motion.div>

                <motion.div whileHover="hover" whileTap="tap" className="w-full">
                  <Button
                    onClick={handleBuyNow}
                    disabled={product.stock !== undefined && product.stock < 1}
                    className="relative overflow-hidden w-full h-13 lg:h-14 flex items-center justify-center bg-[#011b54] hover:bg-[#022b82] text-white shadow-[0_8px_25px_rgba(1,27,84,0.3)] transition-all font-bold rounded-xl border-0 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none animate-cta-sheen" />
                    <Package className="h-4 w-4 mr-2 relative z-10" />
                    <span className="relative z-10">Buy Now</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Trust Guarantees — high-conversion 3-pillar card */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1">
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-150/70 text-center sm:text-left shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#011b54]/8 flex items-center justify-center text-[#011b54] shrink-0">
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">Free Delivery</div>
                <div className="text-[9.5px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">Across Pakistan</div>
              </div>
            </div>

            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-150/70 text-center sm:text-left shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">Cash on Delivery</div>
                <div className="text-[9.5px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">Pay at Doorstep</div>
              </div>
            </div>

            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gray-50/80 border border-gray-150/70 text-center sm:text-left shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-[#011b54] shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">10-Day Warranty</div>
                <div className="text-[9.5px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">Easy Replacement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {visualHighlightImages.length > 0 && (
        <section className="mt-10 sm:mt-12 lg:mt-16">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400">Product Details</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Full-bleed breakout — escape the container padding so banners go edge-to-edge */}
          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <div className="flex flex-col divide-y divide-gray-100">
              {visualHighlightImages.map((image: ImageProps, index: number) => (
                <motion.div
                  key={`banner-${image.url}-${index}`}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full bg-white"
                >
                  {/* Natural-ratio image — no fixed height, preserves original aspect ratio exactly */}
                  <Image
                    src={image.url}
                    alt={image.alt || `${product.name} detail ${index + 1}`}
                    width={image.metadata?.width || 1200}
                    height={image.metadata?.height || 800}
                    className="w-full h-auto block"
                    sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px"
                    style={{ display: "block" }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Details Tabs */}
      <div className="mt-8 sm:mt-10 lg:mt-12">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-5 sm:mb-6 p-1 bg-gray-100/90 rounded-xl sm:rounded-2xl border border-gray-200/80">
            <TabsTrigger
              value="features"
              className="text-xs sm:text-sm py-2 sm:py-2.5 font-bold rounded-lg sm:rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#011b54] data-[state=active]:shadow-xs transition-all"
            >
              Features
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="text-xs sm:text-sm py-2 sm:py-2.5 font-bold rounded-lg sm:rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#011b54] data-[state=active]:shadow-xs transition-all"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="text-xs sm:text-sm py-2 sm:py-2.5 font-bold rounded-lg sm:rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#011b54] data-[state=active]:shadow-xs transition-all"
            >
              Specifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Product Overview
            </h3>
            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2.5 bg-gray-50/70 p-4 rounded-xl border border-gray-150/70">
              <p>{product.description}</p>
              {product.shortDescription && (
                <p className="text-gray-700 font-medium">{product.shortDescription}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="specifications"
            className="space-y-3 sm:space-y-4"
          >
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Specifications
            </h3>
            <div className="grid gap-2.5 sm:gap-3">
              {Object.entries(product.specifications || {}).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:justify-between py-2 sm:py-3 border-b"
                  >
                    <span className="font-medium text-gray-700 text-sm sm:text-base mb-1 sm:mb-0">
                      {key}
                    </span>
                    <span className="text-gray-900 text-sm sm:text-base">
                      {value as string}
                    </span>
                  </div>
                )
              )}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                Key Features & Highlights
              </h3>
              <span className="text-xs text-gray-500 font-semibold">
                {(product.features || []).length} standout features
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              {(product.features || []).map((feature: string, index: number) => {
                const { title, desc } = parseFeatureText(feature);
                const IconComponent = getFeatureIconComponent(title, desc);
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-50/70 hover:bg-white border border-gray-150/80 hover:border-[#011b54]/25 shadow-2xs hover:shadow-xs transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-[#011b54]/8 text-[#011b54] flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent className="h-4 w-4 stroke-[2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {title ? (
                        <>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                            {title}
                          </h4>
                          <p className="text-[11.5px] sm:text-xs text-gray-600 font-medium leading-relaxed mt-1">
                            {desc}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
        <Accordion
          type="single"
          collapsible
          className="w-full space-y-2 sm:space-y-3"
        >
          <AccordionItem
            value="item-1"
            className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4"
          >
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              Is bargaining available on this product?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              {product.bargainEnabled
                ? `Yes! You can bargain for this product. You have ${product.maxBargainRounds} attempts to negotiate a better price. Accepted offers generate 24-hour coupons.`
                : "No, bargaining is not available for this product at the moment."}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-2"
            className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4"
          >
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              What is the return policy?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              We offer a 10-day return policy for unused products in original
              packaging. Return shipping is free for defective items.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-3"
            className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4"
          >
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              How long does shipping take?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              Standard shipping takes 3-5 business days. Express shipping (Rs
              300) delivers in 1-2 business days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-4"
            className="border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4"
          >
            <AccordionTrigger className="text-sm sm:text-base lg:text-lg py-3 sm:py-4 hover:no-underline">
              Can I use bargain coupons with other discounts?
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-base text-gray-600 pb-3 sm:pb-4">
              Bargain coupons are product-specific and cannot be combined with
              other coupons. However, you can use points (10% max) along with
              bargain coupons.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* ═══════════════════════════════════════════════════
           MOBILE STICKY BOTTOM ACTION BAR
           Always visible — no scrolling required on mobile
      ═══════════════════════════════════════════════════ */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        {/* Cart notification strip */}
        {cartItem && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-700">
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Already in cart ({cartItem.quantity})</span>
            </div>
            <Link href="/cart">
              <span className="text-xs font-semibold text-blue-700 underline">View Cart →</span>
            </Link>
          </div>
        )}

        <div className="px-3.5 pt-2.5 pb-[max(24px,calc(env(safe-area-inset-bottom,0px)+14px))] flex items-center gap-2.5">
          {/* Compact Qty */}
          <div className="flex items-center border border-gray-200 rounded-xl shrink-0 bg-gray-50 h-11">
            <motion.button
              onClick={decrementQuantity}
              whileTap={{ scale: 0.85 }}
              className="w-8 h-full flex items-center justify-center text-gray-600 disabled:text-gray-300 disabled:pointer-events-none"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </motion.button>
            <span className="w-7 text-center text-xs font-bold text-gray-900">{quantity}</span>
            <motion.button
              onClick={incrementQuantity}
              whileTap={{ scale: 0.85 }}
              className="w-8 h-full flex items-center justify-center text-gray-600 disabled:text-gray-300 disabled:pointer-events-none"
              disabled={quantity >= (product.stock || 0)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </motion.button>
          </div>

          {/* Add to Cart */}
          <div className="flex-1 min-w-0">
            <AddToCartButton
              product={formattedProduct}
              variant="default"
              size="default"
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold"
            />
          </div>

          {/* Buy Now */}
          <motion.button
            onClick={handleBuyNow}
            whileTap={{ scale: 0.97 }}
            disabled={product.stock !== undefined && product.stock < 1}
            className="relative overflow-hidden h-11 px-4 sm:px-5 rounded-xl flex items-center justify-center gap-1.5 bg-[#011b54] hover:bg-[#022b82] text-white text-xs sm:text-sm font-bold shadow-[0_4px_15px_rgba(1,27,84,0.35)] disabled:opacity-40 disabled:pointer-events-none shrink-0"
          >
            {!(product.stock !== undefined && product.stock < 1) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none animate-cta-sheen" />
            )}
            <Package className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Buy Now</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
