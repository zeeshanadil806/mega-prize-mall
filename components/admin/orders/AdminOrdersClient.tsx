'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye,
  Edit,
  Download,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  RefreshCw,
  X,
  CheckCircle,
  Clock,
  Truck,
  Home,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/bargain-utils';
import { ClientOrder } from '@/types';
import { AdminInvoiceGenerator } from './AdminInvoiceGenerator';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface AdminOrdersClientProps {
  orders: (ClientOrder & { user: { name: string; email: string; phone?: string } })[];
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  stats: {
    total: number;
    today: number;
    yesterday: number;
    last7Days: number;
    revenue: number;
    pending: number;
    processing: number;
  };
}

const statusConfig: Record<string, { 
  label: string; 
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  pending: { 
    label: 'Pending', 
    color: 'text-yellow-800', 
    bgColor: 'bg-yellow-100 border-yellow-200',
    icon: <Clock className="h-3 w-3" />
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'text-blue-800', 
    bgColor: 'bg-blue-100 border-blue-200',
    icon: <CheckCircle className="h-3 w-3" />
  },
  processing: { 
    label: 'Processing', 
    color: 'text-purple-800', 
    bgColor: 'bg-purple-100 border-purple-200',
    icon: <Package className="h-3 w-3" />
  },
  shipped: { 
    label: 'Shipped', 
    color: 'text-indigo-800', 
    bgColor: 'bg-indigo-100 border-indigo-200',
    icon: <Truck className="h-3 w-3" />
  },
  delivered: { 
    label: 'Delivered', 
    color: 'text-green-800', 
    bgColor: 'bg-green-100 border-green-200',
    icon: <Home className="h-3 w-3" />
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-800', 
    bgColor: 'bg-red-100 border-red-200',
    icon: <X className="h-3 w-3" />
  },
  returned: { 
    label: 'Returned', 
    color: 'text-orange-800', 
    bgColor: 'bg-orange-100 border-orange-200',
    icon: <RefreshCw className="h-3 w-3" />
  },
  refunded: { 
    label: 'Refunded', 
    color: 'text-gray-800', 
    bgColor: 'bg-gray-100 border-gray-200',
    icon: <DollarSign className="h-3 w-3" />
  },
};

export function AdminOrdersClient({
  orders,
  currentPage,
  totalPages,
  currentStatus,
  searchQuery: initialSearch,
  dateFrom: initialDateFrom,
  dateTo: initialDateTo,
  stats,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const [bulkAction, setBulkAction] = useState('');
  const [showFilters, setShowFilters] = useState(!!initialDateFrom || !!initialDateTo);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    params.set('page', '1');
    
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    router.push('/admin/orders');
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      setIsUpdating(true);
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrders,
          action: bulkAction,
        }),
      });

      if (response.ok) {
        router.refresh();
        setSelectedOrders([]);
        setBulkAction('');
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  const downloadCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Status', 'Items', 'Total', 'Date', 'Payment'];
    const csvData = orders.map(order => [
      order._id,
      order.user.name,
      order.user.email,
      order.user.phone || 'N/A',
      order.status,
      order.items.reduce((sum, item) => sum + item.quantity, 0),
      formatCurrency(order.grandTotal),
      new Date(order.createdAt).toLocaleDateString(),
      order.paymentMethod,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage, track, and process customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Orders</p>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.yesterday} yesterday
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
                  Need attention
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
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
                <p className="text-xs text-muted-foreground">
                  In progress
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                <p className="text-xs text-muted-foreground">
                  Last 7 days: {stats.last7Days} orders
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
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
                <Label htmlFor="search">Search Orders</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by order ID, product, customer..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                {showFilters ? 'Hide Filters' : 'More Filters'}
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
                <Button onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Showing {orders.length} of {stats.total} orders
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card className="mb-4 border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{selectedOrders.length} order(s) selected</p>
                  <p className="text-sm text-muted-foreground">
                    Choose an action to apply to all selected orders
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mark_processing">Mark as Processing</SelectItem>
                    <SelectItem value="mark_shipped">Mark as Shipped</SelectItem>
                    <SelectItem value="mark_delivered">Mark as Delivered</SelectItem>
                    <SelectItem value="mark_cancelled">Mark as Cancelled</SelectItem>
                    <SelectItem value="export_selected">Export Selected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction || isUpdating}
                >
                  {isUpdating ? 'Processing...' : 'Apply'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedOrders([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={selectAllOrders}
                      className="h-4 w-4"
                    />
                  </th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold mb-2">No orders found</p>
                        <p className="text-muted-foreground">
                          Try adjusting your filters or search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.pending;
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    
                    return (
                      <tr key={order._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => toggleOrderSelection(order._id)}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium font-mono text-sm">
                              {order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.paymentMethod === 'cod' ? 'COD' : 'Paid'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{order.user.name}</p>
                            <p className="text-xs text-muted-foreground">{order.user.email}</p>
                            {order.user.phone && (
                              <p className="text-xs text-muted-foreground">{order.user.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge className={`${config.bgColor} ${config.color} border`}>
                              <span className="flex items-center gap-1">
                                {config.icon}
                                {config.label}
                              </span>
                            </Badge>
                            <Select
                              defaultValue={order.status}
                              onValueChange={(value) => handleStatusChange(order._id, value)}
                            >
                              <SelectTrigger className="h-7 w-7 p-0">
                                <Edit className="h-3 w-3" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{formatCurrency(order.grandTotal)}</p>
                            {order.pointsRedeemed > 0 && (
                              <p className="text-xs text-green-600">
                                -{order.pointsRedeemed} points
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString('en-PK')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <a href={`/admin/orders/${order._id}`}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <AdminInvoiceGenerator order={order} />

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('page', (currentPage - 1).toString());
                  router.push(`/admin/orders?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    const start = Math.max(1, currentPage - 2);
                    const pageNum = start + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="min-w-9"
                        onClick={() => {
                          const params = new URLSearchParams(window.location.search);
                          params.set('page', pageNum.toString());
                          router.push(`/admin/orders?${params.toString()}`);
                        }}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="min-w-9"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('page', pageNum.toString());
                        router.push(`/admin/orders?${params.toString()}`);
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-9"
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        params.set('page', totalPages.toString());
                        router.push(`/admin/orders?${params.toString()}`);
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
                  const params = new URLSearchParams(window.location.search);
                  params.set('page', (currentPage + 1).toString());
                  router.push(`/admin/orders?${params.toString()}`);
                }}
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
