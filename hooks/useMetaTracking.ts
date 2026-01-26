"use client";

import { useCallback } from 'react';
import { useMetaPixel } from '@/lib/meta/client/meta-pixel';
import { STANDARD_EVENTS, CUSTOM_EVENTS } from '@/types/events';

export function useMetaTracking() {
  const { trackEvent } = useMetaPixel();

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
      content_name: productName,
      content_ids: [productId],
      content_type: 'product',
      contents: [{
        id: productId,
        quantity: 1,
        item_price: price,
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
      content_name: productName,
      content_ids: [productId],
      content_type: 'product',
      contents: [{
        id: productId,
        quantity,
        item_price: price,
      }],
    });
  }, [trackEvent]);

  /**
   * Track purchase initiation
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
    const contentIds = cartItems.map(item => item.productId);
    const contents = cartItems.map(item => ({
      id: item.productId,
      quantity: item.quantity,
      item_price: item.price,
    }));

    return trackEvent(STANDARD_EVENTS.INITIATE_CHECKOUT, {
      value: totalValue,
      currency,
      content_ids: contentIds,
      content_type: 'product',
      contents,
      num_items: cartItems.length,
    });
  }, [trackEvent]);

  /**
   * Complete purchase tracking
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
    const contentIds = orderData.items.map(item => item.productId);
    const contents = orderData.items.map(item => ({
      id: item.productId,
      quantity: item.quantity,
      item_price: item.price,
    }));

    // First, track client-side purchase
    const clientEventIdFinal = clientEventId || trackEvent(
      STANDARD_EVENTS.PURCHASE,
      {
        value: orderData.totalValue,
        currency: orderData.currency,
        content_ids: contentIds,
        content_type: 'product',
        contents,
        order_id: orderData.orderId,
        num_items: orderData.items.length,
      }
    );

    if (!clientEventIdFinal) {
      return { success: false };
    }

    // Note: Meta Conversion API would go here (server-side)
    // Similar to TikTok implementation
    
    return {
      success: true,
      event_id: clientEventIdFinal,
    };
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
      content_name: productName,
      content_ids: [productId],
      original_price: originalPrice,
      bargain_amount: originalPrice - bargainPrice,
      custom_data: {
        original_price: originalPrice,
        bargain_price: bargainPrice,
      },
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
      content_name: productName,
      content_ids: [productId],
      original_price: originalPrice,
      discount_amount: originalPrice - finalPrice,
      custom_data: {
        bargain_id: bargainId,
        discount_percentage: Math.round(((originalPrice - finalPrice) / originalPrice) * 100),
      },
    });
  }, [trackEvent]);

  /**
   * Track lucky draw entry (custom event)
   */
  const trackLuckyDrawEntry = useCallback((
    drawId: string,
    drawName: string,
    entryMethod: 'purchase' | 'points' | 'free'
  ): string | null => {
    return trackEvent(CUSTOM_EVENTS.LUCKY_DRAW_ENTERED, {
      content_name: drawName,
      custom_data: {
        draw_id: drawId,
        entry_method: entryMethod,
        draw_name: drawName,
      },
    });
  }, [trackEvent]);

  return {
    trackProductView,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchaseComplete,
    trackBargainInitiated,
    trackBargainAccepted,
    trackLuckyDrawEntry,
  };
}