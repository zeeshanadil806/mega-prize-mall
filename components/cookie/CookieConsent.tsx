"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTikTokPixel } from '@/lib/tiktok/client/tiktok-pixel';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { initialize, optOut } = useTikTokPixel();

  // Check cookie consent on client side only
  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    
    if (!consent) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
    initialize(); // Initialize TikTok pixel
  }, [initialize]);

  const handleReject = useCallback(() => {
    localStorage.setItem('cookie_consent', 'rejected');
    setShowBanner(false);
    optOut(); // Disable TikTok tracking
  }, [optOut]);

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