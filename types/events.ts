export interface TikTokEventBase {
  event: string;
  event_id: string;
  timestamp: string;
  context: {
    ad: {
      callback: string; // ttclid from URL
    };
    user: {
      email_sha256?: string;
      phone_sha256?: string;
      external_id?: string;
    };
    page: {
      url: string;
      referrer: string;
    };
  };
}

// Define all possible TikTok event properties
export interface TikTokStandardParams {
  value?: number;
  currency?: string;
  description?: string;
  query?: string;
  order_id?: string;
  coupon?: string;
  contents?: TikTokContentItem[];
  status?: 'success' | 'failure';
  payment_type?: string;
}

export interface TikTokContentItem {
  content_id: string;
  content_name: string;
  quantity: number;
  price: number;
  content_type?: string;
  content_category?: string;
}

// Custom event properties for your specific features
export interface TikTokCustomParams {
  // For Bargain events
  original_price?: number;
  bargain_amount?: number;
  bargain_id?: string;
  discount_amount?: number;
  
  // For Lucky Draw events
  draw_id?: string;
  draw_name?: string;
  entry_method?: 'purchase' | 'points' | 'free';
  prize_value?: number;
  
  // For Wallet events
  points_amount?: number;
  redemption_type?: string;
  wallet_balance?: number;
  
  // For Coupon events
  coupon_code?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  
  // For general custom events
  custom_field_1?: string | number | boolean;
  custom_field_2?: string | number | boolean;
  custom_field_3?: string | number | boolean;
}

// Union type for all possible parameters
export type TikTokEventParams = TikTokStandardParams & TikTokCustomParams;

export type TikTokEvent = TikTokEventBase & {
  properties?: TikTokEventParams;
};

// Standard TikTok Events
export const STANDARD_EVENTS = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  ADD_TO_CART: 'AddToCart',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  ADD_PAYMENT_INFO: 'AddPaymentInfo',
  PURCHASE: 'Purchase',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  CONTACT: 'Contact',
  SEARCH: 'Search',
} as const;

// Custom Events for Your Features
export const CUSTOM_EVENTS = {
  BARGAIN_INITIATED: 'BargainInitiated',
  BARGAIN_ACCEPTED: 'BargainAccepted',
  BARGAIN_REJECTED: 'BargainRejected',
  LUCKY_DRAW_ENTERED: 'LuckyDrawEntered',
  LUCKY_DRAW_WON: 'LuckyDrawWon',
  WALLET_REDEEMED: 'WalletRedeemed',
  POINTS_EARNED: 'PointsEarned',
  COUPON_APPLIED: 'CouponApplied',
  COUPON_GENERATED: 'CouponGenerated',
  REFERRAL_COMPLETED: 'ReferralCompleted',
  WISHLIST_ADDED: 'WishlistAdded',
  PRODUCT_REVIEWED: 'ProductReviewed',
} as const;

// Type for event names
export type TikTokEventName = 
  | typeof STANDARD_EVENTS[keyof typeof STANDARD_EVENTS]
  | typeof CUSTOM_EVENTS[keyof typeof CUSTOM_EVENTS];