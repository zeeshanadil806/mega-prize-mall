'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, FileText } from 'lucide-react';
import { formatCurrency } from '@/shared/format';
import jsPDF, { TextOptionsLight } from 'jspdf';
import { UserOptions } from 'jspdf-autotable';

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

export function AdminInvoiceGenerator({ order }: AdminInvoiceGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Dynamic import to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;

      // Create PDF with professional design
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
}
      // Initialize autoTable
(doc as JsPDFWithAutoTable).autoTable = (options: UserOptions) => {
        autoTable(doc, options);
      };      // Colors for professional design
      const primaryColor = [41, 128, 185]; // Blue
      const secondaryColor = [52, 152, 219]; // Light Blue
      const accentColor = [46, 204, 113]; // Green
      const darkColor = [44, 62, 80]; // Dark
      const lightColor = [236, 240, 241]; // Light Gray

      // Helper function to add text with styling
      const addText = (text: string, x: number, y: number, options: TextOptionsLight = {}) => {
        doc.text(text, x, y, options);
      };

      // Helper function to draw line
      const drawLine = (x1: number, y1: number, x2: number, y2: number, width = 0.5, color = darkColor) => {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(width);
        doc.line(x1, y1, x2, y2);
      };

      // Set fonts
      doc.setFont('helvetica');
      
      // ============ HEADER SECTION ============
      // Company Logo Area (left)
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 30, 'F');
      
      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      addText('MEGA PRIZE MALL', 20, 20);
      
      // Tagline
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      addText('Your Luck, Your Price, Your Mall', 20, 26);
      
      // Invoice Title (right)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      addText('INVOICE', 150, 20);
      
      // Invoice Number
      doc.setFontSize(12);
      addText(`#${order._id.slice(-8).toUpperCase()}`, 150, 26);

      // ============ COMPANY DETAILS ============
      const companyDetailsY = 40;
      
      // Company Info Box
      doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
      doc.roundedRect(15, companyDetailsY, 85, 40, 2, 2, 'F');
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      addText('MEGA PRIZE MALL', 20, companyDetailsY + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      // addText('123 Mall Road, Gulberg', 20, companyDetailsY + 14);
      addText('Lahore, Punjab', 20, companyDetailsY + 19);
      addText('Pakistan', 20, companyDetailsY + 24);
      
      addText('📞 +92 325 4007037', 20, companyDetailsY + 30);
      addText('🌐 www.megaprizemall.com', 20, companyDetailsY + 35);
      addText('✉️ support@megaprizemall.com', 20, companyDetailsY + 40);

      // ============ INVOICE METADATA ============
      const metaY = companyDetailsY;
      
      doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
      doc.roundedRect(110, metaY, 85, 40, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      addText('INVOICE DETAILS', 115, metaY + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      addText(`Invoice #: ${order._id.slice(-8).toUpperCase()}`, 115, metaY + 15);
      addText(`Date: ${new Date(order.createdAt).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 115, metaY + 20);
      addText(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-PK')}`, 115, metaY + 25);
      addText(`Status: ${order.status.toUpperCase()}`, 115, metaY + 30);
      addText(`Payment: ${order.paymentMethod.toUpperCase()}`, 115, metaY + 35);

      // ============ BILL TO SECTION ============
      const billToY = 90;
      
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(15, billToY, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      addText('BILL TO', 20, billToY + 6);
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      addText(order.shippingAddress.fullName, 20, billToY + 16);
      addText(order.shippingAddress.addressLine1, 20, billToY + 22);
      
      let addressY = billToY + 28;
      if (order.shippingAddress.addressLine2) {
        addText(order.shippingAddress.addressLine2, 20, addressY);
        addressY += 6;
      }
      
      addText(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`, 20, addressY);
      addText(order.shippingAddress.country, 20, addressY + 6);
      addText(`📞 ${order.shippingAddress.phone}`, 20, addressY + 12);
      
      if (order.user?.email) {
        addText(`✉️ ${order.user.email}`, 20, addressY + 18);
      }

      // ============ ORDER ITEMS TABLE ============
      const tableStartY = addressY + 30;
      
      // Table header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, tableStartY, 180, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
    //   const colWidths = [85, 20, 25, 25, 25];
      const colPositions = [20, 105, 125, 150, 175];
      
      addText('PRODUCT', colPositions[0], tableStartY + 7);
      addText('QTY', colPositions[1], tableStartY + 7);
      addText('PRICE', colPositions[2], tableStartY + 7);
      addText('DISCOUNT', colPositions[3], tableStartY + 7);
      addText('TOTAL', colPositions[4], tableStartY + 7);

      // Table rows
      let currentY = tableStartY + 10;
      let rowIndex = 0;
      
      order.items.forEach((item) => {
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(15, currentY, 180, 10, 'F');
        }
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Product name (truncate if too long)
        const productName = item.productName.length > 35 
          ? item.productName.substring(0, 32) + '...' 
          : item.productName;
        
        addText(productName, colPositions[0], currentY + 7);
        addText(item.quantity.toString(), colPositions[1], currentY + 7);
        addText(formatCurrency(item.price), colPositions[2], currentY + 7);
        
        // Discount if any
        if (item.discountAmount > 0) {
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          addText(`-${formatCurrency(item.discountAmount)}`, colPositions[3], currentY + 7);
        } else {
          addText('-', colPositions[3], currentY + 7);
        }
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        addText(formatCurrency(item.finalPrice * item.quantity), colPositions[4], currentY + 7);
        
        currentY += 10;
        rowIndex++;
      });

      // ============ SUMMARY SECTION ============
      const summaryY = currentY + 15;
      
      // Summary box
      doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
      doc.roundedRect(100, summaryY, 95, 80, 3, 3, 'F');
      
      // Summary title
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      addText('ORDER SUMMARY', 105, summaryY + 8);
      
      drawLine(105, summaryY + 10, 190, summaryY + 10, 0.3, primaryColor);
      
      // Summary items
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let summaryCurrentY = summaryY + 20;
      
      // Subtotal
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      addText('Subtotal:', 105, summaryCurrentY);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      addText(formatCurrency(order.subtotal), 175, summaryCurrentY, { align: 'right' });
      summaryCurrentY += 8;
      
      // Discounts
      if (order.discountTotal > 0) {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        addText('Discounts:', 105, summaryCurrentY);
        addText(`-${formatCurrency(order.discountTotal)}`, 175, summaryCurrentY, { align: 'right' });
        summaryCurrentY += 8;
      }
      
      // Points Redeemed
      if (order.pointsValue > 0) {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        addText('Points Redeemed:', 105, summaryCurrentY);
        addText(`-${formatCurrency(order.pointsValue)}`, 175, summaryCurrentY, { align: 'right' });
        summaryCurrentY += 8;
      }
      
      // Shipping
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      addText('Shipping:', 105, summaryCurrentY);
      addText(order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee), 175, summaryCurrentY, { align: 'right' });
      summaryCurrentY += 8;
      
      // Tax
      if (order.taxAmount > 0) {
        addText('Tax:', 105, summaryCurrentY);
        addText(formatCurrency(order.taxAmount), 175, summaryCurrentY, { align: 'right' });
        summaryCurrentY += 8;
      }
      
      // Total line
      drawLine(105, summaryCurrentY, 190, summaryCurrentY, 0.5, darkColor);
      summaryCurrentY += 8;
      
      // Grand Total
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      addText('GRAND TOTAL', 105, summaryCurrentY);
      addText(formatCurrency(order.grandTotal), 175, summaryCurrentY, { align: 'right' });
      summaryCurrentY += 10;
      
      // Points Earned (if any)
      if (order.pointsEarned > 0) {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        addText(`🎉 Earned ${order.pointsEarned} points (${formatCurrency(order.pointsEarned * 0.1)})`, 
          105, summaryCurrentY);
      }

      // ============ PAYMENT & SHIPPING INFO ============
      const infoY = summaryY + 90;
      
      // Payment Info Box
      doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
      doc.roundedRect(15, infoY, 85, 35, 2, 2, 'F');
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      addText('PAYMENT INFORMATION', 20, infoY + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      addText(`Method: ${order.paymentMethod.toUpperCase()}`, 20, infoY + 16);
      addText(`Status: ${order.paymentStatus.toUpperCase()}`, 20, infoY + 22);
      
      if (order.transactionId) {
        addText(`TXN: ${order.transactionId.slice(-12)}`, 20, infoY + 28);
      }
      
      if (order.paidAt) {
        addText(`Paid: ${new Date(order.paidAt).toLocaleDateString()}`, 20, infoY + 34);
      }

      // Shipping Info Box
      doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
      doc.roundedRect(110, infoY, 85, 35, 2, 2, 'F');
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      addText('SHIPPING INFORMATION', 115, infoY + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      addText(`Method: ${order.shippingMethod.toUpperCase()}`, 115, infoY + 16);
      
      if (order.estimatedDelivery) {
        addText(`Est. Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}`, 115, infoY + 22);
      }
      
      if (order.deliveredAt) {
        addText(`Delivered: ${new Date(order.deliveredAt).toLocaleDateString()}`, 115, infoY + 28);
      }
      
      addText(`Status: ${order.status.toUpperCase()}`, 115, infoY + 34);

      // ============ FOOTER SECTION ============
      const footerY = 260;
      
      // Thank you message
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      addText('Thank you for shopping with Mega Prize Mall!', 105, footerY, { align: 'center' });
      
      // Contact info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      addText('For any queries, contact us at: support@megaprizemall.com | +92 325 4007037', 
        105, footerY + 8, { align: 'center' });
      
      addText('Terms & Conditions apply. Points expire 90 days from earning.', 
        105, footerY + 16, { align: 'center' });
      
      // Page number
      addText(`Page 1 of 1 | Generated on ${new Date().toLocaleDateString()}`, 
        105, footerY + 24, { align: 'center' });

      // ============ SAVE PDF ============
      const fileName = `Invoice-${order._id.slice(-8)}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating invoice:', error);
      setError('Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={generateInvoice}
          disabled={isGenerating}
          variant="default"
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Download Invoice
            </>
          )}
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
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {/* <div className="text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          Professional invoice with company branding
        </p>
        <p className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          Includes all order details & payment info
        </p>
        <p className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          Generated instantly on your device
        </p>
      </div> */}
    </div>
  );
}