// components/products/ProductFilters.tsx (Client Component)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { formatCurrency } from '@/lib/bargain-utils';

interface ProductFiltersProps {
  categories: string[];
  priceRange: { min: number; max: number };
  selectedCategory?: string;
  selectedMinPrice?: string;
  selectedMaxPrice?: string;
  selectedSortBy?: string;
  searchQuery?: string;
}

export default function ProductFilters({
  categories,
  priceRange,
  selectedCategory,
  selectedMinPrice,
  selectedMaxPrice,
  selectedSortBy,
  searchQuery,
}: ProductFiltersProps) {
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
  
  const clearPriceFilter = () => {
    setPriceRangeLocal([priceRange.min, priceRange.max]);
    updateFilters({
      minPrice: undefined,
      maxPrice: undefined,
    });
  };
  
  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h2>
        {(selectedCategory || selectedMinPrice || selectedMaxPrice) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/products')}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      <Accordion type="multiple" defaultValue={['sort', 'category', 'price']} className="space-y-4">
        {/* Sort By */}
        <AccordionItem value="sort" className="border-b-0">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="font-medium text-gray-900">Sort By</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sort-${option.value}`}
                    checked={selectedSortBy === option.value}
                    onCheckedChange={(checked) => {
                      updateFilters({
                        sortBy: checked ? option.value : undefined,
                      });
                    }}
                  />
                  <Label
                    htmlFor={`sort-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Categories */}
        <AccordionItem value="category" className="border-b-0">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="font-medium text-gray-900">Categories</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="category-all"
                  checked={!selectedCategory}
                  onCheckedChange={() => {
                    updateFilters({ category: undefined });
                  }}
                />
                <Label htmlFor="category-all" className="text-sm font-normal cursor-pointer">
                  All Categories
                </Label>
              </div>
              
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategory === category}
                    onCheckedChange={(checked) => {
                      updateFilters({
                        category: checked ? category : undefined,
                      });
                    }}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Price Range */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="font-medium text-gray-900">Price Range</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
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
              
              <div className="flex gap-2">
                <Button
                  onClick={applyPriceFilter}
                  size="sm"
                  className="flex-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white"
                >
                  Apply Price
                </Button>
                {(selectedMinPrice || selectedMaxPrice) && (
                  <Button
                    onClick={clearPriceFilter}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Quick Filters */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="font-medium text-gray-900 mb-3">Quick Filters</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-green-600 hover:text-green-700 hover:border-green-200"
            onClick={() => updateFilters({ category: 'Electronics' })}
          >
            🎮 Electronics
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:border-blue-200"
            onClick={() => updateFilters({ category: 'Fashion' })}
          >
            👗 Fashion
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-[#EAB75F] hover:text-[#D9A64E] hover:border-[#EAB75F]/20"
            onClick={() => router.push('/products?bargainEnabled=true')}
          >
            💰 Bargain Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:border-red-200"
            onClick={() => router.push('/products?isOnSale=true')}
          >
            🔥 On Sale
          </Button>
        </div>
      </div>
    </div>
  );
}