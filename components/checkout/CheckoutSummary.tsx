// components/checkout/CheckoutSummary.tsx
"use client";

import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/bargain-utils";
import { Package, Shield, Truck } from "lucide-react";
import { AppliedCoupon, CheckoutState } from "@/types";

interface CheckoutSummaryProps {
  checkoutData: CheckoutState;
  currentStep: number;
}

export default function CheckoutSummary({
  checkoutData,
  currentStep,
}: CheckoutSummaryProps) {
  const { items, getSubtotal, getDiscountTotal, getGrandTotal } =
    useCartStore();

  const subtotal = getSubtotal();
  const discountTotal = getDiscountTotal();
  const grandTotal = getGrandTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate shipping
  const freeDeliveryThreshold = 2000;
  const shippingFee =
    checkoutData.shippingMethod === "express"
      ? 300
      : grandTotal > freeDeliveryThreshold
        ? 0
        : 150;

  // Calculate points discount
  const pointsDiscount = checkoutData.pointsToUse * 0.1; // 10 points = Rs 1

  // Calculate coupon discount
  const couponDiscount = checkoutData.appliedCoupons.reduce(
    (sum: number, coupon: AppliedCoupon) => sum + coupon.discount,
    0,
  );

  // Calculate amount needed for free delivery
  const amountForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - (grandTotal - couponDiscount - pointsDiscount),
  );

  // Progress percentage for free delivery
  const freeDeliveryProgress = Math.min(
    100,
    ((grandTotal - couponDiscount - pointsDiscount) / freeDeliveryThreshold) *
      100,
  );

  // Final total
  const finalTotal = Math.max(
    0,
    getGrandTotal() + shippingFee - couponDiscount - pointsDiscount,
  );

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Order Summary</h3>
          <p className="text-white/80 text-sm">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in your order
          </p>
        </div>

        {/* Items List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {items.map((item, index) => {
            const price = item.discountedPrice || item.price;
            const total = price * item.quantity;

            return (
              <motion.div
                key={`${item.productId}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                {/* Item Image */}
                <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {item.name}
                  </h4>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </div>
                    <div className="font-medium">{formatCurrency(total)}</div>
                  </div>

                  {/* Bargain Discount */}
                  {item.bargainDiscount && (
                    <div className="text-xs text-green-600 mt-1">
                      Bargain: -{formatCurrency(item.bargainDiscount)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Free Delivery Progress Bar */}
        {shippingFee > 0 && amountForFreeDelivery > 0 && (
          <div className="px-6 pb-4">
            <div className="bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5 p-4 rounded-xl border border-[#7C2C78]/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add{" "}
                  <span className="text-[#7C2C78] font-bold">
                    {formatCurrency(amountForFreeDelivery)}
                  </span>{" "}
                  more for FREE delivery!
                </span>
                <span className="text-xs font-medium text-[#A43875]">
                  {Math.round(freeDeliveryProgress)}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-3 bg-gray-200/80 rounded-full overflow-hidden relative">
                {/* Base Progress Fill */}
                <motion.div
                  className="h-full rounded-full absolute"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeDeliveryProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    background:
                      "linear-gradient(90deg, #7C2C78, #A43875, #EAB75F)",
                  }}
                />

                {/* Main Glow - Moving light streak */}
                <motion.div
                  className="h-full rounded-full absolute"
                  style={{
                    width: `${freeDeliveryProgress}%`,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                    filter: "blur(3px)",
                  }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 0.5,
                  }}
                />

                {/* Sparkle Particles Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="h-1 w-1 rounded-full absolute top-1"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 0 4px 1px rgba(234, 183, 95, 0.8)",
                    }}
                    initial={{ x: 0 }}
                    animate={{ x: `${freeDeliveryProgress * 10}px` }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full absolute top-1.5"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 0 6px 2px rgba(164, 56, 117, 0.8)",
                    }}
                    initial={{ x: "20px" }}
                    animate={{ x: `${freeDeliveryProgress * 10 + 20}px` }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>

                {/* Glowing Edge with soft blur */}
                <div
                  className="absolute h-full w-3 rounded-full"
                  style={{
                    left: `${freeDeliveryProgress}%`,
                    background:
                      "linear-gradient(90deg, rgba(124, 44, 120, 0.8), rgba(164, 56, 117, 0.8), rgba(234, 183, 95, 0.8))",
                    filter: "blur(4px)",
                    transform: "translateX(-50%)",
                    boxShadow: `
                      0 0 15px 3px rgba(124, 44, 120, 0.4),
                      0 0 20px 5px rgba(164, 56, 117, 0.3),
                      0 0 25px 7px rgba(234, 183, 95, 0.2)
                    `,
                  }}
                />

                {/* Subtle Pulse Effect */}
                <motion.div
                  className="h-full rounded-full absolute"
                  style={{
                    width: `${freeDeliveryProgress}%`,
                    background:
                      "linear-gradient(90deg, rgba(234, 183, 95, 0.1), rgba(164, 56, 117, 0.2), rgba(124, 44, 120, 0.1))",
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-600">Rs 0</span>
                <span className="text-xs text-gray-600">
                  {formatCurrency(freeDeliveryThreshold)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {discountTotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Item Discounts</span>
                <span>-{formatCurrency(discountTotal)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Coupon Discount</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            {pointsDiscount > 0 && (
              <div className="flex justify-between text-[#EAB75F]">
                <span>Points Redeemed</span>
                <span>-{formatCurrency(pointsDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span
                className={shippingFee === 0 ? "text-green-600" : "font-medium"}
              >
                {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <div className="text-right">
                  <div className="text-2xl text-gray-900">
                    {formatCurrency(finalTotal)}
                  </div>
                  {currentStep === 3 && (
                    <div className="text-sm text-gray-600 mt-1">
                      Pay on delivery
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Benefits */}
        <div className="border-t border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Secure Payment
                </div>
                <div className="text-xs text-gray-600">
                  100% secure & encrypted
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Free Shipping
                </div>
                <div className="text-xs text-gray-600">
                  On orders over {formatCurrency(freeDeliveryThreshold)}
                </div>
              </div>
            </div>

            {/* Points Earned Preview */}
            {currentStep === 3 && finalTotal > 0 && (
              <div className="mt-4 p-3 bg-linear-to-r from-[#EAB75F]/10 to-[#A43875]/10 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  You&apos;ll Earn
                </div>
                <div className="text-lg font-bold text-[#EAB75F]">
                  {Math.floor(finalTotal / 10).toLocaleString()} Points
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}