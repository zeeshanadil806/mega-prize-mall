// components/bargain/BargainButton.tsx - ADD THIS FUNCTION
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        <Button
          onClick={handleBargainClick}
          className="w-full bg-gradient-to-r from-[#EAB75F] to-[#A43875] hover:from-[#D9A64E] hover:to-[#8D2F6A] text-white shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <Tag className="h-5 w-5 mr-2" />
          Make an Offer
          {session?.user && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Save up to {minDiscountPercentage}%
            </span>
          )}
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