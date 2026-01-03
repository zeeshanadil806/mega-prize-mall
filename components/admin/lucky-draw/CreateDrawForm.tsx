'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Sparkles, Gift, Calendar, Tag, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CreateDrawFormProps {
  onSuccess: () => void;
  adminId: string;
}

export function CreateDrawForm({ onSuccess }: CreateDrawFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    drawType: 'manual' as 'instant' | 'scheduled' | 'manual',
    prizeName: '',
    prizeDescription: '',
    prizeImage: '',
    prizeValue: '',
    prizeCategory: 'other' as 'vehicle' | 'electronics' | 'cash' | 'voucher' | 'other',
    entryCriteria: {
      minOrderAmount: '3000',
      qualifyingStatus: 'delivered',
      maxEntriesPerUser: '',
    },
    drawDate: '',
    announcementDate: '',
    isFeatured: false,
    notes: '',
  });

  const handleChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          // FIX: Assert this is an object (Record<string, any>) to allow spreading
          ...(prev[parent as keyof typeof prev] as Record<string, string | number | boolean>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        prizeValue: formData.prizeValue ? parseFloat(formData.prizeValue) : undefined,
        entryCriteria: {
          ...formData.entryCriteria,
          minOrderAmount: parseFloat(formData.entryCriteria.minOrderAmount),
          maxEntriesPerUser: formData.entryCriteria.maxEntriesPerUser 
            ? parseInt(formData.entryCriteria.maxEntriesPerUser)
            : undefined,
        },
      };

      const response = await fetch('/api/admin/lucky-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create draw');
      }

      onSuccess();
      
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

      console.error('Error creating draw:', error);
      setError(errorMessage || 'Failed to create lucky draw');
    } finally {
      setIsLoading(false);
    }
  };

  const prizeCategories = [
    { value: 'vehicle', label: '🚗 Vehicle', description: 'Car, Bike, Scooter' },
    { value: 'electronics', label: '📱 Electronics', description: 'Phone, Laptop, TV' },
    { value: 'cash', label: '💰 Cash Prize', description: 'Money reward' },
    { value: 'voucher', label: '🎫 Shopping Voucher', description: 'Store credit' },
    { value: 'other', label: '🎁 Other', description: 'Miscellaneous prize' },
  ];

  const drawTypes = [
    { value: 'manual', label: 'Manual Draw', description: 'Admin announces draw manually' },
    { value: 'scheduled', label: 'Scheduled Draw', description: 'Draw happens on specific date' },
    { value: 'instant', label: 'Instant Draw', description: 'Draw happens immediately' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 overflow-y-scroll">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Draw Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Mega Car Giveaway"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drawType">Draw Type *</Label>
            <Select
              value={formData.drawType}
              onValueChange={(value: string) => handleChange('drawType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select draw type" />
              </SelectTrigger>
              <SelectContent>
                {drawTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the draw, rules, and excitement..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            required
          />
        </div>
      </div>

      <Separator />

      {/* Prize Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Prize Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prizeName">Prize Name *</Label>
            <Input
              id="prizeName"
              placeholder="e.g., Toyota Corolla 2024"
              value={formData.prizeName}
              onChange={(e) => handleChange('prizeName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prizeCategory">Prize Category *</Label>
            <Select
              value={formData.prizeCategory}
              onValueChange={(value: string) => handleChange('prizeCategory', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {prizeCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.label.split(' ')[0]}</span>
                      <span>{category.label.split(' ')[1]}</span>
                      <span className="text-xs text-muted-foreground">({category.description})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prizeDescription">Prize Description *</Label>
          <Textarea
            id="prizeDescription"
            placeholder="Describe the prize in detail..."
            value={formData.prizeDescription}
            onChange={(e) => handleChange('prizeDescription', e.target.value)}
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prizeValue">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Prize Value (Optional)
              </div>
            </Label>
            <Input
              id="prizeValue"
              type="number"
              placeholder="e.g., 2500000"
              value={formData.prizeValue}
              onChange={(e) => handleChange('prizeValue', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Approximate value in PKR</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prizeImage">Prize Image URL (Optional)</Label>
            <Input
              id="prizeImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.prizeImage}
              onChange={(e) => handleChange('prizeImage', e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Entry Criteria */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Entry Criteria</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Minimum Order Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                Rs 
              </span>
              <Input
                id="minOrderAmount"
                type="number"
                className="pl-8"
                value={formData.entryCriteria.minOrderAmount}
                onChange={(e) => handleChange('entryCriteria.minOrderAmount', e.target.value)}
                required
                min="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">Orders must be at least this amount</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifyingStatus">Qualifying Status</Label>
            <Input
              id="qualifyingStatus"
              value={formData.entryCriteria.qualifyingStatus}
              readOnly
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Only delivered orders qualify</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxEntriesPerUser">Max Entries Per User (Optional)</Label>
            <Input
              id="maxEntriesPerUser"
              type="number"
              placeholder="Unlimited"
              value={formData.entryCriteria.maxEntriesPerUser}
              onChange={(e) => handleChange('entryCriteria.maxEntriesPerUser', e.target.value)}
              min="1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Dates & Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Dates & Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="announcementDate">Announcement Date (Optional)</Label>
            <Input
              id="announcementDate"
              type="date"
              value={formData.announcementDate}
              onChange={(e) => handleChange('announcementDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drawDate">Draw Date (Optional)</Label>
            <Input
              id="drawDate"
              type="date"
              value={formData.drawDate}
              onChange={(e) => handleChange('drawDate', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="isFeatured">Featured Draw</Label>
            <p className="text-sm text-muted-foreground">
              Show this draw prominently on the website
            </p>
          </div>
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => handleChange('isFeatured', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Admin Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Internal notes about this draw..."
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Lucky Draw
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
