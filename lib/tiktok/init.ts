"use client";

let isInitialized = false;
let pixelId: string | null = null;

export function initTikTokPixel(pixelIdParam: string) {
  if (isInitialized || !pixelIdParam) return;
  
  pixelId = pixelIdParam;
  
  if (typeof window === 'undefined') return;
  
  // Check if already loaded
  if (window.ttq) {
    isInitialized = true;
    return;
  }

  const script = document.createElement('script');
  script.src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=${pixelIdParam}`;
  script.async = true;
  script.onload = () => {
    if (window.ttq) {
      window.ttq.load(pixelIdParam);
      window.ttq.page();
      isInitialized = true;
    }
  };
  
  document.head.appendChild(script);
}

export function getTikTokPixelStatus() {
  return {
    isInitialized,
    pixelId,
    hasWindow: typeof window !== 'undefined',
    hasTtq: typeof window !== 'undefined' && !!window.ttq,
  };
}