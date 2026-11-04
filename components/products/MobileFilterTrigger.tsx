// components/products/MobileFilterTrigger.tsx (Client Component)
'use client';

import { SlidersHorizontal } from 'lucide-react';

interface MobileFilterTriggerProps {
  activeCount?: number;
}

export default function MobileFilterTrigger({ activeCount = 0 }: MobileFilterTriggerProps) {
  const openDrawer = () => {
    const drawer = document.getElementById('mobile-filter-drawer');
    if (drawer) {
      drawer.classList.remove('translate-x-full', 'invisible', 'pointer-events-none');
      drawer.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    }
  };

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 bg-white border border-gray-200/90 hover:border-[#011b54] active:bg-gray-50 text-gray-800 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0"
      onClick={openDrawer}
      aria-label="Open product filters"
    >
      <SlidersHorizontal className="h-3.5 w-3.5 text-[#011b54]" />
      <span>Filters</span>
      {activeCount > 0 && (
        <span className="w-4.5 h-4.5 rounded-full bg-[#011b54] text-white text-[10px] font-extrabold flex items-center justify-center ml-0.5">
          {activeCount}
        </span>
      )}
    </button>
  );
}