// src/components/admin/support/SupportAccountForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SupportAccountFormProps {
  initialData?: {
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
  };
  onSubmit: (data: SupportAccountFormData) => Promise<{ success: boolean; message: string }>;
  onCancel: () => void;
  isEditing?: boolean;
}
export interface SupportAccountFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  isActive: boolean;
}
export default function SupportAccountForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: SupportAccountFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    password: '',
    confirmPassword: '',
    isActive: initialData?.isActive !== false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Invalid email format' });
      return;
    }
    
    if (!isEditing && !formData.password) {
      setMessage({ type: 'error', text: 'Password is required for new accounts' });
      return;
    }
    
    if (!isEditing && formData.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }
    
    if (!isEditing && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    // Prepare data
    const submitData: SupportAccountFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      isActive: formData.isActive,
    };
    
    if (formData.phone.trim()) {
      submitData.phone = formData.phone.trim();
    }
    
    if (!isEditing && formData.password) {
      submitData.password = formData.password;
    }
    
    const result = await onSubmit(submitData);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      if (!isEditing) {
        // Reset form for new entries
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          isActive: true,
        });
      }
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(null); // Clear message on change
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter full name"
            className="mt-1"
            disabled={isSubmitting}
            required
          />
        </div>
        
        {/* Email */}
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
            className="mt-1"
            disabled={isSubmitting || isEditing}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {isEditing ? 'Email cannot be changed' : 'This will be the login email'}
          </p>
        </div>
        
        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter phone number (optional)"
            className="mt-1"
            disabled={isSubmitting}
          />
        </div>
        
        {/* Password Fields (only for new accounts) */}
        {!isEditing && (
          <>
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  className="pr-10"
                  disabled={isSubmitting}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  className="pr-10"
                  disabled={isSubmitting}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Active Status */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Account Status</Label>
            <p className="text-sm text-muted-foreground">
              {formData.isActive 
                ? 'Account is active and can access the system'
                : 'Account is inactive and cannot login'}
            </p>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : isEditing ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}