// components/checkout/steps/CheckoutStep2.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';
import { formatCurrency, calculateMaxRedeemablePoints } from '@/lib/bargain-utils';
import { Wallet, Ticket, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { AppliedCoupon, CheckoutState } from '@/types';

interface CheckoutStep2Props {
  checkoutData: CheckoutState;
  setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutState>>;
  userId: string;
}

export default function CheckoutStep2({ checkoutData, setCheckoutData, userId }: CheckoutStep2Props) {
  const { getSubtotal, getGrandTotal } = useCartStore();
  const [userPoints, setUserPoints] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  const subtotal = getSubtotal();
//   const discountTotal = getDiscountTotal();
  const grandTotal = getGrandTotal();
  
  // Calculate shipping
  const shippingFee = subtotal > 1000 ? 0 : 150;
  
  // Points calculations
  const maxPointsData = calculateMaxRedeemablePoints(grandTotal - shippingFee, userPoints);
  const pointsDiscount = (checkoutData.pointsToUse * 0.1); // 10 points = Rs 1
  
  // Final total
//   const couponDiscount = checkoutData.appliedCoupons.reduce((sum: number, coupon: any) => sum + coupon.discount, 0);
//   const finalTotal = Math.max(0, grandTotal + shippingFee - couponDiscount - pointsDiscount);
  
  useEffect(() => {
    // Fetch user points
    const fetchUserPoints = async () => {
      try {
        const response = await fetch('/api/user/points');
        if (response.ok) {
          const data = await response.json();
          setUserPoints(data.points || 0);
        }
      } catch (error) {
        console.error('Failed to fetch user points:', error);
      }
    };
    
    fetchUserPoints();
  }, []);
  
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    setApplyingCoupon(true);
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponInput.trim(),
          orderAmount: grandTotal + shippingFee,
          userId,
        }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        // Check if coupon already applied
        const alreadyApplied = checkoutData.appliedCoupons.some(
          (c: AppliedCoupon) => c.code === data.couponCode
        );
        
        if (alreadyApplied) {
          toast.error('Coupon already applied');
          return;
        }
        
        // Check coupon compatibility
        if (data.couponType === 'bargain') {
          // Check if already have bargain coupon applied
          const hasBargain = checkoutData.appliedCoupons.some(
            (c: AppliedCoupon) => c.type === 'bargain'
          );
          
          if (hasBargain) {
            toast.error('Only one bargain coupon can be used per order');
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
            }
          ]
        }));
        
        setCouponInput('');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast.error('Failed to validate coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };
  
  const handleRemoveCoupon = (code: string) => {
    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      appliedCoupons: prev.appliedCoupons.filter((c: AppliedCoupon) => c.code !== code)
    }));
    toast.info('Coupon removed');
  };
  
  const handleUsePoints = (points: number) => {
    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      pointsToUse: points,
    }));
  };
  
  const handleUseMaxPoints = () => {
    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      pointsToUse: maxPointsData.maxPoints,
    }));
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Review & Payment
      </h2>
      
      {/* Shipping Method */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Shipping Method</h3>
        <div className="grid gap-3">
          {[
            { id: 'standard', name: 'Standard Shipping', price: 150, time: '3-5 business days', freeOver: 1001 },
            { id: 'express', name: 'Express Shipping', price: 300, time: '1-2 business days' },
          ].map((method) => {
            const isFree = method.id === 'standard' && subtotal >= (method.freeOver || Infinity);
            const price = isFree ? 0 : method.price;
            
            return (
              <motion.label
                key={method.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="block cursor-pointer"
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={checkoutData.shippingMethod === method.id}
                  onChange={(e) => setCheckoutData((prev: CheckoutState) => ({ ...prev, shippingMethod: e.target.value }))}
                  className="sr-only"
                />
                <div className={`
                  p-4 border-2 rounded-xl transition-all
                  ${checkoutData.shippingMethod === method.id
                    ? 'border-[#7C2C78] bg-[#7C2C78]/5'
                    : 'border-gray-200 hover:border-gray-300'}
                `}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {method.time}
                        {isFree && <span className="ml-2 text-green-600 font-medium">FREE</span>}
                      </div>
                    </div>
                    <div className="text-lg font-bold">
                      {isFree ? 'FREE' : formatCurrency(price)}
                    </div>
                  </div>
                </div>
              </motion.label>
            );
          })}
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="grid gap-3">
          {[
            { id: 'cod', name: 'Cash on Delivery', icon: Wallet, description: 'Pay when you receive your order' },
            // { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Pay securely with your card' },
          ].map((method) => (
            <motion.label
              key={method.id}
              whileHover={{ scale: 1.01 }}
              className="block cursor-pointer"
            >
              <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <method.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {method.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {method.description}
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </motion.label>
          ))}
        </div>
      </div>
      
      {/* Points Redemption */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#EAB75F]" />
          Redeem Points
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="font-medium text-gray-900">
                You have {userPoints.toLocaleString()} points
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(userPoints * 0.1)} value
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Max {maxPointsData.maxPoints.toLocaleString()} points ({formatCurrency(maxPointsData.maxDiscount)})
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[100, 500, 1000].map((points) => (
              <button
                key={points}
                onClick={() => handleUsePoints(points)}
                disabled={points > maxPointsData.maxPoints || points > userPoints}
                className={`
                  p-2 border rounded-lg text-center transition-all
                  ${checkoutData.pointsToUse === points
                    ? 'border-[#7C2C78] bg-[#7C2C78]/10 text-[#7C2C78]'
                    : 'border-gray-300 hover:border-gray-400'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="font-medium">{points}</div>
                <div className="text-xs text-gray-600">
                  {formatCurrency(points * 0.1)}
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={handleUseMaxPoints}
            disabled={maxPointsData.maxPoints === 0}
            className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use Maximum ({maxPointsData.maxPoints.toLocaleString()} points = {formatCurrency(maxPointsData.maxDiscount)})
          </button>
          
          {checkoutData.pointsToUse > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between text-green-700">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">
                    {checkoutData.pointsToUse.toLocaleString()} points applied
                  </span>
                  <span className="text-sm">
                    (-{formatCurrency(pointsDiscount)})
                  </span>
                </div>
                <button
                  onClick={() => handleUsePoints(0)}
                  className="text-green-700 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Coupon Codes */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Ticket className="h-5 w-5 text-[#A43875]" />
          Apply Coupon
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
            disabled={applyingCoupon}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={applyingCoupon || !couponInput.trim()}
            className="px-6 py-3 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applyingCoupon ? 'Applying...' : 'Apply'}
          </button>
        </div>
        
        {/* Applied Coupons */}
        {checkoutData.appliedCoupons.length > 0 && (
          <div className="mt-4 space-y-2">
            {checkoutData.appliedCoupons.map((coupon: AppliedCoupon) => (
              <div
                key={coupon.code}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">
                      {coupon.code}
                    </div>
                    <div className="text-sm text-blue-700">
                      -{formatCurrency(coupon.discount)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCoupon(coupon.code)}
                  className="text-blue-700 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Order Notes */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Order Notes (Optional)</h3>
        <textarea
          value={checkoutData.notes}
          onChange={(e) => setCheckoutData((prev: CheckoutState) => ({ ...prev, notes: e.target.value }))}
          placeholder="Special instructions, delivery preferences, etc."
          className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent resize-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {checkoutData.notes.length}/500 characters
        </div>
      </div>
    </div>
  );
}