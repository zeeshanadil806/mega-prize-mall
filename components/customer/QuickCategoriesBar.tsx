import Link from "next/link";
import { Tag } from "lucide-react";
import { headerCategories, getCategoryIcon } from "./header-categories";
import type { CategoryStat } from "@/features/product/domain";

interface QuickCategoriesBarProps {
  categoryStats?: CategoryStat[];
}

export default function QuickCategoriesBar({ categoryStats = [] }: QuickCategoriesBarProps) {
  // If stats are empty, use fallback hardcoded categories
  const displayCategories = categoryStats.length > 0
    ? categoryStats
        .slice(0, 5)
        .map((c) => {
          let displayName = c.category;
          if (c.category === "PC and Laptop Accessories") {
            displayName = "PC and Laptop";
          } else if (c.category === "Power Charging") {
            displayName = "Power and Charging";
          }
          return {
            name: displayName,
            href: `/products?category=${encodeURIComponent(c.category)}`,
            icon: getCategoryIcon(c.category, "h-3.5 w-3.5"),
          };
        })
    : headerCategories.map((c) => ({
        name: c.name,
        href: c.href,
        icon: c.icon,
      }));

  return (
    <div className="bg-linear-to-r from-gray-50 to-white border-b border-gray-200 py-2 overflow-x-auto scrollbar-hide">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            Shop by:
          </span>
          <div className="flex items-center gap-2">
            {displayCategories.map((category, index) => (
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
  );
}
