// components/products/MobileFilterDrawer.tsx (Client Component)
'use client';

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
      drawer.classList.add('translate-x-full', 'invisible', 'pointer-events-none');
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
      className="fixed inset-0 z-50 translate-x-full invisible pointer-events-none transition-transform duration-300 lg:hidden"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawerOnBackdropClick}
      />
      
      {/* Drawer Content - Clean full width on phone, max-w-md on tablet */}
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col">
        <MobileFilters
          categories={categories}
          priceRange={priceRange}
          selectedCategory={searchParams.category as string}
          selectedMinPrice={searchParams.minPrice as string}
          selectedMaxPrice={searchParams.maxPrice as string}
          selectedSortBy={searchParams.sortBy as string}
          selectedBargain={searchParams.bargain as string}
          selectedNew={searchParams.new as string}
          searchQuery={searchParams.search as string}
          onClose={closeDrawer}
        />
      </div>
    </div>
  );
}
