import CustomerFooter from "@/components/customer/CustomerFooter"
import Header from "@/components/customer/Header"
import { getCategoryStats } from "@/features/product/service"

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categoryStats = await getCategoryStats();

  return (
    <div className="bg-linear-to-b from-gray-50 to-white scroll-smooth">
      {/* Parallax background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden hidden md:block" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-r from-[#EAB75F]/10 to-[#2E297D]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Header categoryStats={categoryStats} />

      <main className="mx-auto">
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      <CustomerFooter />
    </div>
  )
}