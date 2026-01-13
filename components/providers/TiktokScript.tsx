"use client";

import { useEffect } from 'react';

// This ensures TikTok pixel loads early but only after consent
export default function TiktokScript() {
  useEffect(() => {
    // Check consent immediately on client
    const consent = localStorage.getItem('cookie_consent');
    const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
    
    if (consent === 'accepted' && pixelId && typeof window !== 'undefined') {
      // Load TikTok script directly if not already loaded
      if (!window.ttq) {
        const script = document.createElement('script');
        script.src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=${pixelId}`;
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  return null; // No UI
}