import Link from "next/link";
import { DollarSign } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white text-[12px] py-2 px-4">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>Cash on Delivery Available!</span>
        </div>
        <Link
          href="/products?bargain=true"
          className="underline hover:no-underline font-medium"
        >
          Shop Now →
        </Link>
      </div>
    </div>
  );
}
