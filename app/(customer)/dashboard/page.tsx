"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { 
  ShoppingBag, 
  Gift, 
  Ticket, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Trophy
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CustomerDashboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
//   const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Mock data
  const stats = [
    { label: "Total Orders", value: "12", icon: ShoppingBag, color: "from-blue-500 to-cyan-500" },
    { label: "Active Bargains", value: "3", icon: Ticket, color: "from-purple-500 to-pink-500" },
    { label: "Points Balance", value: "1,250", icon: Gift, color: "from-amber-500 to-orange-500" },
    { label: "Success Rate", value: "85%", icon: TrendingUp, color: "from-emerald-500 to-green-500" },
  ]

  const recentOrders = [
    { id: "#MPM-1234", date: "Today", amount: "₹1,499", status: "Delivered" },
    { id: "#MPM-1233", date: "Yesterday", amount: "₹2,999", status: "Shipped" },
    { id: "#MPM-1232", date: "Dec 10", amount: "₹899", status: "Processing" },
  ]

  const activeBargains = [
    { product: "Wireless Earbuds", offer: "₹1,299", original: "₹1,499", status: "Pending" },
    { product: "Phone Case", offer: "₹699", original: "₹899", status: "Accepted" },
    { product: "Power Bank", offer: "₹1,099", original: "₹1,299", status: "Rejected" },
  ]

  return (
    <div ref={containerRef} className="space-y-12">
      {/* Hero Welcome Section with Parallax */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#7C2C78]/10 via-[#A43875]/10 to-[#EAB75F]/10 p-8 md:p-12">
        <motion.div
          style={{ y }}
          className="absolute inset-0 bg-linear-to-br from-[#7C2C78]/5 via-[#A43875]/5 to-[#EAB75F]/5"
        />
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" /> Welcome Back!
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Shopping Journey <span className="bg-linear-to-r from-[#7C2C78] to-[#A43875] bg-clip-text text-transparent">Continues</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Track orders, manage bargains, and win amazing prizes in our lucky draws!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white shadow-lg hover:shadow-xl transition-all">
                Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-gray-300 hover:border-[#7C2C78]">
                Check Lucky Draw
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-8 right-8 w-24 h-24 bg-linear-to-br from-[#EAB75F]/20 to-[#2E297D]/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
          className="absolute bottom-8 left-8 w-32 h-32 bg-linear-to-br from-[#7C2C78]/20 to-[#A43875]/20 rounded-full blur-xl"
        />
      </section>

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
                      Today
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
                <ShoppingBag className="h-5 w-5 mr-2 text-[#7C2C78]" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
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
              </div>
              <Button variant="ghost" className="w-full mt-4 text-[#7C2C78]">
                View All Orders
              </Button>
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
                <Ticket className="h-5 w-5 mr-2 text-[#EAB75F]" />
                Active Bargains
              </CardTitle>
              <CardDescription>Your negotiation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeBargains.map((bargain, index) => (
                  <motion.div
                    key={bargain.product}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-gray-200 hover:border-[#EAB75F] transition-colors"
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
                      <span className="font-bold text-[#7C2C78]">{bargain.offer}</span>
                      <span className="text-green-600 font-medium">
                        Save ₹{(parseInt(bargain.original.replace("₹", "")) - parseInt(bargain.offer.replace("₹", ""))).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-[#EAB75F]">
                Start New Bargain
              </Button>
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
        <Card className="border-0 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white overflow-hidden">
          <CardContent className="p-12">
            <Trophy className="h-16 w-16 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Enter Today&apos;s Lucky Draw!</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Every purchase above ₹2000 gives you one entry. Win amazing prizes every week!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#7C2C78] hover:bg-white/90 shadow-lg"
              >
                Check My Entries
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                View Prizes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}