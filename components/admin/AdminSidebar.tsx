"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  // Settings,
  BarChart3,
  // MessageSquare,
  Gift,
  LogOut,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

// Define the type for navigation items
type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
    roles?: ("admin" | "support")[]; // Which roles can see this item
};

const navItems: NavItem[] = [
  { 
    name: "Dashboard", 
    href: "/admin", 
    icon: LayoutDashboard,
    roles: ["admin", "support"] 
  },
  { 
    name: "Products", 
    href: "/admin/products", 
    icon: Package,
    roles: ["admin", "support"] 
  },
  { 
    name: "Orders", 
    href: "/admin/orders", 
    icon: ShoppingCart,
    roles: ["admin", "support"] 
  },
  { 
    name: "Bargain Requests", 
    href: "/admin/bargain", 
    icon: Ticket,
    roles: ["admin", "support"] 
  },
  { 
    name: "Lucky Draw", 
    href: "/admin/lucky-draw", 
    icon: Gift,
    roles: ["admin"] // Only admin
  },
  // Analytics with sub-menu
  {
    name: "Analytics",
    href: "/admin",
    icon: BarChart3,
    roles: ["admin"], // Only admin
    children: [
      { name: "Dashboard", href: "/admin", icon: BarChart3 },
      { name: "Sales", href: "/admin/analytics/sales", icon: DollarSign },
      { name: "Users", href: "/admin/analytics/users", icon: Users },
      { name: "Products", href: "/admin/analytics/products", icon: Package },
      { name: "Points", href: "/admin/analytics/points", icon: Gift },
    ],
  },
  // Coupons management
  {
    name: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
    roles: ["admin", "support"],
    children: [
      {
        name: "All Coupons",
        href: "/admin/coupons",
        icon: Tag,
      },
      {
        name: "Create Coupon",
        href: "/admin/coupons/new",
        icon: Tag,
      },
      {
        name: "Bulk Generate",
        href: "/admin/coupons?bulk=true",
        icon: Tag,
      },
    ],
  },
  { 
    name: "Users", 
    href: "/admin/users", 
    icon: Users,
    roles: ["admin"] // Only admin
  },
  { 
    name: "Support Accounts", 
    href: "/admin/support", 
    icon: Users,
    roles: ["admin"] // Only admin
  },
];


export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "customer";
const getFilteredNavItems = (): NavItem[] => {
    return navItems.filter(item => {
      // If no roles specified, show to all
      if (!item.roles) return true;
      
      // Check if user role has permission
      return item.roles.includes(userRole as "admin" | "support");
    });
  };
  const filteredNavItems = getFilteredNavItems();

  // State to track which menu items are expanded
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Effect to automatically expand the menu if the current path is within a child
  useEffect(() => {
    filteredNavItems.forEach((item) => {
      if (item.children) {
        // Check if any child matches the current path
        const isChildActive = item.children.some(
          (child) =>
            pathname === child.href || pathname.startsWith(`${child.href}/`)
        );

        // If child is active and parent isn't expanded, expand it
        if (isChildActive) {
          setExpandedItems((prev) =>
            prev.includes(item.name) ? prev : [...prev, item.name]
          );
        }
      }
    });
  }, [pathname, filteredNavItems]);


  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  return (
    <aside className="hidden lg:flex w-64 lg:min-w-64 lg:flex-col border-r border-gray-200 bg-white h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200 shrink-0">
        <Link href={"/"} className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-linear-to-br from-[#011b54] to-[#022b82] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mega Prize Mall</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;

          // Check strict equality for dashboard to avoid highlighting on every route
          const isActive =
            !hasChildren &&
            (item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href));

          // Check if any child is active to highlight parent lightly
          const isChildActive =
            hasChildren &&
            item.children?.some(
              (child) =>
                pathname === child.href || pathname.startsWith(`${child.href}/`)
            );

          return (
            <div key={item.name}>
              {hasChildren ? (
                // Parent Item with Children (Collapsible)
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isChildActive
                      ? "bg-gray-50 text-[#011b54]"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center">
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5",
                        isChildActive
                          ? "text-[#011b54]"
                          : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              ) : (
                // Standard Link Item
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-linear-to-r from-[#011b54]/10 to-[#022b82]/10 text-[#011b54] border-l-4 border-[#011b54]"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive
                        ? "text-[#011b54]"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              )}

              {/* Render Children */}
              {hasChildren && isExpanded && (
                <div className="mt-1 ml-4 space-y-1 border-l border-gray-100 pl-2">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildLinkActive = pathname === child.href;

                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                          isChildLinkActive
                            ? "text-[#011b54] bg-[#011b54]/5"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <ChildIcon
                          className={cn(
                            "mr-3 h-4 w-4",
                            isChildLinkActive
                              ? "text-[#011b54]"
                              : "text-gray-400"
                          )}
                        />
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 shrink-0">
        <Button
          variant="outline"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
