// components/cart/CartProvider.tsx
"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/stores/cart-store"
// import { toast } from "sonner"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const items = useCartStore((state) => state.items)
  
  useEffect(() => {
    // Sync cart with backend when user logs in
    const syncCart = async () => {
      if (session?.user && items.length > 0) {
        try {
          const response = await fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: session.user.id,
              items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                bargainCouponId: item.bargainCouponId,
              }))
            }),
          })
          
          if (!response.ok) {
            throw new Error("Failed to sync cart")
          }
        } catch (error) {
          console.error("Cart sync failed:", error)
        }
      }
    }
    
    syncCart()
  }, [session?.user, items])
  
  return <>{children}</>
}