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
  "Mobile Accessories": {
    name: "Mobile Accessories",
    icon: Smartphone,
    color: "from-[#7C2C78] to-[#A43875]",
  },
  "Gaming Accessories": {
    name: "Gaming Accessories",
    icon: Gamepad2,
    color: "from-[#2E297D] to-[#7C2C78]",
  },
  "Audio and Multimedia": {
    name: "Audio and Multimedia",
    icon: Headphones,
    color: "from-[#A43875] to-[#EAB75F]",
  },
  "PC and Laptop Accessories": {
    name: "PC and Laptop Accessories",
    icon: Laptop,
    color: "from-[#EAB75F] to-[#FF9F45]",
  },
  "Smart Wearables": {
    name: "Smart Wearables",
    icon: Watch,
    color: "from-[#2E297D] to-[#A43875]",
  },
  "Content Creation": {
    name: "Content Creation and Vlogging",
    icon: Camera,
    color: "from-[#7C2C78] to-[#2E297D]",
  },
  "Tv Accessories": {
    name: "TV Accessories",
    icon: Tv,
    color: "from-[#A43875] to-[#7C2C78]",
  },
  "Connectivity Accessories": {
    name: "Connectivity Accessories",
    icon: Wifi,
    color: "from-[#EAB75F] to-[#2E297D]",
  },
  "Mobile Cases": {
    name: "Mobile Cases",
    icon: Shield,
    color: "from-[#7C2C78] to-[#EAB75F]",
  },
  "Screen Protectors": {
    name: "Screen Protectors",
    icon: Shield,
    color: "from-[#2E297D] to-[#A43875]",
  },
  "Power Charging": {
    name: "Charging & cables",
    icon: Battery,
    color: "from-[#EAB75F] to-[#7C2C78]",
  },
  "Mobile Holders": {
    name: "Mobile Holders",
    icon: SmartphoneCharging,
    color: "from-[#A43875] to-[#2E297D]",
  },
  "Other Accessories": {
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
                stat.category.toLowerCase() === config.name.toLowerCase(),
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
          className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4 md:gap-6"
        >
          {categories.slice(0, 8).map((category) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover="hover"
                initial="initial"
                className="relative flex flex-col items-center"
              >
                {/* Glow Effect - Hidden on mobile */}
                <motion.div
                  variants={glowVariants}
                  className={`absolute inset-0 rounded-full bg-linear-to-r blur-xl -z-10 opacity-30 md:opacity-50`}
                />

                {/* Round Category Circle */}
                <motion.div
                  variants={cardHoverVariants}
                  className="relative group"
                >
                  <Link href={category.link} className="block">
                    <div className="relative overflow-hidden rounded-full bg-white border border-gray-200/50 hover:border-transparent shadow-sm hover:shadow-xl md:shadow-md md:hover:shadow-xl transition-all duration-300">
                      {/* Circular Container */}
                      <div className="relative aspect-square flex items-center justify-center">
                        {/* Icon Container with Gradient */}
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-full bg-linear-to-r ${category.color} flex items-center justify-center shadow-md md:shadow-lg`}
                        >
                          <div className="text-white">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Category Name - Below the circle */}
                <div className="mt-2 text-center">
                  <Link href={category.link}>
                    <h3 className="text-xs xs:text-xs sm:text-sm md:text-base font-medium text-gray-900 hover:text-[#7C2C78] transition-colors line-clamp-1 xs:hidden sm:block">
                      {category.name}
                    </h3>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Categories Button */}
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 sm:mt-8 md:mt-10 lg:mt-12"
        >
          <Link href="/categories">
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-[#2E297D] text-[#2E297D] hover:bg-[#2E297D] hover:text-white transition-all duration-300 mb-2"
            >
              {/* Responsive padding and text size */}
              <span className="px-5 py-2.5 sm:px-7 sm:py-3 md:px-8 md:py-4 text-sm sm:text-base md:text-lg font-medium">
                View All Categories
                <ArrowRight className="ml-1.5 sm:ml-2 md:ml-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-0.5 sm:group-hover:translate-x-1 transition-transform inline-block" />
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
