// components/checkout/CheckoutClient.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart-store';
import CheckoutStep1 from './steps/CheckoutStep1';
import CheckoutStep2 from './steps/CheckoutStep2';
import CheckoutStep3 from './steps/CheckoutStep3';
import CheckoutSummary from './CheckoutSummary';
import { Loader2, ArrowLeft, Shield, Lock } from 'lucide-react';
import { Address, CheckoutState, CheckoutUser } from '@/types';

interface CheckoutClientProps {
  user: CheckoutUser;
  userId: string;
    addresses: Address[]; // Add this
}

export default function CheckoutClient({ user, userId, addresses }: CheckoutClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutState>({
    shippingAddress: null,
    billingAddress: null,
    useSameAddress: true,
    shippingMethod: 'standard',
    pointsToUse: 0,
    appliedCoupons: [],
    notes: '',
  });
  
  const { items, clearCart } = useCartStore();
  
  // Check if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
    }
  }, [items, router]);
  
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1 && !checkoutData.shippingAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    
    if (currentStep === 2 && !validateOrderSummary()) {
      return;
    }
    
    setCurrentStep(prev => Math.min(3, prev + 1));
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  const validateOrderSummary = () => {
    // Check product availability, prices, etc.
    return true;
  };
  
  const handlePlaceOrder = async () => {
    if (!checkoutData.shippingAddress) {
      toast.error('Please provide shipping address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        userId,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
          bargainCouponId: item.bargainCouponId,
          bargainDiscount: item.bargainDiscount,
        })),
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.useSameAddress 
          ? checkoutData.shippingAddress 
          : checkoutData.billingAddress,
        shippingMethod: checkoutData.shippingMethod,
        pointsToUse: checkoutData.pointsToUse,
        couponCodes: checkoutData.appliedCoupons.map(c => c.code),
        notes: checkoutData.notes,
      };
      
      const response = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      // Clear cart on success
      clearCart();
      
      // Redirect to order confirmation
      router.push(`/checkout/success?orderId=${data.orderId}`);
      
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Step titles
  const stepTitles = ['Shipping Address', 'Review & Pay', 'Confirmation'];
  
  return (
    <div className="min-h-screen bg-Linear-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your purchase in just 3 easy steps
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {stepTitles.map((title, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${currentStep > index + 1 ? 'bg-green-500 text-white' : 
                        currentStep === index + 1 ? 'bg-[#7C2C78] text-white' : 
                        'bg-gray-200 text-gray-400'}
                      font-semibold
                    `}>
                      {currentStep > index + 1 ? '✓' : index + 1}
                    </div>
                    <span className={`
                      mt-2 text-sm font-medium hidden sm:block
                      ${currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {title}
                    </span>
                  </div>
                ))}
                
                {/* Progress Line */}
                <div className="absolute left-1/2 right-1/2 top-5 h-0.5 bg-gray-200 -translate-y-1/2 z-0 hidden sm:block">
                  <motion.div 
                    className="h-full bg-[#7C2C78]"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: currentStep === 1 ? '0%' : 
                             currentStep === 2 ? '50%' : '100%' 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Secure Checkout</p>
                <p className="text-sm text-green-700">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
            
            {/* Steps Content */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckoutStep1
                          addresses={addresses} // Pass addresses
                      user={user}
                      checkoutData={checkoutData}
                      setCheckoutData={setCheckoutData}
                    />
                  </motion.div>
                )}
                
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckoutStep2
                      checkoutData={checkoutData}
                      setCheckoutData={setCheckoutData}
                      userId={userId}
                    />
                  </motion.div>
                )}
                
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckoutStep3
                      checkoutData={checkoutData}
                      isSubmitting={isSubmitting}
                      onPlaceOrder={handlePlaceOrder}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Navigation Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                {currentStep > 1 ? (
                  <button
                    onClick={handlePreviousStep}
                    className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <a 
                    href="/cart"
                    className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Cart
                  </a>
                )}
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-Linear-to-r from-[#7C2C78] to-[#A43875] text-black rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-black"
                  >
                    Continue to {currentStep === 1 ? 'Review' : 'Payment'}
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-Linear-to-r from-green-500 to-green-600 text-black border border-black rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              checkoutData={checkoutData}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}