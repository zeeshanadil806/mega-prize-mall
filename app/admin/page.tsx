import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Ticket,
  Gift
} from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login")
  }

  // Mock data - replace with real data later
  const stats = [
    { title: "Total Products", value: "1,248", change: "+12.5%", icon: Package, trend: "up" },
    { title: "Total Orders", value: "342", change: "+8.2%", icon: ShoppingCart, trend: "up" },
    { title: "Total Customers", value: "1,892", change: "-2.1%", icon: Users, trend: "down" },
    { title: "Revenue", value: "$24,580", change: "+18.7%", icon: DollarSign, trend: "up" },
  ]

  const recentActivities = [
    { id: 1, user: "John Doe", action: "placed an order", time: "2 min ago" },
    { id: 2, user: "Sarah Smith", action: "requested a bargain", time: "15 min ago" },
    { id: 3, user: "Mike Johnson", action: "won lucky draw prize", time: "1 hour ago" },
    { id: 4, user: "Emma Wilson", action: "added a review", time: "2 hours ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
        <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Grid */}
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
              <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white">
                <Package className="h-6 w-6" />
                Add Product
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2 border-gray-200">
                <ShoppingCart className="h-6 w-6" />
                View Orders
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2 border-gray-200">
                <Ticket className="h-6 w-6" />
                Bargain Requests
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2 border-gray-200">
                <Gift className="h-6 w-6" />
                Lucky Draw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest store activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#EAB75F] to-[#A43875] flex items-center justify-center text-white text-xs font-bold">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user} <span className="font-normal text-gray-600">{activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-[#7C2C78] hover:text-[#6A2566]">
              View all activity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}