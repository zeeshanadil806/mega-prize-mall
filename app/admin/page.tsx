import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  // Ticket,
  Gift,
  TrendingUp,
  // TrendingDown,
  RefreshCw
} from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { formatCurrency, formatNumber } from "@/lib/utils"
import Link from "next/link"

// Structure for the data AFTER it has been formatted for the UI
interface FormattedActivity {
  id: number;
  user: string;
  action: string;
  orderId?: string; // Optional because the mock data might not have it
  amount?: string;  // Optional because mock data might not have it
  time: string;
  status?: string;  // Optional
}
// Structure for a single recent order from API
interface RecentOrder {
  id: string;
  customer: string; // or 'user' depending on your API
  amount: number;
  date: string;
  status: 'delivered' | 'shipped' | 'processing' | 'pending' | 'cancelled';
}

// Structure for a top product from API
interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

// Fetch analytics data
async function getAnalyticsData() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/analytics/overview?period=month`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return null
  }
}

// Fetch recent activities
async function getRecentActivities() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/analytics/overview?period=today`, {
      next: { revalidate: 60 } // Cache for 1 minute
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch recent activities')
    }
    
    const data = await response.json()
    return data.success ? data.data.recentOrders.slice(0, 4) : []
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}

export default async function AdminDashboard() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login")
  }

  // Fetch real data
  const [analyticsData, recentActivities] = await Promise.all([
    getAnalyticsData(),
    getRecentActivities()
  ])

  // Use real data or fallback to mock
  const stats = analyticsData ? [
    { 
      title: "Total Orders", 
      value: formatNumber(analyticsData.summary.totalOrders), 
      change: "+12.5%", // TODO: Calculate real change
      icon: ShoppingCart, 
      trend: "up" 
    },
    { 
      title: "Total Revenue", 
      value: formatCurrency(analyticsData.summary.totalRevenue), 
      change: "+18.7%", 
      icon: DollarSign, 
      trend: "up" 
    },
    { 
      title: "Total Customers", 
      value: formatNumber(analyticsData.summary.totalCustomers), 
      change: "+5.2%", 
      icon: Users, 
      trend: "up" 
    },
    { 
      title: "Active Products", 
      value: formatNumber(analyticsData.summary.activeProducts), 
      change: "+3.1%", 
      icon: Package, 
      trend: "up" 
    },
  ] : [
    { title: "Total Products", value: "1,248", change: "+12.5%", icon: Package, trend: "up" },
    { title: "Total Orders", value: "342", change: "+8.2%", icon: ShoppingCart, trend: "up" },
    { title: "Total Customers", value: "1,892", change: "-2.1%", icon: Users, trend: "down" },
    { title: "Revenue", value: "$24,580", change: "+18.7%", icon: DollarSign, trend: "up" },
  ]

  // Additional stats from analytics
  const additionalStats = analyticsData ? [
    { 
      title: "Points Earned", 
      value: formatNumber(analyticsData.summary.totalPointsEarned), 
      subtitle: `Value: ${formatCurrency(analyticsData.summary.totalPointsEarned * 0.1)}`,
      icon: Gift,
      color: "from-[#EAB75F] to-[#A43875]"
    },
    { 
      title: "Conversion Rate", 
      value: analyticsData.summary.conversionRate, 
      subtitle: "Orders per customer",
      icon: TrendingUp,
      color: "from-green-400 to-emerald-600"
    },
    { 
      title: "Avg Order Value", 
      value: analyticsData.summary.averageOrderValue, 
      subtitle: "Per order average",
      icon: DollarSign,
      color: "from-blue-400 to-cyan-600"
    },
    { 
      title: "Completed Orders", 
      value: formatNumber(analyticsData.summary.completedOrders), 
      subtitle: `${((analyticsData.summary.completedOrders / analyticsData.summary.totalOrders) * 100).toFixed(1)}% of total`,
      icon: ShoppingCart,
      color: "from-purple-400 to-pink-600"
    },
  ] : []

  // Format recent activities from real data
  const formattedRecentActivities = recentActivities.length > 0 
    ? recentActivities.map((order: RecentOrder, index: number) => ({
        id: index + 1,
        user: order.customer || "Customer",
        action: `placed an order`,
        orderId: order.id,
        amount: formatCurrency(order.amount),
        time: new Date(order.date).toLocaleTimeString('en-PK', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: order.status
      }))
    : [
        { id: 1, user: "John Doe", action: "placed an order", time: "2 min ago" },
        { id: 2, user: "Sarah Smith", action: "requested a bargain", time: "15 min ago" },
        { id: 3, user: "Mike Johnson", action: "won lucky draw prize", time: "1 hour ago" },
        { id: 4, user: "Emma Wilson", action: "added a review", time: "2 hours ago" },
      ]

  return (
    <div className="space-y-6">
      {/* Welcome Header with Refresh */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
          <p className="text-gray-600 mt-2">
            {analyticsData 
              ? `Here's your store performance for the last month`
              : "Here's what's happening with your store today."
            }
          </p>
          {analyticsData?.period && (
            <p className="text-sm text-gray-500 mt-1">
              Period: {new Date(analyticsData.period.start).toLocaleDateString()} - {new Date(analyticsData.period.end).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center mt-2">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats (if analytics available) */}
      {additionalStats.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {additionalStats.map((stat) => (
            <Card key={stat.title} className="overflow-hidden border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-linear-to-br ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.subtitle}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-gray-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your store quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/products/new">
                <Button className="h-24 w-full flex-col gap-2 bg-linear-to-br from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white">
                  <Package className="h-6 w-6" />
                  Add Product
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="h-24 w-full flex-col gap-2 border-gray-200">
                  <ShoppingCart className="h-6 w-6" />
                  View Orders
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="h-24 w-full flex-col gap-2 border-gray-200">
                  <Users className="h-6 w-6" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/lucky-draw">
                <Button variant="outline" className="h-24 w-full flex-col gap-2 border-gray-200">
                  <Gift className="h-6 w-6" />
                  Lucky Draw
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formattedRecentActivities.map((activity:FormattedActivity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-[#EAB75F] to-[#A43875] flex items-center justify-center text-white text-xs font-bold">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user}{' '}
                          <span className="font-normal text-gray-600">{activity.action}</span>
                        </p>
                        {activity.orderId && (
                          <p className="text-xs text-gray-500">Order: MPM-{activity.orderId}</p>
                        )}
                      </div>
                      {activity.amount && (
                        <span className="text-sm font-semibold text-[#7C2C78]">
                          {activity.amount}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.status && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          activity.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" className="w-full mt-4 text-[#7C2C78] hover:text-[#6A2566]">
                View all orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Top Products (if analytics available) */}
      {analyticsData?.topProducts && analyticsData.topProducts.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product: TopProduct, index: number) => (
                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-linear-to-br from-[#EAB75F] to-[#A43875] flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}