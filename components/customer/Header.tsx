import AnnouncementBar from "./AnnouncementBar";
import HeaderInteractive from "./HeaderInteractive";
import QuickCategoriesBar from "./QuickCategoriesBar";
import type { CategoryStat } from "@/features/product/domain";

interface HeaderProps {
  categoryStats?: CategoryStat[];
}

export default function Header({ categoryStats = [] }: HeaderProps) {
  return (
    <>
      <AnnouncementBar />
      <HeaderInteractive categoryStats={categoryStats} />
      <QuickCategoriesBar categoryStats={categoryStats} />
    </>
  );
}
