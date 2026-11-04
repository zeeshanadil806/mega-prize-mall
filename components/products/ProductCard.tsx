// components/products/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { ProductProps } from "@/types";

interface ProductCardProps {
  product: ProductProps;
  /**
   * Mark as the LCP image — passes `priority` to Next/Image so the first
   * above-the-fold card gets eager loading + fetchpriority=high. Off by
   * default so non-LCP cards stay lazy.
   */
  priority?: boolean;
  /**
   * Additional wrapper classes (e.g. for responsive widths in peek carousels)
   */
  className?: string;
}

/**
 * Returns a high-end color swatch dot inspired by Ronin.
 * Replaces ugly text pills with a sleek, physical circular dot.
 */
function getColorSwatch(color?: string) {
  if (!color) {
    return (
      <span
        title="Black Edition"
        className="inline-block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-neutral-900 shadow-2xs ring-1 ring-gray-300/70"
      />
    );
  }

  const c = color.toLowerCase().trim();
  let bgClass = "bg-neutral-900";
  let ringClass = "ring-1 ring-gray-300/70";

  if (c.includes("black")) {
    bgClass = "bg-neutral-900";
  } else if (c.includes("white")) {
    bgClass = "bg-white";
    ringClass = "ring-1 ring-gray-300";
  } else if (c.includes("blue") || c.includes("navy")) {
    bgClass = "bg-[#1877F2]";
  } else if (c.includes("red") || c.includes("crimson")) {
    bgClass = "bg-red-500";
  } else if (c.includes("green") || c.includes("olive")) {
    bgClass = "bg-emerald-600";
  } else if (c.includes("grey") || c.includes("gray") || c.includes("silver")) {
    bgClass = "bg-gray-400";
  } else if (c.includes("gold") || c.includes("yellow")) {
    bgClass = "bg-amber-400";
  } else if (c.includes("pink") || c.includes("rose")) {
    bgClass = "bg-pink-400";
  } else if (c.includes("orange")) {
    bgClass = "bg-orange-500";
  } else if (c.includes("purple") || c.includes("violet")) {
    bgClass = "bg-purple-600";
  } else if (c.includes("transparent") || c.includes("clear")) {
    bgClass = "bg-white/80";
    ringClass = "ring-1 ring-dashed ring-gray-400";
  } else {
    // Multicolor / special gradient
    bgClass = "bg-linear-to-tr from-purple-500 via-pink-500 to-amber-400";
  }

  return (
    <span
      title={`Color: ${color}`}
      className={`inline-block w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shadow-2xs ${bgClass} ${ringClass}`}
    />
  );
}

export default function ProductCard({
  product,
  priority = false,
  className = "",
}: ProductCardProps) {
  const finalPrice = product.discountedPrice || product.price;
  const discountPercentage = product.discountedPrice
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100,
      )
    : 0;

  const mainImage = product.images?.[0]?.url || "/placeholder-product.jpg";
  const hoverImage = product.images?.[1]?.url;

  // Determine Ronin-style beautified vertical ribbon config
  let ribbonConfig: {
    text: string;
    gradient: string;
    shadow: string;
  } | null = null;

  if (product.isNewArrival) {
    ribbonConfig = {
      text: "NEWLY LAUNCHED",
      gradient: "bg-linear-to-b from-[#3B82F6] via-[#1D4ED8] to-[#1E40AF]",
      shadow: "shadow-[2px_2px_10px_rgba(29,78,216,0.35)]",
    };
  } else if (product.isBestSeller) {
    ribbonConfig = {
      text: "BEST SELLER",
      gradient: "bg-linear-to-b from-[#F59E0B] via-[#D97706] to-[#B45309]",
      shadow: "shadow-[2px_2px_10px_rgba(217,119,6,0.35)]",
    };
  } else if (discountPercentage >= 15) {
    ribbonConfig = {
      text: `SAVE ${discountPercentage}%`,
      gradient: "bg-linear-to-b from-[#10B981] via-[#059669] to-[#047857]",
      shadow: "shadow-[2px_2px_10px_rgba(5,150,105,0.35)]",
    };
  } else if (product.isFeatured) {
    ribbonConfig = {
      text: "FEATURED",
      gradient: "bg-linear-to-b from-[#9333EA] via-[#7C2C78] to-[#581C87]",
      shadow: "shadow-[2px_2px_10px_rgba(124,44,120,0.35)]",
    };
  }

  // Derive hardware compatibility / feature badge
  const categoryLabel = product.category || "Smart Gadget";
  const featureTag =
    product.shortDescription ||
    (product.features && product.features.length > 0
      ? product.features.slice(0, 2).join(" • ")
      : "Compatible with iOS & Android Devices");

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group relative flex flex-col justify-between h-full bg-white rounded-[22px] sm:rounded-[26px] border border-gray-150/90 hover:border-gray-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] p-3.5 sm:p-4 pt-4 sm:pt-4.5 transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* 1. Beautified Sculpted Side Display Ribbon on Left Border */}
      {ribbonConfig && (
        <div className="absolute left-0 top-[35%] -translate-y-1/2 z-20 pointer-events-none">
          <div
            className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 sm:px-1.5 rounded-r-xl border-r border-y border-white/30 text-white ${ribbonConfig.gradient} ${ribbonConfig.shadow}`}
          >
            {/* Jewel micro-dot indicator */}
            <span className="w-1 h-1 rounded-full bg-white/95 shadow-2xs mb-1.5 shrink-0" />

            {/* Vertically oriented typography with luxury letter-spacing */}
            <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-[0.24em] [writing-mode:vertical-lr] rotate-180 antialiased drop-shadow-xs">
              {ribbonConfig.text}
            </span>
          </div>
        </div>
      )}

      {/* 2. Top-Right AI Bargain Badge (Mega Prize Mall USP) */}
      {product.bargainEnabled && (
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-purple-50/95 border border-purple-200/90 text-[#7C2C78] text-[9px] sm:text-[10px] font-bold shadow-2xs flex items-center gap-1 backdrop-blur-xs">
            <span>💎</span> Offer
          </span>
        </div>
      )}

      {/* 3. Floating Product Image Canvas (Clean White - No Clunky Box!) */}
      <div className="flex flex-col flex-1">
        <div className="relative aspect-square w-full flex items-center justify-center pt-1.5 pb-1 overflow-hidden">
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className={`object-contain p-2.5 sm:p-3.5 transition-all duration-500 ease-out ${
                  hoverImage
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-106"
                }`}
                sizes="(max-width: 640px) 78vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                {...(priority ? { priority: true } : { loading: "lazy" })}
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} alternate view`}
                  fill
                  className="object-contain p-2 sm:p-3 opacity-0 group-hover:opacity-100 group-hover:scale-106 transition-all duration-500 ease-out absolute inset-0"
                  sizes="(max-width: 640px) 78vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-300">
              <ShoppingCart className="h-8 w-8 stroke-1" />
            </div>
          )}
        </div>

        {/* 4. Sub-Image Compatibility / Feature Micro-Line (Ronin Style) */}
        <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] text-gray-500 font-medium my-1 text-center px-1">
          <span className="text-[10px] opacity-70">⚡</span>
          <span className="line-clamp-1">{featureTag}</span>
        </div>

        {/* 5. Product Title (Uppercase Bold Ronin Typography) */}
        <div className="mt-1 min-h-[1.5rem] sm:min-h-[2.25rem] flex items-start">
          <h3 className="font-extrabold uppercase tracking-tight text-gray-900 group-hover:text-[#022b82] text-xs sm:text-[13px] line-clamp-2 transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* 6. Product Subtitle / Category Specs */}
        <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium line-clamp-1 mt-1">
          {categoryLabel} | {product.brand || "Official Warranty"}
        </p>

        {/* 7. Rating Stars (5 Stars) + Color Swatch Dot */}
        <div className="flex items-center justify-between mt-2 mb-1 px-0.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 stroke-amber-400"
              />
            ))}
          </div>
          {getColorSwatch(product.color)}
        </div>
      </div>

      {/* 8. Crisp Horizontal Divider Line */}
      <div className="w-full h-px bg-gray-100 my-2 sm:my-2.5" />

      {/* 9. Spacious Price & "Buy Now" Action Button */}
      <div className="flex items-center justify-between gap-2.5 pt-0.5 mt-auto">
        {/* Price Hierarchy - Stacked vertically for zero congestion */}
        <div className="flex flex-col justify-center min-w-0 shrink-0">
          <span className="text-sm sm:text-base font-black text-gray-900 tracking-tight whitespace-nowrap leading-tight">
            Rs. {finalPrice.toLocaleString()}
          </span>
          {product.discountedPrice ? (
            <span className="text-[10px] sm:text-[11px] text-gray-400 line-through font-normal whitespace-nowrap leading-none mt-0.5">
              Rs. {product.price.toLocaleString()}
            </span>
          ) : null}
        </div>

        {/* High-Conversion "Buy Now" Button (Deep Royal Navy Brand Gradient) */}
        <span className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold bg-linear-to-r from-[#011b54] via-[#02246d] to-[#022b82] hover:from-[#022b82] hover:to-[#011b54] text-white border border-white/10 shadow-xs group-hover:shadow-[0_4px_14px_rgba(1,27,84,0.35)] active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0">
          <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Buy Now</span>
        </span>
      </div>
    </Link>
  );
}
