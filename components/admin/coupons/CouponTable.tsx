// components/admin/coupons/CouponTable.tsx
'use client';

// import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Tag,
  Percent,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
} from 'lucide-react';

interface Coupon {
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
  minOrderAmount: number;
  createdAt: string;
  isValidForUse: boolean;
  isExpired: boolean;
  isFullyUsed: boolean;
  maxUsesPerUser: number;
  daysRemaining: number;
  remainingUses?: number | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CouponTableProps {
  coupons: Coupon[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onView: (code: string) => void;
  onEdit: (code: string) => void;
  onDelete: (code: string) => void;
  onToggleStatus: (code: string, currentStatus: boolean) => void;
  onCopyCode: (code: string) => void;
}

export default function CouponTable({
  coupons,
  loading,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopyCode,
}: CouponTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountBadge = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return (
          <Badge className="bg-linear-to-r from-[#EAB75F]/20 to-[#A43875]/20 text-[#7C2C78] border border-[#7C2C78]/20">
            <Percent className="h-3 w-3 mr-1" />
            {coupon.discountValue}% OFF
            {coupon.maxDiscountAmount && (
              <span className="ml-1 text-xs">
                (up to {formatCurrency(coupon.maxDiscountAmount)})
              </span>
            )}
          </Badge>
        );
      
      case 'fixed':
        return (
          <Badge className="bg-linear-to-r from-[#7C2C78]/20 to-[#A43875]/20 text-[#7C2C78] border border-[#7C2C78]/20">
            <DollarSign className="h-3 w-3 mr-1" />
            {formatCurrency(coupon.discountValue)} OFF
          </Badge>
        );
      
      case 'free_shipping':
        return (
          <Badge className="bg-linear-to-r from-[#2E297D]/20 to-[#7C2C78]/20 text-[#2E297D] border border-[#2E297D]/20">
            <Truck className="h-3 w-3 mr-1" />
            Free Shipping
          </Badge>
        );
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      );
    }

    if (coupon.isExpired) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-100">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    if (coupon.isFullyUsed) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100">
          <AlertCircle className="h-3 w-3 mr-1" />
          Fully Used
        </Badge>
      );
    }

    if (!coupon.isValidForUse) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100">
          <Clock className="h-3 w-3 mr-1" />
          Not Started
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active ({coupon.daysRemaining}d)
      </Badge>
    );
  };

  const getUsageBadge = (coupon: Coupon) => {
    if (coupon.maxUses) {
      const percentage = Math.round((coupon.usedCount / coupon.maxUses) * 100);
      return (
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Usage</span>
              <span>{coupon.usedCount}/{coupon.maxUses}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  percentage > 80 ? 'bg-red-500' : 
                  percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <Users className="h-4 w-4 mr-2 text-[#A43875]" />
        <span className="font-bold">{coupon.usedCount}</span>
        <span className="text-sm text-gray-500 ml-1">uses</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg glass">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Coupon</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C2C78]"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No coupons found
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow 
                  key={coupon._id} 
                  className="hover:bg-linear-to-r hover:from-[#7C2C78]/5 hover:to-[#A43875]/5 transition-colors"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#7C2C78] to-[#A43875] flex items-center justify-center">
                          <Tag className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 gradient-text">
                            {coupon.code}
                          </div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {coupon.name}
                          </div>
                          {coupon.description && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {coupon.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span>Min: {formatCurrency(coupon.minOrderAmount)}</span>
                        <span className="mx-2">•</span>
                        <span>Created: {formatDate(coupon.createdAt)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getDiscountBadge(coupon)}
                      <div className="text-xs text-gray-600">
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}% discount` 
                          : coupon.discountType === 'fixed'
                          ? `${formatCurrency(coupon.discountValue)} off`
                          : 'Free shipping'
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {formatDate(coupon.validFrom)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        to {formatDate(coupon.validUntil)}
                      </div>
                      {coupon.daysRemaining > 0 && coupon.daysRemaining <= 7 && (
                        <div className="text-xs text-red-600 font-medium">
                          {coupon.daysRemaining} days left
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getUsageBadge(coupon)}
                    {coupon.maxUsesPerUser > 1 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {coupon.maxUsesPerUser} per user
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(coupon)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-[#7C2C78]/10"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="glass border border-[#7C2C78]/20"
                      >
                        <DropdownMenuItem onClick={() => onView(coupon.code)}>
                          <Eye className="h-4 w-4 mr-2 text-[#7C2C78]" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(coupon.code)}>
                          <Edit className="h-4 w-4 mr-2 text-[#2E297D]" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCopyCode(coupon.code)}>
                          <Copy className="h-4 w-4 mr-2 text-[#A43875]" />
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(coupon.code, coupon.isActive)}>
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
                        <DropdownMenuItem 
                          onClick={() => onDelete(coupon.code)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {coupons.length > 0 && !loading && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} coupons
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="border-[#7C2C78]/30 hover:bg-[#7C2C78]/10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 p-0 ${
                      pagination.page === pageNum 
                        ? 'bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white border-0' 
                        : 'border-[#7C2C78]/30 hover:bg-[#7C2C78]/10'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="border-[#7C2C78]/30 hover:bg-[#7C2C78]/10"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}