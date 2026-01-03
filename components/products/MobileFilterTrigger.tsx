// components/products/MobileFilterTrigger.tsx (Client Component)
'use client';

import { Filter } from 'lucide-react';

export default function MobileFilterTrigger() {
  const openDrawer = () => {
    const drawer = document.getElementById('mobile-filter-drawer');
    if (drawer) {
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    }
  };

  return (
    <button
      className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all"
      onClick={openDrawer}
    >
      <Filter className="h-5 w-5" />
      <span>Filters</span>
    </button>
  );
}