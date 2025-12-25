"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  ShoppingBag, 
  User, 
  Gift, 
  Ticket, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CustomerNavbarProps {
  user: Session["user"] | null
}

export default function CustomerNavbar({ user }: CustomerNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U"

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: User },
    { name: "My Orders", href: "/orders", icon: ShoppingBag },
    { name: "My Points", href: "/points", icon: Gift },
    { name: "My Bargains", href: "/bargains", icon: Ticket },
  ]

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className=" mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 group"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative w-12 h-12"
              >
                <div className="absolute inset-0 bg-linear-to-br from-[#7C2C78] via-[#A43875] to-[#EAB75F] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-linear-to-r from-[#7C2C78] to-[#EAB75F] rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-[#7C2C78] to-[#A43875] bg-clip-text text-transparent">
                  Mega Prize Mall
                </h1>
                <p className="text-xs text-gray-500">Unbeatable Deals Every Day!</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-all duration-300 group",
                      isActive
                        ? "text-[#7C2C78]"
                        : "text-gray-600 hover:text-[#7C2C78]"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="relative">
                      {link.name}
                      {isActive && (
                        <motion.span
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full"
                        />
                      )}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <motion.div
                animate={{ width: searchOpen ? 300 : 40 }}
                className="overflow-hidden hidden md:block"
              >
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="rounded-full"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <AnimatePresence>
                    {searchOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 250 }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-2"
                      >
                        <Input
                          placeholder="Search products..."
                          className="border-gray-300 focus:border-[#7C2C78]"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                // whileHover={{ scale: 1.1 }}
                // whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-linear-to-r from-[#EAB75F] to-[#A43875] text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Avatar */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Avatar className="h-10 w-10 border-2 border-white shadow-lg cursor-pointer">
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback className="bg-linear-to-br from-[#7C2C78] to-[#A43875] text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback className="bg-linear-to-br from-[#7C2C78] to-[#A43875] text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
                          isActive
                            ? "bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78]"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}