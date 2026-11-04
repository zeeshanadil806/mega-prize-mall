// components/cart/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, XCircle } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAllTracking } from '@/hooks/useAllTracking';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountedPrice?: number;
    bargainEnabled: boolean;
    minBargainPrice: number;
    maxBargainRounds: number;
    bargainValidityHours: number;
    images?: Array<{ url: string; alt?: string }>;
    stock?: number;
  };
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { trackAddToCart } = useAllTracking();
  const [added, setAdded] = useState(false);
  const [floats, setFloats] = useState<{ id: number }[]>([]);
  
  const addItem = useCartStore((state) => state.addItem);
  const getItem = useCartStore((state) => state.getItem);

  const handleAddToCart = () => {
    if (product.stock !== undefined && product.stock < 1) {
      toast.error("Out of stock");
      return;
    }

    setIsAdding(true);

    const cartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountedPrice: product.discountedPrice,
      bargainEnabled: product.bargainEnabled,
      minBargainPrice: product.minBargainPrice,
      maxBargainRounds: product.maxBargainRounds,
      bargainValidityHours: product.bargainValidityHours,
      images: product.images,
      quantity: 1,
    };

    addItem(cartItem);
    trackAddToCart(
      product.id,
      product.name,
      cartItem.quantity || 1,
      product.discountedPrice || product.price,
      "PKR"
    );
    toast.success(`${product.name} added to cart`);
    setAdded(true);

    // Trigger floating +1 animation
    const newFloatId = Date.now();
    setFloats((prev) => [...prev, { id: newFloatId }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== newFloatId));
    }, 1000);

    // Reset added state after 2 seconds
    setTimeout(() => {
      setAdded(false);
      setIsAdding(false);
    }, 2000);
  };

  // Check if product is already in cart
  const cartItem = getItem(product?.id);
  const buttonText = cartItem
    ? `In Cart (${cartItem.quantity})`
    : "Add to Cart";

  const buttonWrapperVariants: Variants = {
    hover: { scale: 1.015 },
    tap: { scale: 0.97 },
  };

  const cartIconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: [-5, 5, -5, 5, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const checkIconVariants: Variants = {
    initial: { scale: 0, rotate: -45 },
    animate: {
      scale: 1.2,
      rotate: 0,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  const isOutOfStock = product.stock !== undefined && product.stock < 1;

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {floats.map((float) => (
          <motion.div
            key={float.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -60, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 flex items-center justify-center bg-white text-[#011b54] font-bold text-sm sm:text-base px-3 py-1.5 rounded-full shadow-[0_8px_20px_rgba(1,27,84,0.25)] border border-blue-100 whitespace-nowrap"
          >
            +1 Added
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        variants={buttonWrapperVariants}
        whileHover={isOutOfStock ? undefined : "hover"}
        whileTap={isOutOfStock ? undefined : "tap"}
        className="w-full"
      >
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          variant={variant}
          size={size}
          className={`relative overflow-hidden w-full transition-all duration-500 gap-2 ${className} ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
              : variant === "default"
              ? added
                ? "bg-transparent text-white shadow-[0_8px_30px_rgba(16,185,129,0.35)] border-0"
                : "bg-[#011b54] hover:bg-[#022b82] text-white shadow-[0_8px_30px_rgba(1,27,84,0.3)] hover:shadow-[0_12px_45px_rgba(1,27,84,0.55)] border-0"
              : ""
          }`}
        >
          {/* Success Gradient Overlay */}
          {!isOutOfStock && (
            <div
              className={`absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-opacity duration-500 ease-out pointer-events-none ${
                added ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Periodic Light Sweep Shine Effect */}
          {!isOutOfStock && !added && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-cta-sheen" />
          )}

          {/* Button Content */}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {added ? (
              <>
                <motion.span
                  variants={checkIconVariants}
                  initial="initial"
                  animate="animate"
                  className="flex items-center"
                >
                  <Check className="h-5 w-5" />
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-semibold"
                >
                  Added!
                </motion.span>
              </>
            ) : isOutOfStock ? (
              <>
                <XCircle className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Out of Stock</span>
              </>
            ) : (
              <>
                <motion.span
                  variants={cartIconVariants}
                  className="flex items-center"
                >
                  <ShoppingCart className="h-5 w-5" />
                </motion.span>
                <span className="font-semibold">{buttonText}</span>
              </>
            )}
          </span>
        </Button>
      </motion.div>
    </div>
  );
}

