import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ProductModel } from "@/models/Product"
import { BargainRequestModel } from "@/models/BargainRequest"
import { BargainCouponModel } from "@/models/BargainCoupon"
import { auth } from "@/auth"
import { log } from "@/lib/logger"
import { 
  generateBargainCouponCode, 
  validateBargainOffer,
  calculateDiscountPercentage,
  formatCurrency 
} from "@/lib/bargain-utils"
import { z } from "zod"

// Validation schema
const bargainSchema = z.object({
  productId: z.string().min(1),
  offeredPrice: z.number().positive(),
  message: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    await connectToDatabase()

    const body = await request.json()
    const validatedData = bargainSchema.parse(body)

    // Get product
    const product = await ProductModel.findById(validatedData.productId)
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if bargain is enabled
    if (!product.bargainEnabled) {
      return NextResponse.json(
        { error: "Bargain not enabled for this product" },
        { status: 400 }
      )
    }

    // Get user's previous bargain requests for this product
    const previousBargains = await BargainRequestModel.find({
      productId: product._id.toString(),
      userId,
      isActive: true,
    }).sort({ createdAt: -1 })

    const currentRound = previousBargains.length + 1
    
    // Validate if user can bargain (max rounds)
    if (currentRound > product.maxBargainRounds) {
      return NextResponse.json(
        { 
          error: `Maximum ${product.maxBargainRounds} bargain rounds reached`,
          currentRound,
          maxRounds: product.maxBargainRounds 
        },
        { status: 400 }
      )
    }

    const currentPrice = product.discountedPrice || product.price
    
    // Validate the offer
    const validation = validateBargainOffer(
      validatedData.offeredPrice,
      product.minBargainPrice || 0,
      currentPrice,
      currentRound,
      product.maxBargainRounds
    )

    if (!validation.valid) {
      // Create rejected bargain request
      const rejectedBargain = await BargainRequestModel.create({
        productId: product._id.toString(),
        userId,
        originalPrice: currentPrice,
        offeredPrice: validatedData.offeredPrice,
        minPrice: product.minBargainPrice || 0,
        status: 'rejected',
        message: validatedData.message,
        bargainRound: currentRound,
        maxRounds: product.maxBargainRounds,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })

      log.info("Bargain rejected", {
        productId: product._id.toString(),
        userId,
        offeredPrice: validatedData.offeredPrice,
        minPrice: product.minBargainPrice,
        round: currentRound,
      })

      return NextResponse.json({
        success: false,
        data: {
          status: 'rejected',
          message: validation.message,
          currentRound,
          maxRounds: product.maxBargainRounds,
          bargainId: rejectedBargain._id,
        }
      })
    }

    // Offer is acceptable - create accepted bargain request
    const discountPercentage = calculateDiscountPercentage(
      currentPrice,
      validatedData.offeredPrice
    )

    const savingAmount = currentPrice - validatedData.offeredPrice

    // Generate coupon
    const couponCode = generateBargainCouponCode()
    const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create accepted bargain request
    const acceptedBargain = await BargainRequestModel.create({
      productId: product._id.toString(),
      userId,
      originalPrice: currentPrice,
      offeredPrice: validatedData.offeredPrice,
      minPrice: product.minBargainPrice || 0,
      status: 'accepted',
      message: validatedData.message,
      couponCode,
      couponExpiresAt: validUntil,
      bargainRound: currentRound,
      maxRounds: product.maxBargainRounds,
      expiresAt: validUntil,
    })

    // Create bargain coupon
    const bargainCoupon = await BargainCouponModel.create({
      code: couponCode,
      productId: product._id.toString(),
      userId,
      bargainRequestId: acceptedBargain._id,
      originalPrice: currentPrice,
      discountedPrice: validatedData.offeredPrice,
      discountAmount: savingAmount,
      discountPercentage,
      validFrom: new Date(),
      validUntil,
    })

    log.info("Bargain accepted", {
      productId: product._id.toString(),
      userId,
      offeredPrice: validatedData.offeredPrice,
      couponCode,
      discountPercentage,
      round: currentRound,
    })

    return NextResponse.json({
      success: true,
      data: {
        status: 'accepted',
        message: validation.message,
        couponCode,
        validUntil,
        discountPercentage,
        savingAmount,
        currentRound,
        maxRounds: product.maxBargainRounds,
        bargainId: acceptedBargain._id,
        couponId: bargainCoupon._id,
        formatted: {
          originalPrice: formatCurrency(currentPrice),
          offeredPrice: formatCurrency(validatedData.offeredPrice),
          savingAmount: formatCurrency(savingAmount),
          discountPercentage: `${discountPercentage}%`,
        }
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error 
      ? error.message 
      : "Bargain processing failed"
    
    log.error("Bargain API error", { error: error as Error })
    
    return NextResponse.json(
      { error: "Bargain processing failed", details: errorMessage },
      { status: 500 }
    )
  }
}
interface IBargainRequest {
  userId: string;
  isActive: boolean;
  productId?: string;
  // ... add other fields if you need to query by them later
}
// GET: Get user's bargain history
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    const query: IBargainRequest = { userId, isActive: true }
    if (productId) {
      query.productId = productId
    }

    const bargainHistory = await BargainRequestModel.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    const formattedHistory = bargainHistory.map(bargain => ({
      id: bargain._id,
      productId: bargain.productId,
      originalPrice: bargain.originalPrice,
      offeredPrice: bargain.offeredPrice,
      status: bargain.status,
      discountPercentage: Math.round(
        ((bargain.originalPrice - bargain.offeredPrice) / bargain.originalPrice) * 100
      ),
      couponCode: bargain.couponCode,
      couponExpiresAt: bargain.couponExpiresAt,
      bargainRound: bargain.bargainRound,
      maxRounds: bargain.maxRounds,
      createdAt: bargain.createdAt,
      isExpired: bargain.couponExpiresAt 
        ? new Date() > new Date(bargain.couponExpiresAt)
        : false,
    }))

    return NextResponse.json({
      success: true,
      data: {
        history: formattedHistory,
        total: formattedHistory.length,
        currentRound: formattedHistory.filter(b => b.status !== 'rejected').length + 1,
      }
    })

  } catch (error) {
    // const errorMessage = error instanceof Error 
    //   ? error.message 
    //   : "Failed to fetch bargain history"
    
    log.error("Bargain history API error", { error: error as Error })
    
    return NextResponse.json(
      { error: "Failed to fetch bargain history" },
      { status: 500 }
    )
  }
}