'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Gift,
//   Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Activity
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

// Types for Users Analytics

interface UserPeriod {
  start: string;
  end: string;
}

interface UserRoleStat {
  _id: string; // e.g., "customer", "admin"
  count: number;
}

interface ReferralStats {
  totalReferrals: number;
  totalReferrers: number;
  avgReferrals: number;
  referralPoints: number;
}

interface UserSummary {
  totalUsers: number;
  byRole: UserRoleStat[];
  referralStats: ReferralStats;
}

interface RegistrationTrend {
  _id: string; // date
  count: number;
}

interface PointsBucket {
  _id: number; // e.g., 0, 100, 500
  count: number;
  totalPoints: number;
}

interface UserSegment {
  _id: number; // e.g., 0 (new), 1 (occasional)
  count: number;
  avgSpent: number;
  totalSpent: number;
}

interface TopUser {
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

interface UserTrends {
  registration: RegistrationTrend[];
}

interface UserDistribution {
  points: PointsBucket[];
  segments: UserSegment[];
}

// Main Data Structure
interface UsersAnalyticsData {
  period: UserPeriod;
  summary: UserSummary;
  trends: UserTrends;
  distribution: UserDistribution;
  topUsers: TopUser[];
}

export default function UsersAnalyticsClient() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [usersData, setUsersData] = useState<UsersAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/users?period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        setUsersData(result.data);
      } else {
        toast.error('Failed to fetch users data');
      }
    } catch (error) {
      console.error('Error fetching users data:', error);
      toast.error('Failed to load users analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [period]);

  if (loading && !usersData) {
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

  const { summary, trends, distribution, topUsers } = usersData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Analytics</h1>
          <p className="text-gray-600 mt-2">
            Analyze user growth, activity, and engagement patterns
          </p>
          {usersData?.period && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {new Date(usersData.period.start).toLocaleDateString()} - {new Date(usersData.period.end).toLocaleDateString()}
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
          
          <Button variant="outline" onClick={fetchUsersData}>
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
              Total Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary?.totalUsers || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {summary?.byRole?.map((role: UserRoleStat) => (
                <div key={role._id} className="flex justify-between">
                  <span>{role._id}:</span>
                  <span className="font-medium">{role.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Referral Program
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <UserPlus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary?.referralStats?.totalReferrals || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {summary?.referralStats?.totalReferrers || 0} referrers • 
              Avg {summary?.referralStats?.avgReferrals?.toFixed(1) || '0'} each
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              User Growth
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              +{trends?.registration?.[trends.registration.length - 1]?.count || 0}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              New users this period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Points Economy
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Gift className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summary?.referralStats?.referralPoints || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Points from referrals
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
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Segments
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Registration Trend */}
          <Card>
            <CardHeader>
              <CardTitle>User Registration Trend</CardTitle>
              <CardDescription>New user signups over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border rounded-lg bg-gray-50">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Registration chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Points Distribution</CardTitle>
              <CardDescription>How points are distributed among users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distribution?.points?.map((bucket: PointsBucket) => (
                  <div key={bucket._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        {bucket._id === 0 ? '0-100 points' :
                         bucket._id === 100 ? '101-500 points' :
                         bucket._id === 500 ? '501-1000 points' :
                         bucket._id === 1000 ? '1001-5000 points' :
                         bucket._id === 5000 ? '5001-10000 points' :
                         '10000+ points'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#7C2C78]">
                          {bucket.count} users
                        </span>
                        <Badge variant="outline">
                          {formatNumber(bucket.totalPoints)} points
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-[#7C2C78] to-[#A43875] h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (bucket.count / (distribution.points.reduce((sum: number, b: PointsBucket) => sum + b.count, 0) || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
              <CardDescription>User segmentation by order behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {distribution?.segments?.map((segment: UserSegment) => (
                  <div key={segment._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {segment._id === 0 ? 'New Users (0 orders)' :
                           segment._id === 1 ? 'Occasional (1-2 orders)' :
                           segment._id === 3 ? 'Regular (3-5 orders)' :
                           segment._id === 5 ? 'Frequent (6-10 orders)' :
                           'VIP (10+ orders)'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {segment.count} users in this segment
                        </p>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {formatCurrency(segment.avgSpent || 0)} avg
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total spent: {formatCurrency(segment.totalSpent || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Spending</CardTitle>
              <CardDescription>Most valuable customers this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers?.slice(0, 10).map((user: TopUser, index: number) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#EAB75F] to-[#A43875] flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(user.totalSpent)}</p>
                      <p className="text-sm text-gray-500">{user.orderCount} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}