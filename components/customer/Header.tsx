// components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Smartphone,
  Headphones,
  Gamepad2,
  Laptop,
  Zap,
  Tag,
  Gift,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  Wallet,
  Home,
  ShoppingCart,
  Award,
  UserCircle,
  CreditCard,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
// Import Logo from "@public/logo.png"
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();

  // ✅ Session hook
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // Your actual categories
  const categories = [
    {
      name: "Mobile Accessories",
      icon: <Smartphone className="h-4 w-4" />,
      href: "/products?category=mobile-accessories",
    },
    {
      name: "Audio and Multimedia",
      icon: <Headphones className="h-4 w-4" />,
      href: "/products?category=audio-and-multimedia",
    },
    {
      name: "Gaming Accessories",
      icon: <Gamepad2 className="h-4 w-4" />,
      href: "/products?category=gaming-accessories",
    },
    {
      name: "PC and Laptop",
      icon: <Laptop className="h-4 w-4" />,
      href: "/products?category=pc-and-laptop-accessories",
    },
    {
      name: "Power and Charging",
      icon: <Zap className="h-4 w-4" />,
      href: "/products?category=power-and-charging",
    },
  ];

  // ✅ Dynamic nav links based on session
  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="h-4 w-4" />, show: true },
    {
      name: "Products",
      href: "/products",
      icon: <Package className="h-4 w-4" />,
      show: true,
    },
      { name: 'Categories', href: '/categories', icon: <Tag className="h-4 w-4" />, show: true },
    {
      name: "Bargain Deals",
      href: "/products?bargain=true",
      icon: <Tag className="h-4 w-4" />,
      show: true,
    },
    {
      name: "Lucky Draw",
      href: "/lucky-draw",
      icon: <Gift className="h-4 w-4" />,
      show: true,
    },
    // ✅ Only show Wallet to logged-in customers
    {
      name: "Wallet",
      href: "/dashboard/wallet",
      icon: <Wallet className="h-4 w-4" />,
      show: !!session?.user,
    },
  ];

  // ✅ User menu items for logged-in users
  const userMenuItems = session?.user
    ? [
        {
          name: "My Profile",
          href: "/dashboard",
          icon: <UserCircle className="h-4 w-4" />,
          type: "link",
        },
        {
          name: "My Orders",
          href: "/dashboard/orders",
          icon: <ShoppingCart className="h-4 w-4" />,
          type: "link",
        },
        {
          name: "My Wallet",
          href: "/dashboard/wallet",
          icon: <CreditCard className="h-4 w-4" />,
          type: "link",
        },
        {
          name: "My Points",
          href: "/dashboard/wallet",
          icon: <Award className="h-4 w-4" />,
          subtext: `${session.user.points || 0} points`,
          type: "link",
        },
        { type: "separator" },
        {
          name: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-4 w-4" />,
          type: "link",
        },
        {
          name: "Logout",
          icon: <LogOut className="h-4 w-4" />,
          type: "button",
          action: () => signOut({ callbackUrl: "/" }),
        },
      ]
    : [];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("search") as string;
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white text-[12px] py-2 px-4">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>🎉 Bargain on Electronics Accessories!</span>
          </div>
          <Link
            href="/products?bargain=true"
            className="underline hover:no-underline font-medium"
          >
            Shop Now →
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative h-10 w-10 sm:h-12 sm:w-12"
                >
                  <Image
                    src="/logo.png"
                    alt="Mega Prize Mall"
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 40px, 48px"
                  />
                </motion.div>

                <div className="hidden sm:block">
                  <div className="text-xl font-bold bg-linear-to-r from-[#7C2C78] to-[#A43875] bg-clip-text text-transparent">
                    Mega Prize Mall
                  </div>
                  <div className="text-xs text-gray-500 -mt-1">
                    Electronics Accessories
                  </div>
                </div>
              </Link>

              {/* Categories Dropdown - Desktop */}
              <div className="hidden lg:block ml-6">
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-[#7C2C78] transition-colors font-medium">
                    Categories
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          href={category.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group/item"
                        >
                          <div className="h-8 w-8 rounded-lg bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center">
                            <div className="text-[#7C2C78]">
                              {category.icon}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {category.name}
                            </div>
                          </div>
                        </Link>
                      ))}

                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <Link
                          href="/categories"
                          className="flex items-center justify-center gap-2 px-4 py-2 text-[#7C2C78] hover:bg-[#7C2C78]/10 rounded-lg transition-colors"
                        >
                          <span className="font-medium">
                            View All Categories
                          </span>
                          <ChevronDown className="h-4 w-4 -rotate-90" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  name="search"
                  placeholder="Search for mobile cases, headphones, chargers..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#7C2C78] focus:ring-2 focus:ring-[#7C2C78]/20 outline-none transition-all bg-gray-50"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search Button - Mobile */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#7C2C78] transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative p-2">
                <ShoppingBag className="h-5 w-5 text-gray-600 hover:text-[#7C2C78] transition-colors" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-linear-to-r from-[#EAB75F] to-[#FF9F45] text-white border-0 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-linear-to-r from-[#7C2C78] to-[#A43875] flex items-center justify-center overflow-hidden">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                )}

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {session?.user ? (
                        // ✅ LOGGED-IN USER MENU
                        <div className="p-4">
                          {/* User Info */}
                          <div className="mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-10 w-10 rounded-full bg-linear-to-r from-[#7C2C78] to-[#A43875] flex items-center justify-center overflow-hidden">
                                {session.user.image ? (
                                  <img
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 truncate">
                                  {session.user.name || "User"}
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {session.user.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white border-0">
                                {session.user.role}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-[#EAB75F] text-[#EAB75F]"
                              >
                                {session.user.points || 0} points
                              </Badge>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="space-y-1">
                            {userMenuItems.map((item, index) => {
                              if (item.type === "separator") {
                                return (
                                  <div
                                    key={index}
                                    className="border-t border-gray-100 my-2"
                                  />
                                );
                              }

                              if (item.type === "button") {
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      if (item.action) item.action();
                                      setIsUserMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                                  >
                                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                                      {item.icon}
                                    </div>
                                    <div>
                                      <div className="font-medium">Logout</div>
                                      <div className="text-xs text-gray-500">
                                        Sign out of your account
                                      </div>
                                    </div>
                                  </button>
                                );
                              }

                              return (
                                <Link
                                  key={index}
                                  href={item.href!}
                                  onClick={() => setIsUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="h-8 w-8 rounded-lg bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center">
                                    {item.icon}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                    {item.subtext && (
                                      <div className="text-xs text-gray-500">
                                        {item.subtext}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // ✅ GUEST USER MENU
                        <div className="p-4">
                          <div className="mb-4 pb-4 border-b border-gray-100">
                            <div className="font-bold text-gray-900">
                              Welcome!
                            </div>
                            <div className="text-sm text-gray-600">
                              Sign in to access your account
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Link
                              href="/login"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="h-8 w-8 rounded-lg bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-[#7C2C78]" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  Sign In
                                </div>
                                <div className="text-xs text-gray-500">
                                  Access your account
                                </div>
                              </div>
                            </Link>

                            <Link
                              href="/register"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="h-8 w-8 rounded-lg bg-linear-to-r from-[#2E297D]/10 to-[#7C2C78]/10 flex items-center justify-center">
                                <Settings className="h-4 w-4 text-[#2E297D]" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  Register
                                </div>
                                <div className="text-xs text-gray-500">
                                  Create new account
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#7C2C78] transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-6 pb-3">
            {navLinks
              .filter((link) => link.show) // ✅ Only show allowed links
              .map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={`flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-[#7C2C78] border-b-2 border-[#7C2C78]"
                      : "text-gray-600 hover:text-[#7C2C78]"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

            {/* Special Badge for Bargain */}
            <Link href="/products?bargain=true" className="relative">
              <Badge className="bg-linear-to-r from-[#EAB75F] to-[#FF9F45] hover:from-[#D9A64E] hover:to-[#EE8E3A] text-white border-0 px-3 py-1">
                <Tag className="h-3 w-3 mr-1" />
                Bargain Zone
              </Badge>
            </Link>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <form onSubmit={handleSearch} className="py-3">
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      placeholder="Search electronics accessories..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#7C2C78] focus:ring-2 focus:ring-[#7C2C78]/20 outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6">
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    {categories.map((category, index) => (
                      <Link
                        key={index}
                        href={category.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center">
                          {category.icon}
                        </div>
                        <span className="text-gray-900">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Navigation
                  </h3>
                  <div className="space-y-1">
                    {navLinks
                      .filter((link) => link.show)
                      .map((link, index) => (
                        <Link
                          key={index}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            pathname === link.href
                              ? "bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78]"
                              : "hover:bg-gray-50 text-gray-900"
                          }`}
                        >
                          {link.icon}
                          <span>{link.name}</span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* User Actions */}
                <div className="space-y-3">
                  {session?.user ? (
                    <>
                      <div className="px-3 py-2 rounded-lg bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10">
                        <div className="font-medium text-gray-900">
                          Hi, {session.user.name || "User"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.user.email}
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button className="w-full" variant="outline">
                          <UserCircle className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>

                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button className="w-full bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A]">
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          className="w-full border-[#2E297D] text-[#2E297D] hover:bg-[#2E297D]/10"
                        >
                          Create Account
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Quick Categories Bar */}
      <div className="bg-linear-to-r from-gray-50 to-white border-b border-gray-200 py-2 overflow-x-auto scrollbar-hide">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Shop by:
            </span>
            <div className="flex items-center gap-2">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={category.href}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:border-[#7C2C78] hover:bg-[#7C2C78]/5 transition-all whitespace-nowrap"
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </Link>
              ))}

              <Link
                href="/products?bargain=true"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 border border-[#EAB75F] hover:bg-linear-to-r hover:from-[#EAB75F]/20 hover:to-[#FF9F45]/20 transition-all whitespace-nowrap"
              >
                <Tag className="h-3 w-3 text-[#EAB75F]" />
                <span className="text-sm font-medium text-[#EAB75F]">
                  Bargain Deals
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
