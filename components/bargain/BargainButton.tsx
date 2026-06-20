// components/bargain/BargainButton.tsx - ADD THIS FUNCTION
"use client"

import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tag, Lock } from "lucide-react"
import BargainModal from "./BargainModal"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useCartStore } from "@/stores/cart-store"

interface BargainButtonProps {
  product: {
    id: string
    name: string
    price: number
    discountedPrice?: number
    bargainEnabled: boolean
    minBargainPrice: number
    maxBargainRounds: number
    bargainValidityHours: number
    images?: Array<{ url: string; alt?: string }>
  }
  className?: string
}

export default function BargainButton({ product, className }: BargainButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: session, status } = useSession()
  const applyBargainToItem = useCartStore((state) => state.applyBargainToItem)
  const getItem = useCartStore((state) => state.getItem)

  if (!product.bargainEnabled) {
    return null
  }

  const handleBargainClick = () => {
    if (status === "loading") return
    
    if (!session?.user) {
      toast.error("Please login to bargain")
      return
    }

    // Check if product is in cart
    const cartItem = getItem(product.id)
    if (!cartItem) {
      toast.error("Please add product to cart first")
      return
    }

    setIsModalOpen(true)
  }

  // Calculate current price
  const currentPrice = product.discountedPrice || product.price
  
  // Calculate minimum discount percentage
  const minDiscountPercentage = Math.round(
    ((currentPrice - product.minBargainPrice) / currentPrice) * 100
  )

  // Handle bargain success
  const handleBargainSuccess = (couponId: string, discountAmount: number) => {
    applyBargainToItem(product.id, couponId, discountAmount)
    toast.success("Bargain applied to cart item!")
  }

  const bargainWrapperVariants: Variants = {
    hover: { scale: 1.015 },
    tap: { scale: 0.97 },
  };

  const bargainIconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  return (
    <>
      <motion.div
        variants={bargainWrapperVariants}
        whileHover="hover"
        whileTap="tap"
        className={className}
      >
        <Button
          onClick={handleBargainClick}
          className="relative overflow-hidden w-full bg-gradient-to-r from-[#EAB75F] to-[#A43875] hover:from-[#D9A64E] hover:to-[#8D2F6A] text-white shadow-[0_8px_30px_rgba(234,183,95,0.25)] hover:shadow-[0_12px_45px_rgba(164,56,117,0.45)] transition-all duration-500 border-0"
          size="lg"
        >
          {/* Light Sweep Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            initial={{ x: "-100%" }}
            whileHover={{
              x: "100%",
              transition: { duration: 0.8, ease: "easeOut" },
            }}
          />

          <span className="relative z-10 flex items-center justify-center gap-2">
            <motion.span variants={bargainIconVariants} className="flex items-center">
              <Tag className="h-5 w-5 mr-1" />
            </motion.span>
            Make an Offer
            {session?.user && (
              <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                Save up to {minDiscountPercentage}%
              </span>
            )}
          </span>
        </Button>
        
        {!session?.user && (
          <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
            <Lock className="h-3 w-3 mr-1" />
            Login required to bargain
          </div>
        )}
      </motion.div>

      {session?.user && (
        <BargainModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          userId={session.user.id}
          onBargainSuccess={handleBargainSuccess} // Add this prop
        />
      )}
    </>
  )
}