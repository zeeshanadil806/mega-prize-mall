import ProductTable from "@/components/admin/products/ProductTable"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { ProductModel } from "@/models/Product"
import { escapeRegex } from "@/lib/utils"
import { serialize } from "@/lib/serialize"

type MongoQuery = {
  $or?: Array<{
    name?: { $regex: string; $options: string }
    sku?: { $regex: string; $options: string }
    description?: { $regex: string; $options: string }
  }>
  category?: string
  isActive?: boolean
  isFeatured?: boolean
  stock?: number
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  
if (!session?.user || (session.user.role !== "admin" && session.user.role !== "support")) {
    redirect("/login")
  }

  await connectToDatabase()

  // Parse query parameters
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
  const limit = 20
  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined

  // Build query
  const query: MongoQuery = {}

  if (search) {
    const safe = escapeRegex(search)
    query.$or = [
      { name: { $regex: safe, $options: "i" } },
      { sku: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
    ]
  }

  if (category) {
    query.category = category
  }

  if (status) {
    if (status === "active") query.isActive = true
    if (status === "inactive") query.isActive = false
    if (status === "featured") query.isFeatured = true
    if (status === "out-of-stock") query.stock = 0
  }

  // Fetch products
  const [products, total] = await Promise.all([
    ProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ProductModel.countDocuments(query),
  ])

  const serializedProducts = serialize(products)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ProductTable
        initialProducts={serializedProducts}
        total={total}
        page={page}
      />
    </div>
  )
}