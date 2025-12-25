"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Save, 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Image as ImageIcon,
  Tag,
  BarChart3,
  CheckCircle,
  XCircle
} from "lucide-react"
import ImageUpload from "./ImageUpload"
import { generateSlug } from "@/lib/utils"
import { ImageProps, ProductProps } from "@/types"

// Mock data for dropdowns
const CATEGORIES = [
  "Mobile Cases",
  "Screen Protectors",
  "Chargers & Cables",
  "Power Banks",
  "Earphones & Headphones",
  "Smart Watches",
  "Mobile Holders",
  "Other Accessories"
]

const BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "OPPO",
  "Vivo",
  "Google",
  "Generic"
]



interface ProductFormProps {
  initialData?: Partial<ProductProps>
  isEditing?: boolean
}

export default function ProductForm({ 
  initialData, 
  isEditing = false 
}: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  
  // Form state
  const [formData, setFormData] = useState<ProductProps>({
    // Basic Info
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    shortDescription: initialData?.shortDescription || "",
    
    // Pricing
    price: initialData?.price || 0,
    discountedPrice: initialData?.discountedPrice || 0,
    costPrice: initialData?.costPrice || 0,
    
    // Categorization
    category: initialData?.category || "",
    tags: initialData?.tags || [],
    brand: initialData?.brand || "",
    
    // Inventory
    sku: initialData?.sku || "",
    stock: initialData?.stock || 0,
    
    // Specifications
    features: initialData?.features || [],
    specifications: initialData?.specifications || {},
    color: initialData?.color || "",
    
    // Gamification
    bargainEnabled: initialData?.bargainEnabled || false,
    minBargainPrice: initialData?.minBargainPrice || 0,
    maxBargainRounds: initialData?.maxBargainRounds || 3,
    bargainValidityHours: initialData?.bargainValidityHours || 48,

    // SEO
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    keywords: initialData?.keywords || [],
    
    // Status
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    isNewArrival: initialData?.isNewArrival || true,
  })

  const [images, setImages] = useState<ImageProps[]>(initialData?.images || [])
  const [currentFeature, setCurrentFeature] = useState("")
  const [specKey, setSpecKey] = useState("")
  const [specValue, setSpecValue] = useState("")
  const [currentTag, setCurrentTag] = useState("")
  const [currentKeyword, setCurrentKeyword] = useState("")

  // Handle input changes
  const handleChange = <K extends keyof ProductProps>(field: keyof ProductProps, value: ProductProps[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name
    if (field === "name" && !isEditing && typeof value === "string") {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  // Handle number inputs
  const handleNumberChange = (field: keyof ProductProps, value: string) => {
    const numValue = parseFloat(value) || 0
    handleChange(field, numValue)
  }

  // Add feature
  const addFeature = () => {
    if (currentFeature.trim()) {
      handleChange("features", [...formData.features, currentFeature.trim()])
      setCurrentFeature("")
    }
  }

  // Remove feature
  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    handleChange("features", newFeatures)
  }

  // Add specification
  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      handleChange("specifications", {
        ...formData.specifications,
        [specKey.trim()]: specValue.trim()
      })
      setSpecKey("")
      setSpecValue("")
    }
  }

  // Remove specification
  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications }
    delete newSpecs[key]
    handleChange("specifications", newSpecs)
  }

  // Add tag
  const addTag = () => {
    if (currentTag.trim()) {
      handleChange("tags", [...formData.tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  // Remove tag
  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index)
    handleChange("tags", newTags)
  }

  // Add keyword
  const addKeyword = () => {
    if (currentKeyword.trim()) {
      handleChange("keywords", [...formData.keywords, currentKeyword.trim()])
      setCurrentKeyword("")
    }
  }

  // Remove keyword
  const removeKeyword = (index: number) => {
    const newKeywords = formData.keywords.filter((_, i) => i !== index)
    handleChange("keywords", newKeywords)
  }

  // Calculate discount percentage
  const discountPercentage = formData.discountedPrice && formData.price > 0
    ? Math.round(((formData.price - formData.discountedPrice) / formData.price) * 100)
    : 0

  // Form validation
  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.name.trim()) errors.push("Product name is required")
    if (!formData.slug.trim()) errors.push("Slug is required")
    if (formData.price <= 0) errors.push("Price must be greater than 0")
    if (!formData.sku.trim()) errors.push("SKU is required")
    if (!formData.category) errors.push("Category is required")
    if (!formData.brand) errors.push("Brand is required")
    if (images.length === 0) errors.push("At least one image is required")

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return false
    }

    return true
  }

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const payload = {
        ...formData,
        images,
      }
      const url = isEditing 
        ? `/api/admin/products/${initialData?._id}`
        : "/api/admin/products"
      
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(isEditing ? "Product updated!" : "Product created!")
        router.push("/admin/products")
        router.refresh()
      } else {
        throw new Error(data.error || "Failed to save product")
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string'
      ? error
      : 'Failed to save product'
  
  toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-gray-600">
              {isEditing ? "Update product details" : "Add a new product to your store"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Images</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="gamification" className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g., Premium Wireless Earbuds"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      placeholder="premium-wireless-earbuds"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Used in product URL: yourstore.com/products/{formData.slug || "slug"}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => handleChange("shortDescription", e.target.value)}
                      placeholder="Brief description shown in product listings"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand *</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => handleChange("brand", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      placeholder="SKU-12345"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Detailed description of your product..."
                  rows={6}
                  className="min-h-[150px]"
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <Badge key={tag} variant="secondary" className="pl-3">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-2"
                          onClick={() => removeTag(index)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>
                Technical details and specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleChange("color", e.target.value)}
                    placeholder="e.g., Black, Blue, Red"
                  />
                </div>
              </div>

              {/* Key-Value Specifications */}
              <div>
                <Label>Additional Specifications</Label>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <Input
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Key (e.g., Battery Capacity)"
                  />
                  <Input
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="Value (e.g., 5000mAh)"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={addSpecification}
                >
                  Add Specification
                </Button>

                {Object.keys(formData.specifications).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{key}:</span>
                          <span className="ml-2 text-gray-600">{value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <Label>Key Features</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    placeholder="Add a key feature"
                    onKeyDown={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button type="button" onClick={addFeature}>
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload high-quality images of your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={images}
                onChange={setImages}
                maxImages={20}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Set prices and manage stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="price">Regular Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => handleNumberChange("price", e.target.value)}
                    placeholder="999"
                  />
                </div>
                <div>
                  <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    value={formData.discountedPrice || ""}
                    onChange={(e) => handleNumberChange("discountedPrice", e.target.value)}
                    placeholder="799"
                  />
                  {discountPercentage > 0 && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
                <div>
                  <Label htmlFor="costPrice">Cost Price (₹)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    value={formData.costPrice || ""}
                    onChange={(e) => handleNumberChange("costPrice", e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) => handleNumberChange("stock", e.target.value)}
                    placeholder="100"
                  />
                  <div className="flex items-center space-x-2 mt-4">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleChange("isActive", checked)}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Product is active
                    </Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleChange("isFeatured", checked)}
                    />
                    <Label htmlFor="isFeatured" className="cursor-pointer">
                      Mark as featured product
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isBestSeller"
                      checked={formData.isBestSeller}
                      onCheckedChange={(checked) => handleChange("isBestSeller", checked)}
                    />
                    <Label htmlFor="isBestSeller" className="cursor-pointer">
                      Mark as best seller
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isNewArrival"
                      checked={formData.isNewArrival}
                      onCheckedChange={(checked) => handleChange("isNewArrival", checked)}
                    />
                    <Label htmlFor="isNewArrival" className="cursor-pointer">
                      Mark as new arrival
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gamification Tab */}
        <TabsContent value="gamification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gamification Features</CardTitle>
              <CardDescription>
                Configure bargain, points, and lucky draw settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bargain System */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Bargain System</h4>
                    <p className="text-sm text-gray-600">
                      Allow customers to negotiate prices
                    </p>
                  </div>
                  <Switch
                    checked={formData.bargainEnabled}
                    onCheckedChange={(checked) => handleChange("bargainEnabled", checked)}
                  />
                </div>

                {formData.bargainEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="minBargainPrice">Minimum Bargain Price (₹)</Label>
                        <Input
                          id="minBargainPrice"
                          type="number"
                          value={formData.minBargainPrice || ""}
                          onChange={(e) => handleNumberChange("minBargainPrice", e.target.value)}
                          placeholder="Minimum acceptable price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxBargainRounds">Max Bargain Rounds</Label>
                        <Select
                          value={formData.maxBargainRounds.toString()}
                          onValueChange={(value) => handleChange("maxBargainRounds", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "round" : "rounds"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bargainValidityHours">Bargain Validity</Label>
                        <Select
                          value={formData.bargainValidityHours.toString()}
                          onValueChange={(value) => handleChange("bargainValidityHours", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="48">48 hours</SelectItem>
                            <SelectItem value="72">72 hours</SelectItem>
                            <SelectItem value="168">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Optimization</CardTitle>
              <CardDescription>
                Optimize your product for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  placeholder="Optimize for search engines (max 70 characters)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaTitle.length}/70 characters
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  placeholder="Brief description for search results (max 160 characters)"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              {/* Keywords */}
              <div>
                <Label>SEO Keywords</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    placeholder="Add a keyword"
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                  />
                  <Button type="button" onClick={addKeyword}>
                    Add
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.keywords.map((keyword, index) => (
                      <Badge key={keyword} variant="outline" className="pl-3">
                        {keyword}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-2"
                          onClick={() => removeKeyword(index)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="sticky bottom-6 bg-linear-to-r from-[#7C2C78]/5 to-[#A43875]/5 border-[#7C2C78]/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">Ready to {isEditing ? "update" : "publish"}?</h3>
              <p className="text-sm text-gray-600">
                {images.length} image(s) • {formData.features.length} feature(s) • 
                {formData.bargainEnabled ? " Bargain enabled" : " No bargain"} • 
                {formData.isActive ? " Active" : " Inactive"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : isEditing ? "Update Product" : "Publish Product"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}