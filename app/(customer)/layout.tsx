import CustomerFooter from "@/components/customer/CustomerFooter"
import Header from "@/components/customer/Header"
import { getCategoryStats, getHeaderMegaMenuProducts } from "@/features/product/service"

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [categoryStats, megaMenuProducts] = await Promise.all([
    getCategoryStats(),
    getHeaderMegaMenuProducts(),
  ]);

  return (
    <div className="bg-linear-to-b from-gray-50 to-white min-h-screen scroll-smooth overflow-x-clip w-full max-w-full">
      {/* Parallax background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden hidden md:block" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-[#011b54]/10 to-[#022b82]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-r from-[#011b54]/10 to-[#011b54]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Header categoryStats={categoryStats} megaMenuProducts={megaMenuProducts} />

      <main className="w-full">
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      <CustomerFooter />
    </div>
  )
}