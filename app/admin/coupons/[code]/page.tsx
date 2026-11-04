// app/admin/coupons/[code]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Tag, 
  Edit, 
  Eye, 
  Copy, 
  CheckCircle, 
  XCircle,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Truck,
  Package,
  BarChart3,
  Clock,
  AlertCircle,
  Download,
  Share2,
  QrCode
} from 'lucide-react';
import Link from 'next/link';

import CouponForm, { SubmitData } from '@/components/admin/coupons/CouponForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CouponDetails {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usedCount: number;
  maxUses?: number;
  maxUsesPerUser: number;
  minOrderAmount: number;
  applicableTo: string;
  categoryIds: string[];
  productIds: string[];
  excludedProductIds: string[];
  userEligibility: string;
  specificUserIds: string[];
  canCombineWithBargain: boolean;
  canCombineWithOtherGlobal: boolean;
  firstOrderOnly: boolean;
  freeShippingMaxWeight?: number;
  freeShippingZones: string[];
  totalDiscountGiven: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  isValidForUse: boolean;
  isExpired: boolean;
  isFullyUsed: boolean;
  daysRemaining: number;
  remainingUses?: number;
}

interface UsageStats {
  totalOrders: number;
  totalDiscount: number;
  avgDiscountPerOrder: number;
  lastUsed: string | null;
  uniqueUserCount: number;
}
interface UserRef {
  _id: string;
  name: string;
  email: string;
}

interface OrderRef {
  _id: string;
  grandTotal: number;
}
interface RecentUsage {
  _id: string;
  userId: UserRef | null;
  orderId: OrderRef | null;
  discountApplied: number;
  orderAmount: number;
  orderAmountAfterDiscount: number;
  usedAt: string;
}

export default function CouponDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const code = params.code as string;
  const editMode = searchParams.get('edit') === 'true';
  
  const [coupon, setCoupon] = useState<CouponDetails | null>(null);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [recentUsage, setRecentUsage] = useState<RecentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (code) {
      fetchCouponDetails();
    }
  }, [code]);

  const fetchCouponDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`);
      const data = await response.json();
      
      if (data.success) {
        setCoupon(data.data.coupon);
        setStats(data.data.stats);
        setRecentUsage(data.data.recentUsage || []);
      } else {
        toast.error(data.error || 'Failed to load coupon');
        router.push('/admin/coupons');
      }
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast.error('Failed to load coupon details');
      router.push('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData: SubmitData) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update coupon');
      }
      
      toast.success('Coupon updated successfully!');
      await fetchCouponDetails();
      router.push(`/admin/coupons/${code}`);
      
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update coupon'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!coupon) return;
    
    try {
      const response = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
        fetchCouponDetails();
      } else {
        toast.error(data.error || 'Failed to update coupon');
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast.error('Failed to update coupon');
    }
  };

  const handleCopyCode = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.code);
      toast.success('Coupon code copied to clipboard');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/admin/coupons/bulk?batchId=${Date.now()}&code=${code}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coupon_${code}_usage.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting coupon data:', error);
      toast.error('Failed to export data');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = () => {
    if (!coupon) return null;
    
    if (!coupon.isActive) {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-300">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }

    if (coupon.isExpired) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    if (coupon.isFullyUsed) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Fully Used
        </Badge>
      );
    }

    if (!coupon.isValidForUse) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          <Clock className="h-3 w-3 mr-1" />
          Not Started
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active ({coupon.daysRemaining}d left)
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011b54]"></div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="text-center py-12">
        <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Coupon not found</h3>
        <p className="text-gray-500 mt-1">The coupon you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/admin/coupons')} className="mt-4">
          Back to Coupons
        </Button>
      </div>
    );
  }

  if (editMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/coupons/${code}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight gradient-text">
                Edit Coupon
              </h1>
              <p className="text-muted-foreground">
                Update coupon details and settings
              </p>
            </div>
          </div>
          <Badge className="text-[#011b54] bg-[#011b54]/10 border-[#011b54]/30">
            {coupon.code}
          </Badge>
        </div>

        <CouponForm
          initialData={{
            name: coupon.name,
            code:coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxDiscountAmount: coupon.maxDiscountAmount,
            validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
            validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
            maxUses: coupon.maxUses,
            maxUsesPerUser: coupon.maxUsesPerUser,
            minOrderAmount: coupon.minOrderAmount,
            applicableTo: coupon.applicableTo as SubmitData['applicableTo'],
            userEligibility: coupon.userEligibility as SubmitData['userEligibility'],
            canCombineWithBargain: coupon.canCombineWithBargain,
            canCombineWithOtherGlobal: coupon.canCombineWithOtherGlobal,
            firstOrderOnly: coupon.firstOrderOnly,
            freeShippingMaxWeight: coupon.freeShippingMaxWeight,
            notes: coupon.notes,
          }}
          isEditing={true}
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/admin/coupons/${code}`)}
          loading={updating}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/coupons">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight gradient-text">
                {coupon.name}
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground">{coupon.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center text-sm text-gray-600">
                <Tag className="h-4 w-4 mr-2 text-[#022b82]" />
                <code className="font-mono font-bold text-lg gradient-text">
                  {coupon.code}
                </code>
              </div>
              <div className="text-sm text-gray-500">
                Created {formatDate(coupon.createdAt)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="border-[#011b54]/30 text-[#011b54] hover:bg-[#011b54]/10"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`?edit=true`)}
            className="border-[#011b54]/30 text-[#011b54] hover:bg-[#011b54]/10"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem onClick={handleToggleStatus}>
                {coupon.isActive ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#011b54] data-[state=active]:text-white">
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-[#022b82] data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Usage Stats
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#011b54] data-[state=active]:text-white">
            <Tag className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#011b54] data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Coupon Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Discount Card */}
              <Card className="border border-[#022b82]/20">
                <CardHeader>
                  <CardTitle className="text-[#022b82] flex items-center gap-2">
                    {coupon.discountType === 'percentage' ? (
                      <Percent className="h-5 w-5" />
                    ) : coupon.discountType === 'fixed' ? (
                      <DollarSign className="h-5 w-5" />
                    ) : (
                      <Truck className="h-5 w-5" />
                    )}
                    Discount Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Discount Type</div>
                      <div className="text-lg font-bold text-[#022b82] capitalize">
                        {coupon.discountType.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Discount Value</div>
                      <div className="text-2xl font-bold gradient-text">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}% OFF`
                          : coupon.discountType === 'fixed'
                          ? `${formatCurrency(coupon.discountValue)} OFF`
                          : 'FREE SHIPPING'
                        }
                      </div>
                    </div>
                  </div>
                  
                  {coupon.maxDiscountAmount && (
                    <div>
                      <div className="text-sm text-gray-600">Maximum Discount</div>
                      <div className="text-lg font-medium">
                        {formatCurrency(coupon.maxDiscountAmount)}
                      </div>
                    </div>
                  )}
                  
                  {coupon.freeShippingMaxWeight && (
                    <div>
                      <div className="text-sm text-gray-600">Maximum Weight</div>
                      <div className="text-lg font-medium">
                        {coupon.freeShippingMaxWeight.toLocaleString()} grams
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Validity Card */}
              <Card className="border border-[#011b54]/20">
                <CardHeader>
                  <CardTitle className="text-[#011b54] flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Validity Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Start Date</div>
                      <div className="text-lg font-medium">
                        {formatDate(coupon.validFrom)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">End Date</div>
                      <div className="text-lg font-medium">
                        {formatDate(coupon.validUntil)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-linear-to-r from-[#011b54]/10 to-[#022b82]/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className={`text-lg font-bold ${
                          coupon.daysRemaining > 7 ? 'text-green-600' :
                          coupon.daysRemaining > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {coupon.isExpired ? 'Expired' : 
                           coupon.daysRemaining <= 0 ? 'Expires today' :
                           `${coupon.daysRemaining} days remaining`}
                        </div>
                      </div>
                      <Clock className="h-8 w-8 text-[#011b54]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats Sidebar */}
            <div className="space-y-6">
              {/* Usage Stats Card */}
              <Card className="border border-[#011b54]/20">
                <CardHeader>
                  <CardTitle className="text-[#011b54] flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Total Uses</div>
                      <div className="text-2xl font-bold gradient-text">
                        {coupon.usedCount}
                        {coupon.maxUses && (
                          <span className="text-lg text-gray-500 ml-2">
                            / {coupon.maxUses}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {coupon.maxUses && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Usage Progress</span>
                          <span>{Math.round((coupon.usedCount / coupon.maxUses) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-linear-to-r from-[#011b54] to-[#022b82] h-2 rounded-full"
                            style={{ width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm text-gray-600">Total Discount Given</div>
                      <div className="text-xl font-bold text-[#022b82]">
                        {formatCurrency(coupon.totalDiscountGiven || 0)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Uses Per User</div>
                      <div className="text-lg font-medium">
                        {coupon.maxUsesPerUser}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Minimum Order Card */}
              <Card className="border border-[#011b54]/20">
                <CardHeader>
                  <CardTitle className="text-[#011b54] flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Minimum Order</div>
                      <div className="text-xl font-bold">
                        {formatCurrency(coupon.minOrderAmount)}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm text-gray-600">Applies To</div>
                      <div className="font-medium capitalize">
                        {coupon.applicableTo.replace('_', ' ')}
                      </div>
                      {(coupon.categoryIds.length > 0 || coupon.productIds.length > 0) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {coupon.categoryIds.length > 0 && (
                            <span>{coupon.categoryIds.length} categories</span>
                          )}
                          {coupon.productIds.length > 0 && (
                            <span>{coupon.categoryIds.length > 0 ? ', ' : ''}{coupon.productIds.length} products</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm text-gray-600">User Eligibility</div>
                      <div className="font-medium capitalize">
                        {coupon.userEligibility.replace('_', ' ')}
                        {coupon.firstOrderOnly && ' (First order only)'}
                      </div>
                      {coupon.specificUserIds.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {coupon.specificUserIds.length} specific users
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Usage Stats Tab */}
        <TabsContent value="usage" className="space-y-6">
          {stats ? (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-[#011b54]/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold gradient-text">
                        {stats.totalOrders}
                      </div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-[#022b82]/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#022b82]">
                        {formatCurrency(stats.totalDiscount)}
                      </div>
                      <div className="text-sm text-gray-600">Total Discount</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-[#011b54]/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#011b54]">
                        {formatCurrency(stats.avgDiscountPerOrder)}
                      </div>
                      <div className="text-sm text-gray-600">Avg. Discount/Order</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-[#011b54]/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#011b54]">
                        {stats.uniqueUserCount}
                      </div>
                      <div className="text-sm text-gray-600">Unique Users</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Usage Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Usage
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      className="border-[#011b54]/30 text-[#011b54]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentUsage.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Discount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Final Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentUsage.map((usage) => (
                            <tr key={usage._id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="font-medium">
                                  {usage.orderId?._id?.toString().slice(-8) || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(usage.orderId?.grandTotal || 0)}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium">
                                  {usage.userId?.name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {usage.userId?.email || 'N/A'}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {formatDate(usage.usedAt)}
                              </td>
                              <td className="py-3 px-4 font-medium">
                                {formatCurrency(usage.orderAmount)}
                              </td>
                              <td className="py-3 px-4">
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  -{formatCurrency(usage.discountApplied)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-bold">
                                {formatCurrency(usage.orderAmountAfterDiscount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div>No usage data available</div>
                      <div className="text-sm mt-1">This coupon hasn&apos;t been used yet</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <div>No statistics available</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Combination Rules */}
                <div className="space-y-4">
                  <h3 className="font-medium text-[#011b54]">Combination Rules</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Combine with Bargain</div>
                        <div className="text-sm text-gray-600">Allow with product-specific coupons</div>
                      </div>
                      <Badge className={coupon.canCombineWithBargain ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {coupon.canCombineWithBargain ? 'Allowed' : 'Not Allowed'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Combine with Other Global</div>
                        <div className="text-sm text-gray-600">Allow stacking multiple coupons</div>
                      </div>
                      <Badge className={coupon.canCombineWithOtherGlobal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {coupon.canCombineWithOtherGlobal ? 'Allowed' : 'Not Allowed'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Restrictions */}
                <div className="space-y-4">
                  <h3 className="font-medium text-[#022b82]">Restrictions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">First Order Only</div>
                        <div className="text-sm text-gray-600">For new customers only</div>
                      </div>
                      <Badge className={coupon.firstOrderOnly ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                        {coupon.firstOrderOnly ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Applicability</div>
                        <div className="text-sm text-gray-600">Where coupon can be used</div>
                      </div>
                      <Badge className="bg-[#022b82]/10 text-[#022b82] border-[#022b82]/30">
                        {coupon.applicableTo.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {coupon.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Admin Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-700 whitespace-pre-wrap">{coupon.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coupon History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Created</div>
                    <div className="text-sm text-gray-600">By Admin</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(coupon.createdAt)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Last Updated</div>
                    <div className="text-sm text-gray-600">Settings modified</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(coupon.updatedAt)}
                  </div>
                </div>
                
                {stats?.lastUsed && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Last Used</div>
                      <div className="text-sm text-gray-600">Most recent order</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(stats.lastUsed)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// MoreVertical icon component
function MoreVertical({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}