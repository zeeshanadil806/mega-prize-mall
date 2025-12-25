import { log } from './logger'

// Types of coupons in our system
export type CouponType = 'bargain' | 'global' | 'loyalty'

interface CouponValidationResult {
  valid: boolean
  message: string
  discountAmount?: number
  discountPercentage?: number
  couponType?: CouponType
}

// Validate bargain coupon
export async function validateBargainCoupon(
  couponCode: string,
  productId: string,
  userId: string,
  currentPrice: number
): Promise<CouponValidationResult> {
  try {
    // Import model dynamically to avoid circular dependencies
    const { BargainCouponModel } = await import('@/models/BargainCoupon')
    
    const coupon = await BargainCouponModel.findOne({
      code: couponCode.toUpperCase(),
      productId,
      userId,
      isActive: true,
      isUsed: false,
    })

    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon for this product'
      }
    }

    // Check validity period
    const now = new Date()
    if (now < coupon.validFrom) {
      return {
        valid: false,
        message: 'Coupon not yet valid'
      }
    }

    if (now > coupon.validUntil) {
      return {
        valid: false,
        message: 'Coupon has expired'
      }
    }

    // Check if product price matches (within tolerance)
    const priceTolerance = currentPrice * 0.1 // 10% tolerance
    if (Math.abs(coupon.originalPrice - currentPrice) > priceTolerance) {
      return {
        valid: false,
        message: 'Product price has changed significantly'
      }
    }

    return {
      valid: true,
      message: 'Coupon applied successfully',
      discountAmount: coupon.discountAmount,
      discountPercentage: coupon.discountPercentage,
      couponType: 'bargain'
    }

  } catch (error) {
    log.error('Error validating bargain coupon', { error:error as Error, couponCode, productId })
    return {
      valid: false,
      message: 'Error validating coupon'
    }
  }
}

// Validate global coupon (for entire order)
export async function validateGlobalCoupon(
  couponCode: string,
  orderAmount: number,
//   userId?: string
): Promise<CouponValidationResult> {
  // This will be implemented when we create global coupons
  // For now, return mock validation
  const mockGlobalCoupons: Record<string, { discount: number; minOrder: number }> = {
    'WELCOME10': { discount: 10, minOrder: 500 },
    'FESTIVE20': { discount: 20, minOrder: 1000 },
  }

  const coupon = mockGlobalCoupons[couponCode.toUpperCase()]

  if (!coupon) {
    return {
      valid: false,
      message: 'Invalid coupon code'
    }
  }

  if (orderAmount < coupon.minOrder) {
    return {
      valid: false,
      message: `Minimum order of Rs ${coupon.minOrder} required`
    }
  }

  const discountAmount = (orderAmount * coupon.discount) / 100

  return {
    valid: true,
    message: `Global coupon applied: ${coupon.discount}% off`,
    discountAmount,
    discountPercentage: coupon.discount,
    couponType: 'global'
  }
}

// Check coupon compatibility (can't use bargain + global together)
export function checkCouponCompatibility(
  appliedCoupons: Array<{ type: CouponType; code: string }>
): {
  compatible: boolean
  message: string
  incompatibleTypes?: CouponType[]
} {
  const types = appliedCoupons.map(c => c.type)
  
  // Check if both bargain and global coupons are applied
  if (types.includes('bargain') && types.includes('global')) {
    return {
      compatible: false,
      message: 'Cannot use bargain coupons with global coupons',
      incompatibleTypes: ['bargain', 'global']
    }
  }

  // Check for duplicate coupon types
  const bargainCoupons = appliedCoupons.filter(c => c.type === 'bargain')
  if (bargainCoupons.length > 1) {
    // Check for duplicate product coupons (same product multiple times)
    const productIds = new Set()
    for (const coupon of bargainCoupons) {
      // We'll need to check product IDs from database
      // For now, just return compatible
    }
  }

  return {
    compatible: true,
    message: 'Coupons are compatible'
  }
}