// components/customer/Header.tsx
import AnnouncementBar from "./AnnouncementBar";
import HeaderInteractive from "./HeaderInteractive";
import type { CategoryStat, MegaMenuProduct } from "@/features/product/domain";

interface HeaderProps {
  categoryStats?: CategoryStat[];
  megaMenuProducts?: Record<string, MegaMenuProduct[]>;
}

export default function Header({
  categoryStats = [],
  megaMenuProducts = {},
}: HeaderProps) {
  return (
    <>
      <AnnouncementBar />
      <HeaderInteractive
        categoryStats={categoryStats}
        megaMenuProducts={megaMenuProducts}
      />
    </>
  );
}
