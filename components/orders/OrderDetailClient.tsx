'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/bargain-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { InvoiceGenerator } from './InvoiceGenerator';
import { ClientOrder } from '@/types';


interface OrderDetailClientProps {
  order: ClientOrder;
  userId: string;
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

export function OrderDetailClient({ order, userId }: OrderDetailClientProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const currentStepIndex = statusIndex[order.status] || 0;
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canTrack = !['cancelled', 'returned', 'refunded'].includes(order.status);
  
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

//   const handleDownloadInvoice = async () => {
//     try {
//       const response = await fetch(`/api/orders/${order._id}/invoice`);
//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `invoice-${order._id.slice(-8)}.pdf`;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error('Error downloading invoice:', error);
//     }
//   };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/orders">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">
            Order ID: <span className="font-mono">{order._id.slice(-8).toUpperCase()}...</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <InvoiceGenerator order={order} userId={userId} />

          {/* <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button> */}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                disabled={!canCancel || isCancelling}
              >
                Cancel Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCancelDialog(false)}
                  >
                    Keep Order
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Order Status Progress */}
      {canTrack && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Order Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: {order.estimatedDelivery 
                      ? new Date(order.estimatedDelivery).toLocaleDateString('en-PK')
                      : 'Calculating...'}
                  </p>
                </div>
                <Badge className="text-sm px-3 py-1">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <Progress value={(currentStepIndex + 1) * 25} className="h-2" />
                <div className="absolute inset-0 flex justify-between mt-3">
                  {statusSteps.map((step, index) => (
                    <div 
                      key={step.key}
                      className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                        index <= currentStepIndex 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {index === 0 && <Package className="h-4 w-4" />}
                        {index === 1 && <CheckCircle className="h-4 w-4" />}
                        {index === 2 && <Package className="h-4 w-4" />}
                        {index === 3 && <Truck className="h-4 w-4" />}
                        {index === 4 && <Home className="h-4 w-4" />}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{step.label}</p>
                        {index === currentStepIndex && (
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0 border-b last:border-0">
                    {/* Product Image */}
                    <div className="shrink-0">
                      <Link href={`/products/${item.productSlug}`}>
                        <div className="h-20 w-20 rounded-lg border overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-full w-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/products/${item.productSlug}`}>
                            <h4 className="font-semibold hover:text-primary transition-colors">
                              {item.productName}
                            </h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.productId.slice(-6).toUpperCase()}
                          </p>
                          {item.bargainCouponId && (
                            <Badge variant="outline" className="mt-1">
                              <Tag className="h-3 w-3 mr-1" />
                              Bargain Applied
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.finalPrice * item.quantity)}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.finalPrice)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Item Actions */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-4">
                          <span className="text-sm">Quantity: {item.quantity}</span>
                          {item.discountAmount > 0 && (
                            <span className="text-sm text-green-600">
                              Saved: {formatCurrency(item.discountAmount)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/products/${item.productSlug}`}>
                              Buy Again
                            </Link>
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/products/${item.productSlug}/review`}>
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
            </CardContent>
          </Card>

          {/* Shipping & Tracking */}
          {canTrack && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{order.shippingMethod.toUpperCase()} Shipping</h4>
                      <p className="text-sm text-muted-foreground">
                        Tracking number will be available once shipped
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Estimated Delivery</h4>
                      <p className="text-sm text-muted-foreground">
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discounts</span>
                    <span>-{formatCurrency(order.discountTotal)}</span>
                  </div>
                )}
                
                {order.pointsValue > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Redeemed</span>
                    <span>-{formatCurrency(order.pointsValue)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.grandTotal)}</span>
                </div>
                
                {order.pointsEarned > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg mt-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Points Earned</p>
                      <p className="text-sm text-muted-foreground">
                        You earned {order.pointsEarned} points ({formatCurrency(order.pointsEarned * 0.1)})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p className="text-sm text-muted-foreground">{order.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.shippingAddress.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}>
                        {order.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
                
                {order.transactionId && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Transaction ID</p>
                      <p className="text-sm font-mono text-muted-foreground">{order.transactionId}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lucky Draw Entry */}
          {order.luckyDrawEntries > 0 && (
            <Card className="bg-linear-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Lucky Draw Entries
                </CardTitle>
                <CardDescription>
                  You have {order.luckyDrawEntries} entry{order.luckyDrawEntries > 1 ? 's' : ''} for the next draw!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-300" asChild>
                  <Link href="/lucky-draw">
                    View Lucky Draw Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Need Help Section */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold">Need help with your order?</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here to help with any questions or issues.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/support">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/orders">View All Orders</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}