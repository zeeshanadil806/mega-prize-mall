'use client';

import { Button } from '@/components/ui/button';
import { Printer, FileText } from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  quantity: number;
  price: number;
  bargainCouponId?: string;
  discountAmount: number;
  finalPrice: number;
}

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  pointsRedeemed: number;
  pointsValue: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  couponCodes: string[];
  bargainCouponIds: string[];
  globalCouponCode?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  status: string;
  pointsEarned: number;
  pointsRedeemTransactionId?: string;
  luckyDrawEntries: number;
  luckyDrawEntryIds: string[];
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  cancelledAt?: string;
}

interface AdminInvoiceGeneratorProps {
  order: Order & { user?: UserInfo };
}

export default function AdminInvoiceGeneratorComponent({ order }: AdminInvoiceGeneratorProps) {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNum = typeof order._id === 'string'
    ? order._id.slice(-8).toUpperCase()
    : String(order._id).slice(-8).toUpperCase();

  return (
    <div className="flex gap-2">
      <Button
        asChild
        variant="default"
        size="sm"
        className="bg-primary hover:bg-primary/90"
      >
        <a
          href={`/api/orders/${order._id}/invoice`}
          target="_blank"
          rel="noopener noreferrer"
          download={`Invoice_${invoiceNum}.pdf`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Download Invoice
        </a>
      </Button>

      <Button
        onClick={handlePrint}
        variant="outline"
        size="sm"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
    </div>
  );
}

export { AdminInvoiceGeneratorComponent as AdminInvoiceGenerator };