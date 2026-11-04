import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ProductModel } from "@/models/Product"
import { serialize } from "@/lib/serialize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  DollarSign, 
  Tag, 
  Ticket
} from "lucide-react"
import Link from "next/link"
import { ImageProps } from "@/types"

export default async function ProductDetailPage({
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
  
  const product = await ProductModel.findById(id).lean()
  
  if (!product) {
    notFound()
  }

  const productData = serialize(product)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{productData.name}</h1>
            <p className="text-gray-600">SKU: {productData.sku}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/products/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
          <Button className="bg-gradient-to-r from-[#011b54] to-[#022b82] text-white">
            View on Store
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Images & Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productData.images?.map((image: ImageProps, index: number) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-[#011b54] to-[#022b82]">
                        Main
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {productData.description}
              </p>
              
              {productData.features?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {productData.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          ✓
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Details */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Status</span>
                <Badge variant={productData.isActive ? "default" : "secondary"}>
                  {productData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {productData.isFeatured && (
                  <Badge className="bg-gradient-to-r from-[#011b54] to-[#022b82] text-white">
                    Featured
                  </Badge>
                )}
                {productData.isBestSeller && (
                  <Badge variant="default">Best Seller</Badge>
                )}
                {productData.isNewArrival && (
                  <Badge variant="outline">New Arrival</Badge>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Views</span>
                  <span className="font-semibold">{productData.viewCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Purchases</span>
                  <span className="font-semibold">{productData.purchaseCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Regular Price</span>
                <span className="font-bold text-lg">{formatPrice(productData.price)}</span>
              </div>
              
              {productData.discountedPrice && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Discounted Price</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatPrice(productData.discountedPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Discount</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round(((productData.price - productData.discountedPrice) / productData.price) * 100)}% OFF
                    </Badge>
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-700">Stock</span>
                <Badge variant={
                  productData.stock === 0 ? "destructive" :
                  productData.stock < 10 ? "secondary" : "default"
                }>
                  {productData.stock} units
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Gamification Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Gamification Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 flex items-center">
                  <Ticket className="h-4 w-4 mr-2" />
                  Bargain System
                </span>
                <Badge variant={productData.bargainEnabled ? "default" : "secondary"}>
                  {productData.bargainEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              {productData.bargainEnabled && (
                <div className="pl-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min. Price:</span>
                    <span>{formatPrice(productData.minBargainPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Rounds:</span>
                    <span>{productData.maxBargainRounds}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}