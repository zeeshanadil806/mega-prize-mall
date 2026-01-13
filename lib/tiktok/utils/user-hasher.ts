import { createHash } from 'crypto';

/**
 * SHA256 hash for GDPR-compliant user identification
 * Never send raw PII to TikTok
 */
export function hashData(data: string): string {
  if (!data) return '';
  
  return createHash('sha256')
    .update(data.trim().toLowerCase())
    .digest('hex');
}

/**
 * Extract and hash user data from session/cookies
 */
export function getUserHashes(): {
  email_sha256?: string;
  phone_sha256?: string;
  external_id?: string;
} {
  if (typeof window === 'undefined') {
    return {};
  }
  
const hashes: Record<string, string> = {};
  
  try {
    // Get from your auth system - adjust based on your implementation
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      
      if (user.email) {
        hashes.email_sha256 = hashData(user.email);
      }
      
      if (user.phone) {
        hashes.phone_sha256 = hashData(user.phone);
      }
      
      if (user.id) {
        hashes.external_id = user.id;
      }
    }
  } catch (error) {
    console.warn('Failed to get user hashes:', error);
  }
  
  return hashes;
}

/**
 * Extract ttclid from URL for ad attribution
 */
export function getTikTokClickId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ttclid') || undefined;
}