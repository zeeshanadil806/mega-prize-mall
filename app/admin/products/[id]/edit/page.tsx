import ProductForm from "@/components/admin/products/ProductForm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { ProductModel } from "@/models/Product"
import { serialize } from "@/lib/serialize"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
if (!session?.user || (session.user.role !== "admin" && session.user.role !== "support")) {
    redirect("/login")
  }

  const { id } = await params

  await connectToDatabase()
  
  // Fetch product data
  const product = await ProductModel.findById(id).lean()
  
  if (!product) {
    redirect("/admin/products")
  }

  const productData = serialize(product)

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ProductForm 
        initialData={productData} 
        isEditing={true} 
      />
    </div>
  )
}