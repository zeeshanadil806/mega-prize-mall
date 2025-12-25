import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ProductModel } from "@/models/Product"
import { auth } from "@/auth"
import { log } from "@/lib/logger"
import { z } from "zod"

const statusSchema = z.object({
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    await connectToDatabase()

    const body = await request.json()
    const validatedData = statusSchema.parse(body)

    // Update product status
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { 
        ...validatedData,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const updatedFields = Object.keys(validatedData)
    log.info("Product status updated", { 
      productId: id, 
      fields: updatedFields 
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: `Product ${updatedFields.join(", ")} updated`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    log.error("Error updating product status", { error: error as Error })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}