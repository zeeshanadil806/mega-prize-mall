'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  TrendingUp, 
  AlertCircle,
  BarChart3,
//   PieChart,
  Filter,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Types for Products Analytics

interface ProductPeriod {
  start: string;
  end: string;
}

interface ProductSummary {
  totalProducts: number;
  activeProducts: number;
  categories: number;
}

interface TopPerformer {
  _id: string;
  productName: string;
  quantity: number;
  orders: number;
  revenue: number;
  avgPrice: number;
}

interface CategorySales {
  _id: string; // Category name
  revenue: number;
  quantity: number;
  products: string[]; // List of product IDs
}

interface ProductSalesData {
  topPerformers: TopPerformer[];
  byCategory: CategorySales[];
}

interface StockBucket {
  _id: number; // e.g., 0, 10, 50
  count: number;
}

interface StockAlert {
  _id: string;
  name: string;
  sku: string;
  stock: number;
}

interface InventoryData {
  status: StockBucket[];
  alerts: StockAlert[];
}

interface BargainProduct {
  _id: string;
  name: string;
  price: number;
  bargainCount: number;
  successfulBargains: number;
  bargainSuccessRate: number;
}

// Main Data Structure
interface ProductsAnalyticsData {
  period: ProductPeriod;
  summary: ProductSummary;
  sales: ProductSalesData;
  inventory: InventoryData;
  bargainPerformance: BargainProduct[];
}

export default function ProductsAnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [productsData, setProductsData] = useState<ProductsAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('performance');

  const fetchProductsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/products?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setProductsData(result.data);
      } else {
        toast.error('Failed to fetch products data');
      }
    } catch (error) {
      console.error('Error fetching products data:', error);
      toast.error('Failed to load products analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, [period]);

  if (loading && !productsData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { summary, sales, inventory, bargainPerformance } = productsData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track product performance, inventory, and sales trends
          </p>
          {productsData?.period && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {new Date(productsData.period.start).toLocaleDateString()} - {new Date(productsData.period.end).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchProductsData}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary?.totalProducts || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {summary?.activeProducts || 0} active • {summary?.categories || 0} categories
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Categories
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {sales?.byCategory?.length || 0}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {sales?.byCategory?.slice(0, 2).map((cat: CategorySales) => cat._id).join(', ')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inventory Alerts
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {inventory?.alerts?.length || 0}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Products with low stock
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="bargain" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Bargain
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>By revenue this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales?.topPerformers?.map((product: TopPerformer, index: number) => (
                  <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-linear-to-br from-[#EAB75F] to-[#A43875] flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.productName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{product.quantity} units sold</span>
                          <span>•</span>
                          <span>{product.orders} orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-gray-500">Avg: {formatCurrency(product.avgPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales?.byCategory?.map((category: CategorySales) => (
                  <div key={category._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900">{category._id}</span>
                        <p className="text-sm text-gray-500">
                          {category.products?.length || 0} products • {category.quantity} units
                        </p>
                      </div>
                      <span className="font-semibold text-[#7C2C78]">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-[#7C2C78] to-[#A43875] h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (category.revenue / (sales.byCategory.reduce((sum: number, cat: CategorySales) => sum + cat.revenue, 0) || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Product stock levels and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Stock Distribution */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Stock Distribution</h4>
                <div className="space-y-4">
                  {inventory?.status?.map((bucket: StockBucket) => (
                    <div key={bucket._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {bucket._id === 0 ? 'Out of Stock (0)' :
                           bucket._id === 10 ? 'Low Stock (1-10)' :
                           bucket._id === 50 ? 'Medium Stock (11-50)' :
                           bucket._id === 100 ? 'Good Stock (51-100)' :
                           bucket._id === 500 ? 'High Stock (101-500)' :
                           'Very High Stock (500+)'}
                        </span>
                        <span className="font-semibold">{bucket.count} products</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            bucket._id === 0 ? 'bg-red-500' :
                            bucket._id === 10 ? 'bg-amber-500' :
                            bucket._id === 50 ? 'bg-yellow-500' :
                            bucket._id === 100 ? 'bg-green-500' :
                            bucket._id === 500 ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (bucket.count / (inventory.status.reduce((sum: number, b: StockBucket) => sum + b.count, 0) || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Alerts */}
              {inventory?.alerts && inventory.alerts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Low Stock Alerts ({inventory.alerts.length})
                  </h4>
                  <div className="space-y-3">
                    {inventory.alerts.slice(0, 10).map((product: StockAlert) => (
                      <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <Badge variant="destructive" className="text-lg">
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bargain Tab */}
        <TabsContent value="bargain">
          <Card>
            <CardHeader>
              <CardTitle>Bargain Performance</CardTitle>
              <CardDescription>Products with bargain feature enabled</CardDescription>
            </CardHeader>
            <CardContent>
              {bargainPerformance && bargainPerformance.length > 0 ? (
                <div className="space-y-6">
                  {bargainPerformance.map((product: BargainProduct) => (
                    <div key={product._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Price: {formatCurrency(product.price)}
                          </p>
                        </div>
                        <Badge 
                          variant={product.bargainSuccessRate >= 0.5 ? "default" : "outline"}
                          className={
                            product.bargainSuccessRate >= 0.5 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : ""
                          }
                        >
                          {Math.round(product.bargainSuccessRate * 100)}% success
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-700">{product.bargainCount}</div>
                          <div className="text-blue-600">Total Bargains</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-700">{product.successfulBargains}</div>
                          <div className="text-green-600">Successful</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 rounded">
                          <div className="font-bold text-amber-700">
                            {Math.round((product.successfulBargains / product.bargainCount) * 100)}%
                          </div>
                          <div className="text-amber-600">Success Rate</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No bargain performance data available</p>
                  <p className="text-sm mt-2">Enable bargain feature on products to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}