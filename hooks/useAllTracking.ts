"use client";

import { useTikTokTracking } from './useTikTokTracking';
import { useMetaTracking } from './useMetaTracking';

export function useAllTracking() {
  const tiktok = useTikTokTracking();
  const meta = useMetaTracking();

  // Combined tracking functions
  const trackProductView = (
    productId: string,
    productName: string,
    price: number,
    currency: string = 'PKR'
  ) => {
    const tiktokId = tiktok.trackProductView(productId, productName, price, currency);
    const metaId = meta.trackProductView(productId, productName, price, currency);
    return { tiktokId, metaId };
  };

  const trackAddToCart = (
    productId: string,
    productName: string,
    quantity: number,
    price: number,
    currency: string = 'PKR'
  ) => {
    const tiktokId = tiktok.trackAddToCart(productId, productName, quantity, price, currency);
    const metaId = meta.trackAddToCart(productId, productName, quantity, price, currency);
    return { tiktokId, metaId };
  };

  const trackInitiateCheckout = (
    cartItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>,
    totalValue: number,
    currency: string = 'PKR'
  ) => {
    const tiktokId = tiktok.trackInitiateCheckout(cartItems, totalValue, currency);
    const metaId = meta.trackInitiateCheckout(cartItems, totalValue, currency);
    return { tiktokId, metaId };
  };

  const trackPurchaseComplete = async (
    clientEventId: string | null,
    orderData: {
      orderId: string;
      totalValue: number;
      currency: string;
      items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
      }>;
      userEmail?: string;
      userPhone?: string;
      userId?: string;
    }
  ) => {
    const tiktokResult = await tiktok.trackPurchaseComplete(clientEventId, orderData);
    const metaResult = await meta.trackPurchaseComplete(clientEventId, orderData);
    
    return {
      success: tiktokResult.success || metaResult.success,
      tiktokEventId: tiktokResult.event_id,
      metaEventId: metaResult.event_id,
    };
  };

  // For custom events, track to both
  const trackBargainInitiated = (
    productId: string,
    productName: string,
    originalPrice: number,
    bargainPrice: number
  ) => {
    const tiktokId = tiktok.trackBargainInitiated(productId, productName, originalPrice, bargainPrice);
    const metaId = meta.trackBargainInitiated(productId, productName, originalPrice, bargainPrice);
    return { tiktokId, metaId };
  };

  const trackBargainAccepted = (
    productId: string,
    productName: string,
    originalPrice: number,
    finalPrice: number,
    bargainId: string
  ) => {
    const tiktokId = tiktok.trackBargainAccepted(productId, productName, originalPrice, finalPrice, bargainId);
    const metaId = meta.trackBargainAccepted(productId, productName, originalPrice, finalPrice, bargainId);
    return { tiktokId, metaId };
  };

  const trackLuckyDrawEntry = (
    drawId: string,
    drawName: string,
    entryMethod: 'purchase' | 'points' | 'free'
  ) => {
    // const tiktokId = tiktok.trackLuckyDrawEntry(drawId, drawName, entryMethod);
    const metaId = meta.trackLuckyDrawEntry(drawId, drawName, entryMethod);
    // return { tiktokId, metaId };
    return { metaId };
  };

  return {
    // Combined functions
    trackProductView,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchaseComplete,
    trackBargainInitiated,
    trackBargainAccepted,
    trackLuckyDrawEntry,
    
    // Individual platform access if needed
    tiktok,
    meta,
  };
}