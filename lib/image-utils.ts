// import sharp from 'sharp'
// import { generateImageId, uploadToR2, uploadToCloudflareImages } from './cloudflare'

// // Allowed image types and max size
// export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
// export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

// // Generate blur hash for image placeholder
// export async function generateBlurHash(imageBuffer: Buffer): Promise<string> {
//   try {
//     // For now, return a simple placeholder
//     // In production, use the blurhash library
//     return 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
//   } catch (error) {
//     return ''
//   }
// }

// // Process and upload image
// export async function processAndUploadImage(
//   file: File
// ): Promise<{
//   id: string
//   url: string
//   r2Key: string
//   blurHash: string
//   metadata: {
//     width: number
//     height: number
//     size: number
//     format: string
//     uploadedAt: Date
//   }
// }> {
//   // Validate file type
//   if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
//     throw new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`)
//   }

//   // Validate file size
//   if (file.size > MAX_IMAGE_SIZE) {
//     throw new Error(`File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
//   }

//   // Convert File to Buffer
//   const arrayBuffer = await file.arrayBuffer()
//   const buffer = Buffer.from(arrayBuffer)

//   // Get image metadata using sharp
//   const metadata = await sharp(buffer).metadata()
  
//   // Generate unique ID
//   const imageId = generateImageId()
  
//   // Upload to R2 (original backup)
//   const r2Result = await uploadToR2(buffer, file.name)
  
//   // Upload to Cloudflare Images (optimized versions)
//   const cfResult = await uploadToCloudflareImages(buffer, {
//     filename: file.name,
//     contentType: file.type,
//     width: metadata.width,
//     height: metadata.height,
//   })
  
//   // Generate blur hash
//   const blurHash = await generateBlurHash(buffer)
  
//   return {
//     id: imageId,
//     url: cfResult.variants.public, // Use public variant as primary URL
//     r2Key: r2Result.key,
//     blurHash,
//     metadata: {
//       width: metadata.width || 0,
//       height: metadata.height || 0,
//       size: file.size,
//       format: metadata.format || 'unknown',
//       uploadedAt: new Date(),
//     },
//   }
// }

// // Validate multiple images
// export function validateImages(files: File[]): {
//   valid: boolean
//   errors: string[]
// } {
//   const errors: string[] = []

//   if (files.length === 0) {
//     errors.push('At least one image is required')
//   }

//   if (files.length > 20) {
//     errors.push('Maximum 20 images allowed')
//   }

//   files.forEach((file, index) => {
//     if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
//       errors.push(`Image ${index + 1}: Invalid file type. Allowed: JPEG, PNG, WebP`)
//     }

//     if (file.size > MAX_IMAGE_SIZE) {
//       errors.push(`Image ${index + 1}: File too large. Maximum: 10MB`)
//     }
//   })

//   return {
//     valid: errors.length === 0,
//     errors,
//   }
// }


// lib/image-utils.ts

// Client-side image utilities (NO sharp, NO R2)

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

// Validate multiple images (Client-side)
export function validateImages(files: File[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (files.length === 0) {
    errors.push('At least one image is required')
  }

  if (files.length > 20) {
    errors.push('Maximum 20 images allowed')
  }

  files.forEach((file, index) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`Image ${index + 1}: Invalid file type. Allowed: JPEG, PNG, WebP`)
    }

    if (file.size > MAX_IMAGE_SIZE) {
      errors.push(`Image ${index + 1}: File too large. Maximum: 10MB`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Get image dimensions client-side (without sharp)
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: img.width, height: img.height })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: 0, height: 0 }) // Default if can't read
    }
    
    img.src = objectUrl
  })
}

// Simple blur hash generator (client-side, no dependencies)
export function generateSimpleBlurHash(): string {
  // Use a simple placeholder for now
  return 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}