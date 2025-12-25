"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  History, 
  Tag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Copy,
  ShoppingBag,
  ArrowRight,
  Calendar,
  Percent
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/bargain-utils"
import Link from "next/link"
import { BargainHistoryItem } from "@/types"


export default function BargainHistory() {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<BargainHistoryItem[]>([])
  const [stats, setStats] = useState({
    totalBargains: 0,
    successfulBargains: 0,
    totalSavings: 0,
    successRate: 0,
  })

  useEffect(() => {
    fetchBargainHistory()
  }, [])

  const fetchBargainHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bargain")
      const data = await response.json()

      if (data.success) {
        // Transform data for display
        const transformedHistory = data.data.history.map((item: BargainHistoryItem) => ({
          ...item,
          savingAmount: item.originalPrice - item.offeredPrice,
          createdAt: new Date(item.createdAt).toLocaleDateString('en-PK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))

        setHistory(transformedHistory)
        
        // Calculate stats
        const total = transformedHistory.length
        const successful = transformedHistory.filter((h: BargainHistoryItem) => h.status === 'accepted').length
        const totalSavings = transformedHistory
          .filter((h: BargainHistoryItem) => h.status === 'accepted')
          .reduce((sum: number, h: BargainHistoryItem) => sum + h.savingAmount, 0)
        const successRate = total > 0 ? Math.round((successful / total) * 100) : 0

        setStats({
          totalBargains: total,
          successfulBargains: successful,
          totalSavings,
          successRate,
        })
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to load bargain history")
    } finally {
      setLoading(false)
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Coupon copied to clipboard!")
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-600">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    }

    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  if (loading) {
    return <BargainHistorySkeleton />
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Bargain History
          </h3>
          <p className="text-gray-600 mb-6">
            You haven&apos;t made any bargain offers yet.
          </p>
          <Button asChild className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white">
            <Link href="/products">
              <Tag className="h-4 w-4 mr-2" />
              Start Bargaining
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bargains</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalBargains}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <History className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.successfulBargains}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Savings</p>
                  <p className="text-2xl font-bold text-[#7C2C78] mt-1">
                    {formatCurrency(stats.totalSavings)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-[#7C2C78]">
                  <Percent className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-[#EAB75F] mt-1">
                    {stats.successRate}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-100 text-[#EAB75F]">
                  <Tag className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Recent Bargain Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-gray-200 hover:border-[#7C2C78]/30 transition-colors overflow-hidden">
                  <CardContent className="p-0">
                    <div className="md:flex">
                      {/* Product Info */}
                      <div className="flex-1 p-4 md:p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(item.status, item.isExpired)}
                              <Badge variant="outline">
                                Round {item.bargainRound}/{item.maxRounds}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                <Calendar className="inline h-3 w-3 mr-1" />
                                {item.createdAt}
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {item.productName}
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Original Price</p>
                                <p className="font-medium text-gray-900 line-through">
                                  {formatCurrency(item.originalPrice)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Your Offer</p>
                                <p className="font-bold text-[#7C2C78]">
                                  {formatCurrency(item.offeredPrice)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Discount</p>
                                <p className="font-medium text-green-600">
                                  {item.discountPercentage}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">You Saved</p>
                                <p className="font-medium text-green-600">
                                  {formatCurrency(item.savingAmount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coupon/Actions Sidebar */}
                      {item.status === 'accepted' && item.couponCode && !item.isExpired && (
                        <div className="md:w-64 p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200 bg-linear-to-br from-[#7C2C78]/5 to-[#A43875]/5">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Your Coupon Code
                              </p>
                              <div className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
                                <code className="font-mono font-bold text-[#7C2C78]">
                                  {item.couponCode}
                                </code>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyCouponCode(item.couponCode!)}
                                  className="h-8 w-8"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              {item.couponExpiresAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  Expires: {new Date(item.couponExpiresAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} tomorrow
                                </p>
                              )}
                            </div>
                            
                            <Button
                              asChild
                              className="w-full bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white"
                              size="sm"
                            >
                              <Link href={`/products/${item.productId}`}>
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Use Coupon
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}

                      {item.status === 'accepted' && item.isExpired && (
                        <div className="md:w-48 p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50">
                          <div className="text-center">
                            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                              Coupon Expired
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              This coupon is no longer valid
                            </p>
                          </div>
                        </div>
                      )}

                      {item.status === 'rejected' && (
                        <div className="md:w-48 p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50">
                          <div className="text-center">
                            <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                              Offer Rejected
                            </p>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="mt-3"
                            >
                              <Link href={`/products/${item.productId}`}>
                                Try Again
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/bargains">
                View All Bargains
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Skeleton Loader
function BargainHistorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History List Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-5 w-64" />
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j}>
                          <Skeleton className="h-4 w-20 mb-2" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}