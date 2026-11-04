// components/products/ProductFilters.tsx (Desktop Filter Sidebar)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Filter, X, Check, Zap, Sparkles, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/shared/format';

export interface CategoryStatProp {
  category: string;
  count: number;
}

interface ProductFiltersProps {
  categories?: string[];
  categoryStats?: CategoryStatProp[];
  priceRange: { min: number; max: number };
  selectedCategory?: string;
  selectedMinPrice?: string;
  selectedMaxPrice?: string;
  selectedSortBy?: string;
  selectedBargain?: string;
  selectedNew?: string;
  searchQuery?: string;
}

// Canonical categories mapped 1:1 with real catalog inventory
const NORMALIZED_CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Mobile & Holders', slug: 'Mobile Accessories' },
  { name: 'Earbuds & Audio', slug: 'Audio and Multimedia' },
  { name: 'Smart Watches', slug: 'Smart Wearables' },
  { name: 'Power & Charging', slug: 'Power and Charging' },
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

export default function ProductFilters({
  categoryStats = [],
  priceRange,
  selectedCategory = '',
  selectedMinPrice = '',
  selectedMaxPrice = '',
  selectedSortBy = 'newest',
  selectedBargain = '',
  selectedNew = '',
  searchQuery = '',
}: ProductFiltersProps) {
  const router = useRouter();

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

  // Build count map from canonical category stats
  const countMap: Record<string, number> = {};
  let totalCount = 0;
  (categoryStats || []).forEach((s) => {
    countMap[s.category] = s.count;
    totalCount += s.count;
  });

  const activeFilterCount =
    (localCategory ? 1 : 0) +
    (localBargain ? 1 : 0) +
    (localNew ? 1 : 0) +
    (localSortBy && localSortBy !== 'newest' ? 1 : 0) +
    (sliderRange[0] > safeMin || sliderRange[1] < safeMax ? 1 : 0);

  const applyUpdates = (updates: {
    category?: string;
    sortBy?: string;
    bargain?: boolean;
    newArrival?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const params = new URLSearchParams();

    // Preserve search query
    if (searchQuery) params.set('search', searchQuery);

    // Category
    const newCat = updates.category !== undefined ? updates.category : localCategory;
    if (newCat) params.set('category', newCat);

    // Sort By
    const newSort = updates.sortBy !== undefined ? updates.sortBy : localSortBy;
    if (newSort && newSort !== 'newest') params.set('sortBy', newSort);

    // Bargain
    const newBargain = updates.bargain !== undefined ? updates.bargain : localBargain;
    if (newBargain) params.set('bargain', 'true');

    // New arrivals
    const newArrival = updates.newArrival !== undefined ? updates.newArrival : localNew;
    if (newArrival) params.set('new', 'true');

    // Price
    const newMin = updates.minPrice !== undefined ? updates.minPrice : sliderRange[0];
    const newMax = updates.maxPrice !== undefined ? updates.maxPrice : sliderRange[1];
    if (newMin > safeMin) params.set('minPrice', newMin.toString());
    if (newMax < safeMax) params.set('maxPrice', newMax.toString());

    // Reset page to 1
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  const handleClearAll = () => {
    setLocalCategory('');
    setLocalSortBy('newest');
    setLocalBargain(false);
    setLocalNew(false);
    setSliderRange([safeMin, safeMax]);

    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#011b54]/5 flex items-center justify-center text-[#011b54]">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">Filter Products</h3>
            <p className="text-[11px] text-gray-500">Tailor your gadget search</p>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Quick USP Highlights */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Highlights & Deals
        </label>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !localBargain;
              setLocalBargain(next);
              applyUpdates({ bargain: next });
            }}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              localBargain
                ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-gray-50/70 border-gray-200/80 text-gray-700 hover:bg-gray-100/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className={`h-4 w-4 ${localBargain ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
              <span>Bargain Deals Only</span>
            </div>
            {localBargain && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !localNew;
              setLocalNew(next);
              applyUpdates({ newArrival: next });
            }}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              localNew
                ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs'
                : 'bg-gray-50/70 border-gray-200/80 text-gray-700 hover:bg-gray-100/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${localNew ? 'text-[#011b54]' : 'text-gray-400'}`} />
              <span>New Arrivals</span>
            </div>
            {localNew && (
              <span className="w-5 h-5 rounded-full bg-[#011b54] text-white flex items-center justify-center">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Canonical Categories */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Categories
        </label>
        <div className="space-y-1">
          {NORMALIZED_CATEGORIES.map((cat) => {
            const isSelected =
              cat.slug === '' ? !localCategory : localCategory.toLowerCase() === cat.slug.toLowerCase();
            const itemCount = cat.slug === '' ? totalCount : countMap[cat.slug] || 0;

            return (
              <button
                key={cat.slug || 'all'}
                type="button"
                onClick={() => {
                  setLocalCategory(cat.slug);
                  applyUpdates({ category: cat.slug });
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#011b54] text-white shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100/80'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Price Range
          </label>
          {(sliderRange[0] > safeMin || sliderRange[1] < safeMax) && (
            <button
              onClick={() => {
                setSliderRange([safeMin, safeMax]);
                applyUpdates({ minPrice: safeMin, maxPrice: safeMax });
              }}
              className="text-[11px] font-semibold text-rose-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Budget Chips */}
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_PRESETS.map((preset) => {
            const minVal = preset.min ? parseInt(preset.min) : safeMin;
            const maxVal = preset.max ? parseInt(preset.max) : safeMax;
            const isPresetActive = sliderRange[0] === minVal && sliderRange[1] === maxVal;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSliderRange([minVal, maxVal]);
                  applyUpdates({ minPrice: minVal, maxPrice: maxVal });
                }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  isPresetActive
                    ? 'bg-[#011b54] border-[#011b54] text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Dual Slider */}
        <div className="pt-2 px-1">
          <Slider
            value={sliderRange}
            min={safeMin}
            max={safeMax}
            step={100}
            onValueChange={(val) => setSliderRange([val[0], val[1]])}
            className="py-2"
          />
        </div>

        {/* Min / Max inputs */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[10px] text-gray-400 font-semibold block">Min</span>
            <span className="font-bold text-gray-800">{formatCurrency(sliderRange[0])}</span>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-right">
            <span className="text-[10px] text-gray-400 font-semibold block">Max</span>
            <span className="font-bold text-gray-800">{formatCurrency(sliderRange[1])}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => applyUpdates({ minPrice: sliderRange[0], maxPrice: sliderRange[1] })}
          className="w-full py-2 bg-linear-to-r from-[#011b54] to-[#022b82] hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
        >
          Apply Price
        </button>
      </div>

      {/* Sort By */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Sort By
        </label>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = localSortBy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setLocalSortBy(opt.value);
                  applyUpdates({ sortBy: opt.value });
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#011b54]/10 text-[#011b54] font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#011b54] stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
