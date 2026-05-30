import { Inter } from "next/font/google"
import CustomerFooter from "@/components/customer/CustomerFooter"
import Header from "@/components/customer/Header"

const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "My Account - Mega Prize Mall",
//   description: "Manage your Mega Prize Mall account, orders, and points",
// }

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <div className={`${inter.className} bg-linear-to-b from-gray-50 to-white min-h-screen scroll-smooth`}>
      {/* Parallax background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-r from-[#EAB75F]/10 to-[#2E297D]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Header />

      <main className="sm:px-6 lg:px-8 mx-auto">
        <div className="animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      <CustomerFooter />
    </div>
  )
}