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