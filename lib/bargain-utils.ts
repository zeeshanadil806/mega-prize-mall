// import { log } from './logger'

// Generate unique bargain coupon code
export function generateBargainCouponCode(): string {
  const prefix = 'BARGAIN-'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789' // No confusing chars
  let code = ''
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return prefix + code
}

// Calculate bargain discount percentage
export function calculateDiscountPercentage(originalPrice: number, offeredPrice: number): number {
  return Math.round(((originalPrice - offeredPrice) / originalPrice) * 100)
}

// Validate bargain offer
export function validateBargainOffer(
  offeredPrice: number,
  minPrice: number,
  originalPrice: number,
  currentRound: number,
  maxRounds: number
): {
  valid: boolean
  message: string
  status: 'acceptable' | 'too_low' | 'too_high' | 'max_rounds_reached'
} {
  // Check if max rounds reached
  if (currentRound >= maxRounds) {
    return {
      valid: false,
      message: `Maximum ${maxRounds} bargain rounds reached`,
      status: 'max_rounds_reached'
    }
  }

  // Check if offer is too low
  if (offeredPrice < minPrice) {
    // const difference = minPrice - offeredPrice
    return {
      valid: false,
      message: `Offer must be at least Rs ${minPrice}`,
      status: 'too_low'
    }
  }

  // Check if offer is too high (more than original price)
  if (offeredPrice >= originalPrice) {
    return {
      valid: false,
      message: 'Offer must be less than original price',
      status: 'too_high'
    }
  }

  // Check if offer is reasonable (at least 5% discount)
  const minDiscount = originalPrice * 0.05 // At least 5% discount
  if (offeredPrice > (originalPrice - minDiscount)) {
    return {
      valid: true,
      message: 'Offer accepted! Generating coupon...',
      status: 'acceptable'
    }
  }

  return {
    valid: true,
    message: 'Great offer! Generating coupon...',
    status: 'acceptable'
  }
}

// Calculate points for order (1 point per Rs 10)
export function calculatePointsForOrder(orderAmount: number): number {
  return Math.floor(orderAmount / 10) // 1 point per Rs 10
}

// Calculate max redeemable points (10% of order)
export function calculateMaxRedeemablePoints(orderAmount: number, userPoints: number): {
  maxPoints: number
  maxDiscount: number
  canRedeem: boolean
} {
  const maxDiscount = orderAmount * 0.1 // 10% of order
  const maxPoints = Math.floor(maxDiscount * 10) // Convert to points (10 points = Rs 1)
  const actualPoints = Math.min(userPoints, maxPoints)
  
  return {
    maxPoints: actualPoints,
    maxDiscount: actualPoints * 0.1, // Convert points to Rs
    canRedeem: actualPoints > 0
  }
}

// Format currency for Pakistan (PKR)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format points with description
export function formatPoints(points: number): string {
  return `${points.toLocaleString()} points (Rs ${(points * 0.1).toFixed(1)})`
}