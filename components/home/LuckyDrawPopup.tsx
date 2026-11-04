"use client"

import { useState, useEffect } from "react"
import { X, Trophy, ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LuckyDrawPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Check if user has seen the popup before (using localStorage)
    const hasSeenPopup = localStorage.getItem("luckyDrawPopupSeen")
    const lastSeen = localStorage.getItem("luckyDrawPopupLastSeen")

    // Show popup if:
    // 1. Never seen before, OR
    // 2. Last seen more than 24 hours ago
    const shouldShow =
      !hasSeenPopup ||
      (lastSeen && Date.now() - parseInt(lastSeen) > 24 * 60 * 60 * 1000)

    if (shouldShow) {
      // Respectful 2-second delay so initial hero render is never interrupted
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
      // Mark as seen for 24 hours
      localStorage.setItem("luckyDrawPopupSeen", "true")
      localStorage.setItem("luckyDrawPopupLastSeen", Date.now().toString())
    }, 250)
  }

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isVisible) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#020817]/70 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-[380px] sm:max-w-[400px] rounded-3xl overflow-hidden shadow-[0_24px_70px_rgba(1,27,84,0.45)] border border-white/15 bg-linear-to-b from-[#011b54] via-[#011646] to-[#000d2b] text-white transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Subtle Ambient Radial Lighting Sheen */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-radial from-blue-400/20 via-transparent to-transparent pointer-events-none" />

        {/* Integrated Close Button (Top-Right, inside card, touch-friendly) */}
        <button
          onClick={handleClose}
          aria-label="Close offer popup"
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Container */}
        <div className="p-5 sm:p-6 pt-6 flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-wider text-blue-200 mb-3.5 shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Official Reward Offer</span>
          </div>

          {/* Premium Trophy Emblem */}
          <div className="relative mb-3.5">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-b from-white/15 to-white/5 border border-white/20 flex items-center justify-center shadow-inner">
              <Trophy className="h-7 w-7 text-amber-300" />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-[#022b82] border border-white/30 text-[9px] font-black tracking-tight text-white shadow-xs">
              FREE
            </span>
          </div>

          {/* Title & Concise Value Proposition */}
          <h2
            id="offer-popup-title"
            className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight mb-1.5"
          >
            Shop & Win Lucky Prizes
          </h2>
          <p className="text-xs sm:text-[13px] text-blue-100/90 leading-relaxed max-w-[310px] mb-4">
            Orders of <span className="font-bold text-white">Rs. 3,000+</span> receive automatic entries into our official Mega Prize Draw.
          </p>

          {/* Clean 2-Point Guarantee Strip (No rainbow clutter) */}
          <div className="w-full grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/6 border border-white/10 text-[11px] text-gray-200 mb-4">
            <div className="flex items-center justify-center gap-1.5 text-center">
              <Truck className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span className="font-semibold text-white/95">Cash on Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-center border-l border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white/95">100% Genuine</span>
            </div>
          </div>

          {/* Primary CTA Button */}
          <Link
            href="/products"
            onClick={handleClose}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-[#011b54] font-black text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Start Shopping & Qualify</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Subtle Dismiss Link */}
          <button
            onClick={handleClose}
            className="mt-3 text-[11px] font-medium text-white/60 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Maybe later, browse store
          </button>
        </div>
      </div>
    </div>
  )
}
