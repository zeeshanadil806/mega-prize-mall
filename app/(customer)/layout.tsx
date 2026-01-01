import type { Metadata } from "next"
import { Inter } from "next/font/google"
import CustomerNavbar from "@/components/customer/CustomerNavbar"
import CustomerFooter from "@/components/customer/CustomerFooter"
import { Toaster } from "sonner"
import { auth } from "@/auth"
import Header from "@/components/customer/Header"
// import { redirect } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "My Account - Mega Prize Mall",
  description: "Manage your Mega Prize Mall account, orders, and points",
}

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  
  // Redirect to login if not authenticated
  // if (!session?.user) {
  //   redirect("/login")
  // }

  // Redirect admin users to admin dashboard
  // if (session.user.role === "admin") {
  //   redirect("/admin")
  // }

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-linear-to-b from-gray-50 to-white min-h-screen`}>
        {/* Parallax background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-r from-[#EAB75F]/10 to-[#2E297D]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* <CustomerNavbar user={session ? session.user : null} /> */}
        <Header />
        
        <main className="px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="animate-in fade-in duration-700">
            {children}
          </div>
        </main>

        <CustomerFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}