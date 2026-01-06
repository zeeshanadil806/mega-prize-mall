// src/components/admin/bargain/AdminBargainClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
  Download,
  MoreVertical,
  Tag,
  Calendar,
  User,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/bargain-utils';
import Link from 'next/link';
import { ImageProps } from '@/types';

interface BargainRequest {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image?: ImageProps;
    price: number;
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  originalPrice: number;
  offeredPrice: number;
  minPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  discountPercentage: number;
  savingAmount: number;
  couponCode?: string;
  couponExpiresAt?: string;
  bargainRound: number;
  maxRounds: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  formatted: {
    originalPrice: string;
    offeredPrice: string;
    minPrice: string;
    savingAmount: string;
  };
}

interface AdminBargainClientProps {
  initialData: {
    requests: BargainRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      total: number;
      pending: number;
      accepted: number;
      rejected: number;
      expired: number;
      totalOfferedAmount: number;
      totalSavingAmount: number;
    };
  };
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'text-yellow-800', 
    bgColor: 'bg-yellow-100 border-yellow-200',
    icon: <Clock className="h-3 w-3" />
  },
  accepted: { 
    label: 'Accepted', 
    color: 'text-green-800', 
    bgColor: 'bg-green-100 border-green-200',
    icon: <CheckCircle className="h-3 w-3" />
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-800', 
    bgColor: 'bg-red-100 border-red-200',
    icon: <XCircle className="h-3 w-3" />
  },
  expired: { 
    label: 'Expired', 
    color: 'text-gray-800', 
    bgColor: 'bg-gray-100 border-gray-200',
    icon: <Clock className="h-3 w-3" />
  },
};

export function AdminBargainClient({ initialData }: AdminBargainClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [requests, setRequests] = useState<BargainRequest[]>(initialData.requests);
  const [stats, setStats] = useState(initialData.stats);
  const [pagination, setPagination] = useState(initialData.pagination);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
  
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch data with filters
  const fetchData = async () => {
    setIsLoading(true);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (sortBy !== '-createdAt') params.set('sort', sortBy);
    params.set('page', pagination.page.toString());
    params.set('limit', '20');

    try {
      const response = await fetch(`/api/admin/bargain?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRequests(data.data.requests);
          setStats(data.data.stats);
          setPagination(data.data.pagination);
          
          // Update URL
          const newUrl = `/admin/bargain?${params.toString()}`;
          window.history.pushState({}, '', newUrl);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bargain data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, sortBy]);

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('-createdAt');
    setPagination({ ...pagination, page: 1 });
    router.push('/admin/bargain');
  };

  const handleStatusUpdate = async (requestId: string, newStatus: BargainRequest['status'], notes?: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/bargain', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: requestId, 
          status: newStatus,
          adminNotes: notes 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // FIX: Find the request first to get its OLD status
          const requestToUpdate = requests.find(r => r.id === requestId);

          if (requestToUpdate) {
             // Update local state for the list
            setRequests(prev => 
              prev.map(req => 
                req.id === requestId 
                  ? { 
                      ...req, 
                      status: newStatus,
                      couponCode: data.data.couponCode || req.couponCode,
                      couponExpiresAt: data.data.couponExpiresAt || req.couponExpiresAt,
                      updatedAt: new Date().toISOString(),
                    }
                  : req
              )
            );
            
            // Update stats using the found request object
            setStats(prev => ({
              ...prev,
              // Use requestToUpdate.status instead of req.status
              [requestToUpdate.status]: Math.max(0, prev[requestToUpdate.status as keyof typeof stats] - 1),
              [newStatus]: (prev[newStatus as keyof typeof stats] || 0) + 1,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
      setAdminNotes('');
    }
  };
console.log(requests)
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this bargain request?')) return;

    try {
      const response = await fetch(`/api/admin/bargain?id=${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Update stats
        const deletedReq = requests.find(req => req.id === requestId);
        if (deletedReq) {
          setStats(prev => ({
            ...prev,
            total: prev.total - 1,
            [deletedReq.status]: Math.max(0, prev[deletedReq.status as keyof typeof stats] - 1),
          }));
        }
      }
    } catch (error) {
      console.error('Failed to delete bargain request:', error);
    }
  };

  const downloadCSV = () => {
    const headers = [
      'ID', 'Customer', 'Email', 'Product', 'Original Price', 
      'Offered Price', 'Saving', 'Discount %', 'Status', 
      'Coupon Code', 'Coupon Expiry', 'Round', 'Date'
    ];
    
    const csvData = requests.map(req => [
      req.id.slice(-8),
      req.user?.name || 'N/A',
      req.user?.email || 'N/A',
      req.product?.name || 'N/A',
      req.formatted.originalPrice,
      req.formatted.offeredPrice,
      req.formatted.savingAmount,
      `${req.discountPercentage}%`,
      req.status,
      req.couponCode || 'N/A',
      req.couponExpiresAt ? new Date(req.couponExpiresAt).toLocaleDateString() : 'N/A',
      `${req.bargainRound}/${req.maxRounds}`,
      new Date(req.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bargain-requests-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const StatusBadge = ({ status }: { status: BargainRequest['status'] }) => {
    const config = statusConfig[status];
    return (
      <Badge className={`${config.bgColor} ${config.color} border flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bargain Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage customer bargain requests and coupon generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bargains</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">
                  All time requests
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">
                  Need review
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{stats.accepted}</p>
                <p className="text-xs text-muted-foreground">
                  Coupons generated
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSavingAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  Customer savings
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search and Status Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Label htmlFor="search">Search Bargains</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by coupon code, customer, product..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:w-48">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="md:w-48">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-createdAt">Newest First</SelectItem>
                    <SelectItem value="createdAt">Oldest First</SelectItem>
                    <SelectItem value="-offeredPrice">Highest Offer</SelectItem>
                    <SelectItem value="offeredPrice">Lowest Offer</SelectItem>
                    <SelectItem value="-discountPercentage">Highest Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Date Filters'}
              </Button>
              
              {showFilters && (
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="date-from">From Date</Label>
                    <Input
                      id="date-from"
                      type="date"
                      className="mt-1"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="date-to">To Date</Label>
                    <Input
                      id="date-to"
                      type="date"
                      className="mt-1"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Apply Filters'}
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Showing {requests.length} of {pagination.total} requests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bargain Requests Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Bargain ID</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Price Details</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Coupon</th>
                  <th className="text-left py-3 px-4">Round</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <div className="flex justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold mb-2">No bargain requests found</p>
                        <p className="text-muted-foreground">
                          Try adjusting your filters or search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">
                          {request.id.slice(-8)}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        {request.product ? (
                          <div className="flex items-center gap-3">
                            {request.product.image && (
                              <img 
                                src={request.product.image.url} 
                                alt={request.product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium line-clamp-1">{request.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {request.formatted.originalPrice}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground italic">Product deleted</div>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        {request.user ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <p className="font-medium">{request.user.name}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{request.user.email}</p>
                            </div>
                            {request.user.phone && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">{request.user.phone}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-muted-foreground italic">User deleted</div>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">Original:</span>
                            <span className="font-medium">{request.formatted.originalPrice}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">Offered:</span>
                            <span className="font-medium text-green-600">
                              {request.formatted.offeredPrice}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">Saving:</span>
                            <span className="font-medium text-blue-600">
                              {request.formatted.savingAmount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">Discount:</span>
                            <Badge variant="outline" className="text-xs">
                              <Percent className="h-3 w-3 mr-1" />
                              {request.discountPercentage}%
                            </Badge>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <StatusBadge status={request.status} />
                      </td>
                      
                      <td className="py-3 px-4">
                        {request.couponCode ? (
                          <div className="space-y-1">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {request.couponCode}
                            </code>
                            {request.couponExpiresAt && (
                              <div className="flex items-center gap-1 text-xs">
                                <Calendar className="h-3 w-3" />
                                <span className={request.isExpired ? 'text-red-600' : 'text-green-600'}>
                                  {request.isExpired ? 'Expired' : new Date(request.couponExpiresAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No coupon</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="font-bold">{request.bargainRound}</div>
                            <div className="text-xs text-muted-foreground">Round</div>
                          </div>
                          <div className="text-muted-foreground">/</div>
                          <div className="text-center">
                            <div className="font-bold">{request.maxRounds}</div>
                            <div className="text-xs text-muted-foreground">Max</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(request.createdAt).toLocaleDateString('en-PK')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {request.product && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link href={`/products/${request.product.slug}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Bargain Request Details</DialogTitle>
                                <DialogDescription>
                                  ID: {request.id}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                {/* Product Info */}
                                {request.product && (
                                  <div className="flex items-start gap-4 p-3 border rounded-lg">
                                    {request.product.image && (
                                      <img 
                                        src={request.product.image.url} 
                                        alt={request.product.name}
                                        className="h-16 w-16 rounded object-cover"
                                      />
                                    )}
                                    <div>
                                      <h4 className="font-semibold">{request.product.name}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Original Price: {request.formatted.originalPrice}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Minimum Price: {request.formatted.minPrice}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Customer Info */}
                                {request.user && (
                                  <div className="p-3 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Customer Information</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Name:</span>
                                        <p>{request.user.name}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Email:</span>
                                        <p>{request.user.email}</p>
                                      </div>
                                      {request.user.phone && (
                                        <div>
                                          <span className="text-muted-foreground">Phone:</span>
                                          <p>{request.user.phone}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Price Details */}
                                <div className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Original</p>
                                    <p className="text-xl font-bold">{request.formatted.originalPrice}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Offered</p>
                                    <p className="text-2xl font-bold text-green-600">{request.formatted.offeredPrice}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Saving</p>
                                    <p className="text-xl font-bold text-blue-600">{request.formatted.savingAmount}</p>
                                    <Badge variant="outline">
                                      {request.discountPercentage}% OFF
                                    </Badge>
                                  </div>
                                </div>

                                {/* Message */}
                                {request.message && (
                                  <div className="p-3 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Customer Message</h4>
                                    <p className="text-sm">{request.message}</p>
                                  </div>
                                )}

                                {/* Status Actions */}
                                {request.status === 'pending' && (
                                  <div className="p-3 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Update Status</h4>
                                    <div className="flex gap-2">
                                      <Button 
                                        onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                        disabled={isUpdating}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept
                                      </Button>
                                      <Button 
                                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                        disabled={isUpdating}
                                        variant="destructive"
                                        className="flex-1"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                    <Textarea 
                                      placeholder="Add notes for the customer (optional)"
                                      className="mt-2"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {request.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                    disabled={isUpdating}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept Bargain
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                    disabled={isUpdating}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Bargain
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {request.status === 'accepted' && request.couponCode && (
                                <DropdownMenuItem
                                  onClick={() => navigator.clipboard.writeText(request.couponCode!)}
                                >
                                  <Tag className="h-4 w-4 mr-2" />
                                  Copy Coupon Code
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(request.id, 'expired')}
                                disabled={isUpdating}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Mark as Expired
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRequest(request.id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Delete Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  if (pagination.totalPages > 5 && pagination.page > 3) {
                    const start = Math.max(1, pagination.page - 2);
                    const pageNum = start + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        className="min-w-9"
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      className="min-w-9"
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-9"
                      onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))}
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}