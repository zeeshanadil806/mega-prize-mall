"use client"

import { X, LayoutDashboard, Package, ShoppingCart, Users, Ticket, Gift, BarChart3, MessageSquare, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Bargain Requests", href: "/admin/bargain", icon: Ticket },
  { name: "Lucky Draw", href: "/admin/lucky-draw", icon: Gift },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Support", href: "/admin/support", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7C2C78] to-[#A43875] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mega Prize Mall</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78] border-l-4 border-[#7C2C78]"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-[#7C2C78]" : "text-gray-400"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-200"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}