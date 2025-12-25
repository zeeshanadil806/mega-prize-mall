// components/cart/MiniCart.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { formatCurrency } from "@/lib/bargain-utils"
import { Separator } from "@/components/ui/separator"

export function MiniCart() {
  const [open, setOpen] = useState(false)
  const { 
    items, 
    removeItem, 
    updateQuantity,
    getTotalItems,
    getSubtotal,
    getDiscountTotal,
    getGrandTotal 
  } = useCartStore()
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-linear-to-r from-[#EAB75F] to-[#A43875] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({getTotalItems()} items)
          </SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button 
              onClick={() => setOpen(false)}
              className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {items.map((item) => {
                  const currentPrice = item.discountedPrice || item.price
                  const itemTotal = currentPrice * item.quantity
                  
                  return (
                    <div key={item.productId} className="flex gap-4 p-3 border rounded-lg">
                      <div className="h-20 w-20 shrink-0 bg-muted rounded-md overflow-hidden">
                        {item.images?.[0]?.url ? (
                          <img 
                            src={item.images[0].url} 
                            alt={item.images[0].alt || item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Link 
                            href={`/products/${item.productId}`}
                            className="font-medium hover:underline line-clamp-1"
                            onClick={() => setOpen(false)}
                          >
                            {item.name}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(itemTotal)}
                            </p>
                            {item.discountedPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                            )}
                            {item.bargainDiscount && (
                              <p className="text-sm text-green-600">
                                Bargain: -{formatCurrency(item.bargainDiscount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            
            <div className="border-t p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                </div>
                {getDiscountTotal() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discounts</span>
                    <span>-{formatCurrency(getDiscountTotal())}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getGrandTotal())}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Continue Shopping
                </Button>
                <Link href="/cart" className="flex-1" onClick={() => setOpen(false)}>
                  <Button className="w-full gap-2 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white">
                    View Cart
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}