'use client';

import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { ClientOrder } from '@/types';

interface InvoiceGeneratorProps {
  order: ClientOrder;
}

export function InvoiceGenerator({ order }: InvoiceGeneratorProps) {
  const invoiceNum = typeof order._id === 'string'
    ? order._id.slice(-8).toUpperCase()
    : String(order._id).slice(-8).toUpperCase();

  const isGuest = Boolean(order.isGuestOrder || !order.userId);
  const phone = order.shippingAddress?.phone;
  const guestParam = isGuest && phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const invoiceHref = `/api/orders/${order._id}/invoice${guestParam}`;

  return (
    <Button
      asChild
      variant="outline"
      className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
    >
      <a
        href={invoiceHref}
        target="_blank"
        rel="noopener noreferrer"
        download={`Invoice_${invoiceNum}.pdf`}
      >
        <FileText className="h-4 w-4 mr-2" />
        Download Invoice
      </a>
    </Button>
  );
}