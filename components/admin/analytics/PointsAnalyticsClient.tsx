'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  TrendingUp, 
  TrendingDown,
  Users,
  BarChart3,
  PieChart,
  Filter,
  Calendar,
  Download
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

// Types for Points Analytics

interface PointsPeriod {
  start: string;
  end: string;
}

interface PointsMetric {
  points: number;
  value: number;
}

interface BalanceMetric {
  totalBalance: number;
  userCount: number;
  avgBalance: number;
}

interface PointsSummary {
  totalEarned: PointsMetric;
  totalRedeemed: PointsMetric;
  totalExpired: PointsMetric; // Added for value calculation
  currentBalance: BalanceMetric;
  utilizationRate: number;
}

interface TransactionTypeStats {
  _id: string; // 'earn', 'redeem', 'expiry'
  transactions: number;
  points: number;
  value: number;
}

interface ExpiryMonth {
  _id: string; // Month name e.g., "January 2024"
  points: number;
  value: number;
  users: string[]; // Array of user IDs
}

interface TopEarner {
  userId: string;
  name: string;
  email: string;
  points: number;
  transactions: number;
}

interface TopRedeemer {
  userId: string;
  name: string;
  email: string;
  points: number;
  value: number;
}

interface TopUsersData {
  earners: TopEarner[];
  redeemers: TopRedeemer[];
}

interface PointsDistribution {
  byType: TransactionTypeStats[];
}

interface PointsExpiryData {
  monthly: ExpiryMonth[];
}

// Main Data Structure
interface PointsAnalyticsData {
  period: PointsPeriod;
  summary: PointsSummary;
  distribution: PointsDistribution;
  topUsers: TopUsersData;
  expiry: PointsExpiryData;
}

export default function PointsAnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [pointsData, setPointsData] = useState<PointsAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/points?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setPointsData(result.data);
      } else {
        toast.error('Failed to fetch points data');
      }
    } catch (error) {
      console.error('Error fetching points data:', error);
      toast.error('Failed to load points analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPointsData();
  }, [period]);

  const handleExport = () => {
    if (!pointsData) return;
    
    const csv = [
      ['Type', 'Points', 'Monetary Value', 'Transactions'],
      ...pointsData.distribution.byType.map((type: TransactionTypeStats) => [
        type._id,
        type.points,
        formatCurrency(type.value),
        type.transactions
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `points-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Points data exported successfully');
  };

  if (loading && !pointsData) {
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

  const { summary, distribution, topUsers, expiry } = pointsData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Points Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track points earning, redemption, and utilization rates
          </p>
          {pointsData?.period && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {new Date(pointsData.period.start).toLocaleDateString()} - {new Date(pointsData.period.end).toLocaleDateString()}
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
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" onClick={fetchPointsData}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Points Earned
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary?.totalEarned?.points || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Value: {formatCurrency(summary?.totalEarned?.value || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Points Redeemed
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary?.totalRedeemed?.points || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Value: {formatCurrency(summary?.totalRedeemed?.value || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Balance
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Gift className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary?.currentBalance?.totalBalance || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {summary?.currentBalance?.userCount || 0} users • Avg {formatNumber(summary?.currentBalance?.avgBalance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Utilization Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {summary?.utilizationRate || '0.0'}%
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Orders with points redemption
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="topusers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Top Users
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Points Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Points Activity Trend</CardTitle>
              <CardDescription>Daily points earned, redeemed, and expired</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border rounded-lg bg-gray-50">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Points trend chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Points by Transaction Type</CardTitle>
              <CardDescription>Distribution of points across different transaction types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distribution?.byType?.map((type: TransactionTypeStats) => (
                  <div key={type._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={
                            type._id === 'earn' ? 'bg-green-50 text-green-700 border-green-200' :
                            type._id === 'redeem' ? 'bg-red-50 text-red-700 border-red-200' :
                            type._id === 'expiry' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }
                        >
                          {type._id.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {type.transactions} transactions
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatNumber(type.points)} points</div>
                        <div className="text-sm text-gray-500">{formatCurrency(type.value)} value</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          type._id === 'earn' ? 'bg-green-500' :
                          type._id === 'redeem' ? 'bg-red-500' :
                          type._id === 'expiry' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (type.points / (distribution.byType.reduce((sum: number, t: TransactionTypeStats) => sum + t.points, 0) || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Points Expiry */}
            <Card>
              <CardHeader>
                <CardTitle>Points Expiry Analysis</CardTitle>
                <CardDescription>Monthly points expiration data</CardDescription>
              </CardHeader>
              <CardContent>
                {expiry?.monthly && expiry.monthly.length > 0 ? (
                  <div className="space-y-4">
                    {expiry.monthly.map((month: ExpiryMonth) => (
                      <div key={month._id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{month._id}</span>
                          <span className="font-semibold text-amber-600">
                            {formatNumber(month.points)} points
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex justify-between">
                          <span>{formatCurrency(month.value)} value</span>
                          <span>{month.users?.length || 0} users affected</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (month.points / (expiry.monthly.reduce((sum: number, m: ExpiryMonth) => sum + m.points, 0) || 1)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No points expiry data available</p>
                    <p className="text-sm mt-2">Points expiry tracking will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Points Value */}
            <Card>
              <CardHeader>
                <CardTitle>Points Monetary Value</CardTitle>
                <CardDescription>Current points balance valuation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-linear-to-br from-[#7C2C78] to-[#A43875] rounded-lg">
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatCurrency((summary?.totalEarned?.value || 0) - (summary?.totalRedeemed?.value || 0))}
                  </div>
                  <div className="text-white/80">Total Points Value in Circulation</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-green-700">Points Earned Value</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(summary?.totalEarned?.value || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-red-700">Points Redeemed Value</span>
                    <span className="font-bold text-red-700">
                      {formatCurrency(summary?.totalRedeemed?.value || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded">
                    <span className="text-amber-700">Points Expired Value</span>
                    <span className="font-bold text-amber-700">
                      {formatCurrency(summary?.totalExpired?.value || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Users Tab */}
        <TabsContent value="topusers">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Earners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Points Earners
                </CardTitle>
                <CardDescription>Users who earned the most points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers?.earners?.map((user: TopEarner, index: number) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatNumber(user.points)}</p>
                        <p className="text-sm text-gray-500">{user.transactions} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Redeemers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Top Points Redeemers
                </CardTitle>
                <CardDescription>Users who redeemed the most points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers?.redeemers?.map((user: TopRedeemer, index: number) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-red-400 to-pink-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatNumber(user.points)}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(user.value)} saved</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}