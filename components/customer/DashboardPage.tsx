"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState, useMemo } from "react"
import { 
  ShoppingBag, 
  Gift, 
  Ticket, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Trophy,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface DashboardStats {
  totalOrders: number
  activeBargains: number
  pointsBalance: number
  successRate: number
}

interface RecentOrder {
  id: string
  date: string
  amount: string
  status: string
  fullId: string
}

interface ActiveBargain {
  product: string
  productId: string
  offer: string
  original: string
  status: string
  savingAmount: number
  bargainId: string
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  activeBargains: ActiveBargain[]
  user: {
    name?: string
    email: string
  }
}

export default function CustomerDashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Move useScroll inside a component that's always rendered
  const HeroSectionWithParallax = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end end"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

    return (
      <section 
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#011b54]/10 via-[#022b82]/10 to-[#011b54]/5 p-8 md:p-12"
      >
        <motion.div
          style={{ y }}
          className="absolute inset-0 bg-linear-to-br from-[#011b54]/5 via-[#022b82]/5 to-[#011b54]/5"
        />
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-linear-to-r from-[#011b54] to-[#022b82] text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" /> Welcome Back, {dashboardData?.user.name || 'Customer'}!
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Shopping Journey <span className="bg-linear-to-r from-[#011b54] to-[#022b82] bg-clip-text text-transparent">Continues</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Track orders, manage bargains, and win amazing prizes in our lucky draws!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-linear-to-r from-[#011b54] to-[#022b82] hover:from-[#022b82] hover:to-[#03369f] text-white shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="/products">
                  Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-8 right-8 w-24 h-24 bg-linear-to-br from-[#011b54]/20 to-[#011b54]/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
          className="absolute bottom-8 left-8 w-32 h-32 bg-linear-to-br from-[#011b54]/20 to-[#022b82]/20 rounded-full blur-xl"
        />
      </section>
    )
  }

  useEffect(() => {
    if (sessionStatus === 'loading') return

    if (!session?.user) {
      setError('Please sign in to view dashboard')
      setLoading(false)
      return
    }

    fetchDashboardData()
  }, [session, sessionStatus])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => dashboardData ? [
    { label: "Total Orders", value: dashboardData.stats.totalOrders.toString(), icon: ShoppingBag, color: "from-blue-500 to-cyan-500" },
    { label: "Active Bargains", value: dashboardData.stats.activeBargains.toString(), icon: Ticket, color: "from-purple-500 to-pink-500" },
    { label: "Points Balance", value: dashboardData.stats.pointsBalance.toLocaleString('en-PK'), icon: Gift, color: "from-amber-500 to-orange-500" },
    { label: "Success Rate", value: `${dashboardData.stats.successRate}%`, icon: TrendingUp, color: "from-emerald-500 to-green-500" },
  ] : [], [dashboardData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#011b54] mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Ticket className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={fetchDashboardData}
            className="bg-linear-to-r from-[#011b54] to-[#022b82] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero Welcome Section with Parallax - Now a separate component */}
      <HeroSectionWithParallax />

      {/* Stats Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="border-gray-300">
                      Live
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-[#011b54]" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date} • {order.amount}</p>
                    </div>
                    <Badge
                      className={
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {order.status}
                    </Badge>
                  </motion.div>
                ))}
                
                {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) && (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                    <Button 
                      variant="ghost" 
                      className="mt-4 text-[#011b54]"
                      asChild
                    >
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </div>
              {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 && (
                <Button variant="ghost" className="w-full mt-4 text-[#011b54]" asChild>
                  <Link href="/dashboard/orders">View All Orders</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Bargains */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-[#011b54]" />
                Active Bargains
              </CardTitle>
              <CardDescription>Your negotiation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.activeBargains.map((bargain, index) => (
                  <motion.div
                    key={bargain.bargainId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-gray-200 hover:border-[#011b54] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{bargain.product}</h4>
                      <Badge
                        variant={
                          bargain.status === "Accepted"
                            ? "default"
                            : bargain.status === "Rejected"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {bargain.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 line-through">{bargain.original}</span>
                      <span className="font-bold text-[#011b54]">{bargain.offer}</span>
                      <span className="text-green-600 font-medium">
                        Save Rs {bargain.savingAmount.toLocaleString('en-PK')}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {(!dashboardData?.activeBargains || dashboardData.activeBargains.length === 0) && (
                  <div className="text-center py-8">
                    <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No active bargains</p>
                    <Button 
                      variant="ghost" 
                      className="mt-4 text-[#011b54]"
                      asChild
                    >
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </div>
              {dashboardData?.activeBargains && dashboardData.activeBargains.length > 0 && (
                <Button variant="ghost" className="w-full mt-4 text-[#011b54]" asChild>
                  <Link href="/products?filter=bargain">Start New Bargain</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Lucky Draw CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Card className="border-0 bg-linear-to-r from-[#011b54] to-[#022b82] text-white overflow-hidden">
          <CardContent className="p-12">
            <Trophy className="h-16 w-16 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Enter Today&apos;s Lucky Draw!</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Every purchase above Rs 2000 gives you one entry. Win amazing prizes every week!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#011b54] hover:bg-white/90 shadow-lg"
                asChild
              >
                <Link href="/dashboard/lucky-draw">Check My Entries</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/dashboard/lucky-draw">View Prizes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}