'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Users,
  Trophy,
  Gift,
  Clock,
  CheckCircle,
  Eye,
//   Edit,
  Sparkles,
  BarChart3,
  TrendingUp,
  Calendar,
  AlertCircle,
//   ArrowRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateDrawForm } from './CreateDrawForm';
import Link from 'next/link';

interface LuckyDraw {
  _id: string;
  title: string;
  description: string;
  prizeName: string;
  prizeDescription: string;
  prizeCategory: string;
  prizeValue?: number;
  status: 'draft' | 'announced' | 'in_progress' | 'completed' | 'cancelled';
  drawType: 'instant' | 'scheduled' | 'manual';
  totalEntries: number;
  eligibleUserCount: number;
  announcementDate?: string;
  drawDate?: string;
  resultDate?: string;
  winnerName?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface AdminLuckyDrawClientProps {
  draws: LuckyDraw[];
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  searchQuery: string;
  stats: {
    total: number;
    draft: number;
    announced: number;
    completed: number;
    active: number;
  };
  adminId: string;
}

const statusConfig: Record<string, { 
  label: string; 
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  draft: { 
    label: 'Draft', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: <Clock className="h-3 w-3" />
  },
  announced: { 
    label: 'Announced', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Sparkles className="h-3 w-3" />
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: <RefreshCw className="h-3 w-3" />
  },
  completed: { 
    label: 'Completed', 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="h-3 w-3" />
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: <AlertCircle className="h-3 w-3" />
  },
};

const prizeCategoryColors: Record<string, string> = {
  vehicle: 'bg-red-100 text-red-800',
  electronics: 'bg-blue-100 text-blue-800',
  cash: 'bg-green-100 text-green-800',
  voucher: 'bg-purple-100 text-purple-800',
  other: 'bg-amber-100 text-amber-800',
};

export function AdminLuckyDrawClient({
  draws,
  currentPage,
  totalPages,
  currentStatus,
  searchQuery,
  stats,
  adminId,
}: AdminLuckyDrawClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleApplyFilters = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('page', '1');
    
    router.push(`/admin/lucky-draw?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setStatusFilter('all');
    router.push('/admin/lucky-draw');
  };

  const handleAnnounceDraw = async (drawId: string) => {
    try {
      const response = await fetch(`/api/admin/lucky-draw/${drawId}/announce`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error announcing draw:', error);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    router.refresh();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Lucky Draw Management</h1>
          </div>
          <p className="text-muted-foreground">
            Create, manage, and monitor lucky draws
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Draw
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create New Lucky Draw
                </DialogTitle>
              </DialogHeader>
              <CreateDrawForm onSuccess={handleCreateSuccess} adminId={adminId} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Draws</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">
                  Accepting entries
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">
                  Not announced
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">
                  Winners selected
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search draws..."
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="announced">Announced</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={handleApplyFilters} disabled={isLoading}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draws Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Draw</th>
                  <th className="text-left py-3 px-4">Prize</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Entries</th>
                  <th className="text-left py-3 px-4">Dates</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Loading Skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-8 w-24" />
                      </td>
                    </tr>
                  ))
                ) : draws.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold mb-2">No draws found</p>
                        <p className="text-muted-foreground mb-6">
                          {searchInput || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first lucky draw!'}
                        </p>
                        {!searchInput && statusFilter === 'all' && (
                          <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Draw
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  draws.map((draw) => {
                    const status = statusConfig[draw.status] || statusConfig.draft;
                    
                    return (
                      <tr key={draw._id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{draw.title}</h4>
                              {draw.isFeatured && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {draw.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {draw.drawType}
                              </Badge>
                              <Badge className={`text-xs ${prizeCategoryColors[draw.prizeCategory]}`}>
                                {draw.prizeCategory}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="font-medium">{draw.prizeName}</p>
                            {draw.prizeValue && (
                              <p className="text-sm text-muted-foreground">
                                Value: ₹{draw.prizeValue.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <Badge className={`${status.bgColor} ${status.color} border`}>
                            <span className="flex items-center gap-1">
                              {status.icon}
                              {status.label}
                            </span>
                          </Badge>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{draw.totalEntries}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {draw.eligibleUserCount} participants
                            </p>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>Announce: {formatDate(draw.announcementDate)}</span>
                            </div>
                            {draw.drawDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>Draw: {formatDate(draw.drawDate)}</span>
                              </div>
                            )}
                            {draw.resultDate && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>Result: {formatDate(draw.resultDate)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                asChild
                              >
                                <a href={`/admin/lucky-draw/${draw._id}`}>
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              
                              {draw.status === 'draft' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleAnnounceDraw(draw._id)}
                                >
                                  Announce
                                </Button>
                              )}
                              
                              {draw.status === 'announced' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="h-8"
                                  asChild
                                >
                                  <a href={`/admin/lucky-draw/${draw._id}/spin`}>
                                    <Trophy className="h-4 w-4 mr-1" />
                                    Spin
                                  </a>
                                </Button>
                              )}
                            </div>
                            
                            {draw.winnerName && (
                              <p className="text-xs text-green-600 font-medium">
                                Winner: {draw.winnerName}
                              </p>
                            )}
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
          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center items-center gap-2 mt-8 pt-8 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (searchInput) params.set('search', searchInput);
                  if (statusFilter !== 'all') params.set('status', statusFilter);
                  params.set('page', (currentPage - 1).toString());
                  router.push(`/admin/lucky-draw?${params.toString()}`);
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
                        if (searchInput) params.set('search', searchInput);
                        if (statusFilter !== 'all') params.set('status', statusFilter);
                        params.set('page', pageNum.toString());
                        router.push(`/admin/lucky-draw?${params.toString()}`);
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
                        if (searchInput) params.set('search', searchInput);
                        if (statusFilter !== 'all') params.set('status', statusFilter);
                        params.set('page', totalPages.toString());
                        router.push(`/admin/lucky-draw?${params.toString()}`);
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
                  if (searchInput) params.set('search', searchInput);
                  if (statusFilter !== 'all') params.set('status', statusFilter);
                  params.set('page', (currentPage + 1).toString());
                  router.push(`/admin/lucky-draw?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start"
              onClick={() => setShowCreateDialog(true)}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">Create New Draw</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set up a new lucky draw with amazing prizes
                </p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start"
              asChild
            >
              <Link href="/admin/orders?status=delivered&search=3000">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-semibold">View Eligible Orders</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check orders that qualify for lucky draw entries
                  </p>
                </div>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 justify-start"
              onClick={() => router.refresh()}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Download className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-semibold">Export Data</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Download draw statistics and entry reports
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Star icon component
const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);