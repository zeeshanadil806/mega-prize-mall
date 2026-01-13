"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Wallet, 
  TrendingUp, 
  Gift, 
  History, 
  CreditCard,
  Clock,
  ArrowRight,
  Coins,
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency, formatPoints } from "@/lib/bargain-utils"
import Link from "next/link"

interface WalletTransaction {
  id: string
  type: 'earn' | 'redeem' | 'adjustment' | 'expiry' | 'refund'
  points: number
  balanceAfter: number
  description: string
  createdAt: string
  status: 'pending' | 'completed' | 'cancelled'
  orderId?: string
  metadata?: Record<string, string>
}

interface WalletStats {
  totalPoints: number
  availablePoints: number
  pendingPoints: number
  expiredPoints: number
  totalValue: number
  nextExpiry?: {
    points: number
    date: string
  }
}

export default function WalletDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<WalletStats>({
    totalPoints: 0,
    availablePoints: 0,
    pendingPoints: 0,
    expiredPoints: 0,
    totalValue: 0,
  })
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [redeemAmount, setRedeemAmount] = useState(0)

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/wallet")
      const data = await response.json()

      if (data.success) {
        setStats(data.data.stats)
        setTransactions(data.data.transactions)
      }
    } catch (error) {
      toast.error("Failed to load wallet data")
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (redeemAmount <= 0 || redeemAmount > stats.availablePoints) {
      toast.error("Invalid redeem amount")
      return
    }

    try {
      const response = await fetch("/api/wallet/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: redeemAmount }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Successfully redeemed ${formatPoints(redeemAmount)}`)
        setRedeemAmount(0)
        fetchWalletData() // Refresh data
      } else {
        throw new Error(data.error || "Redemption failed")
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Redemption failed"
      toast.error(errorMessage)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'redeem':
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case 'adjustment':
        return <Gift className="h-5 w-5 text-purple-600" />
      case 'expiry':
        return <Clock className="h-5 w-5 text-red-600" />
      default:
        return <History className="h-5 w-5 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return "text-green-700 bg-green-100"
      case 'redeem':
        return "text-blue-700 bg-blue-100"
      case 'adjustment':
        return "text-purple-700 bg-purple-100"
      case 'expiry':
        return "text-red-700 bg-red-100"
      default:
        return "text-gray-700 bg-gray-100"
    }
  }

  const getTransactionDescription = (transaction: WalletTransaction) => {
    const pointsFormatted = transaction.points > 0 
      ? `+${transaction.points}` 
      : transaction.points.toString()
    
    const value = Math.abs(transaction.points) * 0.1 // 10 points = Rs 1
    
    return `${pointsFormatted} points (Rs ${value.toFixed(1)}) - ${transaction.description}`
  }

  if (loading) {
    return <WalletDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 bg-gradient-to-br from-[#7C2C78] to-[#A43875] text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-20 translate-y-20"></div>
            
            <CardContent className="relative p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Points Wallet</h2>
                  <p className="text-white/80 mt-1">Your loyalty rewards balance</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Wallet className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white/80 text-sm mb-2">Available Balance</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-5xl font-bold">
                      {stats.availablePoints.toLocaleString()}
                    </h3>
                    <span className="text-2xl font-semibold text-white/80">
                      points
                    </span>
                  </div>
                  <p className="text-white/80 mt-2">
                    = {formatCurrency(stats.totalValue)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-sm text-white/80 mb-1">Pending</p>
                    <p className="text-xl font-semibold">
                      {stats.pendingPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">After order delivery</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-sm text-white/80 mb-1">Earn Rate</p>
                    <p className="text-xl font-semibold">1:10</p>
                    <p className="text-xs text-white/60">1 point per Rs 10</p>
                  </div>
                </div>

                {stats.nextExpiry && (
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/80 mb-1">Next Expiry</p>
                        <p className="font-semibold">
                          {stats.nextExpiry.points.toLocaleString()} points
                        </p>
                        <p className="text-xs text-white/60">
                          {new Date(stats.nextExpiry.date).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-white/60" />
                    </div>
                    <Progress 
                      value={70} 
                      className="mt-3 h-2 bg-white/20" 
                    //   indicatorClassName="bg-white"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Redemption Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-[#EAB75F]" />
                Redeem Points
              </CardTitle>
              <CardDescription>
                Use points to get discounts on orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Max per order</span>
                  <Badge variant="outline">10% of order</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  You can redeem maximum 10% of order value in points
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Points to Redeem
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={stats.availablePoints}
                        step="10"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>{Math.floor(stats.availablePoints / 2)}</span>
                        <span>{stats.availablePoints}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#7C2C78]">
                        {redeemAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        = {formatCurrency(redeemAmount * 0.1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRedeemAmount(
                        Math.min(amount, stats.availablePoints)
                      )}
                      disabled={amount > stats.availablePoints}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleRedeem}
                  disabled={redeemAmount <= 0 || redeemAmount > stats.availablePoints}
                  className="w-full bg-gradient-to-r from-[#EAB75F] to-[#A43875] text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Redeem {formatPoints(redeemAmount)}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Redeemed points will be available as discount on next order
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Recent Transactions
              </div>
              <Badge variant="outline">
                {transactions.length} transactions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Transactions Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start shopping to earn points!
                </p>
                <Button asChild className="bg-gradient-to-r from-[#7C2C78] to-[#A43875] text-white">
                  <Link href="/products">
                    <Coins className="h-4 w-4 mr-2" />
                    Start Shopping
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${getTransactionColor(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getTransactionDescription(transaction)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(transaction.createdAt).toLocaleDateString('en-PK', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </div>
                        <div className="text-sm text-gray-500">
                          Balance: {transaction.balanceAfter}
                        </div>
                        {transaction.status === 'pending' && (
                          <Badge variant="outline" className="mt-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {transactions.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <Link href="/wallet/transactions">
                    View All Transactions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Skeleton Loader
function WalletDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
