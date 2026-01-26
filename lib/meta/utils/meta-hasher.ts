"use client";

import { hashData, getUserHashes as getTikTokHashes } from '@/lib/tiktok/utils/user-hasher';

// Meta requires lowercase email hashes
export function getMetaUserHashes() {
  const hashes = getTikTokHashes();
  
  // Meta specific: ensure lowercase
  if (hashes.email_sha256) {
    hashes.email_sha256 = hashes.email_sha256.toLowerCase();
  }
  if (hashes.phone_sha256) {
    hashes.phone_sha256 = hashes.phone_sha256.toLowerCase();
  }
  
  return hashes;
}

// Get Facebook Click ID from cookies
export function getFbClickId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // Meta stores FBC in _fbc cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbc') {
      return value;
    }
  }
  return undefined;
}

// Get Facebook Browser ID from cookies
export function getFbBrowserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // Meta stores FBP in _fbp cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') {
      return value;
    }
  }
  return undefined;
}