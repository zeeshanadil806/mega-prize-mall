"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTikTokPixel } from '@/lib/tiktok/client/tiktok-pixel';
import Link from 'next/link';
import { useMetaPixel } from '@/lib/meta/client/meta-pixel';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { initialize: initTikTok, optOut: optOutTikTok } = useTikTokPixel();
  const { initialize: initMeta, optOut: optOutMeta } = useMetaPixel();

  // Check cookie consent on client side only
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    
    if (!consent) {
      setTimeout(() => setShowBanner(true), 2000);
    } else if (consent === 'accepted') {
      initTikTok(); // Initialize TikTok if already accepted
      initMeta();   // Initialize Meta if already accepted
    }

  }, [initTikTok, initMeta]);

  const handleAccept = useCallback(() => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
    initTikTok(); // Initialize TikTok
    initMeta();   // Initialize Meta
  }, [initTikTok,initMeta]);

  const handleReject = useCallback(() => {
    localStorage.setItem('cookie_consent', 'rejected');
    setShowBanner(false);
    optOutTikTok(); // Disable TikTok
    optOutMeta();   // Disable Meta
  }, [optOutTikTok, optOutMeta]);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            We use cookies for better shopping experience. 
            By continuing, you agree to our{' '}
            <Link href="/privacy-policy" className="underline hover:text-blue-300">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled
            className="px-4 py-2 text-sm border border-gray-600 bg-gray-400 rounded hover:bg-gray-800"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}