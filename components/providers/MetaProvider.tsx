"use client";

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { isMetaTestMode } from '@/lib/meta/constants';
import { useMetaPixel } from '@/lib/meta/client/meta-pixel';

// Global flag to ensure single initialization
let globalMetaInitialized = false;

interface MetaProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

// Main component with Suspense
export default function MetaProvider({
  children,
  enabled = true,
}: MetaProviderProps) {
  return (
    <Suspense fallback={children}>
      <MetaProviderContent enabled={enabled}>
        {children}
      </MetaProviderContent>
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function MetaProviderContent({
  children,
  enabled = true,
}: MetaProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    initialize,
    trackPageView,
    isInitialized,
    pixelId,
  } = useMetaPixel();

  // Initialize once globally on mount
  useEffect(() => {
    if (!enabled || !pixelId || globalMetaInitialized) return;

    const checkConsent = () => {
      const hasConsent = localStorage.getItem('cookie_consent') === 'accepted';
      
      if (hasConsent) {
        initialize();
        globalMetaInitialized = true;
      }
    };
    
    checkConsent();
  }, [enabled, pixelId, initialize]);

  // Track page views
  useEffect(() => {
    if (!enabled || !isInitialized) return;
    
    const timer = setTimeout(() => {
      trackPageView();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams, enabled, isInitialized, trackPageView]);

  // Debug overlay in test mode
  if (isMetaTestMode && typeof window !== 'undefined') {
    return (
      <>
        {children}
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: isInitialized ? '#1877F2' : '#f44336', // Facebook blue
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          opacity: 0.9,
        }}>
          Meta: {isInitialized ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </>
    );
  }
  
  return <>{children}</>;
}