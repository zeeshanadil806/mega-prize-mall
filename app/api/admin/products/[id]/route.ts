import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ProductModel, ProductSchema } from "@/models/Product"
import { requireSessionRoles } from "@/shared/http"
import { log } from "@/lib/logger"
import { z } from "zod"

// GET: Get single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    const { id } = await params
    await connectToDatabase()

    // Find product by ID
    const product = await ProductModel.findById(id)
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    log.info("Product fetched", { productId: id })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    log.error("Error fetching product", { error: error as Error })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT: Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    const { id } = await params
    await connectToDatabase()

    const body = await request.json()

    // Validate input
    const validatedData = ProductSchema.partial().parse(body)

    // Check if product exists
    const existingProduct = await ProductModel.findById(id)
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check for duplicate SKU or slug if changing
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const skuExists = await ProductModel.findOne({ 
        sku: validatedData.sku,
        _id: { $ne: id }
      })
      if (skuExists) {
        return NextResponse.json(
          { error: "SKU already exists" },
          { status: 409 }
        )
      }
    }

    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const slugExists = await ProductModel.findOne({ 
        slug: validatedData.slug,
        _id: { $ne: id }
      })
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        )
      }
    }

    // Update product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { 
        ...validatedData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    log.info("Product updated", { 
      productId: id, 
      updates: Object.keys(validatedData) 
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      )
    }

    log.error("Error updating product", { error: error as Error })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE: Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    const { id } = await params
    await connectToDatabase()

    // Find and delete product
    const product = await ProductModel.findByIdAndDelete(id)
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    log.info("Product deleted", { productId: id, name: product.name })

    // TODO: Delete associated images from Cloudflare

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    log.error("Error deleting product", { error: error as Error })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
