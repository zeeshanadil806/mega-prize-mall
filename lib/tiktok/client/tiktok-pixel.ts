"use client";

import { useCallback, useRef, useEffect } from "react";
import { TIKTOK_PIXEL_ID, isTestMode } from "../constants";
import {
  generateEventId,
  storeEventId,
  isDuplicateEvent,
} from "../utils/event-id";
import { getUserHashes, getTikTokClickId } from "../utils/user-hasher";
import type { TikTokEventParams, TikTokEventName } from "@/types/events";

declare global {
  interface Window {
    ttq: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      instance: (pixelId: string) => void;
    };
  }
}

// Add index signature to TikTokTrackParams
// interface TikTokTrackParams extends TikTokEventParams {
//   event_id?: string;
//   ttclid?: string;
//   email_sha256?: string;
//   phone_sha256?: string;
//   external_id?: string;
//   [key: string]: unknown; // Add index signature
// }

export function useTikTokPixel() {
  const initialized = useRef(false);
  const pixelId = TIKTOK_PIXEL_ID || "";

  /**
   * Initialize TikTok Pixel (loads script)
   */
  const initialize = useCallback((): void => {
    const hasConsent = localStorage.getItem("cookie_consent") === "accepted";
    if (!hasConsent) return;
    if (initialized.current || !pixelId) {
      if (isTestMode) {
        console.log("TikTok Pixel already initialized or no pixel ID");
      }
      return;
    }

    if (typeof window === "undefined") return;

    // Check if already loaded globally
    if (window.ttq) {
      initialized.current = true;
      return;
    }

    // Load TikTok Pixel script
    const script = document.createElement("script");
    script.src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=${pixelId}`;
    script.async = true;
    script.onload = () => {
      if (window.ttq) {
        window.ttq.load(pixelId);
        window.ttq.page();
        initialized.current = true;

        if (isTestMode) {
          console.log("TikTok Pixel initialized in test mode");
        }
      }
    };

    script.onerror = () => {
      console.error("Failed to load TikTok Pixel script");
    };

    document.head.appendChild(script);
  }, [pixelId]);

  /**
   * Track standard or custom event
   */
  const trackEvent = useCallback(
    (
      eventName: TikTokEventName,
      params?: TikTokEventParams,
      customEventId?: string
    ): string | null => {
      if (!initialized.current || !pixelId || typeof window === "undefined") {
        if (isTestMode) {
          console.log(`[TikTok Test] Event ${eventName}:`, params);
        }
        return null;
      }

      // Generate unique event ID for deduplication
      const eventId =
        customEventId ||
        generateEventId(
          eventName.toLowerCase(),
          "track",
          getUserHashes().external_id
        );

      // Prevent duplicate events in same session
      if (isDuplicateEvent(eventId)) {
        console.warn(`Duplicate TikTok event detected: ${eventId}`);
        return eventId;
      }

      try {
        // Prepare event parameters with Record<string, unknown> type
        const eventParams: Record<string, unknown> = {
          ...params,
          event_id: eventId,
        };

        // Add user hashes for matching
        const userHashes = getUserHashes();
        if (userHashes.email_sha256) {
          eventParams.email_sha256 = userHashes.email_sha256;
        }
        if (userHashes.phone_sha256) {
          eventParams.phone_sha256 = userHashes.phone_sha256;
        }
        if (userHashes.external_id) {
          eventParams.external_id = userHashes.external_id;
        }

        // Add ttclid for ad attribution
        const ttclid = getTikTokClickId();
        if (ttclid) {
          eventParams.ttclid = ttclid;
        }

        // Track event - now compatible with Record<string, unknown>
        window.ttq.track(eventName, eventParams);

        // Store for deduplication
        storeEventId(eventId, eventName);

        if (isTestMode) {
          console.log(`[TikTok Tracked] ${eventName}:`, eventParams);
        }

        return eventId;
      } catch (error) {
        console.error("Failed to track TikTok event:", error);
        return null;
      }
    },
    [pixelId]
  );

  /**
   * Track page view
   */
  const trackPageView = useCallback((): void => {
    if (!initialized.current || !pixelId || typeof window === "undefined")
      return;

    try {
      window.ttq.page();

      if (isTestMode) {
        console.log("[TikTok PageView] Tracked");
      }
    } catch (error) {
      console.error("Failed to track page view:", error);
    }
  }, [pixelId]);

  /**
   * For GDPR - allow users to opt-out
   */
  const optOut = useCallback((): void => {
    if (typeof window === "undefined" || !window.ttq) return;

    try {
      window.ttq.instance("disable");
      initialized.current = false;

      // Clear stored events
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("tiktok_events");
      }
    } catch (error) {
      console.error("Failed to opt-out of TikTok tracking:", error);
    }
  }, []);

  /**
   * For GDPR - allow users to opt-in
   */
  const optIn = useCallback((): void => {
    if (!pixelId) return;
    initialize();
  }, [pixelId, initialize]);

  /**
   * Check if pixel is initialized
   */
  const isInitialized = useCallback((): boolean => {
    return initialized.current && typeof window !== "undefined" && !!window.ttq;
  }, []);

  // Auto-initialize on component mount if consent exists
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasConsent = localStorage.getItem("cookie_consent") === "accepted";
    if (hasConsent && pixelId) {
      initialize();
    }
  }, [initialize, pixelId]);

  return {
    initialize,
    trackEvent,
    trackPageView,
    optOut,
    optIn,
    isInitialized: isInitialized,
    pixelId,
  };
}
