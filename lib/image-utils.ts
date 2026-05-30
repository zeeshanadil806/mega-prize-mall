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