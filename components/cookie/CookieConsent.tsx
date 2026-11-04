"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useTikTokPixel } from "@/lib/tiktok/client/tiktok-pixel";
import { useMetaPixel } from "@/lib/meta/client/meta-pixel";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { initialize: initTikTok, optOut: optOutTikTok } = useTikTokPixel();
  const { initialize: initMeta, optOut: optOutMeta } = useMetaPixel();

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");

    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    } else if (consent === "accepted") {
      initTikTok();
      initMeta();
    }
  }, [initTikTok, initMeta]);

  const handleAccept = useCallback(() => {
    localStorage.setItem("cookie_consent", "accepted");
    setShowBanner(false);
    initTikTok();
    initMeta();
  }, [initTikTok, initMeta]);

  const handleReject = useCallback(() => {
    localStorage.setItem("cookie_consent", "rejected");
    setShowBanner(false);
    optOutTikTok();
    optOutMeta();
  }, [optOutTikTok, optOutMeta]);

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[90] animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="rounded-2xl bg-[#011646] border border-white/15 shadow-2xl p-4 sm:p-5 text-white">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            We value your privacy
          </h3>
          <button
            onClick={handleReject}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors -mr-1 -mt-1"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-blue-100/70 leading-relaxed mb-4">
          We use cookies to improve your browsing experience, analyze site traffic, and assist with order processing. Read our{" "}
          <Link
            href="/cookie-policy"
            className="text-white underline underline-offset-2 hover:text-blue-300 transition-colors"
          >
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-white underline underline-offset-2 hover:text-blue-300 transition-colors"
          >
            Privacy Policy
          </Link>.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-center"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-[#011b54] bg-white hover:bg-gray-100 transition-colors text-center shadow-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}