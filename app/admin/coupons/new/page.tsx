// app/admin/coupons/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Tag, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import CouponForm, { type SubmitData } from '@/components/admin/coupons/CouponForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: SubmitData) => {
    try {
      setLoading(true);
      
      // First generate a code
      const codeResponse = await fetch('/api/admin/coupons/generate-code');
      const codeData = await codeResponse.json();
      
      if (!codeData.success) {
        throw new Error('Failed to generate coupon code');
      }
      
      // Create coupon with generated code
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: codeData.code,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }
      
      toast.success('Coupon created successfully!', {
        description: `Code: ${data.data.code}`,
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        action: {
          label: 'View',
          onClick: () => router.push(`/admin/coupons/${data.data.code}`),
        },
      });
      
      router.push('/admin/coupons');
      
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create coupon'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/coupons');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/coupons">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">
              Create New Coupon
            </h1>
            <p className="text-muted-foreground">
              Create a new discount coupon for your store
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-[#A43875]" />
          <span className="text-sm text-gray-600">New Coupon</span>
        </div>
      </div>

      {/* Help Card */}
      <Card className="border border-[#EAB75F]/30 bg-linear-to-r from-[#EAB75F]/5 to-[#A43875]/5">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-medium text-[#EAB75F] flex items-center gap-2">
              <Info className="h-4 w-4" />
              Tips for creating effective coupons
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
              <li>Set clear validity periods to create urgency</li>
              <li>Use minimum order amounts to increase average order value</li>
              <li>Limit usage to prevent abuse</li>
              <li>Test coupons before launching site-wide</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <CouponForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}

// Info icon component
function Info({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}