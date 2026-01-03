// components/products/MobileFilterDrawer.tsx (Client Component)
'use client';

import { X } from 'lucide-react';
import MobileFilters from './MobileFilters';

interface MobileFilterDrawerProps {
  categories: string[];
  priceRange: { min: number; max: number };
  searchParams: Record<string, string | string[] | undefined>;
}

export default function MobileFilterDrawer({
  categories,
  priceRange,
  searchParams,
}: MobileFilterDrawerProps) {
  const closeDrawer = () => {
    const drawer = document.getElementById('mobile-filter-drawer');
    if (drawer) {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
      document.body.style.overflow = 'auto';
    }
  };

  const closeDrawerOnBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeDrawer();
    }
  };

  return (
    <div
      id="mobile-filter-drawer"
      className="fixed inset-0 z-50 translate-x-full transition-transform duration-300 lg:hidden"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeDrawerOnBackdropClick}
      />
      
      {/* Drawer Content */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Mobile Filters Component */}
            <MobileFilters
              categories={categories}
              priceRange={priceRange}
              selectedCategory={searchParams.category as string}
              selectedMinPrice={searchParams.minPrice as string}
              selectedMaxPrice={searchParams.maxPrice as string}
              selectedSortBy={searchParams.sortBy as string}
              searchQuery={searchParams.search as string}
            />
            
            {/* Apply Filters Button */}
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <button
                onClick={closeDrawer}
                className="w-full py-3 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg font-medium hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}