// components/cart/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { motion } from "framer-motion";
// import { useTikTokTracking } from "@/hooks/useTikTokTracking";
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
  const { trackAddToCart } = useAllTracking(); // ADD THIS
  const [added, setAdded] = useState(false);
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
      product.discountedPrice || product.price, // Fallback to original price
      "PKR"
    );
    toast.success(`${product.name} added to cart`);
    setAdded(true);

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
    : product.stock !== undefined && product.stock < 1
    ? "Out of Stock"
    : "Add to Cart";

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        onClick={handleAddToCart}
        disabled={
          isAdding || (product.stock !== undefined && product.stock < 1)
        }
        variant={variant}
        size={size}
        className={`gap-2 ${className} ${
          variant === "default"
            ? "bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A]"
            : ""
        }`}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>
    </motion.div>
  );
}
