"use client"

import { useState, useEffect } from "react"
import { X, Gift, Sparkles, Trophy, ShoppingBag } from "lucide-react"
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

//   const handleEnterNow = () => {
//     handleClose()
//     // Redirect to lucky draw page
//     window.location.href = "/dashboard/lucky-draw"
//   }

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
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}>
        <div className="relative w-full max-w-md mx-auto">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header - Gradient */}
            <div className="bg-linear-to-r from-[#7C2C78] via-[#A43875] to-[#EAB75F] p-6 text-center relative">
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" /> Limited Time
                </Badge>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-lg" />
                  <Trophy className="h-16 w-16 text-white relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  🎉 Win Amazing Prizes! 🎉
                </h2>
                <p className="text-white/90 text-sm">
                  Shop & Get Lucky Draw Entries
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Offer Details */}
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <Gift className="h-6 w-6 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Spend ₹3000+ & Get Entries</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Every order above ₹3000 gives you automatic lucky draw entries
                  </p>
                </div>
              </div>

              {/* Prizes List */}
              {/* <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  This Week&apos;s Prizes:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-[#7C2C78] rounded-full" />
                    <span className="text-sm text-gray-700">🎮 Wireless Gaming Headset</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-[#A43875] rounded-full" />
                    <span className="text-sm text-gray-700">📱 Premium Power Bank 20,000mAh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-[#EAB75F] rounded-full" />
                    <span className="text-sm text-gray-700">🎧 Bluetooth Earbuds + ₹500 Voucher</span>
                  </li>
                </ul>
              </div> */}

              {/* How it Works */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">How it works:</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-2">
                    <div className="h-10 w-10 mx-auto bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-600">Shop for ₹3000+</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 w-10 mx-auto bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Gift className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-600">Get Auto Entries</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 w-10 mx-auto bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-xs text-gray-600">Win Prizes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - CTA Buttons */}
            <div className="p-6 pt-0 space-y-3">
              {/* <Button
                onClick={handleEnterNow}
                className="w-full bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white h-12 text-lg shadow-lg"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Check My Entries
              </Button> */}
              
              <Button
                variant="outline"
                className="w-full border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78]/10 h-10"
                asChild
              >
                <Link href="/products" onClick={handleClose}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Start Shopping Now
                </Link>
              </Button>
              
              {/* <p className="text-center text-xs text-gray-500 pt-2">
                Draw happens every Saturday at 8 PM
              </p> */}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-200/30 rounded-full blur-xl" />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-200/30 rounded-full blur-xl" />
        </div>
      </div>
    </>
  )
}