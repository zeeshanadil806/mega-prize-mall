// components/products/MobileFilters.tsx (Client Component)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { X, Check, Zap, Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/shared/format';

interface MobileFiltersProps {
  categories: string[];
  priceRange: { min: number; max: number };
  selectedCategory?: string;
  selectedMinPrice?: string;
  selectedMaxPrice?: string;
  selectedSortBy?: string;
  selectedBargain?: string;
  selectedNew?: string;
  searchQuery?: string;
  onClose?: () => void;
}

// Normalized primary categories with consumer-friendly labels
const NORMALIZED_CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Earbuds & Audio', slug: 'Audio and Multimedia' },
  { name: 'Smart Watches', slug: 'Smart Wearables' },
  { name: 'Power & Charging', slug: 'Power and Charging' },
  { name: 'Mobile & Holders', slug: 'Mobile Accessories' },
  { name: 'Gaming Gear', slug: 'Gaming Accessories' },
  { name: 'PC & Laptops', slug: 'PC and Laptop Accessories' },
  { name: 'Other Accessories', slug: 'Other Accessories' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const BUDGET_PRESETS = [
  { label: 'All', min: '', max: '' },
  { label: '< 1.5K', min: '', max: '1500' },
  { label: '1.5K - 3.5K', min: '1500', max: '3500' },
  { label: '3.5K - 7K', min: '3500', max: '7000' },
  { label: '7K+', min: '7000', max: '' },
];

export default function MobileFilters({
  categories: _categories,
  priceRange,
  selectedCategory = '',
  selectedMinPrice = '',
  selectedMaxPrice = '',
  selectedSortBy = 'newest',
  selectedBargain = '',
  selectedNew = '',
  searchQuery = '',
  onClose,
}: MobileFiltersProps) {
  const router = useRouter();

  // Local state so the user can configure multiple filters without the drawer closing prematurely
  const [localCategory, setLocalCategory] = useState<string>(selectedCategory);
  const [localSortBy, setLocalSortBy] = useState<string>(selectedSortBy || 'newest');
  const [localBargain, setLocalBargain] = useState<boolean>(selectedBargain === 'true');
  const [localNew, setLocalNew] = useState<boolean>(selectedNew === 'true');

  const safeMin = priceRange?.min ?? 0;
  const safeMax = priceRange?.max ?? 20000;

  const [sliderRange, setSliderRange] = useState<[number, number]>([
    selectedMinPrice ? parseInt(selectedMinPrice) : safeMin,
    selectedMaxPrice ? parseInt(selectedMaxPrice) : safeMax,
  ]);

  // Adjust local state during render when URL filter props change (React 19 pattern avoiding effect cascades)
  const currentFilterKey = `${selectedCategory}|${selectedSortBy}|${selectedBargain}|${selectedNew}|${selectedMinPrice}|${selectedMaxPrice}|${safeMin}|${safeMax}`;
  const [prevFilterKey, setPrevFilterKey] = useState(currentFilterKey);

  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setLocalCategory(selectedCategory || '');
    setLocalSortBy(selectedSortBy || 'newest');
    setLocalBargain(selectedBargain === 'true');
    setLocalNew(selectedNew === 'true');
    setSliderRange([
      selectedMinPrice ? parseInt(selectedMinPrice) : safeMin,
      selectedMaxPrice ? parseInt(selectedMaxPrice) : safeMax,
    ]);
  }

  const activeFilterCount =
    (localCategory ? 1 : 0) +
    (localBargain ? 1 : 0) +
    (localNew ? 1 : 0) +
    (localSortBy && localSortBy !== 'newest' ? 1 : 0) +
    (sliderRange[0] > safeMin || sliderRange[1] < safeMax ? 1 : 0);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    // Preserve search query if present
    if (searchQuery) params.set('search', searchQuery);

    // Apply category
    if (localCategory) params.set('category', localCategory);

    // Apply sort
    if (localSortBy && localSortBy !== 'newest') params.set('sortBy', localSortBy);

    // Apply feature toggles
    if (localBargain) params.set('bargain', 'true');
    if (localNew) params.set('new', 'true');

    // Apply price range
    if (sliderRange[0] > safeMin) params.set('minPrice', sliderRange[0].toString());
    if (sliderRange[1] < safeMax) params.set('maxPrice', sliderRange[1].toString());

    // Reset pagination
    params.delete('page');

    if (onClose) onClose();
    router.push(`/products?${params.toString()}`);
  };

  const handleResetAll = () => {
    setLocalCategory('');
    setLocalSortBy('newest');
    setLocalBargain(false);
    setLocalNew(false);
    setSliderRange([safeMin, safeMax]);

    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);

    if (onClose) onClose();
    router.push(`/products?${params.toString()}`);
  };

  const handlePresetClick = (min: string, max: string) => {
    const parsedMin = min ? parseInt(min) : safeMin;
    const parsedMax = max ? parseInt(max) : safeMax;
    setSliderRange([parsedMin, parsedMax]);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. Sleek Single Header (No Duplication) */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-150 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-[#011b54]" />
          <h2 className="text-base font-black text-gray-900 tracking-tight">
            Filters & Refinements
          </h2>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#011b54] text-white text-[10px] font-extrabold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body with Clean Touch Target Spacing */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Quick Toggles: Platform USPs */}
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2.5">
            Special Highlights
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Bargain Filter */}
            <button
              type="button"
              onClick={() => setLocalBargain(!localBargain)}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                localBargain
                  ? 'bg-amber-500/10 border-amber-500 text-amber-900 shadow-2xs'
                  : 'bg-white border-gray-200/90 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Zap className={`w-4 h-4 shrink-0 ${localBargain ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                <span className="truncate">Bargain Deals</span>
              </div>
              {localBargain && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
            </button>

            {/* New Arrivals Filter */}
            <button
              type="button"
              onClick={() => setLocalNew(!localNew)}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                localNew
                  ? 'bg-blue-500/10 border-[#011b54] text-[#011b54] shadow-2xs'
                  : 'bg-white border-gray-200/90 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Sparkles className={`w-4 h-4 shrink-0 ${localNew ? 'text-[#011b54] fill-[#011b54]' : 'text-gray-400'}`} />
                <span className="truncate">New Arrivals</span>
              </div>
              {localNew && <Check className="w-3.5 h-3.5 text-[#011b54] shrink-0 ml-1" />}
            </button>
          </div>
        </div>

        {/* Sort By Section */}
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2.5">
            Sort Products
          </span>
          <div className="grid grid-cols-2 gap-2">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = localSortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLocalSortBy(opt.value)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isSelected
                      ? 'bg-[#011b54] text-white border-[#011b54] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200/90 hover:border-gray-300'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Section - Compact 2-Column Grid */}
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2.5">
            Categories
          </span>
          <div className="grid grid-cols-2 gap-2">
            {NORMALIZED_CATEGORIES.map((cat) => {
              const isSelected = localCategory === cat.slug;
              return (
                <button
                  key={cat.slug || 'all'}
                  type="button"
                  onClick={() => setLocalCategory(cat.slug)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                    isSelected
                      ? 'bg-[#011b54] text-white border-[#011b54] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200/90 hover:border-gray-300'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Price Range (PKR)
            </span>
            {(sliderRange[0] > safeMin || sliderRange[1] < safeMax) && (
              <button
                type="button"
                onClick={() => setSliderRange([safeMin, safeMax])}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Price</span>
              </button>
            )}
          </div>

          {/* Quick Budget Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {BUDGET_PRESETS.map((preset) => {
              const pMin = preset.min ? parseInt(preset.min) : safeMin;
              const pMax = preset.max ? parseInt(preset.max) : safeMax;
              const isSelected = sliderRange[0] === pMin && sliderRange[1] === pMax;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset.min, preset.max)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    isSelected
                      ? 'bg-[#011b54] text-white border-[#011b54]'
                      : 'bg-gray-50 text-gray-700 border-gray-200/80 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Min/Max Display Cards */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Min Price</span>
              <span className="text-xs font-black text-gray-900">{formatCurrency(sliderRange[0])}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Max Price</span>
              <span className="text-xs font-black text-gray-900">{formatCurrency(sliderRange[1])}</span>
            </div>
          </div>

          {/* Slider */}
          <div className="px-1 py-2">
            <Slider
              value={sliderRange}
              min={safeMin}
              max={safeMax}
              step={100}
              onValueChange={(val) => setSliderRange([val[0], val[1]])}
              className="py-2"
            />
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Action Bar with Single Tap Commit */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-4 pt-3 pb-[max(22px,calc(env(safe-area-inset-bottom,0px)+14px))] border-t border-gray-150 flex items-center gap-2.5 shadow-lg">
        <button
          type="button"
          onClick={handleResetAll}
          className="w-1/3 py-3 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="w-2/3 py-3 px-4 rounded-xl bg-linear-to-r from-[#011b54] to-[#022b82] hover:from-[#022b82] hover:to-[#011b54] text-white text-xs sm:text-sm font-bold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Show Results</span>
        </button>
      </div>
    </div>
  );
}
