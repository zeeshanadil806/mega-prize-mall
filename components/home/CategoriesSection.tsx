// components/home/CategoriesSection.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Gamepad2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Watch,
  Wifi,
  Shield,
  Tv,
  Battery,
  Package,
  SmartphoneCharging,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Category configuration with icons and colors
const CATEGORY_CONFIG = {
  "mobile-accessories": {
    name: "Mobile Accessories",
    icon: Smartphone,
    color: "from-[#7C2C78] to-[#A43875]",
  },
  "gaming-accessories": {
    name: "Gaming Accessories",
    icon: Gamepad2,
    color: "from-[#2E297D] to-[#7C2C78]",
  },
  "audio-multimedia": {
    name: "Audio & Multimedia",
    icon: Headphones,
    color: "from-[#A43875] to-[#EAB75F]",
  },
  "pc-laptop-accessories": {
    name: "PC & Laptop Accessories",
    icon: Laptop,
    color: "from-[#EAB75F] to-[#FF9F45]",
  },
  "smart-wearables": {
    name: "Smart Wearables",
    icon: Watch,
    color: "from-[#2E297D] to-[#A43875]",
  },
  "content-creation": {
    name: "Content Creation",
    icon: Camera,
    color: "from-[#7C2C78] to-[#2E297D]",
  },
  "tv-accessories": {
    name: "TV Accessories",
    icon: Tv,
    color: "from-[#A43875] to-[#7C2C78]",
  },
  "connectivity-accessories": {
    name: "Connectivity Accessories",
    icon: Wifi,
    color: "from-[#EAB75F] to-[#2E297D]",
  },
  "mobile-cases": {
    name: "Mobile Cases",
    icon: Shield,
    color: "from-[#7C2C78] to-[#EAB75F]",
  },
  "screen-protectors": {
    name: "Screen Protectors",
    icon: Shield,
    color: "from-[#2E297D] to-[#A43875]",
  },
  "power-charging": {
    name: "Power & Charging",
    icon: Battery,
    color: "from-[#EAB75F] to-[#7C2C78]",
  },
  "mobile-holders": {
    name: "Mobile Holders",
    icon: SmartphoneCharging,
    color: "from-[#A43875] to-[#2E297D]",
  },
  "other-accessories": {
    name: "Other Accessories",
    icon: Package,
    color: "from-[#7C2C78] to-[#EAB75F]",
  },
} as const;

type CategorySlug = keyof typeof CATEGORY_CONFIG;

interface CategoryData {
  id: CategorySlug;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  productCount: number;
  link: string;
  isActive: boolean;
}

interface CategoryStats {
  category: string;
  count: number;
}

const CategoriesSection = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  //   const [activeCategory, setActiveCategory] = useState<CategorySlug | null>(null);
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Fetch category data from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);

        // Fetch category counts from your API
        const response = await fetch("/api/products/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categoryStats: CategoryStats[] = await response.json();

        // Transform data with your configuration
        const categoryData: CategoryData[] = Object.entries(CATEGORY_CONFIG)
          .map(([slug, config]) => {
            const stats = categoryStats.find(
              (stat) =>
                stat.category.toLowerCase() === slug.toLowerCase() ||
                stat.category.toLowerCase() === config.name.toLowerCase()
            );

            return {
              id: slug as CategorySlug,
              name: config.name,
              description: getCategoryDescription(config.name),
              icon: config.icon,
              color: config.color,
              productCount: stats?.count || 0,
              link: `/products?category=${slug}`,
              isActive: (stats?.count || 0) > 0,
            };
          })
          .filter((category) => category.isActive)
          .sort((a, b) => b.productCount - a.productCount); // Sort by product count

        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories if API fails
        setCategories(getFallbackCategories());
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const getFallbackCategories = (): CategoryData[] => {
    return Object.entries(CATEGORY_CONFIG)
      .map(([slug, config]) => ({
        id: slug as CategorySlug,
        name: config.name,
        description: getCategoryDescription(config.name),
        icon: config.icon,
        color: config.color,
        productCount: Math.floor(Math.random() * 100) + 50, // Fallback random count
        link: `/products?category=${slug}`,
        isActive: true,
      }))
      .slice(0, 8); // Show top 8 categories as fallback
  };

  const getCategoryDescription = (categoryName: string): string => {
    const descriptions: Record<string, string> = {
      "Mobile Accessories": "Cases, Chargers, Screen Protectors",
      "Gaming Accessories": "Controllers, Headsets, Keyboards",
      "Audio & Multimedia": "Headphones, Speakers, Earbuds",
      "PC & Laptop Accessories": "Docks, Adapters, Cooling Pads",
      "Smart Wearables": "Smartwatches, Fitness Bands",
      "Content Creation": "Mics, Lights, Tripods",
      "TV Accessories": "Mounts, Soundbars, Remotes",
      "Connectivity Accessories": "Cables, Adapters, Hubs",
      "Mobile Cases": "Premium Cases, Covers, Protectors",
      "Screen Protectors": "Tempered Glass, Films, Privacy",
      "Power & Charging": "Power Banks, Chargers, Cables",
      "Mobile Holders": "Car Mounts, Desk Stands",
      "Other Accessories": "Miscellaneous Tech Accessories",
    };
    return descriptions[categoryName] || `${categoryName} Collection`;
  };

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardHoverVariants: Variants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const glowVariants = {
    initial: { opacity: 1 },
    hover: {
      opacity: 0.6,
      transition: { duration: 0.3 },
    },
  };

  if (loading) {
    return (
      <section className="bg-linear-to-b from-white to-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="bg-linear-to-b from-white to-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible" // <--- Add this
          viewport={{ once: true, amount: 0.1 }} // <--- Add this
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78] text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Shop by Category</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900">Explore </span>
            <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
              Premium Categories
            </span>
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing products across all categories. Each purchase gives
            you a chance to win big!
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        >
          {categories.slice(0, 8).map((category) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover="hover"
                initial="initial"
                className="relative"
              >
                {/* Glow Effect - Hidden on mobile for better performance */}
                <motion.div
                  variants={glowVariants}
                  className={`absolute inset-0 rounded-xl md:rounded-2xl bg-linear-to-r ${category.color} blur-xl -z-10 opacity-50 md:opacity-100`}
                />

                {/* Category Card */}
                <motion.div
                  variants={cardHoverVariants}
                  className="relative group"
                >
                  <Link href={category.link}>
                    <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-white border border-gray-200/50 hover:border-transparent shadow-sm hover:shadow-xl md:shadow-lg md:hover:shadow-2xl transition-all duration-300 h-full">
                      {/* Card Content */}
                      <div className="relative p-3 sm:p-4 md:p-6 h-full flex flex-col">
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className={`h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-lg md:rounded-xl bg-linear-to-r ${category.color} flex items-center justify-center mb-3 md:mb-4 shadow-md md:shadow-lg`}
                        >
                          <div className="text-white">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                          </div>
                        </motion.div>

                        {/* Category Info */}
                        <div className="flex-1 mb-2 md:mb-0">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 line-clamp-1 md:line-clamp-none mb-1 md:mb-2">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 md:line-clamp-2 mb-2 md:mb-4">
                            {category.description}
                          </p>
                        </div>

                        {/* Stats & CTA */}
                        <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-gray-100/50 md:border-gray-100">
                          <div className="text-xs sm:text-sm">
                            <span className="font-bold text-gray-900">
                              {category.productCount > 999
                                ? `${(category.productCount / 1000).toFixed(
                                    1
                                  )}k`
                                : category.productCount.toLocaleString()}
                            </span>
                            <span className="text-gray-500 ml-0.5 md:ml-1">
                              items
                            </span>
                          </div>

                          <div className="flex items-center text-[#7C2C78] font-medium text-xs sm:text-sm group-hover:text-[#A43875] transition-colors">
                            <span className="hidden xs:inline">Shop</span>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5 group-hover:translate-x-0.5 md:group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Categories Button */}
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          //   animate={controls}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-[#2E297D] text-[#2E297D] hover:bg-[#2E297D] hover:text-white px-8 py-6 text-lg transition-all duration-300"
            >
              <span>View All Categories</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
