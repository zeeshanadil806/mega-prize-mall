"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTikTokPixel } from '@/lib/tiktok/client/tiktok-pixel';

// Global flag to ensure single initialization
let globalInitialized = false;

interface TiktokProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

// Main component with Suspense
export default function TiktokProvider({
  children,
  enabled = true,
}: TiktokProviderProps) {
  return (
    <Suspense fallback={children}>
      <TiktokProviderContent enabled={enabled}>
        {children}
      </TiktokProviderContent>
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function TiktokProviderContent({
  children,
  enabled = true,
}: TiktokProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    initialize,
    trackPageView,
    isInitialized,
    pixelId,
  } = useTikTokPixel();

  // Initialize once globally on mount
  useEffect(() => {
    if (!enabled || !pixelId || globalInitialized) return;

    const checkConsent = () => {
      const hasConsent = localStorage.getItem('cookie_consent') === 'accepted';
      
      if (hasConsent) {
        initialize();
        globalInitialized = true;
      }
    };
    
    checkConsent();
  }, [enabled, pixelId, initialize]);

  // Track page views
  useEffect(() => {
    if (!enabled || !isInitialized()) return;
    
    const timer = setTimeout(() => {
      trackPageView();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams, enabled, isInitialized, trackPageView]);

  return <>{children}</>;
}