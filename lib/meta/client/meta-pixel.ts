"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { META_PIXEL_ID, isMetaTestMode } from "../constants";
import {
  generateEventId,
  storeEventId,
  isDuplicateEvent,
} from "@/lib/tiktok/utils/event-id";
import { getUserHashes } from "@/lib/tiktok/utils/user-hasher";
import {
  type MetaEventParams,
  type EventName,
  STANDARD_EVENTS,
} from "@/types/events";

declare global {
  interface Window {
    // FIXED: Added '?' to make fbq optional, preventing the ts(2774) error
    fbq?: {
      (method: "init", pixelId: string, options?: MetaEventParams): void;
      (
        method: "track",
        event: string,
        params?: MetaEventParams,
        eventId?: string,
      ): void;
      (
        method: "trackCustom",
        event: string,
        params?: MetaEventParams,
        eventId?: string,
      ): void;
      (method: "consent", action: "grant" | "revoke"): void;
    };
  }
}

export function useMetaPixel() {
  const initialized = useRef(false);
  const pixelId = META_PIXEL_ID || "";
  const [isInitializedState, setIsInitializedState] = useState(false);

  /**
   * Initialize Meta Pixel (loads script)
   */
  /**
   * Initialize Meta Pixel (loads script)
   */
  const initialize = useCallback(() => {
    if (typeof window === "undefined" || initialized.current || !pixelId) return;

    // 1. Standard Meta Shim (Typed)
    interface MetaPixel {
      (...args: unknown[]): void;
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      push: MetaPixel;
      loaded: boolean;
      version: string;
    }

    (function (
      f: Window & { fbq?: MetaPixel; _fbq?: MetaPixel },
      b: Document,
      e: string,
      v: string,
      n?: MetaPixel,
      t?: HTMLScriptElement,
      s?: Element
    ) {
      if (f.fbq) return;

      n = f.fbq = function (...args: unknown[]) {
        if (n?.callMethod) {
          n.callMethod(...args);
        } else {
          n?.queue.push(args);
        }
      } as MetaPixel;

      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];

      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s?.parentNode?.insertBefore(t, s);
    })(
      window as unknown as Window & { fbq?: MetaPixel; _fbq?: MetaPixel },
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    // 2. Initialize
    window.fbq?.("init", pixelId);
    window.fbq?.("track", "PageView");

    initialized.current = true;

    // FIX: Wrap state update in setTimeout to avoid 'setState in effect' warning
    setTimeout(() => {
      setIsInitializedState(true);
    }, 0);

    if (isMetaTestMode) console.log("Meta Pixel Initialized");
  }, [pixelId]);

  /**
   * Track standard or custom event
   */
  const trackEvent = useCallback(
    (
      eventName: EventName,
      params?: MetaEventParams,
      customEventId?: string,
    ): string | null => {
      if (!initialized.current || !pixelId || typeof window === "undefined") {
        if (isMetaTestMode) {
          console.log(`[Meta Test] Event ${eventName}:`, params);
        }
        return null;
      }

      // Generate unique event ID for deduplication (same as TikTok)
      const eventId =
        customEventId ||
        generateEventId(
          eventName.toLowerCase(),
          "track",
          getUserHashes().external_id,
        );

      // Prevent duplicate events in same session
      if (isDuplicateEvent(`meta_${eventId}`)) {
        console.warn(`Duplicate Meta event detected: ${eventId}`);
        return eventId;
      }

      try {
        // Prepare event parameters
        const eventParams: Record<string, unknown> = {
          ...params,
          eventID: eventId,
        };

        // Track event
        if (eventName in STANDARD_EVENTS) {
          window.fbq?.("track", eventName, eventParams, eventId);
        } else {
          window.fbq?.("trackCustom", eventName, eventParams, eventId);
        }

        // Store for deduplication with meta prefix
        storeEventId(`meta_${eventId}`, eventName);

        if (isMetaTestMode) {
          console.log(`[Meta Tracked] ${eventName}:`, eventParams);
        }

        return eventId;
      } catch (error) {
        console.error("Failed to track Meta event:", error);
        return null;
      }
    },
    [pixelId],
  );

  /**
   * Track page view
   */
  const trackPageView = useCallback((): void => {
    if (!initialized.current || !pixelId || typeof window === "undefined")
      return;

    try {
      window.fbq?.("track", "PageView");

      if (isMetaTestMode) {
        console.log("[Meta PageView] Tracked");
      }
    } catch (error) {
      console.error("Failed to track page view:", error);
    }
  }, [pixelId]);

  /**
   * For GDPR - allow users to opt-out
   */
  const optOut = useCallback((): void => {
    if (typeof window === "undefined" || !window.fbq) return;

    try {
      window.fbq("consent", "revoke");
      initialized.current = false;
      setIsInitializedState(false);
    } catch (error) {
      console.error("Failed to opt-out of Meta tracking:", error);
    }
  }, []);

  /**
   * For GDPR - allow users to opt-in
   */
  const optIn = useCallback((): void => {
    if (!pixelId) return;
    window.fbq?.("consent", "grant");
    initialize();
  }, [pixelId, initialize]);

  /**
   * Check if pixel is initialized
   */
  // const isInitialized = useCallback((): boolean => {
  //   return isInitializedState;
  // }, [isInitializedState]);
  const initRef = useRef(initialize);
  useEffect(() => {
    initRef.current = initialize;
  }, [initialize]);

  // Auto-initialize on component mount if consent exists
  useEffect(() => {
    const hasConsent = localStorage.getItem("cookie_consent") === "accepted";
    if (hasConsent && pixelId) {
      initialize();
    }
  }, [pixelId, initialize]);

  // Sync state with ref on mount
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      initialized.current = true;
      setTimeout(() => {
        setIsInitializedState(true);
      }, 0);
    }
  }, []);

  return {
    initialize,
    trackEvent,
    trackPageView,
    optOut,
    optIn,
    isInitialized: isInitializedState,
    pixelId,
  };
}
