// app/(customer)/cart/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingBag,
  Tag,
  Loader2
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatCurrency } from '@/lib/bargain-utils';
import BargainButton  from '@/components/bargain/BargainButton';
import { toast } from 'sonner';
import Image from 'next/image';

// interface ProductDetails {
//   _id: string;
//   name: string;
//   bargainEnabled: boolean;
//   minBargainPrice?: number;
//   maxBargainRounds: number;
//   bargainValidityHours: number;
//   images?: Array<{ url: string }>;
// }

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity,
    clearCart,
    getSubtotal,
    getDiscountTotal,
    getGrandTotal,
    getTotalItems,
    // getBargainEligibleItems,
    // applyBargainToItem,
    removeBargainFromItem,
    loadedProducts,
    setLoadedProducts
  } = useCartStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedGlobalCoupon, setAppliedGlobalCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  
  // Fetch product details for all items in cart
  const fetchProductDetails = useCallback(async () => {
    if (items.length === 0) return;
    
    setIsLoading(true);
    try {
      const productIds = items.map(item => item.productId);
      const response = await fetch(`/api/products/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });
      
      if (response.ok) {
        const products = await response.json();
        setLoadedProducts(products);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  }, [items, setLoadedProducts]);
  
  // Fetch on mount and when items change
  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);
  
  // Handle bargain success
//   const handleBargainSuccess = useCallback((
//     productId: string, 
//     couponId: string, 
//     discountAmount: number
//   ) => {
//     applyBargainToItem(productId, couponId, discountAmount);
//     toast.success('Bargain applied to cart item!');
//   }, [applyBargainToItem]);
  
  // Handle bargain removal
  const handleRemoveBargain = useCallback((productId: string) => {
    removeBargainFromItem(productId);
    toast.info('Bargain removed from item');
  }, [removeBargainFromItem]);
  
  // Apply global coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          orderAmount: getSubtotal() - getDiscountTotal(),
        }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setAppliedGlobalCoupon({
          code: couponCode.toUpperCase(),
          discount: data.discountAmount || 0,
        });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
        console.log(error)
      toast.error('Failed to validate coupon');
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
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any products to your cart yet.
        </p>
        <Link href="/products">
          <Button size="lg" className="gap-2">
            <ShoppingBag className="h-5 w-5" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading product details...</span>
        </div>
      )}
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => {
              const product = loadedProducts[item.productId];
              const isBargainEligible = product?.bargainEnabled && !item.bargainCouponId;
              const itemPrice = item.discountedPrice || item.price;
              const imageUrl = item.images?.[0]?.url || product?.images?.[0]?.url;

              return (
                <Card key={item.productId}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="h-32 w-32 shrink-0 bg-muted rounded-lg overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            // fill
                            height={100}
                            width={100}
                            className="object-cover"
                            // sizes="(max-width: 768px) 100vw, 300px" // Adjust based on your card size
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link 
                              href={`/products/${item.slug}`}
                              className="text-xl font-semibold hover:underline"
                            >
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                          </div>
                          
                          {/* Pricing */}
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {formatCurrency(itemPrice * item.quantity)}
                            </p>
                            {item.discountedPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            )}
                            {item.bargainDiscount && (
                              <p className="text-sm text-green-600">
                                Bargain: -{formatCurrency(item.bargainDiscount)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Bargain Button for eligible products */}
                        {isBargainEligible && product && (
                          <div className="mt-4">
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
                            />
                          </div>
                        )}
                        
                        {/* Applied Bargain */}
                        {item.bargainCouponId && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-green-700">
                                <Tag className="h-4 w-4" />
                                <span className="font-medium">Bargain Applied!</span>
                                <span className="text-sm">
                                  Save {formatCurrency(item.bargainDiscount || 0)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-green-700 hover:text-green-800"
                                onClick={() => handleRemoveBargain(item.productId)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-8 flex justify-between">
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            
            <Button 
              variant="destructive" 
              className="gap-2"
              onClick={clearCart}
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({getTotalItems()})</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                
                {/* Item Discounts */}
                {getDiscountTotal() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Item Discounts</span>
                    <span>-{formatCurrency(getDiscountTotal())}</span>
                  </div>
                )}
                
                {/* Global Coupon Section */}
                <div className="pt-2 border-t">
                  <div className="mb-3">
                    <label className="text-sm font-medium mb-1 block">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 border rounded-md px-3 py-2 text-sm"
                        disabled={!!appliedGlobalCoupon}
                      />
                      {appliedGlobalCoupon ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setAppliedGlobalCoupon(null);
                            setCouponCode('');
                          }}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleApplyCoupon}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Applied Global Coupon */}
                  {appliedGlobalCoupon && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                      <div className="flex items-center justify-between text-blue-700">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span className="font-medium">{appliedGlobalCoupon.code}</span>
                          <span className="text-sm">
                            -{formatCurrency(appliedGlobalCoupon.discount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Shipping Estimate */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-sm">
                    {getGrandTotal() > 1000 ? 'FREE' : 'Rs 150'}
                  </span>
                </div>
                
                <Separator />
                
                {/* Final Total */}
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <div className="text-right">
                    <div className="text-2xl">{formatCurrency(calculateFinalTotal())}</div>
                    {appliedGlobalCoupon && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatCurrency(getGrandTotal())}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Shipping & taxes calculated at checkout
                </div>
                
                <Link href="/checkout">
                  <Button size="lg" className="w-full mt-4 gap-2">
                    Proceed to Checkout
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </Link>
                
                <div className="text-xs text-muted-foreground text-center mt-4">
                  By completing your purchase, you agree to our Terms of Service
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Points Redemption - Working Implementation */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Redeem Points</h3>
              <PointsRedemption 
                orderTotal={calculateFinalTotal()}
                onPointsApplied={(pointsUsed, discountAmount) => {
                  // Handle points redemption
                  toast.success(`Redeemed ${pointsUsed} points for Rs ${discountAmount}`);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Points Redemption Component
interface PointsRedemptionProps {
  orderTotal: number;
  onPointsApplied: (pointsUsed: number, discountAmount: number) => void;
}

function PointsRedemption({ orderTotal, onPointsApplied }: PointsRedemptionProps) {
  const [userPoints, setUserPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Calculate max redeemable points (10% of order)
  const calculateMaxPoints = () => {
    const maxDiscount = orderTotal * 0.1; // 10% of order
    const maxPoints = Math.floor(maxDiscount * 10); // Convert to points (10 points = Rs 1)
    return Math.min(userPoints, maxPoints);
  };
  
  const maxPoints = calculateMaxPoints();
  const maxDiscount = maxPoints * 0.1;
  
  const handleUseMaxPoints = () => {
    if (maxPoints > 0) {
      setPointsToUse(maxPoints);
      onPointsApplied(maxPoints, maxDiscount);
    }
  };
  
  const handleRedeemPoints = async (points: number) => {
    if (points <= 0 || points > maxPoints) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      });
      
      if (response.ok) {
        setPointsToUse(points);
        const discount = points * 0.1;
        onPointsApplied(points, discount);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to redeem points');
      }
    } catch (error) {
        console.log(error)
      toast.error('Failed to redeem points');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        You have <span className="font-semibold">{userPoints.toLocaleString()} points</span> available (Rs {(userPoints * 0.1).toFixed(2)})
      </p>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => handleRedeemPoints(100)}
          disabled={isLoading || maxPoints < 100}
        >
          <span>100 points</span>
          <span className="text-green-600">(Rs 10.00)</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => handleRedeemPoints(500)}
          disabled={isLoading || maxPoints < 500}
        >
          <span>500 points</span>
          <span className="text-green-600">(Rs 50.00)</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={handleUseMaxPoints}
          disabled={isLoading || maxPoints === 0}
        >
          <span>Use Maximum</span>
          <span className="text-green-600">
            ({maxPoints.toLocaleString()} points = Rs {maxDiscount.toFixed(2)})
          </span>
        </Button>
      </div>
      
      {pointsToUse > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between text-green-700">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="font-medium">{pointsToUse.toLocaleString()} points applied</span>
              <span className="text-sm">
                (Rs {(pointsToUse * 0.1).toFixed(2)})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-green-700 hover:text-green-800"
              onClick={() => setPointsToUse(0)}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </>
  );
}