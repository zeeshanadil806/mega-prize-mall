// components/admin/coupons/CouponForm.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { DefaultValues, Resolver, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Users,
  Tag,
  Package,
//   Filter,
//   Hash,
//   Clock,
  Info,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Zod schema matching our GlobalCoupon model
const couponFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  
  // Discount Configuration
  discountType: z.enum(['percentage', 'fixed', 'free_shipping']),
  discountValue: z.coerce
    .number()
    .positive('Discount value must be positive')
    .transform(val => parseFloat(val.toFixed(2))),
  maxDiscountAmount: z.coerce
    .number()
    .positive('Max discount must be positive')
    .optional()
    .transform(val => val ? parseFloat(val.toFixed(2)) : undefined),
  
  // Validity
  validFrom: z.string().min(1, 'Start date is required'),
  validUntil: z.string().min(1, 'End date is required'),
  
  // Usage Limits
  maxUses: z.coerce
    .number()
    .int('Must be a whole number')
    .positive('Must be positive')
    .optional(),
  maxUsesPerUser: z.coerce
    .number()
    .int('Must be a whole number')
    .positive('Must be positive')
    .default(1),
  minOrderAmount: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .default(0),
  
  // Applicability Rules
  applicableTo: z.enum(['all_products', 'specific_categories', 'specific_products']).default('all_products'),
  
  // User Restrictions
  userEligibility: z.enum(['all_users', 'new_users', 'specific_users']).default('all_users'),
  
  // Combination Rules
  canCombineWithBargain: z.boolean().default(false),
  canCombineWithOtherGlobal: z.boolean().default(false),
  
  // First Order Special
  firstOrderOnly: z.boolean().default(false),
  
  // Free Shipping Specific
  freeShippingMaxWeight: z.coerce.number().positive().optional(),
  
  // Notes
  notes: z.string().max(1000).optional(),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;
export type SubmitData = CouponFormValues & { code: string };
interface CouponFormProps {
  initialData?: Partial<CouponFormValues> & { code?: string };
  isEditing?: boolean;
  onSubmit: (data: SubmitData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CouponForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false,
}: CouponFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(initialData?.code || '');
  const [defaultDates] = useState(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    
    return {
      validFrom: today.toISOString().split('T')[0],
      validUntil: nextMonth.toISOString().split('T')[0],
    };
  });

  const defaultValues: DefaultValues<CouponFormValues> = {
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: defaultDates.validFrom,
    validUntil: defaultDates.validUntil,
    maxUsesPerUser: 1,
    minOrderAmount: 0,
    applicableTo: 'all_products',
    userEligibility: 'all_users',
    canCombineWithBargain: false,
    canCombineWithOtherGlobal: false,
    firstOrderOnly: false,
    ...initialData,
  };
console.log(initialData)
  const form = useForm<CouponFormValues>({
    // We cast resolver to 'any' because z.coerce types conflict with strict form types
    // This is a standard workaround for Zod coercion in React Hook Form
resolver: zodResolver(couponFormSchema) as Resolver<CouponFormValues>,
    defaultValues,
  });

  const watchDiscountType = useWatch({ control: form.control, name: 'discountType' });
const watchApplicableTo = useWatch({ control: form.control, name: 'applicableTo' });
const watchUserEligibility = useWatch({ control: form.control, name: 'userEligibility' });
//   const watchFirstOrderOnly = form.watch('firstOrderOnly');

  // Generate coupon code
  const generateCode = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/coupons/generate-code');
      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
        toast.success('New code generated');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      // Fallback client-side generation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedCode(code);
    }
  }, []);
  useEffect(() => {
    if (!isEditing && !generatedCode) {
      generateCode();
    }
    // We intentionally disable the dependency warning for 'generatedCode'
    // because we only want to check this on mount/init, not re-run when state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, generateCode]);
  console.log("generateCoded>>>",generatedCode)

  const handleSubmit: SubmitHandler<CouponFormValues> = async (data) => {
    try {
      if (!generatedCode) {
        toast.error("Please generate a coupon code first");
        return;
      }
      
      // MERGE: { ...data, code: generatedCode } fixes the missing 'code' error
      await onSubmit({ ...data, code: generatedCode }); 
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Coupon Code Display */}
        <Card className="border border-[#7C2C78]/20 glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#7C2C78]">
              <Tag className="h-5 w-5" />
              {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing && generatedCode && (
              <div className="mb-6 p-4 bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 rounded-lg border border-[#7C2C78]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Coupon Code</div>
                    <div className="text-2xl font-bold gradient-text">
                      {generatedCode}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      This code will be assigned to the coupon
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateCode}
                    className="border-[#EAB75F] text-[#EAB75F] hover:bg-[#EAB75F]/10"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card className="border border-[#2E297D]/20">
              <CardHeader>
                <CardTitle className="text-[#2E297D] flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Coupon Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Summer Sale 2024" 
                          className="border-[#7C2C78]/30 focus:border-[#7C2C78]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for internal reference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Optional description about this coupon offer..."
                          className="min-h-20 border-[#7C2C78]/30 focus:border-[#7C2C78]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Will be shown to customers when applying
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Discount Configuration Card */}
            <Card className="border border-[#A43875]/20">
              <CardHeader>
                <CardTitle className="text-[#A43875] flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Discount Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Discount Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#A43875]/30">
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage" className="focus:bg-[#A43875]/10">
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4 text-[#A43875]" />
                              Percentage Discount
                            </div>
                          </SelectItem>
                          <SelectItem value="fixed" className="focus:bg-[#7C2C78]/10">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-[#7C2C78]" />
                              Fixed Amount Discount
                            </div>
                          </SelectItem>
                          <SelectItem value="free_shipping" className="focus:bg-[#2E297D]/10">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-[#2E297D]" />
                              Free Shipping
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchDiscountType !== 'free_shipping' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            {watchDiscountType === 'percentage' ? 'Percentage' : 'Amount'} *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={watchDiscountType === 'percentage' ? "10" : "500"}
                                className="pl-10 border-[#A43875]/30 focus:border-[#A43875]"
                                {...field}
                              />
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                {watchDiscountType === 'percentage' ? '%' : 'Rs '}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchDiscountType === 'percentage' && (
                      <FormField
                        control={form.control}
                        name="maxDiscountAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Maximum Discount (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="1000"
                                  className="pl-10 border-[#A43875]/30 focus:border-[#A43875]"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  Rs 
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Caps the discount amount
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                {watchDiscountType === 'free_shipping' && (
                  <FormField
                    control={form.control}
                    name="freeShippingMaxWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Maximum Weight (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="5000"
                              className="pl-16 border-[#A43875]/30 focus:border-[#A43875]"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              <span className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                grams
                              </span>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Maximum weight for free shipping (leave empty for no limit)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Validity Card */}
            <Card className="border border-[#EAB75F]/20">
              <CardHeader>
                <CardTitle className="text-[#EAB75F] flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Validity Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Start Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="border-[#EAB75F]/30 focus:border-[#EAB75F]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">End Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="border-[#EAB75F]/30 focus:border-[#EAB75F]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options Toggle */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#7C2C78]/30 text-[#7C2C78] hover:bg-[#7C2C78]/10"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </Button>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-6">
                {/* Usage Limits Card */}
                <Card className="border border-[#7C2C78]/20">
                  <CardHeader>
                    <CardTitle className="text-[#7C2C78] flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Usage Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="maxUses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Maximum Total Uses (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 100 (leave empty for unlimited)"
                              className="border-[#7C2C78]/30 focus:border-[#7C2C78]"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Total number of times this coupon can be used
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxUsesPerUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Uses Per User</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="border-[#7C2C78]/30 focus:border-[#7C2C78]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            How many times a single user can use this coupon
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minOrderAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Minimum Order Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                className="pl-10 border-[#7C2C78]/30 focus:border-[#7C2C78]"
                                {...field}
                              />
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                Rs 
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Minimum cart value required to use this coupon
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Combination Rules Card */}
                {/* <Card className="border border-[#2E297D]/20">
                  <CardHeader>
                    <CardTitle className="text-[#2E297D] flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Combination Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="canCombineWithBargain"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-[#2E297D]/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Combine with Bargain Coupons</FormLabel>
                            <FormDescription>
                              Allow this coupon to be used with bargain coupons
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#2E297D]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="canCombineWithOtherGlobal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-[#2E297D]/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Combine with Other Global Coupons</FormLabel>
                            <FormDescription>
                              Allow stacking with other site-wide coupons
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#2E297D]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card> */}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Applicability Card */}
            <Card className="border border-[#A43875]/20">
              <CardHeader>
                <CardTitle className="text-[#A43875] flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Applicability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicableTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Applies To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#A43875]/30">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all_products">All Products</SelectItem>
                          <SelectItem value="specific_categories">Specific Categories</SelectItem>
                          <SelectItem value="specific_products">Specific Products</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchApplicableTo !== 'all_products' && (
                  <div className="p-3 bg-linear-to-r from-[#A43875]/10 to-[#7C2C78]/10 rounded-lg border border-[#A43875]/30">
                    <div className="text-sm font-medium text-[#A43875] mb-2">
                      {watchApplicableTo === 'specific_categories' 
                        ? 'Category restrictions will be configured after creation'
                        : 'Product restrictions will be configured after creation'
                      }
                    </div>
                    <div className="text-xs text-gray-600">
                      You can manage restrictions in coupon details page
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Eligibility Card */}
            <Card className="border border-[#EAB75F]/20">
              <CardHeader>
                <CardTitle className="text-[#EAB75F] flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="userEligibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Eligible Users</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#EAB75F]/30">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all_users">All Users</SelectItem>
                          <SelectItem value="new_users">New Users Only</SelectItem>
                          <SelectItem value="specific_users">Specific Users</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchUserEligibility === 'specific_users' && (
                  <div className="p-3 bg-linear-to-r from-[#EAB75F]/10 to-[#A43875]/10 rounded-lg border border-[#EAB75F]/30">
                    <div className="text-sm font-medium text-[#EAB75F] mb-2">
                      User restrictions will be configured after creation
                    </div>
                    <div className="text-xs text-gray-600">
                      You can select specific users in coupon details page
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="firstOrderOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-[#EAB75F]/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">First Order Only</FormLabel>
                        <FormDescription className="text-xs">
                          Only for customers with no previous orders
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#EAB75F]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card className="border border-[#2E297D]/20">
              <CardHeader>
                <CardTitle className="text-[#2E297D] flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Internal notes about this coupon..."
                          className="min-h-[100px] border-[#2E297D]/30 focus:border-[#2E297D]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        For internal reference only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="border border-gradient-to-r from-[#7C2C78]/30 to-[#A43875]/30 glass">
              <CardHeader>
                <CardTitle className="gradient-text">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Discount</div>
                  <div className="text-lg font-bold text-[#7C2C78]">
                    {watchDiscountType === 'percentage' 
                      ? `${form.getValues('discountValue') || 0}% OFF`
                      : watchDiscountType === 'fixed'
                      ? `${formatCurrency(form.getValues('discountValue') || 0)} OFF`
                      : 'FREE SHIPPING'
                    }
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Minimum Order</div>
                  <div className="text-lg font-medium">
                    {formatCurrency(form.getValues('minOrderAmount') || 0)}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Validity</div>
                  <div className="text-sm">
                    {new Date(form.getValues('validFrom')).toLocaleDateString()} to{' '}
                    {new Date(form.getValues('validUntil')).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="border-[#7C2C78]/30 text-[#7C2C78] hover:bg-[#7C2C78]/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Tag className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Coupon' : 'Create Coupon'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}