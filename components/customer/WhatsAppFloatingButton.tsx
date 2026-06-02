// components/common/WhatsAppFloatingButton.tsx
"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  bounceInterval?: number;
}

export default function WhatsAppFloatingButton({
  phoneNumber = "923254007037", // Your WhatsApp number without +
  message = "Hello! I have a question about your products",
  position = "bottom-right",
  showOnMobile = true,
  showOnDesktop = true,
  bounceInterval = 3000, // Bounce every 3 seconds
}: WhatsAppFloatingButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Bouncing animation — runs a fixed number of times to draw attention
  // on first load, then stops permanently. The original implementation
  // bounced forever, re-rendering the framer-motion subtree every 3s for
  // the entire session — wasted CPU and battery, and visually nagging.
  // Also respects prefers-reduced-motion to disable bouncing entirely.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const MAX_BOUNCES = 4;
    let bounceCount = 0;
    let cancelled = false;
    let bounceTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      if (cancelled) return;
      setIsBouncing(true);
      bounceTimeout = setTimeout(() => setIsBouncing(false), 600);
      bounceCount += 1;
      if (bounceCount >= MAX_BOUNCES) clearInterval(interval);
    }, bounceInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (bounceTimeout) clearTimeout(bounceTimeout);
    };
  }, [bounceInterval]);

  // Show button after delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Determine if button should be shown
  const shouldShow = (isMobile && showOnMobile) || (!isMobile && showOnDesktop);

  if (!shouldShow) return null;

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }[position];

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    
    // Track click (optional - for analytics)
    // if (typeof window !== "undefined" && (window as any).gtag) {
    //   (window as any).gtag("event", "whatsapp_click", {
    //     event_category: "engagement",
    //     event_label: "whatsapp_floating_button",
    //   });
    // }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            translateY: isBouncing ? [-10, 0] : 0
          }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            bounce: isBouncing ? 0.8 : 0.5
          }}
          className={`fixed ${positionClasses} z-50`}
          style={{ 
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))" 
          }}
        >
          {/* Tooltip on hover */}
          <div className="relative group">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                Chat with us on WhatsApp
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
              </div>
            </div>

            {/* Main button */}
            <motion.button
              onClick={handleClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Pulsing effect */}
              {isBouncing && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-500"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}

              {/* Main button */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-linear-to-r from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <MessageCircle className="h-7 w-7 md:h-8 md:w-8 text-white" />
                
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Unread messages indicator (optional) */}
          {/* <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-3 bg-white rounded-lg shadow-lg p-3 max-w-xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700">
                Online now
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Quick reply within minutes
            </p>
          </motion.div> */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}