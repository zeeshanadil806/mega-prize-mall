// components/checkout/OrderSuccessClient.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { formatCurrency } from '@/shared/format';
import { useEffect } from 'react';
import { ClientOrder } from '@/types';
// import { useTikTokTracking } from '@/hooks/useTikTokTracking';
import { InvoiceGenerator } from '../orders/InvoiceGenerator';
import { useAllTracking } from '@/hooks/useAllTracking';

interface OrderSuccessClientProps {
  order: ClientOrder;
}

export default function OrderSuccessClient({ order }: OrderSuccessClientProps) {
  const { trackPurchaseComplete } = useAllTracking();

  useEffect(() => {
    async function trackPurchase() {

      try {

        // 2. Track purchase
        await trackPurchaseComplete(
          null, // client event ID (optional)
          {
            orderId: order._id,
            totalValue: order.grandTotal,
            currency: 'PKR',
            items: order.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
            })),
            // userEmail: order.shippingAddress.phone,
            userPhone: order.shippingAddress.phone,
            userId: order.userId,
          }
        );
      } catch (error) {
        console.error('Failed to track purchase:', error);
      }
    }

    trackPurchase();
  }, [order._id, order.grandTotal, order.items, order.shippingAddress.phone, order.userId, trackPurchaseComplete]);

  useEffect(() => {
    // Clear cart on success page load
    localStorage.removeItem('megaprize-cart');
  }, []);
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (order.shippingMethod === 'express' ? 2 : 5));
  
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex h-24 w-24 rounded-full bg-green-100 items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Your order <span className="font-bold text-[#011b54]">#{order._id}</span> has been placed successfully
            </p>
          </motion.div>
          
          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-8"
          >
            <div className="bg-linear-to-r from-[#011b54] to-[#022b82] p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm opacity-80">Order Number</div>
                  <div className="font-bold">{order._id}</div>
                </div>
                <div>
                  <div className="text-sm opacity-80">Date</div>
                  <div className="font-bold">
                    {new Date(order.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Delivery Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#011b54]" />
                    Delivery Information
                  </h3>
                  <div className="text-gray-600">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.postalCode}</p>
                    <p className="mt-2">📞 {order.shippingAddress.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#011b54]" />
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Total</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.discountTotal > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(order.discountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className={order.shippingFee === 0 ? 'text-green-600' : ''}>
                        {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Paid</span>
                        <span>{formatCurrency(order.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Estimated Delivery */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">
                      Estimated Delivery
                    </div>
                    <div className="text-blue-700">
                      {estimatedDelivery.toLocaleDateString('en-PK', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Points Earned */}
              {order.pointsEarned > 0 && (
                <div className="mt-6 p-4 bg-linear-to-r from-[#011b54]/5 to-[#022b82]/10 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">You&apos;ve Earned</div>
                    <div className="text-3xl font-bold text-[#011b54] mb-2">
                      {order.pointsEarned.toLocaleString()} Points
                    </div>
                    <div className="text-gray-600">
                      Points will be added to your account after delivery
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4 mb-8"
          >
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-center"
            >
                View All Orders
            </Link>
            
            {/* <button
              onClick={() => window.print()}
              className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-center"
            >
              <div className="font-medium text-gray-900 mb-1">
                Download Invoice
              </div>
              <div className="text-sm text-gray-600">
                Save for your records
              </div>
            </button> */}
            <InvoiceGenerator order={order}/>
          </motion.div>
          
          {/* Continue Shopping */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-6">
              Thank you for shopping with Mega Prize Mall!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-[#011b54] to-[#022b82] text-white rounded-xl hover:from-[#022b82] hover:to-[#03369f] transition-all shadow-lg hover:shadow-xl"
            >
              <Home className="h-5 w-5" />
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}