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
  Map,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { headerCategories, getCategoryIcon } from "./header-categories";
import type { CategoryStat } from "@/features/product/domain";

interface HeaderInteractiveProps {
  categoryStats?: CategoryStat[];
}

const HeaderInteractive = ({ categoryStats = [] }: HeaderInteractiveProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const rawCartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const cartCount = mounted ? rawCartCount : 0;

  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const categories = categoryStats.length > 0
    ? categoryStats.map((c) => {
        let displayName = c.category;
        if (c.category === "PC and Laptop Accessories") {
          displayName = "PC and Laptop";
        } else if (c.category === "Power Charging") {
          displayName = "Power and Charging";
        }
        return {
          name: displayName,
          href: `/products?category=${encodeURIComponent(c.category)}`,
          icon: getCategoryIcon(c.category, "h-4 w-4"),
        };
      })
    : headerCategories;

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="h-4 w-4" />, show: true },
    {
      name: "Products",
      href: "/products",
      icon: <Package className="h-4 w-4" />,
      show: true,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: <Tag className="h-4 w-4" />,
      show: true,
    },
    {
      name: "Bargain Deals",
      href: "/products?bargain=true",
      icon: <Tag className="h-4 w-4" />,
      show: true,
    },
    {
      name: "Lucky Draw",
      href: "/dashboard/lucky-draw",
      icon: <Gift className="h-4 w-4" />,
      show: true,
    },
    {
      name: "Wallet",
      href: "/dashboard/wallet",
      icon: <Wallet className="h-4 w-4" />,
      show: !!session?.user && session.user.role === "customer",
    },
    {
      name: "Admin",
      href: "/admin",
      icon: <Settings className="h-4 w-4" />,
      show:
        !!session?.user &&
        (session.user.role === "admin" || session.user.role === "support"),
    },
  ];

  const userMenuItems = session?.user
    ? [
        ...(session.user.role === "customer"
          ? [
              {
                name: "My Profile",
                href: "/dashboard",
                icon: <UserCircle className="h-4 w-4" />,
                type: "link",
              },
              {
                name: "My Addresses",
                href: "/addresses",
                icon: <Map className="h-4 w-4" />,
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
            ]
          : []),

        ...(session.user.role === "admin" || session.user.role === "support"
          ? [
              {
                name: "Admin Dashboard",
                href: "/admin",
                icon: <Settings className="h-4 w-4" />,
                type: "link",
              },
            ]
          : []),

        { type: "separator" },

        {
          name: "Logout",
          icon: <LogOut className="h-4 w-4" />,
          type: "button",
          action: () => signOut({ callbackUrl: "/" }),
        },
      ]
    : [];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

                <div className="absolute top-full left-0 mt-2 w-[540px] bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          href={category.href}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200 group/item animate-in fade-in slide-in-from-top-1 duration-150"
                        >
                          <div className="h-9 w-9 rounded-xl bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform duration-200">
                            <div className="text-[#7C2C78]">{category.icon}</div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate group-hover/item:text-[#7C2C78] transition-colors">
                              {category.name}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link
                        href="/categories"
                        className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#7C2C78] hover:bg-[#7C2C78]/5 rounded-xl transition-colors"
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
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#7C2C78] transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link href="/cart" className="relative p-2">
              <ShoppingBag className="h-5 w-5 text-gray-600 hover:text-[#7C2C78] transition-colors" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-linear-to-r from-[#EAB75F] to-[#FF9F45] text-white border-0 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>

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
                      <div className="p-4">
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
                                {session.user.email &&
                                !session.user.email.includes(
                                  "temp.megaprizemall.com",
                                ) ? (
                                  <>{session.user.email}</>
                                ) : (
                                  "Logged in as Guest"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge
                              className={`
    ${
      session.user.role === "admin"
        ? "bg-linear-to-r from-red-600 to-red-500"
        : session.user.role === "support"
          ? "bg-linear-to-r from-blue-600 to-blue-500"
          : "bg-linear-to-r from-[#7C2C78] to-[#A43875]"
    } text-white border-0
  `}
                            >
                              {session.user.role &&
                                session.user.role?.charAt(0).toUpperCase() +
                                  session.user.role?.slice(1)}
                            </Badge>
                            {session.user.role === "customer" && (
                              <Badge
                                variant="outline"
                                className="border-[#EAB75F] text-[#EAB75F]"
                              >
                                {session.user.points || 0} points
                              </Badge>
                            )}
                          </div>
                        </div>

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
            .filter((link) => link.show)
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
                      <div className="mt-1">
                        <Badge
                          className={`
            text-xs ${
              session.user.role === "admin"
                ? "bg-red-100 text-red-800"
                : session.user.role === "support"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-[#7C2C78]/10 text-[#7C2C78]"
            }
          `}
                        >
                          {session.user.role &&
                            session.user.role.charAt(0).toUpperCase() +
                              session.user.role.slice(1)}
                        </Badge>
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

                    {(session.user.role === "admin" ||
                      session.user.role === "support") && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button className="w-full bg-linear-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}

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
  );
};

export default HeaderInteractive;
