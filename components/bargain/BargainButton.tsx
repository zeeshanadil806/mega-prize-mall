// components/bargain/BargainButton.tsx
"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tag, Lock, Sparkles } from "lucide-react";
import BargainModal from "./BargainModal";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";

interface BargainButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    bargainEnabled: boolean;
    minBargainPrice: number;
    maxBargainRounds: number;
    bargainValidityHours: number;
    images?: Array<{ url: string; alt?: string }>;
    stock?: number;
    slug?: string;
  };
  className?: string;
  size?: "default" | "sm" | "lg";
  buttonText?: string;
}

export default function BargainButton({
  product,
  className,
  size = "lg",
  buttonText,
}: BargainButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const applyBargainToItem = useCartStore((state) => state.applyBargainToItem);
  const getItem = useCartStore((state) => state.getItem);
  const addItem = useCartStore((state) => state.addItem);

  if (!product.bargainEnabled) {
    return null;
  }

  const handleBargainClick = () => {
    if (status === "loading") return;

    if (!session?.user) {
      toast.error("Please sign in to make an offer and unlock your discount coupon!");
      return;
    }

    // Auto-add to cart if not already present so bargaining never errors
    const cartItem = getItem(product.id);
    if (!cartItem) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug || product.id,
        price: product.price,
        discountedPrice: product.discountedPrice,
        bargainEnabled: product.bargainEnabled,
        minBargainPrice: product.minBargainPrice,
        maxBargainRounds: product.maxBargainRounds,
        bargainValidityHours: product.bargainValidityHours,
        images: product.images,
        quantity: 1,
      });
      toast.success("Product added to cart for bargaining!");
    }

    setIsModalOpen(true);
  };

  // Calculate current price
  const currentPrice = product.discountedPrice || product.price;

  // Calculate minimum discount percentage
  const minDiscountPercentage = Math.round(
    ((currentPrice - product.minBargainPrice) / currentPrice) * 100
  );

  // Handle bargain success
  const handleBargainSuccess = (couponId: string, discountAmount: number) => {
    applyBargainToItem(product.id, couponId, discountAmount);
    toast.success("Bargain discount coupon applied to cart!");
  };

  const bargainWrapperVariants: Variants = {
    hover: { scale: 1.015 },
    tap: { scale: 0.97 },
  };

  const bargainIconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const isSmall = size === "sm";

  return (
    <>
      <motion.div
        variants={bargainWrapperVariants}
        whileHover="hover"
        whileTap="tap"
        className={className}
      >
        <Button
          onClick={handleBargainClick}
          className={`relative overflow-hidden font-bold transition-all duration-300 border-0 ${
            isSmall
              ? "h-9 px-3.5 rounded-xl text-xs bg-linear-to-r from-[#011b54] to-[#022b82] hover:from-[#022b82] hover:to-[#011b54] text-white shadow-sm flex items-center justify-center gap-1.5"
              : "w-full bg-linear-to-r from-[#011b54] to-[#022b82] hover:from-[#022b82] hover:to-[#011b54] text-white shadow-[0_8px_25px_rgba(1,27,84,0.28)] hover:shadow-[0_12px_35px_rgba(1,27,84,0.45)] h-13 sm:h-14 lg:h-16 rounded-xl text-sm sm:text-base"
          }`}
          size={isSmall ? "sm" : "lg"}
        >
          {/* Light Sweep Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-cta-sheen" />

          <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
            <motion.span variants={bargainIconVariants} className="flex items-center">
              {isSmall ? <Sparkles className="h-3.5 w-3.5 text-amber-300" /> : <Tag className="h-4 w-4 sm:h-5 sm:w-5" />}
            </motion.span>
            <span>{buttonText || "Make an Offer"}</span>
            {session?.user && minDiscountPercentage > 0 && (
              <span className="text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                Save up to {minDiscountPercentage}%
              </span>
            )}
          </span>
        </Button>

        {!session?.user && !isSmall && (
          <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
            <Lock className="h-3 w-3 mr-1" />
            Sign in to make an offer & unlock coupons
          </div>
        )}
      </motion.div>

      {session?.user && (
        <BargainModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          userId={session.user.id}
          onBargainSuccess={handleBargainSuccess}
        />
      )}
    </>
  );
}
