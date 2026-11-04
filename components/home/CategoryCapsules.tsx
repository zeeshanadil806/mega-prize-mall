// components/home/CategoryCapsules.tsx
"use client";

import Link from "next/link";
import {
  Headphones,
  Watch,
  Battery,
  SmartphoneCharging,
  Gamepad2,
  Volume2,
  Shield,
  Camera,
  Laptop,
  Smartphone,
  Package,
} from "lucide-react";

interface CategoryStat {
  category: string;
  count: number;
}

interface CategoryCapsulesProps {
  categoryStats?: CategoryStat[];
}

// Icon mapping matching Ronin's category iconography
const ICON_MAP: Record<string, React.ElementType> = {
  "Audio and Multimedia": Headphones,
  "Audio & Multimedia": Headphones,
  "Earbuds": Headphones,
  "Smart Wearables": Watch,
  "Smartwatches": Watch,
  "Power Charging": Battery,
  "Power and Charging": Battery,
  "Power Bank": Battery,
  "Chargers": SmartphoneCharging,
  "Gaming Accessories": Gamepad2,
  "Speakers": Volume2,
  "Screen Protectors": Shield,
  "Mobile Cases": Smartphone,
  "Mobile Accessories": Smartphone,
  "Content Creation": Camera,
  "PC and Laptop Accessories": Laptop,
  "PC & Laptop Accessories": Laptop,
};

// Fallback high-impact tech categories if database stats are empty or loading
const DEFAULT_CATEGORIES = [
  { name: "Audio and Multimedia", displayName: "Earbuds", icon: Headphones },
  { name: "Smart Wearables", displayName: "Watches", icon: Watch },
  { name: "Power and Charging", displayName: "Power", icon: Battery },
  { name: "Mobile Accessories", displayName: "Holders", icon: Smartphone },
  { name: "Gaming Accessories", displayName: "Gaming", icon: Gamepad2 },
  { name: "PC and Laptop Accessories", displayName: "Laptops", icon: Laptop },
  { name: "Other Accessories", displayName: "Accessories", icon: Package },
];

const CAPSULE_NAME_MAP: Record<string, string> = {
  "Audio and Multimedia": "Earbuds",
  "Audio & Multimedia": "Earbuds",
  "Earbuds": "Earbuds",
  "Smart Wearables": "Watches",
  "Smartwatches": "Watches",
  "Power Charging": "Power",
  "Power and Charging": "Power",
  "Power Bank": "Power",
  "Chargers": "Chargers",
  "Mobile Accessories": "Holders",
  "Mobile & Holders": "Holders",
  "Mobile Cases": "Cases",
  "Gaming Accessories": "Gaming",
  "PC and Laptop Accessories": "Laptops",
  "PC & Laptop Accessories": "Laptops",
  "Other Accessories": "Accessories",
  "Content Creation": "Vlogging",
};

export default function CategoryCapsules({
  categoryStats = [],
}: CategoryCapsulesProps) {
  // Map incoming stats to display items
  const items =
    categoryStats.length > 0
      ? categoryStats.slice(0, 7).map((stat) => {
          const IconComponent = ICON_MAP[stat.category] || Package;
          const shortName = CAPSULE_NAME_MAP[stat.category] || stat.category;

          return {
            name: stat.category,
            displayName: shortName,
            count: stat.count,
            icon: IconComponent,
          };
        })
      : DEFAULT_CATEGORIES;

  return (
    <section className="py-2.5 sm:py-3.5 bg-white border-b border-gray-150/70 shadow-2xs">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* On mobile: smooth horizontal snap scroll with peek. On md+: 7-column equal grid */}
        <div className="flex md:grid md:grid-cols-7 items-center justify-start md:justify-items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto md:overflow-visible scrollbar-hide py-1 px-1 snap-x snap-mandatory">
          {items.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center gap-1.5 shrink-0 w-[72px] sm:w-[84px] md:w-auto snap-center transition-transform duration-200 hover:-translate-y-1"
              >
                {/* Ronin-style circular icon capsule with ring */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-full bg-gray-50 border border-gray-200/80 group-hover:border-[#011b54] group-hover:bg-[#011b54]/5 group-hover:shadow-md group-hover:shadow-[#011b54]/15 flex items-center justify-center transition-all duration-300">
                  <Icon className="w-5.5 h-5.5 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5 text-gray-700 group-hover:text-[#011b54] transition-colors stroke-[1.75]" />
                </div>

                {/* Capsule Label - Clean centered text with zero truncation */}
                <span className="text-[11px] sm:text-xs font-semibold text-gray-800 group-hover:text-[#011b54] transition-colors text-center leading-tight whitespace-nowrap">
                  {cat.displayName}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
