// components/checkout/steps/CheckoutStep3.tsx
'use client';

import { CheckoutState } from '@/types';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Home, Clock } from 'lucide-react';

interface CheckoutStep3Props {
  checkoutData: CheckoutState;
  isSubmitting: boolean;
  onPlaceOrder: () => void;
}

export default function CheckoutStep3({ checkoutData }: CheckoutStep3Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Order Confirmation
      </h2>
      
      {/* Confirmation Message */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex h-20 w-20 rounded-full bg-green-100 items-center justify-center mb-4"
        >
          <CheckCircle className="h-10 w-10 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Ready to Place Your Order?
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Please review your order details below before confirming
        </p>
      </div>
      
      {/* Order Summary Preview */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4">Order Summary</h4>
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          {/* Shipping Address */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Shipping to</div>
              <div className="text-gray-600 text-sm">
                {checkoutData.shippingAddress?.fullName}<br />
                {checkoutData.shippingAddress?.addressLine1}<br />
                {checkoutData.shippingAddress?.city}, {checkoutData.shippingAddress?.state}<br />
                📞 {checkoutData.shippingAddress?.phone}
              </div>
            </div>
          </div>
          
          {/* Delivery */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Delivery</div>
              <div className="text-gray-600 text-sm">
                {checkoutData.shippingMethod === 'standard' ? 'Standard (3-5 business days)' : 'Express (1-2 business days)'}
              </div>
            </div>
          </div>
          
          {/* Payment */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Payment</div>
              <div className="text-gray-600 text-sm">
                Cash on Delivery (Pay when you receive)
              </div>
            </div>
          </div>
          
          {/* Estimated Delivery */}
          <div className="flex items-start gap-3 pt-4 border-t">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Estimated Delivery</div>
              <div className="text-gray-600 text-sm">
                {(() => {
                  const today = new Date();
                  const deliveryDays = checkoutData.shippingMethod === 'express' ? 2 : 5;
                  today.setDate(today.getDate() + deliveryDays);
                  return today.toLocaleDateString('en-PK', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Terms & Conditions */}
      <div className="mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Important Information</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Your order will be processed within 24 hours</li>
            <li>• You&apos;ll receive order confirmation via email</li>
            <li>• You can track your order in your account dashboard</li>
            <li>• For any issues, contact support at support@megaprizemall.com</li>
            <li>• Returns accepted within 10 days of delivery</li>
          </ul>
        </div>
      </div>
      
      {/* Confirmation Check */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="confirmTerms"
          defaultChecked
          className="h-5 w-5 text-[#7C2C78] focus:ring-[#7C2C78] border-gray-300 rounded mt-1"
        />
        <label htmlFor="confirmTerms" className="text-gray-700">
          I confirm that I have read and agree to the{' '}
          <a href="/terms" className="text-[#7C2C78] hover:underline">Terms & Conditions</a>{' '}
          and <a href="/privacy" className="text-[#7C2C78] hover:underline">Privacy Policy</a>.
          I understand that this order is subject to product availability.
        </label>
      </div>
    </div>
  );
}