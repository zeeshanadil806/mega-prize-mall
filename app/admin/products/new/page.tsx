import ProductForm from "@/components/admin/products/ProductForm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function NewProductPage() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ProductForm isEditing={false} />
    </div>
  )
}