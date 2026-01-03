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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
//   User, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  points: number;
}

interface ManagePointsDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPointsUpdate: (userId: string, action: 'add' | 'deduct' | 'set', points: number, reason: string) => Promise<void>;
}

export default function ManagePointsDialog({
  user,
  open,
  onOpenChange,
  onPointsUpdate,
}: ManagePointsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    action: 'add' as 'add' | 'deduct' | 'set',
    points: '',
    reason: '',
  });

  const [preview, setPreview] = useState({
    newBalance: user?.points || 0,
    pointsChange: 0,
  });

  // Update preview when form changes
  const updatePreview = (action: string, pointsValue: string) => {
    if (!user) return;
    
    const points = parseInt(pointsValue) || 0;
    let newBalance = user.points;
    let pointsChange = 0;

    switch (action) {
      case 'add':
        newBalance = user.points + points;
        pointsChange = points;
        break;
      case 'deduct':
        newBalance = Math.max(0, user.points - points);
        pointsChange = -points;
        break;
      case 'set':
        newBalance = Math.max(0, points);
        pointsChange = points - user.points;
        break;
    }

    setPreview({
      newBalance,
      pointsChange,
    });
  };

  const handleActionChange = (value: string) => {
    const action = value as 'add' | 'deduct' | 'set';
    setFormData({ ...formData, action });
    updatePreview(action, formData.points);
  };

  const handlePointsChange = (value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/\D/g, '');
    setFormData({ ...formData, points: numericValue });
    updatePreview(formData.action, numericValue);
  };

  const handleSubmit = async () => {
    if (!user) return;

    const points = parseInt(formData.points);
    if (!points || points <= 0) {
      toast.error('Please enter a valid points amount');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for this points adjustment');
      return;
    }

    if (formData.action === 'deduct' && points > user.points) {
      toast.error('Cannot deduct more points than user has');
      return;
    }

    try {
      setLoading(true);
      await onPointsUpdate(user._id, formData.action, points, formData.reason);
      
      toast.success(
        formData.action === 'add' ? 'Points added successfully!' :
        formData.action === 'deduct' ? 'Points deducted successfully!' :
        'Points set successfully!'
      );
      
      onOpenChange(false);
      // Reset form
      setFormData({
        action: 'add',
        points: '',
        reason: '',
      });
    } catch (error) {
      toast.error('Failed to update points');
      console.error('Error updating points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'add':
        return {
          title: 'Add Points',
          description: 'Reward user with additional points',
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'deduct':
        return {
          title: 'Deduct Points',
          description: 'Remove points from user account',
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
      case 'set':
        return {
          title: 'Set Points',
          description: 'Set user points to specific amount',
          icon: DollarSign,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      default:
        return {
          title: 'Manage Points',
          description: 'Adjust user points balance',
          icon: Gift,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const actionConfig = getActionConfig(formData.action);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${actionConfig.bgColor}`}>
              <actionConfig.icon className={`h-6 w-6 ${actionConfig.color}`} />
            </div>
            <div>
              <DialogTitle>{actionConfig.title}</DialogTitle>
              <DialogDescription>
                {actionConfig.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#EAB75F] to-[#A43875] flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="font-semibold">{user.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-3 w-3 mr-1" />
                  {user.email}
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Current Points</div>
                <div className="flex items-center">
                  <Gift className="h-4 w-4 mr-2 text-[#EAB75F]" />
                  <span className="text-lg font-bold text-gray-900">{user.points}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    (Rs {(user.points * 0.1).toFixed(2)})
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">User Role</div>
                <Badge className={
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'support' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={formData.action} onValueChange={handleActionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    <span>Add Points</span>
                    <span className="ml-2 text-xs text-green-600">Reward user</span>
                  </div>
                </SelectItem>
                <SelectItem value="deduct">
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                    <span>Deduct Points</span>
                    <span className="ml-2 text-xs text-red-600">Penalty/adjustment</span>
                  </div>
                </SelectItem>
                <SelectItem value="set">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Set Points</span>
                    <span className="ml-2 text-xs text-blue-600">Override balance</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Points Input */}
          <div className="space-y-2">
            <Label htmlFor="points">
              {formData.action === 'add' ? 'Points to Add' :
               formData.action === 'deduct' ? 'Points to Deduct' :
               'Set Points To'}
            </Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="points"
                  type="text"
                  inputMode="numeric"
                  value={formData.points}
                  onChange={(e) => handlePointsChange(e.target.value)}
                  className="pl-10"
                  placeholder="Enter points amount"
                />
              </div>
              <div className="text-sm text-gray-500 whitespace-nowrap">
                = Rs {((parseInt(formData.points) || 0) * 0.1).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why you're adjusting these points..."
              rows={3}
              className="resize-none"
            />
            <div className="text-sm text-gray-500">
              This reason will be recorded in the transaction history.
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-3">Preview Changes</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Balance:</span>
                <span className="font-semibold">{user.points} points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Points Change:</span>
                <span className={`font-semibold ${preview.pointsChange > 0 ? 'text-green-600' : preview.pointsChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {preview.pointsChange > 0 ? '+' : ''}{preview.pointsChange} points
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">New Balance:</span>
                  <div className="flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-[#7C2C78]" />
                    <span className="text-xl font-bold text-[#7C2C78]">
                      {preview.newBalance} points
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      (Rs {(preview.newBalance * 0.1).toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning for deduct */}
          {formData.action === 'deduct' && parseInt(formData.points) > 0 && (
            <div className="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Note:</strong> Deducting points cannot be undone. The user will be notified of this adjustment.
              </div>
            </div>
          )}
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
            onClick={handleSubmit}
            disabled={loading || !formData.points || !formData.reason.trim()}
            className={
              formData.action === 'add' ? 'bg-green-600 hover:bg-green-700' :
              formData.action === 'deduct' ? 'bg-red-600 hover:bg-red-700' :
              'bg-blue-600 hover:bg-blue-700'
            }
          >
            {loading ? 'Processing...' : `Confirm ${actionConfig.title}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}