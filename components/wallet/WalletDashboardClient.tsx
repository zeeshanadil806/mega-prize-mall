'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  Filter,
  Download,
//   ChevronRight,
  Sparkles,
  Clock,
  Award,
  Gift,
  AlertCircle,
  Coins,
  Zap,
  Wallet,
//   BarChart3,
  History,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/bargain-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { WalletTransaction } from '@/types';

interface WalletDashboardClientProps {
  transactions: WalletTransaction[];
  currentPage: number;
  totalPages: number;
  currentType: string;
  currentMonth: string;
  monthOptions: Array<{ value: string; label: string; count: number }>;
  stats: {
    currentPoints: number;
    monetaryValue: number;
    currentMonthEarned: number;
    lastMonthEarned: number;
    pointsExpiringSoon: number;
    totalEarned: number;
    totalRedeemed: number;
  };
  userId: string;
}

const typeConfig: Record<string, { 
  label: string; 
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  sign: string;
}> = {
  earn: { 
    label: 'Earned', 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <ArrowUpRight className="h-4 w-4" />,
    sign: '+',
  },
  redeem: { 
    label: 'Redeemed', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <ArrowDownRight className="h-4 w-4" />,
    sign: '-',
  },
  adjustment: { 
    label: 'Adjustment', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: <RefreshCw className="h-4 w-4" />,
    sign: '±',
  },
  expiry: { 
    label: 'Expired', 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <XCircle className="h-4 w-4" />,
    sign: '-',
  },
  refund: { 
    label: 'Refunded', 
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: <CheckCircle className="h-4 w-4" />,
    sign: '+',
  },
};

export function WalletDashboardClient({
  transactions,
  currentPage,
  totalPages,
  currentType,
  currentMonth,
  monthOptions,
  stats,
  userId,
}: WalletDashboardClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(currentType);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleFilterChange = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedMonth !== 'all') params.set('month', selectedMonth);
    params.set('page', '1');
    
    router.push(`/dashboard/wallet?${params.toString()}`);
  };

  const handleRedeemPoints = async () => {
    if (!redeemAmount || parseInt(redeemAmount) <= 0) return;
    
    try {
      setIsRedeeming(true);
      const response = await fetch('/api/wallet/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: parseInt(redeemAmount),
          userId,
        }),
      });

      if (response.ok) {
        setShowRedeemDialog(false);
        setRedeemAmount('');
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to redeem points');
      }
    } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
      console.error('Redeem error:', error);
      alert(errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleExportTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.set('type', selectedType);
      if (selectedMonth !== 'all') params.set('month', selectedMonth);
      
      const response = await fetch(`/api/wallet/export?${params.toString()}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const maxRedeemable = Math.floor(stats.currentPoints);
  const redeemValue = parseInt(redeemAmount) * 0.1 || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Points Wallet</h1>
          <p className="text-muted-foreground mt-2">
            Track your points balance, transactions, and redeem for discounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Current Balance */}
        <Card className="bg-linear-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold mt-2">{stats.currentPoints.toLocaleString()}</p>
                <p className="text-lg text-primary font-semibold">
                  = {formatCurrency(stats.monetaryValue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                className="w-full" 
                onClick={() => setShowRedeemDialog(true)}
                disabled={stats.currentPoints < 100} // Minimum 100 points to redeem
              >
                <Gift className="h-4 w-4 mr-2" />
                Redeem Points
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Minimum 100 points required to redeem
              </p>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points Earned This Month</p>
                <p className="text-2xl font-bold mt-2">
                  +{stats.currentMonthEarned.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.currentMonthEarned > stats.lastMonthEarned ? 'Up' : 'Down'} from last month
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points Earned</p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalEarned.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Worth {formatCurrency(stats.totalEarned * 0.1)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points Expiring */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points Expiring Soon</p>
                <p className="text-2xl font-bold mt-2">
                  {stats.pointsExpiringSoon.toLocaleString()}
                </p>
                <p className="text-sm text-amber-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Within 30 days
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Points Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.currentPoints.toLocaleString()} points • {formatCurrency(stats.monetaryValue)}
                </p>
              </div>
              <Badge variant="outline">
                {Math.round((stats.currentPoints / 10000) * 100)}% to next level
              </Badge>
            </div>
            
            <Progress value={(stats.currentPoints % 10000) / 100} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bronze</span>
              <span className="text-muted-foreground">Silver (10,000)</span>
              <span className="text-muted-foreground">Gold (25,000)</span>
              <span className="text-muted-foreground">Platinum (50,000)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Type Tabs */}
            <Tabs 
              value={selectedType} 
              onValueChange={setSelectedType}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 md:flex">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="earn">Earned</TabsTrigger>
                <TabsTrigger value="redeem">Redeemed</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Month Selector */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthOptions.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label} ({month.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Apply Filters Button */}
            <Button onClick={handleFilterChange} disabled={isLoading}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              // Loading Skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedType !== 'all' || selectedMonth !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start earning points by shopping!'}
                </p>
                {selectedType === 'all' && selectedMonth === 'all' && (
                  <Button asChild>
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                )}
              </div>
            ) : (
              // Transactions List
              transactions.map((transaction) => {
                const config = typeConfig[transaction.type] || typeConfig.earn;
                const isPositive = transaction.points > 0;
                
                return (
                  <div 
                    key={transaction._id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <div className={config.color}>
                          {config.icon}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config.label}</span>
                          {transaction.expiresAt && new Date(transaction.expiresAt) > new Date() && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Expires {new Date(transaction.expiresAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                          {transaction.orderId && (
                            <span className="font-mono">
                              Order: {transaction.orderId.slice(-8).toUpperCase()}
                            </span>
                          )}
                          {transaction.balanceAfter !== undefined && (
                            <span>Balance: {transaction.balanceAfter.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{Math.abs(transaction.points).toLocaleString()} points
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(Math.abs(transaction.points) * transaction.rate)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center items-center gap-2 mt-8 pt-8 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (selectedType !== 'all') params.set('type', selectedType);
                  if (selectedMonth !== 'all') params.set('month', selectedMonth);
                  params.set('page', (currentPage - 1).toString());
                  router.push(`/dashboard/wallet?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="min-w-9"
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (selectedType !== 'all') params.set('type', selectedType);
                        if (selectedMonth !== 'all') params.set('month', selectedMonth);
                        params.set('page', pageNum.toString());
                        router.push(`/dashboard/wallet?${params.toString()}`);
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-9"
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (selectedType !== 'all') params.set('type', selectedType);
                        if (selectedMonth !== 'all') params.set('month', selectedMonth);
                        params.set('page', totalPages.toString());
                        router.push(`/dashboard/wallet?${params.toString()}`);
                      }}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (selectedType !== 'all') params.set('type', selectedType);
                  if (selectedMonth !== 'all') params.set('month', selectedMonth);
                  params.set('page', (currentPage + 1).toString());
                  router.push(`/dashboard/wallet?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn More */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            How to Earn More Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold">Shop & Earn</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Earn points for every spend
              </p>
              <p className="text-sm font-medium text-primary mt-2">+10 pts / Rs 100</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-semibold">Complete Orders</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Bonus points on order completion
              </p>
              <p className="text-sm font-medium text-green-600 mt-2">+50 pts / order</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-semibold">Lucky Draw</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Win bonus points in lucky draws
              </p>
              <p className="text-sm font-medium text-blue-600 mt-2">Up to +1000 pts</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <History className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-semibold">Write Reviews</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Earn points for product reviews
              </p>
              <p className="text-sm font-medium text-purple-600 mt-2">+20 pts / review</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redeem Points Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Redeem Points
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Redeem points for discounts on your next order. 1 point = Rs 0.10
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Points to Redeem</label>
                <div className="mt-2">
                  <input
                    type="number"
                    min="100"
                    max={maxRedeemable}
                    step="10"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter points to redeem"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Available: {maxRedeemable.toLocaleString()} points • Max redeem: {Math.floor(maxRedeemable / 100) * 100} points
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Points to redeem:</span>
                  <span className="font-semibold">{parseInt(redeemAmount) || 0}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Discount value:</span>
                  <span className="text-green-600 font-bold">{formatCurrency(redeemValue)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span>Points after redemption:</span>
                  <span className="font-semibold">
                    {(stats.currentPoints - (parseInt(redeemAmount) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000, 2000, 5000, 10000].map(amount => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRedeemAmount(Math.min(amount, maxRedeemable).toString())}
                    disabled={amount > maxRedeemable}
                  >
                    {amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRedeemDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRedeemPoints}
                disabled={!redeemAmount || parseInt(redeemAmount) < 100 || parseInt(redeemAmount) > maxRedeemable || isRedeeming}
              >
                {isRedeeming ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Redeem {redeemValue ? `for ${formatCurrency(redeemValue)}` : 'Points'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// DialogFooter component
function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      {children}
    </div>
  );
}