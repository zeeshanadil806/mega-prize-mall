// components/checkout/CheckoutSummary.tsx - UPDATE
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/shared/format";
import { calculateMaxRedeemablePoints } from "@/features/wallet/domain";
import { STORE_CONFIG } from "@/shared/config";
import {
  Package,
  Shield,
  Truck,
  Ticket,
  Wallet,
  Check,
  X,
  Loader2,
  User,
} from "lucide-react";
import { AppliedCoupon, CheckoutState } from "@/types";
import { toast } from "sonner";
import { useSession } from "next-auth/react"; // ADD THIS

interface CheckoutSummaryProps {
  checkoutData: CheckoutState;
  setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutState>>;
  userId: string;
}

export default function CheckoutSummary({
  checkoutData,
  setCheckoutData,
  userId,
}: CheckoutSummaryProps) {
  const { data: session } = useSession(); // ADD THIS
  const { items, getSubtotal, getDiscountTotal, getGrandTotal } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [userPoints, setUserPoints] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Fetch user points (skip for guests)
  useEffect(() => {
    if (session?.user?.isGuest) {
      setUserPoints(0);
      return;
    }

    const fetchUserPoints = async () => {
      try {
        const response = await fetch("/api/user/points");
        if (response.ok) {
          const data = await response.json();
          setUserPoints(data.points || 0);
        }
      } catch (error) {
        console.error("Failed to fetch user points:", error);
      }
    };

    fetchUserPoints();
  }, [session?.user?.isGuest]);

  const subtotal = getSubtotal();
  const discountTotal = getDiscountTotal();
  const grandTotal = getGrandTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!mounted) {
    return (
      <div className="sticky top-24">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#7C2C78] mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading order summary...</p>
        </div>
      </div>
    );
  }

  // Calculate shipping
  const freeDeliveryThreshold = 2000;
  const shippingFee = grandTotal > freeDeliveryThreshold ? 0 : 150;

  // Points calculations (skip for guests)
  const maxPointsData = session?.user?.isGuest
    ? { maxPoints: 0, maxDiscount: 0 }
    : calculateMaxRedeemablePoints(grandTotal - shippingFee, userPoints);

  const pointsDiscount = checkoutData.pointsToUse * STORE_CONFIG.pointsToRupeeRate; // 10 points = Rs 1

  // Coupon discount
  const couponDiscount = checkoutData.appliedCoupons.reduce(
    (sum: number, coupon: AppliedCoupon) => sum + coupon.discount,
    0,
  );

  // Amount needed for free delivery (after discounts)
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
    grandTotal + shippingFee - couponDiscount - pointsDiscount,
  );

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplyingCoupon(true);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponInput.trim(),
          orderAmount: grandTotal + shippingFee,
          userId: session?.user?.isGuest ? undefined : userId,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        // Check if coupon already applied
        const alreadyApplied = checkoutData.appliedCoupons.some(
          (c: AppliedCoupon) => c.code === data.couponCode,
        );

        if (alreadyApplied) {
          toast.error("Coupon already applied");
          return;
        }

        // Check coupon compatibility
        if (data.couponType === "bargain") {
          const hasBargain = checkoutData.appliedCoupons.some(
            (c: AppliedCoupon) => c.type === "bargain",
          );

          if (hasBargain) {
            toast.error("Only one bargain coupon can be used per order");
            return;
          }
        }

        setCheckoutData((prev: CheckoutState) => ({
          ...prev,
          appliedCoupons: [
            ...prev.appliedCoupons,
            {
              code: data.couponCode,
              type: data.couponType,
              discount: data.discountAmount,
            },
          ],
        }));

        setCouponInput("");
        setShowCouponInput(false);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = (code: string) => {
    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      appliedCoupons: prev.appliedCoupons.filter(
        (c: AppliedCoupon) => c.code !== code,
      ),
    }));
    toast.info("Coupon removed");
  };

  // Points handling (disabled for guests)
  const handleUsePoints = (points: number) => {
    if (session?.user?.isGuest) return; // Prevent point usage for guests

    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      pointsToUse: points,
    }));
  };

  const handleUseMaxPoints = () => {
    if (session?.user?.isGuest) return; // Prevent point usage for guests

    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      pointsToUse: maxPointsData.maxPoints,
    }));
  };

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header with Guest Badge */}
        <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] p-6 text-white relative">
          <h3 className="text-xl font-bold mb-2">Order Summary</h3>
          <p className="text-white/80 text-sm">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in your order
          </p>
          {session?.user?.isGuest && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                <User className="h-3 w-3" />
                <span>Guest</span>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="p-6 max-h-80 overflow-y-auto">
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

        {/* Points Redemption Section (HIDDEN for guests) */}
        {!session?.user?.isGuest && userPoints > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#EAB75F]" />
                <span className="font-medium text-gray-900">Redeem Points</span>
              </div>
              <span className="text-sm text-gray-600">
                {userPoints.toLocaleString()} pts
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[100, 500, 1000].map((points) => (
                <button
                  key={points}
                  onClick={() => handleUsePoints(points)}
                  disabled={
                    points > maxPointsData.maxPoints || points > userPoints
                  }
                  className={`
                    p-2 border rounded-lg text-center transition-all text-sm
                    ${
                      checkoutData.pointsToUse === points
                        ? "border-[#7C2C78] bg-[#7C2C78]/10 text-[#7C2C78]"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="font-medium">{points}</div>
                  <div className="text-xs text-gray-600">
                    {formatCurrency(points * STORE_CONFIG.pointsToRupeeRate)}
                  </div>
                </button>
              ))}
            </div>

            {maxPointsData.maxPoints > 0 && (
              <button
                onClick={handleUseMaxPoints}
                className="w-full py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Use Max ({maxPointsData.maxPoints.toLocaleString()} pts ={" "}
                {formatCurrency(maxPointsData.maxDiscount)})
              </button>
            )}

            {checkoutData.pointsToUse > 0 && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between text-green-700 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3" />
                    <span className="font-medium">
                      {checkoutData.pointsToUse.toLocaleString()} points applied
                    </span>
                  </div>
                  <button
                    onClick={() => handleUsePoints(0)}
                    className="text-green-700 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guest Notice (SHOW for guests) */}
        {session?.user?.isGuest && (
          <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 text-sm">
                  Guest Checkout
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Create an account after ordering to earn points and track your
                  purchase.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Section (AVAILABLE for all) */}
        <div className="px-6 py-4 border-t border-gray-200">
          {!showCouponInput ? (
            <button
              onClick={() => setShowCouponInput(true)}
              className="w-full flex items-center justify-center gap-2 text-[#A43875] hover:text-[#7C2C78] transition-colors"
            >
              <Ticket className="h-4 w-4" />
              <span className="font-medium">Have a coupon code?</span>
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-[#A43875]" />
                  <span className="font-medium text-gray-900">
                    Apply Coupon
                  </span>
                </div>
                <button
                  onClick={() => setShowCouponInput(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                  disabled={applyingCoupon}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-[#7C2C78] text-white text-sm rounded-lg hover:bg-[#6A2566] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyingCoupon ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Applied Coupons */}
          {checkoutData.appliedCoupons.length > 0 && (
            <div className="mt-3 space-y-2">
              {checkoutData.appliedCoupons.map((coupon: AppliedCoupon) => (
                <div
                  key={coupon.code}
                  className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="h-3 w-3 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {coupon.code}
                    </span>
                    <span className="text-blue-700">
                      -{formatCurrency(coupon.discount)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveCoupon(coupon.code)}
                    className="text-blue-700 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free Delivery Progress */}
        {shippingFee > 0 && amountForFreeDelivery > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5 p-3 rounded-lg border border-[#7C2C78]/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Add {formatCurrency(amountForFreeDelivery)} more for FREE
                  delivery!
                </span>
                <span className="text-xs font-medium text-[#A43875]">
                  {Math.round(freeDeliveryProgress)}%
                </span>
              </div>

              <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${freeDeliveryProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(90deg, #7C2C78, #A43875)",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {discountTotal > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Item Discounts</span>
                <span>-{formatCurrency(discountTotal)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Coupon Discount</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            {!session?.user?.isGuest && pointsDiscount > 0 && (
              <div className="flex justify-between text-sm text-[#EAB75F]">
                <span>Points Redeemed</span>
                <span>-{formatCurrency(pointsDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span
                className={
                  shippingFee === 0
                    ? "text-green-600 font-medium"
                    : "font-medium"
                }
              >
                {shippingFee === 0 ? "FREE" : formatCurrency(shippingFee)}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-300">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <div className="text-right">
                  <div className="text-xl text-gray-900">
                    {formatCurrency(finalTotal)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Pay on delivery
                  </div>
                </div>
              </div>

              {/* Points Earned (HIDDEN for guests) */}
              {!session?.user?.isGuest && finalTotal > 0 && (
                <div className="mt-3 p-2 bg-linear-to-r from-[#EAB75F]/10 to-[#A43875]/10 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    You&apos;ll Earn
                  </div>
                  <div className="text-lg font-bold text-[#EAB75F]">
                    {Math.floor(finalTotal / 10).toLocaleString()} Points
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Create account to earn and redeem points
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security & Benefits */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  100% Secure Checkout
                </div>
                <div className="text-xs text-gray-600">
                  Encrypted & protected
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
          </div>
        </div>
      </div>
    </div>
  );
}
