// app/(customer)/cart/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Tag,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/bargain-utils";
import BargainButton from "@/components/bargain/BargainButton";
import { toast } from "sonner";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";

export default function CartPage() {
  const { data: session, status } = useSession();
  console.log(session?.user);
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getDiscountTotal,
    getGrandTotal,
    getTotalItems,
    removeBargainFromItem,
    loadedProducts,
    setLoadedProducts,
  } = useCartStore();

  const [isLoading, setIsLoading] = useState(false);
  // const [couponCode, setCouponCode] = useState("");
  const [appliedGlobalCoupon, setAppliedGlobalCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // Fetch product details for all items in cart
  const fetchProductDetails = useCallback(async () => {
    if (items.length === 0) return;

    setIsLoading(true);
    try {
      const productIds = items.map((item) => item.productId);
      const response = await fetch(`/api/products/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });

      if (response.ok) {
        const products = await response.json();
        setLoadedProducts(products);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      toast.error("Failed to load product details");
    } finally {
      setIsLoading(false);
    }
  }, [items, setLoadedProducts]);

  // Fetch on mount and when items change
  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Handle bargain removal
  const handleRemoveBargain = useCallback(
    (productId: string) => {
      removeBargainFromItem(productId);
      toast.info("Bargain removed from item");
    },
    [removeBargainFromItem],
  );

  const handleGuestCheckout = async () => {
    try {
      await signIn("guest", {
        callbackUrl: "/checkout",
        redirect: true,
      });
    } catch (error) {
      console.error("Guest checkout failed:", error);
      toast.error("Failed to proceed as guest. Please try again.");
    }
  };

  // Calculate final total with global coupon
  const calculateFinalTotal = () => {
    const grandTotal = getGrandTotal();
    if (appliedGlobalCoupon) {
      return Math.max(0, grandTotal - appliedGlobalCoupon.discount);
    }
    return grandTotal;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-[#7C2C78]">
          Your cart is empty
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any products to your cart yet.
        </p>
        <Link
          href="/products"
          className="bg-linear-to-r from-[#7C2C78] to-[#A43875]"
        >
          <Button size="lg" className="gap-2">
            <ShoppingBag className="h-5 w-5" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Shopping Cart
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Review your items and proceed to checkout
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-center py-8 sm:py-12 gap-3 sm:gap-4">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[#7C2C78]" />
          <span className="text-sm sm:text-base text-gray-600">
            Loading product details...
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
        {/* Cart Items - Left Column */}
        <div className="lg:w-2/3">
          <div className="space-y-4 sm:space-y-6">
            {items.map((item) => {
              const product = loadedProducts[item.productId];
              const isBargainEligible =
                product?.bargainEnabled && !item.bargainCouponId;
              const itemPrice = item.discountedPrice || item.price;
              const imageUrl =
                item.images?.[0]?.url || product?.images?.[0]?.url;

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 shrink-0 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden self-center sm:self-start"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 hover:text-[#7C2C78] transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>

                            {/* Quantity Controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg border-gray-300 hover:border-gray-400"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </Button>

                                <span className="w-8 sm:w-10 text-center font-medium text-sm sm:text-base lg:text-lg">
                                  {item.quantity}
                                </span>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg border-gray-300 hover:border-gray-400"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity + 1,
                                    )
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 sm:gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 w-fit h-8 sm:h-9 px-2 sm:px-3"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">
                                  Remove
                                </span>
                              </Button>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="text-right min-w-[120px]">
                            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                              {formatCurrency(itemPrice * item.quantity)}
                            </p>
                            {item.discountedPrice && (
                              <p className="text-sm sm:text-base text-gray-500 line-through mt-0.5">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            )}
                            {item.bargainDiscount && (
                              <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                                Bargain: -{formatCurrency(item.bargainDiscount)}
                              </p>
                            )}
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {formatCurrency(itemPrice)} each
                            </p>
                          </div>
                        </div>

                        {/* Bargain Button for eligible products */}
                        {isBargainEligible && product && (
                          <div className="mt-4 sm:mt-5">
                            <BargainButton
                              product={{
                                id: item.productId,
                                name: item.name,
                                price: item.price,
                                discountedPrice: item.discountedPrice,
                                bargainEnabled:
                                  product?.bargainEnabled || false,
                                minBargainPrice: product?.minBargainPrice || 0,
                                maxBargainRounds:
                                  product?.maxBargainRounds || 3,
                                bargainValidityHours:
                                  product?.bargainValidityHours || 24,
                                images: item.images,
                              }}
                              // size="sm"
                              className="text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
                            />
                          </div>
                        )}

                        {/* Applied Bargain */}
                        {item.bargainCouponId && (
                          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                              <div className="flex items-center gap-1.5 sm:gap-2 text-green-700">
                                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="font-medium text-sm sm:text-base">
                                  Bargain Applied!
                                </span>
                                <span className="text-xs sm:text-sm">
                                  Save{" "}
                                  {formatCurrency(item.bargainDiscount || 0)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 sm:h-8 text-green-700 hover:text-green-800 hover:bg-green-100 text-xs sm:text-sm"
                                onClick={() =>
                                  handleRemoveBargain(item.productId)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Actions */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 gap-1.5 sm:gap-2 text-sm sm:text-base border-gray-300 hover:border-gray-400"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Continue Shopping
              </Button>
            </Link>

            <Button
              variant="destructive"
              className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 gap-1.5 sm:gap-2 text-sm sm:text-base"
              onClick={clearCart}
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary - Right Column */}
        <div className="lg:w-1/3">
          <div className="sticky top-6 space-y-4 sm:space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 lg:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 lg:mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">
                      Items ({getTotalItems()})
                    </span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatCurrency(getSubtotal())}
                    </span>
                  </div>

                  {/* Item Discounts */}
                  {getDiscountTotal() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm sm:text-base">
                        Item Discounts
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        -{formatCurrency(getDiscountTotal())}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    {/* Final Total */}
                    <div className="flex justify-between text-lg sm:text-xl lg:text-2xl font-bold">
                      <span>Total</span>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl lg:text-3xl text-gray-900">
                          {formatCurrency(calculateFinalTotal())}
                        </div>
                        {appliedGlobalCoupon && (
                          <div className="text-sm text-gray-500 line-through mt-0.5">
                            {formatCurrency(getGrandTotal())}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
                      Shipping & taxes calculated at checkout
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <Link href="/checkout" className="block">
                        <Button
                          size="lg"
                          className="w-full h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white gap-2"
                        >
                          Proceed to Checkout
                          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 rotate-180" />
                        </Button>
                      </Link>
                      {!session?.user && (
                        <Button
                          onClick={handleGuestCheckout}
                          variant="outline"
                          className="w-full h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50 gap-2"
                        >
                          Continue as Guest
                          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        </Button>
                      )}

                      <div className="text-xs text-gray-500 text-center mt-3 sm:mt-4">
                        By completing your purchase, you agree to our Terms of
                        Service
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
