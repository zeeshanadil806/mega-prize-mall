"use client"

import { useState, useEffect } from "react"
import { X, Gift, Sparkles, Trophy, ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    const shouldShow = !hasSeenPopup || 
      (lastSeen && Date.now() - parseInt(lastSeen) > 24 * 60 * 60 * 1000)

    if (shouldShow) {
      // Small delay for better UX
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
    }, 300)
  }


  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ${
        isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}>
        <div className="relative w-full max-w-md mx-auto">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-10 p-1.5 sm:p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header - Gradient */}
            <div className="bg-linear-to-r from-[#7C2C78] via-[#A43875] to-[#EAB75F] p-4 sm:p-6 text-center relative">
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs sm:text-sm">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Limited Time
                </Badge>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-lg" />
                  <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-white relative z-10" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  🎉 Win Amazing Prizes! 🎉
                </h2>
                <p className="text-white/90 text-xs sm:text-sm">
                  Shop & Get Lucky Draw Entries
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* COD Prominent Banner */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 text-sm sm:text-base">
                    Cash on Delivery Available!
                  </h3>
                  <p className="text-green-700 text-xs sm:text-sm mt-0.5">
                    Pay at your doorsteps option available for all orders
                  </p>
                </div>
              </div>

              {/* Offer Details */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Spend Rs 3000+ & Get Entries
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    Every order above Rs 3000 gives you automatic lucky draw entries
                  </p>
                </div>
              </div>

              {/* How it Works */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">How it works:</h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 mx-auto bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">Shop for Rs 3000+</p>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 mx-auto bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Gift className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">Get Auto Entries</p>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 mx-auto bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">Win Prizes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - CTA Buttons */}
            <div className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
              <Button
                variant="outline"
                className="w-full border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78]/10 h-9 sm:h-10 text-sm sm:text-base"
                asChild
              >
                <Link href="/products" onClick={handleClose}>
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Start Shopping Now
                </Link>
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 bg-purple-200/30 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-20 h-20 sm:w-32 sm:h-32 bg-amber-200/30 rounded-full blur-xl" />
        </div>
      </div>
    </>
  )
}