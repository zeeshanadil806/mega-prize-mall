// components/customer/AnnouncementBar.tsx
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="relative bg-[#011646] text-[11px] sm:text-[11.5px] py-2 border-b border-white/10 overflow-hidden text-white w-full max-w-full">
      {/* Subtle crystalline sheen across the navy bar */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />

      <div className="container mx-auto flex items-center justify-between relative z-10 px-3 sm:px-6 w-full max-w-full min-w-0">
        {/* Left: animated marquee promo */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 flex-1">
          {/* Live pulse dot */}
          <span className="relative flex-shrink-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="font-black text-white tracking-tight flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5 text-blue-300" />
              Mega Lucky Draw Program
            </span>
          </span>

          {/* Separator */}
          <span className="hidden sm:inline text-white/20 flex-shrink-0">|</span>

          {/* Scrolling ticker */}
          <div className="hidden sm:block overflow-hidden flex-1 max-w-xs lg:max-w-sm">
            <div className="marquee-track flex items-center gap-8 whitespace-nowrap text-blue-100/80 font-medium">
              <span>🎁 Win prizes every week — join the draw</span>
              <span className="text-white/20">•</span>
              <span>💎 <Link href="/products?bargain=true" className="text-white font-semibold underline hover:text-blue-200">Live Bargain Zone Sale</Link> — AI-powered deals</span>
              <span className="text-white/20">•</span>
              <span>🎁 Win prizes every week — join the draw</span>
              <span className="text-white/20">•</span>
              <span>💎 <Link href="/products?bargain=true" className="text-white font-semibold underline hover:text-blue-200">Live Bargain Zone Sale</Link> — AI-powered deals</span>
            </div>
          </div>

          {/* Mobile fallback (no marquee) */}
          <Link
            href="/products?bargain=true"
            className="sm:hidden font-semibold text-blue-200 hover:text-white transition-colors text-[10.5px] shrink-0"
          >
            Bargain Sale →
          </Link>
        </div>

        {/* Right: utility links */}
        <div className="flex items-center gap-3 sm:gap-4 text-blue-100/70 flex-shrink-0">
          <Link href="/about" className="hover:text-white transition-colors hidden lg:inline">
            Guarantee
          </Link>
          <span className="hidden lg:inline text-white/15">•</span>
          <Link href="/dashboard/orders" className="hover:text-white transition-colors hidden sm:inline">
            Track Orders
          </Link>
          <span className="hidden sm:inline text-white/15">•</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
