import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { uploadToCloudflareImages, generateImageId } from "@/lib/cloudflare"
import { auth } from "@/auth"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      )
    }

    // Validate file size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum: ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get image metadata using sharp (server-side only)
    const metadata = await sharp(buffer).metadata()
    
    // Generate unique ID
    const imageId = generateImageId()
    
    // Upload to Cloudflare Images (our primary storage)
    const cfResult = await uploadToCloudflareImages(buffer, {
      filename: file.name,
      contentType: file.type,
      width: metadata.width,
      height: metadata.height,
    })
    
    // Generate simple blur hash
    const blurHash = "L6PZfSi_.AyE_3t7t7R**0o#DgR4"

    log.info("Image uploaded successfully", { 
      imageId, 
      filename: file.name,
      size: file.size,
      variants: Object.keys(cfResult.variants)
    })

    return NextResponse.json({
      success: true,
      data: {
        id: imageId,
        url: cfResult.variants.public, // Main URL
        thumbUrl: cfResult.variants.thumb, // Thumbnail URL
        galleryUrl: cfResult.variants.gallery, // Gallery URL
        blurUrl: cfResult.variants.blur, // Blur placeholder URL
        blurHash,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          size: file.size,
          format: metadata.format || 'unknown',
          uploadedAt: new Date(),
        },
        // Store Cloudflare Image ID for future reference
        cloudflareId: cfResult.id,
      }
    }, { status: 201 })

  } catch (error) {
    // Type-safe error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Upload failed"
    
    log.error("Upload API error", { error: errorMessage })
    
    return NextResponse.json(
      { 
        success: false,
        error: "Upload failed",
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

// Set max duration for large uploads
export const maxDuration = 60 // 60 seconds
export const dynamic = 'force-dynamic'