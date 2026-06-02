// components/home/NewArrivals.tsx
"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import {
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProductCard from "../products/ProductCard";
import { CustomerProductProps } from "@/types";

interface NewArrivalsProps {
  products: CustomerProductProps[];
}

const NewArrivals = ({ products }: NewArrivalsProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  // No products state
  if (products.length === 0) {
    return (
      <section className="py-20 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-4">
            <Clock className="h-4 w-4" />
            <span>No New Arrivals Yet</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h2>

          <p className="text-gray-600 mb-6">
            Check back soon for exciting new products!
          </p>

          <Link href="/products">
            <Button>Explore All Products</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-10 bg-linear-to-b from-white to-gray-50">
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
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="mb-6 lg:mb-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 text-[#EAB75F] text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              <span>Fresh Arrivals</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              {/* <span className="text-gray-900">Hot </span> */}
              <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
                New Arrivals
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-600 sm:max-w-sm md:max-w-lg lg:max-w-2xl mx-auto">
              Discover the latest products just added to our collection
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Updated daily</span>
            </div>

            <Link href="/products?new=true">
              <Button
                variant="ghost"
                className="text-[#7C2C78] hover:text-[#6A2566] hover:bg-[#7C2C78]/10"
              >
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* New Arrivals Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        >
          {products.map((product, idx) => (
            <ProductCard
              key={product._id.toString()}
              product={product}
              priority={idx < 5}
            />
          ))}
        </motion.div>

        {/* View More Button if more than 4 products */}
        {products.length > 4 && (
          <div className="text-center mt-8">
            <Link href="/products?new=true">
              <Button
                variant="outline"
                className="border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78] hover:text-white"
              >
                View More
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
