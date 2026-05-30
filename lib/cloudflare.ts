// lib/cloudflare.ts - FIXED R2 VERSION
import { log } from './logger'
import crypto from 'crypto'

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const CLOUDFLARE_R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY!
const CLOUDFLARE_R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY!
const CLOUDFLARE_R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET!
// Public read-only R2 bucket endpoint. Falls back to the prior hardcoded value
// so existing deployments keep working until CLOUDFLARE_R2_PUBLIC_ENDPOINT is set.
const CLOUDFLARE_R2_PUBLIC_ENDPOINT =
  process.env.CLOUDFLARE_R2_PUBLIC_ENDPOINT ||
  'https://pub-b072b472844f414b9c691e5a9b16d1e1.r2.dev'

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
      body: file as unknown as BodyInit,
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

    const publicUrl = `${CLOUDFLARE_R2_PUBLIC_ENDPOINT}/${fileName}`
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
      error: error as Error,
      filename: metadata.filename
    })
    throw new Error(errorMessage)
  }
}