"use client";

import { useTikTokTracking } from "@/hooks/useTikTokTracking";
import { useMetaTracking } from '@/hooks/useMetaTracking'; // We'll create this next

export function useCombinedTracking() {
  const tiktok = useTikTokTracking();
  const meta = useMetaTracking(); // Coming next
  
  // Combined functions that track to both platforms
  const trackProductView = (
    productId: string,
    productName: string,
    price: number,
    currency: string = 'PKR'
  ) => {
    tiktok.trackProductView(productId, productName, price, currency);
    meta.trackProductView(productId, productName, price, currency);
  };
  
  const trackAddToCart = (
    productId: string,
    productName: string,
    quantity: number,
    price: number,
    currency: string = 'PKR'
  ) => {
    tiktok.trackAddToCart(productId, productName, quantity, price, currency);
    meta.trackAddToCart(productId, productName, quantity, price, currency);
  };
  
  // ... similar for other events
  
  return {
    trackProductView,
    trackAddToCart,
    trackInitiateCheckout: tiktok.trackInitiateCheckout,
    trackPurchaseComplete: tiktok.trackPurchaseComplete,
    trackBargainInitiated: tiktok.trackBargainInitiated,
    trackBargainAccepted: tiktok.trackBargainAccepted,
    // trackLuckyDrawEntry: tiktok.trackLuckyDrawEntry,
    // Meta-specific functions available through meta object
    meta,
    tiktok,
  };
}