// import { log } from './logger'

// const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
// const CLOUDFLARE_IMAGES_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN!

// if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_IMAGES_TOKEN) {
//   throw new Error('Missing Cloudflare Images environment variables')
// }

// // Generate unique ID for images
// export function generateImageId(): string {
//   return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
// }

// // Upload to Cloudflare Images (our primary storage + optimization)
// export async function uploadToCloudflareImages(
//   file: Buffer,
//   metadata: {
//     filename: string
//     contentType: string
//     width?: number
//     height?: number
//   }
// ): Promise<{
//   id: string
//   variants: {
//     public: string
//     thumb: string
//     gallery: string
//     blur: string
//   }
// }> {
//   try {
//     // Create FormData for Cloudflare Images API
//     const formData = new FormData()
//     const blob = new Blob([file], { type: metadata.contentType })
//     formData.append('file', blob, metadata.filename)

//     const uploadResponse = await fetch(
//       `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
//         },
//         body: formData,
//       }
//     )

//     console.log('Uploading to Cloudflare:', {
//   accountId: CLOUDFLARE_ACCOUNT_ID,
//   filename: metadata.filename,
//   size: file.length
// })
//     if (!uploadResponse.ok) {
//       const errorText = await uploadResponse.text()
//       log.error('Cloudflare Images upload failed', {
//         status: uploadResponse.status,
//         error: errorText,
//         filename: metadata.filename
//       })
//       throw new Error(`Upload failed: ${uploadResponse.status}`)
//     }

//     const uploadData = await uploadResponse.json()
    
//     // Check for API errors
//     if (!uploadData.success) {
//       const errorMsg = uploadData.errors?.[0]?.message || 'Upload failed'
//       throw new Error(errorMsg)
//     }

//     const imageId = uploadData.result.id

//     // Cloudflare Images auto-generates these variants
//     const variants = {
//       public: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/public`,
//       thumb: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/thumb`,
//       gallery: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/gallery`,
//       blur: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/blur`,
//     }

//     log.info('Image uploaded to Cloudflare Images', {
//       imageId,
//       filename: metadata.filename,
//       size: file.length
//     })
    
//     return {
//       id: imageId,
//       variants,
//     }
//   } catch (error) {
//     // Type-safe error handling
//     const errorMessage = error instanceof Error
//       ? error.message
//       : 'Cloudflare Images upload failed'
    
//     log.error('Cloudflare Images upload error', {
//       error: errorMessage,
//       filename: metadata.filename
//     })
//     throw new Error(errorMessage)
//   }
// }

// // Delete image from Cloudflare Images
// export async function deleteCloudflareImage(imageId: string): Promise<void> {
//   try {
//     const response = await fetch(
//       `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
//       {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
//         },
//       }
//     )

//     if (!response.ok) {
//       log.warn('Failed to delete image from Cloudflare Images', { imageId })
//     } else {
//       log.info('Image deleted from Cloudflare Images', { imageId })
//     }
//   } catch (error) {
//     const errorMessage = error instanceof Error
//       ? error.message
//       : 'Error deleting image'
    
//     log.error('Error deleting Cloudflare image', {
//       error: errorMessage,
//       imageId
//     })
//   }
// }

// // Get variant URLs helper
// export function getImageVariants(imageId: string) {
//   return {
//     public: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/public`,
//     thumb: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/thumb`,
//     gallery: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/gallery`,
//     blur: `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/blur`,
//   }
// }



// lib/cloudflare.ts - FIXED R2 VERSION
import { log } from './logger'
import crypto from 'crypto'

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const CLOUDFLARE_R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY!
const CLOUDFLARE_R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY!
const CLOUDFLARE_R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET!

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY_ID || !CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
  throw new Error('Missing Cloudflare R2 environment variables')
}

export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// AWS S4 Signature Helper
function getS3Signature(
  method: string,
  pathname: string,
  accessKeyId: string,
  secretAccessKey: string,
  region = 'auto'
) {
  const now = new Date()
  const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const datestamp = amzdate.substring(0, 8)
  
  const canonicalRequest = [
    method,
    pathname,
    '',
    `host:${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    `x-amz-content-sha256:UNSIGNED-PAYLOAD`,
    `x-amz-date:${amzdate}`,
    '',
    'host;x-amz-content-sha256;x-amz-date',
    'UNSIGNED-PAYLOAD'
  ].join('\n')

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzdate,
    `${datestamp}/${region}/s3/aws4_request`,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n')

  const getSignatureKey = (key: string, dateStamp: string, regionName: string, serviceName: string) => {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest()
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest()
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest()
    return crypto.createHmac('sha256', kService).update('aws4_request').digest()
  }

  const signingKey = getSignatureKey(secretAccessKey, datestamp, region, 's3')
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  return {
    amzdate,
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${datestamp}/${region}/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`
  }
}

export async function uploadToCloudflareImages(
  file: Buffer,
  metadata: {
    filename: string
    contentType: string
    width?: number
    height?: number
  }
): Promise<{
  id: string
  variants: {
    public: string
    thumb: string
    gallery: string
    blur: string
  }
}> {
  try {
    // Generate safe filename
    const safeFilename = metadata.filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .substring(0, 50)
        .replace(/^\.+/, '') // REMOVE LEADING DOTS!
    
    const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${safeFilename}`
    const pathname = `/${CLOUDFLARE_R2_BUCKET}/${fileName}`

    // Get AWS S4 signature
    const signature = getS3Signature(
      'PUT',
      pathname,
      CLOUDFLARE_R2_ACCESS_KEY_ID,
      CLOUDFLARE_R2_SECRET_ACCESS_KEY
    )

    // Upload to R2
    const uploadUrl = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com${pathname}`
    
    console.log('Uploading to R2:', {
      bucket: CLOUDFLARE_R2_BUCKET,
      filename: fileName,
      size: file.length,
      url: uploadUrl
    })

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Host': `${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        'Authorization': signature.authorization,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'x-amz-date': signature.amzdate,
        'Content-Type': metadata.contentType,
        'Content-Length': file.length.toString()
      },
      body: file,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('R2 Upload Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`R2 upload failed: ${response.status} ${response.statusText}`)
    }
const R2_PUBLIC_ENDPOINT = 'https://pub-b072b472844f414b9c691e5a9b16d1e1.r2.dev'

const publicUrl = `${R2_PUBLIC_ENDPOINT}/${fileName}`
console.log('Generated public URL:', publicUrl) // Check this in logs

    const imageId = generateImageId()

    log.info('Image uploaded to R2', {
      imageId,
      filename: metadata.filename,
      size: file.length,
      publicUrl
    })

    return {
      id: imageId,
      variants: {
        public: publicUrl,
        thumb: publicUrl,  // Same URL for now
        gallery: publicUrl,
        blur: '/placeholder-blur.jpg'
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'R2 upload failed'
    
    log.error('R2 upload error', {
      error: errorMessage,
      filename: metadata.filename
    })
    throw new Error(errorMessage)
  }
}

// Simple delete (you'll need to track filenames)
export async function deleteCloudflareImage(imageId: string): Promise<void> {
  log.warn('Delete not implemented for R2 yet', { imageId })
}

// Get image URLs (placeholder - need database tracking)
export function getImageVariants(imageId: string) {
  return {
    public: '/placeholder.jpg',
    thumb: '/placeholder.jpg',
    gallery: '/placeholder.jpg',
    blur: '/placeholder-blur.jpg',
  }
}