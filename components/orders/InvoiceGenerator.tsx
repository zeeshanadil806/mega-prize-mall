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

  return (
    <Button
      asChild
      variant="outline"
      className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
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
  );
}