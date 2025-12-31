export interface ImageProps {
  id: string
  url: string
  alt?: string
  order: number
  metadata: {
    width: number
    height: number
    size: number
    format: string
  }
}
export interface ProductProps {
  // Basic Info
  _id?: string
  name: string
  slug: string
  description: string
  shortDescription: string
  // Pricing
  price: number
  discountedPrice: number
  costPrice: number
  
  // Categorization
  category: string
  tags: string[]
  brand: string
  
  // Inventory
  sku: string
  stock: number
  
  // Specifications
  features: string[]
  specifications: Record<string, string>
  color: string
  
  // Gamification
  bargainEnabled: boolean
  minBargainPrice: number
  maxBargainRounds: number
  bargainValidityHours: number
  
  images?:ImageProps[]
  // SEO
  metaTitle: string
  metaDescription: string
  keywords: string[]
  
  // Status
  isActive: boolean
  isFeatured: boolean
  isBestSeller: boolean
  isNewArrival: boolean

  purchaseCount?: number
}

export interface CustomerProductProps {
  // Basic Info
  _id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  // Pricing
  price: number
  discountedPrice: number
  costPrice: number
  
  // Categorization
  category: string
  tags: string[]
  brand: string
  
  // Inventory
  sku: string
  stock: number
  
  // Specifications
  features: string[]
  specifications: Record<string, string>
  color: string
  
  // Gamification
  bargainEnabled: boolean
  minBargainPrice: number
  maxBargainRounds: number
  bargainValidityHours: number
  
  images?:ImageProps[]
  // SEO
  metaTitle: string
  metaDescription: string
  keywords: string[]
  
  // Status
  isActive: boolean
  isFeatured: boolean
  isBestSeller: boolean
  isNewArrival: boolean

  purchaseCount?: number
}
export interface EmailSubscriber {
  email: string;
  referralCode: string;
  points: number;
  subscribedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface BargainHistoryItem {
  id: string
  productId: string
  productName: string
  productImage?: string
  originalPrice: number
  offeredPrice: number
  status: 'accepted' | 'rejected' | 'pending' | 'expired'
  discountPercentage: number
  couponCode?: string
  couponExpiresAt?: string
  bargainRound: number
  maxRounds: number
  createdAt: string
  isExpired: boolean
  savingAmount: number
}

export interface ProductFilter {
  isActive?: boolean;
  category?: string;
  price?: {
    $gte?: number;
    $lte?: number;
  };
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  bargainEnabled: boolean;
  minBargainPrice: number;
  maxBargainRounds: number;
  bargainValidityHours: number;
  images?: Array<{ url: string; alt?: string }>;
  quantity: number;
  bargainCouponId?: string;
  bargainDiscount?: number;
}



// types/checkout.ts (Recommended) OR top of CheckoutClient.tsx

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label?: string;
  isDefault: boolean;
}

export interface AppliedCoupon {
  code: string;
  type: 'bargain' | 'global';
  discount: number;
}

export interface CheckoutState {
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useSameAddress: boolean;
  shippingMethod: string;
  pointsToUse: number;
  appliedCoupons: AppliedCoupon[];
  notes: string;
}

// The shape of the User object passed from the Server
export interface CheckoutUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
}


export interface OrderDetails {
  _id: string;
  // orderNumber: string;
  createdAt: string | Date; // Can accept ISO string or Date object
  shippingMethod: string;
  shippingAddress: Address;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
  pointsEarned: number;
}


export interface ClientAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ClientOrderItem {
  _id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  quantity: number;
  price: number;
  discountAmount: number;
  finalPrice: number;
  bargainCouponId?: string;
}

export interface ClientOrder {
  _id: string;
  userId: string;
  items: ClientOrderItem[];
  subtotal: number;
  discountTotal: number;
  pointsRedeemed: number;
  pointsValue: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  couponCodes: string[];
  bargainCouponIds: string[];
  shippingAddress: ClientAddress;
  billingAddress: ClientAddress;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  pointsEarned: number;
  luckyDrawEntries: number;
  luckyDrawEntryIds: string[];
  notes?: string;
  transactionId?: string;
  estimatedDelivery?: string;
  createdAt: string; 
  updatedAt: string;
}


export interface WalletTransaction {
  _id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'adjustment' | 'expiry' | 'refund';
  points: number;
  balanceAfter: number;
  rate: number;
  orderId?: string;
  productId?: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  // metadata: Record<string, any>;
  expiresAt?: string; // ISO date string
  processedAt?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}


export interface CompletedDraw {
  _id: string;
  title: string;
  prizeName: string;
  prizeImage?: string;
  resultDate?: Date;
  winnerName?: string;
  winnerEmail?: string;
  status: 'completed';
}