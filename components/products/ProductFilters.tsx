// components/products/MobileFilters.tsx (Client Component)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { 
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { formatCurrency } from '@/shared/format';

interface MobileFiltersProps {
  categories: string[];
  priceRange: { min: number; max: number };
  selectedCategory?: string;
  selectedMinPrice?: string;
  selectedMaxPrice?: string;
  selectedSortBy?: string;
  searchQuery?: string;
}

export default function MobileFilters({
  categories,
  priceRange,
  selectedCategory,
  selectedMinPrice,
  selectedMaxPrice,
  selectedSortBy,
  searchQuery,
}: MobileFiltersProps) {
  const router = useRouter();
  const [priceRangeLocal, setPriceRangeLocal] = useState<[number, number]>([
    parseInt(selectedMinPrice || priceRange.min.toString()),
    parseInt(selectedMaxPrice || priceRange.max.toString()),
  ]);
  
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    
    // Keep existing params
    if (searchQuery) params.set('search', searchQuery);
    if (selectedSortBy) params.set('sortBy', selectedSortBy);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedMinPrice) params.set('minPrice', selectedMinPrice);
    if (selectedMaxPrice) params.set('maxPrice', selectedMaxPrice);
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset page when filters change
    params.delete('page');
    
    // Close drawer and navigate
    const drawer = document.getElementById('mobile-filter-drawer');
    if (drawer) {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
      // document.body.style.overflow = 'auto';
    }
    
    router.push(`/products?${params.toString()}`);
  };
  
  const handlePriceChange = (value: number[]) => {
    setPriceRangeLocal([value[0], value[1]]);
  };
  
  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRangeLocal[0].toString(),
      maxPrice: priceRangeLocal[1].toString(),
    });
  };
  
  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    
    // Close drawer
    const drawer = document.getElementById('mobile-filter-drawer');
    if (drawer) {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
      document.body.style.overflow = 'auto';
    }
    
    router.push(`/products?${params.toString()}`);
  };
  
  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-[#7C2C78]" />
          <h3 className="font-semibold text-gray-900">Filter & Sort</h3>
        </div>
        {(selectedCategory || selectedMinPrice || selectedMaxPrice || selectedSortBy) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      {/* Sort By Section */}
      <div className="border-b pb-4">
        <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updateFilters({
                  sortBy: selectedSortBy === option.value ? undefined : option.value,
                });
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSortBy === option.value
                  ? 'bg-[#7C2C78] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="border-b pb-4">
        <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <button
            onClick={() => {
              updateFilters({ category: undefined });
            }}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              !selectedCategory
                ? 'bg-[#7C2C78] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                updateFilters({
                  category: selectedCategory === category ? undefined : category,
                });
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-[#7C2C78] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Price Range Section */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Price Range</h4>
          {(selectedMinPrice || selectedMaxPrice) && (
            <button
              onClick={() => {
                updateFilters({
                  minPrice: undefined,
                  maxPrice: undefined,
                });
                setPriceRangeLocal([priceRange.min, priceRange.max]);
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Min: {formatCurrency(priceRangeLocal[0])}</span>
              <span className="text-gray-600">Max: {formatCurrency(priceRangeLocal[1])}</span>
            </div>
            
            <Slider
              value={priceRangeLocal}
              min={priceRange.min}
              max={priceRange.max}
              step={100}
              onValueChange={handlePriceChange}
              className="py-4"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatCurrency(priceRange.min)}</span>
              <span>{formatCurrency(priceRange.max)}</span>
            </div>
          </div>
          
          <Button
            onClick={applyPriceFilter}
            className="w-full bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white"
          >
            Apply Price Filter
          </Button>
        </div>
      </div>
    </div>
  );
}