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
import { Loader2, ArrowLeft, Shield, Lock, ArrowRight } from 'lucide-react';
import { Address, CheckoutState, CheckoutUser } from '@/types';
import { Button } from '../ui/button';
import Link from 'next/link';

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
      toast.success('Order Placed Successfully and your cart is empty.');
      // router.push('/cart');
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
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-6 sm:py-8">
  <div className="container mx-auto px-3 sm:px-4 lg:px-8">
    {/* Header */}
    <div className="mb-6 sm:mb-8 text-center">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2">
        Checkout
      </h1>
      <p className="text-sm sm:text-base text-gray-600">
        Complete your purchase in just 3 easy steps
      </p>
    </div>
    
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
      {/* Left Column - Checkout Steps */}
      <div className="lg:w-2/3">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="relative flex items-center justify-between mb-4 sm:mb-6">
            {stepTitles.map((title, index) => (
              <div key={index} className="relative flex flex-col items-center z-10">
                <div className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold
                  ${currentStep > index + 1 ? 'bg-green-500 text-white' : 
                    currentStep === index + 1 ? 'bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white shadow-lg' : 
                    'bg-gray-200 text-gray-400'}
                  transition-all duration-300
                `}>
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`
                  mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium
                  ${currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-400'}
                  text-center
                `}>
                  <span className="hidden xs:inline">{title}</span>
                  <span className="xs:hidden">Step {index + 1}</span>
                </span>
              </div>
            ))}
            
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-4 sm:top-5 h-0.5 sm:h-1 bg-gray-200 -translate-y-1/2 z-0 hidden xs:block">
              <motion.div 
                className="h-full bg-linear-to-r from-[#7C2C78] to-[#A43875]"
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
        <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-start sm:items-center gap-2.5 sm:gap-3">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="font-medium text-green-800 text-sm sm:text-base">
              Secure Checkout
            </p>
            <p className="text-xs sm:text-sm text-green-700">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
        
        {/* Steps Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 lg:p-6">
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
                    addresses={addresses}
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
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
              <div className="w-full sm:w-auto">
                {currentStep > 1 ? (
                  <Button
                    onClick={handlePreviousStep}
                    variant="outline"
                    className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 gap-1.5 sm:gap-2 text-sm sm:text-base border-gray-300 hover:border-gray-400"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Back
                  </Button>
                ) : (
                  <Link 
                    href="/cart"
                    className="inline-block w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 gap-1.5 sm:gap-2 text-sm sm:text-base border-gray-300 hover:border-gray-400"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Back to Cart
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="w-full sm:w-auto">
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white"
                  >
                    Continue to {currentStep === 1 ? 'Review' : 'Payment'}
                    <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column - Order Summary */}
      <div className="lg:w-1/3">
        <div className="sticky top-4 sm:top-6">
          <CheckoutSummary
            checkoutData={checkoutData}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  </div>
</div>
  );
}