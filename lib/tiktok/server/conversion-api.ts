import { TIKTOK_ACCESS_TOKEN, TIKTOK_CONVERSION_API_URL, isTestMode } from '../constants';
import type { TikTokContentItem, TikTokEventParams } from '@/types/events';
export interface ConversionApiRequest {
  pixel_code: string;
  event: string;
  event_id: string;
  timestamp: string;
  context: {
    ad?: {
      callback?: string;
    };
    user?: {
      email_sha256?: string;
      phone_sha256?: string;
      external_id?: string;
    };
    page?: {
      url: string;
      referrer: string;
    };
  };
  properties?: TikTokEventParams;
  test_event_code?: string;
}

export interface ConversionApiResponse {
  code: number;
  message: string;
  request_id: string;
  data?: {
    event_id: string;
    matched_events?: number;
  };
}

export interface PurchaseEventData {
  orderId: string;
  value: number;
  currency: string;
  contents: TikTokContentItem[];
  user?: {
    email?: string;
    phone?: string;
    external_id?: string;
  };
  ttclid?: string;
  pageUrl?: string;
}

export interface CustomEventData {
  eventName: string;
  eventId: string;
  params?: TikTokEventParams;
  userData?: {
    email?: string;
    phone?: string;
    external_id?: string;
  };
  ttclid?: string;
}

export class TikTokConversionAPI {
  private pixelId: string;
  private accessToken: string;

  constructor() {
    this.pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';
    this.accessToken = TIKTOK_ACCESS_TOKEN || '';
    
    if (!this.pixelId || !this.accessToken) {
      console.warn('TikTok Conversion API not configured - missing credentials');
    }
  }

  /**
   * Send event to TikTok Conversion API
   */
  async sendEvent(eventData: ConversionApiRequest): Promise<ConversionApiResponse> {
    if (!this.pixelId || !this.accessToken) {
      throw new Error('TikTok Conversion API not configured');
    }

    const requestBody: ConversionApiRequest = {
      ...eventData,
      pixel_code: this.pixelId,
    };

    // Add test event code if in test mode
    if (isTestMode) {
      requestBody.test_event_code = process.env.TIKTOK_TEST_EVENT_CODE;
    }

    try {
      const response = await fetch(TIKTOK_CONVERSION_API_URL, {
        method: 'POST',
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: ConversionApiResponse = await response.json();
      
      if (isTestMode) {
        console.log('[TikTok CAPI Response]', {
          event: eventData.event,
          event_id: eventData.event_id,
          response: data,
        });
      }

      return data;
    } catch (error) {
      console.error('Failed to send event to TikTok Conversion API:', error);
      throw error;
    }
  }

  /**
   * Prepare and send purchase event (Server-side)
   */
  async sendPurchaseEvent(
    eventId: string,
    orderData: PurchaseEventData
  ): Promise<ConversionApiResponse> {
    const { createHash } = await import('crypto');
    
    // Prepare user hashes
    const userHashes: Record<string, string> = {};
    
    if (orderData.user?.email) {
      userHashes.email_sha256 = createHash('sha256')
        .update(orderData.user.email.trim().toLowerCase())
        .digest('hex');
    }
    
    if (orderData.user?.phone) {
      userHashes.phone_sha256 = createHash('sha256')
        .update(orderData.user.phone.trim())
        .digest('hex');
    }
    
    if (orderData.user?.external_id) {
      userHashes.external_id = orderData.user.external_id;
    }

    const eventData: ConversionApiRequest = {
      pixel_code: this.pixelId,
      event: 'Purchase',
      event_id: eventId,
      timestamp: new Date().toISOString(),
      context: {
        ad: orderData.ttclid ? { callback: orderData.ttclid } : undefined,
        user: Object.keys(userHashes).length > 0 ? userHashes : undefined,
        page: {
          url: orderData.pageUrl || '',
          referrer: '',
        },
      },
      properties: {
        value: orderData.value,
        currency: orderData.currency,
        contents: orderData.contents,
        order_id: orderData.orderId,
      },
    };

    return this.sendEvent(eventData);
  }

  /**
   * Send custom event (Server-side)
   */
  async sendCustomEvent({
    eventName,
    eventId,
    params,
    userData,
    ttclid,
  }: CustomEventData): Promise<ConversionApiResponse> {
    const { createHash } = await import('crypto');
    
    // Prepare user hashes
    const userHashes: Record<string, string> = {};
    
    if (userData?.email) {
      userHashes.email_sha256 = createHash('sha256')
        .update(userData.email.trim().toLowerCase())
        .digest('hex');
    }
    
    if (userData?.phone) {
      userHashes.phone_sha256 = createHash('sha256')
        .update(userData.phone.trim())
        .digest('hex');
    }
    
    if (userData?.external_id) {
      userHashes.external_id = userData.external_id;
    }

    const eventData: ConversionApiRequest = {
      pixel_code: this.pixelId,
      event: eventName,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      context: {
        ad: ttclid ? { callback: ttclid } : undefined,
        user: Object.keys(userHashes).length > 0 ? userHashes : undefined,
        page: {
          url: '',
          referrer: '',
        },
      },
      properties: params,
    };

    return this.sendEvent(eventData);
  }
}

// Singleton instance
export const tiktokConversionAPI = new TikTokConversionAPI();
