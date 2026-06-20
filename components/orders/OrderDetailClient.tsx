'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { 
  Package,
  Truck,
  CheckCircle,
  Home,
  CreditCard,
//   Download,
//   Printer,
  AlertCircle,
  ChevronLeft,
  MapPin,
  Phone,
  Calendar,
  Tag,
  Sparkles,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/shared/format';
import { STORE_CONFIG, getWhatsAppSupportLink } from '@/shared/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Progress } from '@/components/ui/progress';
import { InvoiceGenerator } from './InvoiceGenerator';
import { ClientOrder } from '@/types';
import Image from 'next/image';


interface OrderDetailClientProps {
  order: ClientOrder;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', description: 'Order confirmed by store' },
  { key: 'processing', label: 'Processing', description: 'Preparing your order' },
  { key: 'shipped', label: 'Shipped', description: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', description: 'Successfully delivered' },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
  returned: -1,
  refunded: -1,
};

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const currentStepIndex = statusIndex[order.status] || 0;
  const canCancel = ['pending'].includes(order.status);
  const canTrack = !['confirmed','cancelled', 'returned', 'refunded'].includes(order.status);
  
  const handleCancelOrder = async () => {
    try {
      setIsCancelling(true);
      const response = await fetch(`/api/orders/${order._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        router.refresh();
        setShowCancelDialog(false);
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
  {/* Header with Actions */}
  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
    <div className="flex-1 min-w-0">
      <Button variant="ghost" size="sm" asChild className="mb-2 sm:mb-3">
        <Link href="/dashboard/orders">
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
          Back to Orders
        </Link>
      </Button>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
        Order Details
      </h1>
      <p className="text-sm sm:text-base text-gray-600">
        Order ID: <span className="font-mono text-gray-800">{order._id.slice(-8).toUpperCase()}...</span>
      </p>
    </div>
    
    <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
      <InvoiceGenerator order={order} />

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
            disabled={!canCancel || isCancelling}
          >
            Cancel Order
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <AlertDescription className="text-sm sm:text-base">
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 sm:h-10 text-sm"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Order
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                className="h-9 sm:h-10 text-sm"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 animate-spin" />
                    Cancelling...
                  </>
                ) : 'Yes, Cancel Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  {/* Order Status Progress */}
  {canTrack && (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8">
      <div className="space-y-4 pb-12 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Order Status</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Estimated delivery: {order.estimatedDelivery 
                ? new Date(order.estimatedDelivery).toLocaleDateString('en-PK')
                : 'Calculating...'}
            </p>
          </div>
          <Badge className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 w-fit">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full"
              style={{ width: `${(currentStepIndex + 1) * 25}%` }}
            />
          </div>
          <div className="absolute inset-0 flex justify-between mt-3 sm:mt-4">
            {statusSteps.map((step, index) => (
              <div 
                key={step.key}
                className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-[#7C2C78]' : 'text-gray-400'}`}
              >
                <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
                  index <= currentStepIndex 
                    ? 'bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white' 
                    : 'bg-gray-200'
                }`}>
                  {index === 0 && <Package className="h-3 w-3 sm:h-4 sm:w-4" />}
                  {index === 1 && <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
                  {index === 2 && <Package className="h-3 w-3 sm:h-4 sm:w-4" />}
                  {index === 3 && <Truck className="h-3 w-3 sm:h-4 sm:w-4" />}
                  {index === 4 && <Home className="h-3 w-3 sm:h-4 sm:w-4" />}
                </div>
                <div className="text-center max-w-[60px] sm:max-w-20">
                  <p className="text-xs font-medium leading-tight">{step.label}</p>
                  {/* {index === currentStepIndex && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{step.description}</p>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Two Column Layout */}
  <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
    {/* Left Column - Order Items */}
    <div className="lg:w-2/3 space-y-4 sm:space-y-6">
      {/* Order Items */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-lg sm:text-xl">
            Order Items ({order.items.length})
          </h2>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-4 sm:space-y-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-3 sm:gap-4 pb-4 sm:pb-6 last:pb-0 border-b last:border-0 border-gray-100">
                {/* Product Image */}
                <Link href={`/products/${item.productSlug}`} className="shrink-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg border border-gray-200 overflow-hidden">
                    {item.productImage ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                          sizes="(max-width: 640px) 64px, 80px"
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productSlug}`}>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base hover:text-[#7C2C78] transition-colors line-clamp-2">
                          {item.productName}
                        </h4>
                      </Link>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        SKU: {item.productId.slice(-6).toUpperCase()}
                      </p>
                      {item.bargainCouponId && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          Bargain Applied
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-base sm:text-lg">
                        {formatCurrency(item.finalPrice * item.quantity)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.quantity} × {formatCurrency(item.finalPrice)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Item Actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm text-gray-700">Quantity: {item.quantity}</span>
                      {item.discountAmount > 0 && (
                        <span className="text-xs sm:text-sm text-green-600">
                          Saved: {formatCurrency(item.discountAmount)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-2.5 sm:px-3 text-xs sm:text-sm" asChild>
                        <Link href={`/products/${item.productSlug}`}>
                          Buy Again
                        </Link>
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm" className="h-8 px-2.5 sm:px-3 text-xs sm:text-sm" asChild>
                          <Link 
                            href={`https://wa.me/923254007037?text=${encodeURIComponent(`Hi, I'd like to share feedback/review for order ${order._id.slice(-8).toUpperCase()} on product: ${item.productName}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Write Review
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipping & Tracking */}
      {canTrack && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 text-lg sm:text-xl">Shipping & Tracking</h2>
          </div>
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">{order.shippingMethod.toUpperCase()} Shipping</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Tracking number will be available once shipped
                  </p>
                </div>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">Estimated Delivery</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {order.estimatedDelivery
                      ? new Date(order.estimatedDelivery).toLocaleDateString('en-PK', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Will be updated soon'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Right Column - Order Summary */}
    <div className="lg:w-1/3 space-y-4 sm:space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-lg sm:text-xl">Order Summary</h2>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm sm:text-base">Subtotal</span>
              <span className="font-medium text-sm sm:text-base">{formatCurrency(order.subtotal)}</span>
            </div>
            
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm sm:text-base">Discounts</span>
                <span className="font-medium text-sm sm:text-base">-{formatCurrency(order.discountTotal)}</span>
              </div>
            )}
            
            {order.pointsValue > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm sm:text-base">Points Redeemed</span>
                <span className="font-medium text-sm sm:text-base">-{formatCurrency(order.pointsValue)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm sm:text-base">Shipping</span>
              <span className="font-medium text-sm sm:text-base">
                {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            
            <div className="h-px bg-gray-200 my-2 sm:my-3" />
            
            <div className="flex justify-between text-base sm:text-lg lg:text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(order.grandTotal)}</span>
            </div>
            
            {order.pointsEarned > 0 && (
              <div className="flex items-center gap-2 p-3 bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5 rounded-lg mt-3 sm:mt-4">
                <Sparkles className="h-4 w-4 text-[#7C2C78]" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Points Earned</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    You earned {order.pointsEarned} points ({formatCurrency(order.pointsEarned * 0.1)})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-lg sm:text-xl">Shipping Address</h2>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base">{order.shippingAddress.fullName}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-xs sm:text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="text-xs sm:text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">{order.shippingAddress.country}</p>
              </div>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-700">{order.shippingAddress.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-lg sm:text-xl">Payment Information</h2>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                  <Badge 
                    variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
                    className="text-xs px-2 py-0.5"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
            
            {order.transactionId && (
              <>
                <div className="h-px bg-gray-200" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Transaction ID</p>
                  <p className="text-xs sm:text-sm font-mono text-gray-600 truncate">{order.transactionId}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lucky Draw Entry */}
      {order.luckyDrawEntries > 0 && (
        <div className="bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 rounded-xl sm:rounded-2xl border border-[#7C2C78]/20 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#7C2C78] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Lucky Draw Entries</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  You have {order.luckyDrawEntries} entry{order.luckyDrawEntries > 1 ? 's' : ''} for the next draw!
                </p>
                <Button 
                  variant="outline" 
                  className="w-full h-9 sm:h-10 mt-3 text-xs sm:text-sm border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78]/10"
                  asChild
                >
                  <Link href="/dashboard/lucky-draw">
                    View Lucky Draw Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Need Help Section */}
  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm mt-6 sm:mt-8">
    <div className="p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Need help with your order?</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Our support team is here to help with any questions or issues.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-9 sm:h-10 text-xs sm:text-sm" asChild>
            <Link href={getWhatsAppSupportLink(`Hello Mega Prize Mall! I need support regarding my order #${order._id.toString().slice(-8).toUpperCase()}`)} target="_blank">Contact Whatsapp</Link>
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none h-9 sm:h-10 text-xs sm:text-sm" asChild>
            <Link href="/dashboard/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}