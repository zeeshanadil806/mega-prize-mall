// components/products/QuickSortSelect.tsx (Client Component)
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

interface QuickSortSelectProps {
  currentSort?: string;
}

export default function QuickSortSelect({ currentSort = 'newest' }: QuickSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val && val !== 'newest') {
      params.set('sortBy', val);
    } else {
      params.delete('sortBy');
    }
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 shrink-0">
      <div className="relative flex items-center">
        <ArrowUpDown className="absolute left-2.5 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
        <select
          id="quick-sort-select"
          value={currentSort || 'newest'}
          onChange={handleSortChange}
          aria-label="Sort products"
          className="h-8 sm:h-9 pl-7 pr-3 sm:pr-4 bg-white border border-gray-200/90 hover:border-[#011b54] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-gray-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#011b54]/20 focus:border-[#011b54] cursor-pointer appearance-none transition-all"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}

