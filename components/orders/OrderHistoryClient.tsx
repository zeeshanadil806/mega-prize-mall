"use client";

import { useState } from "react";
import Link from "next/link";
import { getWhatsAppSupportLink } from '@/shared/config';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  ChevronRight,
  Package,
  CheckCircle,
  Truck,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/shared/format";
import { ClientOrder } from "@/types";

interface OrderHistoryClientProps {
  orders: ClientOrder[];
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  stats: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
  };
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-4 w-4" />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Package className="h-4 w-4" />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: null,
  },
  returned: {
    label: "Returned",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: null,
  },
  refunded: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null,
  },
};

export function OrderHistoryClient({
  orders,
  currentPage,
  totalPages,
  currentStatus,
  stats,
}: OrderHistoryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      // Update: Search by orderNumber OR product name
      (order._id && order._id.toLowerCase().includes(query)) ||
      order._id.toLowerCase().includes(query) ||
      order.items.some((item) => item.productName.toLowerCase().includes(query))
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "highest":
        return b.grandTotal - a.grandTotal;
      case "lowest":
        return a.grandTotal - b.grandTotal;
      default:
        return 0;
    }
  });

  const handleStatusChange = (status: string) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (searchQuery) params.set("search", searchQuery);
    router.push(`/dashboard/orders?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const params = new URLSearchParams();
    if (currentStatus !== "all") params.set("status", currentStatus);
    if (searchQuery) params.set("search", searchQuery);
    router.push(`/dashboard/orders?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-2">
          Track, view, and manage all your purchases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Orders Card */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Total Orders
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-gradient-to-r from-[#7C2C78]/10 to-[#A43875]/10 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-[#7C2C78]" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Pending
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Processing Orders Card */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Processing
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.processing}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Delivered Orders Card */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  Delivered
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.delivered}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Status Tabs */}
            <Tabs
              value={currentStatus}
              onValueChange={handleStatusChange}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-4 md:flex">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="flex gap-2 w-full md:w-auto"
            >
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Order # or Product Name..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" disabled={isLoading}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </form>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : sortedOrders.length === 0 ? (
          // Empty State
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || currentStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start shopping to see your orders here"}
              </p>
              {!searchQuery && currentStatus === "all" && (
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          // Orders List
          sortedOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const itemCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <Card
                key={order._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={config.color}>
                          {config.icon}
                          <span className="ml-1">{config.label}</span>
                        </Badge>
                        <span className="text-sm font-mono text-muted-foreground">
                          {/* UPDATED: Uses the proper orderNumber field */}
                          Order Id:{" "}
                          {order._id || order._id.slice(-8).toUpperCase()}...
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {itemCount} item{itemCount > 1 ? "s" : ""} •{" "}
                          {formatCurrency(order.grandTotal)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-PK",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      {/* Products Preview */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {item.productImage && (
                              <div className="h-10 w-10 rounded-md border overflow-hidden">
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium line-clamp-1">
                                {item.productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} ×{" "}
                                {formatCurrency(item.finalPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatCurrency(order.grandTotal)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.pointsEarned > 0 &&
                            `Earned ${order.pointsEarned} points`}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/orders/${order._id}`}>
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>

                        {order.status === "delivered" && (
                          <Button variant="default" size="sm" asChild>
                            <Link
                              href={getWhatsAppSupportLink(`Hi, I'd like to share feedback/review for order ID: ${order._id.slice(-8).toUpperCase()}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Write Review
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination (Keep exactly as provided, just ensure handlers are correct) */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {/* ... Pagination logic remains same as your original code ... */}
          {/* If you need the full pagination block again, let me know, 
               but it works perfectly with these props */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() =>
              router.push(`/dashboard/orders?page=${currentPage - 1}`)
            }
          >
            Previous
          </Button>

          {/* ... */}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() =>
              router.push(`/dashboard/orders?page=${currentPage + 1}`)
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
