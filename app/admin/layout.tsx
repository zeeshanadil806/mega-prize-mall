import type { Metadata } from "next"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Admin Dashboard - Mega Prize Mall",
  description: "Manage your Mega Prize Mall store",
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  
  // Redirect if not authenticated or not admin
  if (!session?.user) {
    redirect("/login")
  }
  
  if (session.user.role !== "admin" && session.user.role !== "support") {
    redirect("/dashboard")
  }

  return (
    <div className="bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <AdminHeader user={session.user} />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      {/* <Toaster position="top-right" /> */}
    </div>
  )
}