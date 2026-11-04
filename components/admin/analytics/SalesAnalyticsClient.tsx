'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  TrendingDown
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

// Types for Sales Analytics

interface SalesPeriod {
  start: string;
  end: string;
  groupBy: string;
}

interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageItemsPerOrder: number;
  averageOrderValue: number;
  minOrderValue: number;
  maxOrderValue: number;
  totalCustomers: number;
  averageOrdersPerCustomer: number;
  totalDiscounts: number;
  averageDiscountPercentage: number;
  totalShipping: number;
  freeShippingOrders: number;
  freeShippingPercentage: number;
  averageShipping: number;
}

interface SalesChartItem {
  _id: string; // usually the date string
  date?: string;
  revenue: number;
  orders: number;
  items: number;
  averageOrderValue: number;
}

interface TopProduct {
  _id: string;
  productName: string;
  quantity: number;
  revenue: number;
  orders: number;
}

interface TopCategory {
  _id: string; // category name
  revenue: number;
  products: string[]; // array of product IDs
}

interface TopMetrics {
  topProducts: TopProduct[];
  topCategories: TopCategory[];
}

// Main Data Structure
interface SalesAnalyticsData {
  period: SalesPeriod;
  summary: SalesSummary;
  salesData: SalesChartItem[];
  topMetrics: TopMetrics;
}

export default function SalesAnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [groupBy, setGroupBy] = useState('day');
  const [salesData, setSalesData] = useState<SalesAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch sales data
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/analytics/sales?period=${period}&groupBy=${groupBy}`
      );
      
      const result = await response.json();
      console.log(result)
      if (result.success) {
        setSalesData(result.data);
      } else {
        toast.error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to load sales analytics');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSalesData();
  }, [period, groupBy]);

  // Export data
  const handleExport = () => {
    if (!salesData) return;
    
    const csv = [
      ['Date', 'Revenue', 'Orders', 'Items', 'Avg Order Value'],
      ...salesData.salesData.map((item: SalesChartItem) => [
        item._id || item.date,
        item.revenue || 0,
        item.orders || 0,
        item.items || 0,
        item.averageOrderValue || 0
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  if (loading && !salesData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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

  const { summary, topMetrics } = salesData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track revenue, orders, and customer purchasing patterns
          </p>
          {salesData?.period && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {new Date(salesData.period.start).toLocaleDateString()} - {new Date(salesData.period.end).toLocaleDateString()}
              </span>
              <Badge variant="outline" className="ml-2">
                {salesData.period.groupBy}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="product">Product</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={fetchSalesData} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Revenue
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary?.totalRevenue || 0)}
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    +12.5%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Orders
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(summary?.totalOrders || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {summary?.averageItemsPerOrder?.toFixed(1) || '0'} items per order
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary?.averageOrderValue || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Min: {formatCurrency(summary?.minOrderValue || 0)} • Max: {formatCurrency(summary?.maxOrderValue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Customers
                </CardTitle>
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(summary?.totalCustomers || 0)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {summary?.averageOrdersPerCustomer?.toFixed(1) || '0'} orders per customer
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Revenue over time ({groupBy} view)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border rounded-lg bg-gray-50">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Revenue chart will appear here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Install Recharts or Chart.js for visualization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Metrics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>By revenue this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMetrics?.topProducts?.slice(0, 5).map((product: TopProduct, index: number) => (
                    <div key={product._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-md bg-linear-to-br from-[#011b54] to-[#022b82] flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-500">
                            {product.quantity} units • {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {product.orders} orders
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>By revenue this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMetrics?.topCategories?.slice(0, 5).map((category: TopCategory) => (
                    <div key={category._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{category._id}</span>
                        <span className="font-semibold text-[#011b54]">
                          {formatCurrency(category.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-linear-to-r from-[#011b54] to-[#022b82] h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(100, (category.revenue / (topMetrics.topCategories[0]?.revenue || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{category.products?.length || 0} products</span>
                        <span>{Math.round((category.revenue / (summary?.totalRevenue || 1)) * 100)}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Detailed product sales analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Product analytics dashboard coming soon</p>
                <p className="text-sm mt-2">View product-level sales, inventory, and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Customer behavior and segmentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Customer analytics dashboard coming soon</p>
                <p className="text-sm mt-2">View customer lifetime value, segmentation, and retention metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-green-600">
                {summary?.totalCustomers && summary.totalOrders 
                  ? ((summary.totalOrders / summary.totalCustomers) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Repeat Customer Rate</span>
              <span className="font-semibold text-blue-600">24.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Acquisition Cost</span>
              <span className="font-semibold text-amber-600">Rs 450</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Discount Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Discounts</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(summary?.totalDiscounts || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Discount %</span>
              <span className="font-semibold text-red-600">
                {summary?.averageDiscountPercentage?.toFixed(1) || '0.0'}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Orders with Discount</span>
              <span className="font-semibold">42%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Shipping Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Shipping Revenue</span>
              <span className="font-semibold text-purple-600">
                {formatCurrency(summary?.totalShipping || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Free Shipping Orders</span>
              <span className="font-semibold">
                {summary?.freeShippingOrders || 0} ({summary?.freeShippingPercentage?.toFixed(1) || '0'}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Shipping Cost</span>
              <span className="font-semibold">
                {formatCurrency(summary?.averageShipping || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}