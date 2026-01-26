"use client";

import { useCallback } from 'react';
import { useTikTokPixel } from '@/lib/tiktok/client/tiktok-pixel';
import { STANDARD_EVENTS, CUSTOM_EVENTS } from '@/types/events';

export function useTikTokTracking() {
      const { trackEvent } = useTikTokPixel();

  /**
   * Track product view with deduplication
   */
  const trackProductView = useCallback((
    productId: string,
    productName: string,
    price: number,
    currency: string = 'PKR'
  ): string | null => {
    return trackEvent(STANDARD_EVENTS.VIEW_CONTENT, {
      value: price,
      currency,
      description: productName,
      contents: [{
        content_id: productId,
        content_name: productName,
        quantity: 1,
        price,
      }],
    });
  }, [trackEvent]);

  /**
   * Track add to cart with deduplication
   */
  const trackAddToCart = useCallback((
    productId: string,
    productName: string,
    quantity: number,
    price: number,
    currency: string = 'PKR'
  ): string | null => {
    return trackEvent(STANDARD_EVENTS.ADD_TO_CART, {
      value: price * quantity,
      currency,
      contents: [{
        content_id: productId,
        content_name: productName,
        quantity,
        price,
      }],
    });
  }, [trackEvent]);

  /**
   * Track purchase initiation (client-side)
   * Returns event ID to be used for server-side deduplication
   */
  const trackInitiateCheckout = useCallback((
    cartItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>,
    totalValue: number,
    currency: string = 'PKR'
  ): string | null => {
    const contents = cartItems.map(item => ({
      content_id: item.productId,
      content_name: item.productName,
      quantity: item.quantity,
      price: item.price,
    }));

    return trackEvent(STANDARD_EVENTS.INITIATE_CHECKOUT, {
      value: totalValue,
      currency,
      contents,
    });
  }, [trackEvent]);

  /**
   * Track bargain initiation (custom event)
   */
  const trackBargainInitiated = useCallback((
    productId: string,
    productName: string,
    originalPrice: number,
    bargainPrice: number
  ): string | null => {
    return trackEvent(CUSTOM_EVENTS.BARGAIN_INITIATED, {
      value: bargainPrice,
      currency: 'PKR',
      original_price: originalPrice,
      bargain_amount: originalPrice - bargainPrice,
      contents: [{
        content_id: productId,
        content_name: productName,
        quantity: 1,
        price: bargainPrice,
      }],
    });
  }, [trackEvent]);

  /**
   * Track bargain accepted (custom event)
   */
  const trackBargainAccepted = useCallback((
    productId: string,
    productName: string,
    originalPrice: number,
    finalPrice: number,
    bargainId: string
  ): string | null => {
    return trackEvent(CUSTOM_EVENTS.BARGAIN_ACCEPTED, {
      value: finalPrice,
      currency: 'PKR',
      original_price: originalPrice,
      discount_amount: originalPrice - finalPrice,
      bargain_id: bargainId,
      contents: [{
        content_id: productId,
        content_name: productName,
        quantity: 1,
        price: finalPrice,
      }],
    });
  }, [trackEvent]);


  /**
   * Complete purchase tracking (call this from client to initiate server-side tracking)
   */
  const trackPurchaseComplete = useCallback(async (
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
  ): Promise<{ success: boolean; event_id?: string }> => {
    // First, track client-side purchase
    const clientEventIdFinal = clientEventId || trackEvent(
      STANDARD_EVENTS.PURCHASE,
      {
        value: orderData.totalValue,
        currency: orderData.currency,
        contents: orderData.items.map(item => ({
          content_id: item.productId,
          content_name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        order_id: orderData.orderId,
      }
    );

    if (!clientEventIdFinal) {
      return { success: false };
    }

    try {
      // Send to server-side conversion API
      const response = await fetch('/api/tiktok/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: STANDARD_EVENTS.PURCHASE,
          event_id: clientEventIdFinal,
          properties: {
            value: orderData.totalValue,
            currency: orderData.currency,
            contents: orderData.items,
            order_id: orderData.orderId,
          },
          user_data: {
            email: orderData.userEmail,
            phone: orderData.userPhone,
            external_id: orderData.userId,
          },
        }),
      });

      const result = await response.json();
      return {
        success: result.success,
        event_id: clientEventIdFinal,
      };
    } catch (error) {
      console.error('Failed to track purchase server-side:', error);
      return {
        success: false,
        event_id: clientEventIdFinal,
      };
    }
  }, [trackEvent]);

  return {
    trackProductView,
    trackAddToCart,
    trackInitiateCheckout,
    trackBargainInitiated,
    trackBargainAccepted,
    trackPurchaseComplete,
  };
}