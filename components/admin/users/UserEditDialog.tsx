'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Gift, Users } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  phone?: string;
  totalReferrals: number;
  createdAt: string;
  updatedAt: string;
}

interface UserEditDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, updates: { role?: string; name?: string; phone?: string }) => Promise<void>;
}

export default function UserEditDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: UserEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: user?.role || 'customer',
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Update form when user changes
  useState(() => {
    if (user) {
      setFormData({
        role: user.role,
        name: user.name,
        phone: user.phone || '',
      });
    }
  });

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Define the structure for the updates object
interface UserUpdates {
  name?: string;
  phone?: string;
  role?: string;
}
      const updates: UserUpdates = {};
      if (formData.role !== user.role) updates.role = formData.role;
      if (formData.name !== user.name) updates.name = formData.name;
      if (formData.phone !== user.phone) updates.phone = formData.phone;

      if (Object.keys(updates).length > 0) {
        await onSave(user._id, updates);
        toast.success('User updated successfully');
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'support': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info Card */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-linear-to-br from-[#EAB75F] to-[#A43875] flex items-center justify-center text-white font-bold text-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-3 w-3 mr-1" />
                  {user.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center text-gray-500">
                  <Gift className="h-3 w-3 mr-1" />
                  <span>Points Balance</span>
                </div>
                <div className="font-semibold text-gray-900">
                  {user.points} points
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-gray-500">
                  <Users className="h-3 w-3 mr-1" />
                  <span>Referrals</span>
                </div>
                <div className="font-semibold text-gray-900">
                  {user.totalReferrals} users
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Joined</span>
                </div>
                <div className="font-semibold text-gray-900">
                  {formatDate(user.createdAt)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">Current Role</div>
                <Badge className={`${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter user's full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 3XX XXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'customer' | 'admin' | 'support') => 
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Customer</span>
                      <span className="ml-2 text-xs text-gray-500">Can shop & bargain</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="support">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Support</span>
                      <span className="ml-2 text-xs text-gray-500">Can manage tickets</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Admin</span>
                      <span className="ml-2 text-xs text-gray-500">Full system access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-gray-500 mt-1">
                <div className="font-medium mb-1">Role Permissions:</div>
                <ul className="space-y-1">
                  {formData.role === 'customer' && (
                    <>
                      <li>• Shop products and place orders</li>
                      <li>• Use bargain system and earn points</li>
                      <li>• Participate in lucky draws</li>
                      <li>• Manage own account and orders</li>
                    </>
                  )}
                  {formData.role === 'support' && (
                    <>
                      <li>• All customer permissions</li>
                      <li>• View and manage support tickets</li>
                      <li>• Assist customers with issues</li>
                      <li>• Cannot manage users or settings</li>
                    </>
                  )}
                  {formData.role === 'admin' && (
                    <>
                      <li>• All support permissions</li>
                      <li>• Manage products, orders, lucky draws</li>
                      <li>• Manage users and their points</li>
                      <li>• Access to all settings and reports</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#7C2C78] hover:bg-[#6A2566]"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}