// src/components/admin/support/SupportAccountsClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Key,
  RefreshCw,
  Download,
  AlertCircle,
  Clock,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SupportAccountForm from './SupportAccountForm';

interface SupportAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'support';
  isActive: boolean;
  points: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface SupportAccountsClientProps {
  initialData: {
    accounts: SupportAccount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function SupportAccountsClient({ initialData }: SupportAccountsClientProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SupportAccount[]>(initialData.accounts);
  const [pagination, setPagination] = useState(initialData.pagination);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('-createdAt');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SupportAccount | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchAccounts = async (page = pagination.page) => {
    setIsLoading(true);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'all') params.set('isActive', statusFilter === 'active' ? 'true' : 'false');
    if (sortBy !== '-createdAt') params.set('sort', sortBy);
    params.set('page', page.toString());
    params.set('limit', '20');

    try {
      const response = await fetch(`/api/admin/support?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccounts(data.data.accounts);
          setPagination(data.data.pagination);
          
          // Update URL
          const newUrl = `/admin/support?${params.toString()}`;
          window.history.pushState({}, '', newUrl);
        }
      }
    } catch (error) {
      console.error('Failed to fetch support accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAccounts(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('-createdAt');
    setPagination(prev => ({ ...prev, page: 1 }));
    router.push('/admin/support');
  };
// Define the shape of data submitted by the form
interface SupportAccountFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string; // Required for creation, optional for updates
  isActive?: boolean;
}

// Define the return type for your actions for better type safety
interface ActionResponse {
  success: boolean;
  message: string;
}
  const handleCreateAccount = async (data: SupportAccountFormData): Promise<ActionResponse> => {
    try {
      const response = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowCreateDialog(false);
        fetchAccounts();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.error || 'Failed to create account' };
      }
    } catch (error) {
        console.log(error)
      return { success: false, message: 'Network error' };
    }
  };

  const handleUpdateAccount = async (accountId: string, data: Partial<SupportAccountFormData>): Promise<ActionResponse> => {
    try {
      const response = await fetch(`/api/admin/support/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.ok) {
        setShowEditDialog(false);
        setSelectedAccount(null);
        fetchAccounts();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.error || 'Failed to update account' };
      }
    } catch (error) {
        console.log(error)
      return { success: false, message: 'Network error' };
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    if (!selectedAccount) return;

    setIsResetting(true);
    try {
      const response = await fetch(`/api/admin/support/${selectedAccount.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Password reset successfully!');
        setShowResetPasswordDialog(false);
        setNewPassword('');
        setConfirmPassword('');
        setSelectedAccount(null);
      } else {
        alert(result.error || 'Failed to reset password');
      }
    } catch (error) {
        console.log(error)
      alert('Network error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleStatus = async (accountId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this account?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/support/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this support account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/support/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const downloadCSV = () => {
    const headers = [
      'ID', 'Name', 'Email', 'Phone', 'Status', 
      'Points', 'Created At'
    ];
    
    const csvData = accounts.map(account => [
      account.id.slice(-8),
      account.name,
      account.email,
      account.phone || 'N/A',
      account.isActive ? 'Active' : 'Inactive',
      account.points,
      new Date(account.createdAt).toLocaleDateString('en-PK'),
      // account.lastLogin ? new Date(account.lastLogin).toLocaleDateString('en-PK') : 'Never',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `support-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
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
          <h1 className="text-3xl font-bold tracking-tight">Support Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Manage support staff accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => fetchAccounts()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Support Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Support Account</DialogTitle>
                <DialogDescription>
                  Add a new support staff member to the system
                </DialogDescription>
              </DialogHeader>
              <SupportAccountForm
                onSubmit={handleCreateAccount}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Support Staff</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-xs text-muted-foreground">
                  All accounts
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {accounts.filter(a => a.isActive).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Currently active
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
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">
                  {accounts.filter(a => !a.isActive).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Deactivated accounts
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
                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">
                  {accounts.filter(a => {
                    const created = new Date(a.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Added this month
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Label htmlFor="search">Search Support Accounts</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or phone..."
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
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
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
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="-name">Name Z-A</SelectItem>
                    <SelectItem value="-updatedAt">Recently Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                Showing {accounts.length} of {pagination.total} accounts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Accounts Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Support Staff</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  {/* <TableHead>Last Login</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <div className="flex justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold mb-2">No support accounts found</p>
                        <p className="text-muted-foreground">
                          {searchQuery || statusFilter !== 'all' 
                            ? 'Try adjusting your filters or search criteria' 
                            : 'Create your first support account using the "Add Support Account" button'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#011b54] to-[#022b82] flex items-center justify-center text-white font-bold">
                            {account.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{account.name}</p>
                            <Badge variant="outline" className="mt-1">
                              ID: {account.id.slice(-8)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{account.email}</span>
                          </div>
                          {account.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{account.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 ${
                            account.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          }`}
                        >
                          {account.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Support
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(account.createdAt)}</span>
                        </div>
                      </TableCell>
                      
                      {/* <TableCell>
                        {account.lastLogin ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatDate(account.lastLogin)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Never logged in</span>
                        )}
                      </TableCell> */}
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem onClick={() => {
                                setSelectedAccount(account);
                                setShowEditDialog(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => {
                                setSelectedAccount(account);
                                setShowResetPasswordDialog(true);
                              }}>
                                <Key className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => 
                                handleToggleStatus(account.id, account.isActive)
                              }>
                                {account.isActive ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Deactivate Account
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate Account
                                  </>
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleDeleteAccount(account.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  fetchAccounts(pagination.page - 1);
                }}
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
                        onClick={() => {
                          setPagination(prev => ({ ...prev, page: pageNum }));
                          fetchAccounts(pageNum);
                        }}
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
                      onClick={() => {
                        setPagination(prev => ({ ...prev, page: pageNum }));
                        fetchAccounts(pageNum);
                      }}
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
                      onClick={() => {
                        setPagination(prev => ({ ...prev, page: pagination.totalPages }));
                        fetchAccounts(pagination.totalPages);
                      }}
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
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  fetchAccounts(pagination.page + 1);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Support Account</DialogTitle>
            <DialogDescription>
              Update details for {selectedAccount?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <SupportAccountForm
              initialData={selectedAccount}
              onSubmit={async (data) => {
                const result = await handleUpdateAccount(selectedAccount.id, data);
                if (result.success) {
                  setShowEditDialog(false);
                  setSelectedAccount(null);
                }
                return result;
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedAccount(null);
              }}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedAccount?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetPasswordDialog(false);
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isResetting || !newPassword || !confirmPassword}
            >
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}