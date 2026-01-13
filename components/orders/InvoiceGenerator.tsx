'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/bargain-utils';
import jsPDF from 'jspdf';
import { ClientOrder } from '@/types';


interface InvoiceGeneratorProps {
  order: ClientOrder;
}

// --- Colors ---
const COLORS = {
  primary: '#1a365d', // Deep Navy Blue
  accent: '#c2940a',  // Gold/Mustard
  text: '#2d3748',    // Dark Gray
  lightGray: '#f7fafc',
  white: '#ffffff',
  tableHeader: '#2c5282'
};

export function InvoiceGenerator({ order }: InvoiceGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // 1. Dynamic Imports
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;

      // 2. Setup Document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // --- Helper Functions ---
      const drawBox = (x: number, y: number, w: number, h: number, color: string) => {
        doc.setFillColor(color);
        doc.roundedRect(x, y, w, h, 2, 2, 'F');
      };

      const addLabelValue = (label: string, value: string, x: number, y: number) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary);
        doc.text(label, x, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.text);
        doc.text(value, x + 35, y);
      };

      // --- 1. Top Bar / Logo Section ---
      // Draw colored top bar
      doc.setFillColor(COLORS.primary);
      doc.rect(0, 0, 210, 15, 'F'); // Full width header bar
      
      // LOGO PLACEHOLDER
      // If you have a base64 logo, uncomment the line below:
    //   doc.addImage("/logo.png", 'PNG', 15, 25, 40, 40); 
      
      // Text Logo Fallback
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(COLORS.primary);
      doc.text('MEGA PRIZE MALL', 15, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(COLORS.accent);
      doc.text('SHOP & WIN BIG', 15, 40);

      // --- 2. Invoice Metadata (Right Side) ---
      const invoiceNum = typeof order._id === 'string' 
      ? order._id.slice(-8).toUpperCase() 
      : String(order._id).slice(-8).toUpperCase();

      doc.setFontSize(24);
      doc.setTextColor(COLORS.primary);
      doc.text('INVOICE', 195, 35, { align: 'right' });

      doc.setFontSize(10);
      doc.setTextColor(COLORS.text);
      doc.text(`#${invoiceNum}`, 195, 42, { align: 'right' });
      
      // Status Badge (Visual)
      const statusColor = order.paymentStatus === 'paid' ? '#48bb78' : '#ed8936';
      doc.setFillColor(statusColor);
      doc.roundedRect(175, 46, 20, 6, 1, 1, 'F');
      doc.setTextColor(COLORS.white);
      doc.setFontSize(8);
      doc.text(order.paymentStatus.toUpperCase(), 185, 50, { align: 'center' });


      // --- 3. Info Boxes (Company & Bill To) ---
      const boxY = 60;
      const boxHeight = 45;
      const col1X = 15;
      const col2X = 110;
      const boxWidth = 85;

      // Company Info (Left)
      drawBox(col1X, boxY, boxWidth, 8, COLORS.primary); // Header bg
      doc.setDrawColor(200);
      doc.roundedRect(col1X, boxY, boxWidth, boxHeight, 2, 2, 'S'); // Border

      doc.setTextColor(COLORS.white);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('FROM:', col1X + 5, boxY + 5.5);

      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Mega Prize Mall', col1X + 5, boxY + 15);
      // doc.text('123 Mall Road, Lahore', col1X + 5, boxY + 20);
      doc.text('Pakistan', col1X + 5, boxY + 25);
      doc.text('support@megaprizemall.com', col1X + 5, boxY + 30);
      doc.text('+92 325 4007037', col1X + 5, boxY + 35);

      // Bill To (Right)
      drawBox(col2X, boxY, boxWidth, 8, COLORS.accent); // Header bg
      doc.setDrawColor(200);
      doc.roundedRect(col2X, boxY, boxWidth, boxHeight, 2, 2, 'S'); // Border

      doc.setTextColor(COLORS.white);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', col2X + 5, boxY + 5.5);

      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(order.shippingAddress.fullName, col2X + 5, boxY + 15);
      doc.text(order.shippingAddress.addressLine1, col2X + 5, boxY + 20);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, col2X + 5, boxY + 25);
      doc.text(order.shippingAddress.phone, col2X + 5, boxY + 30);
      
      // Order Dates Line
      const datesY = boxY + boxHeight + 15;
      doc.setDrawColor(220);
      doc.line(15, datesY - 5, 195, datesY - 5); // Divider line

      addLabelValue('Order Date:', new Date(order.createdAt).toLocaleDateString(), 15, datesY);
      addLabelValue('Issue Date:', new Date().toLocaleDateString(), 110, datesY);


      // --- 4. Items Table ---
      const tableData = order.items.map(item => [
        item.productName.substring(0, 45) + (item.productName.length > 45 ? '...' : ''),
        item.quantity.toString(),
        formatCurrency(item.finalPrice),
        formatCurrency(item.finalPrice * item.quantity)
      ]);

      autoTable(doc, {
        startY: datesY + 10,
        head: [['DESCRIPTION', 'QTY', 'PRICE', 'AMOUNT']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.tableHeader,
          textColor: COLORS.white,
          fontStyle: 'bold',
          halign: 'left',
          minCellHeight: 10,
          valign: 'middle',
        },
        bodyStyles: {
          textColor: COLORS.text,
          minCellHeight: 10,
          valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Description
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
        alternateRowStyles: {
          fillColor: COLORS.lightGray,
        },
        margin: { left: 15, right: 15 },
      });

      // --- 5. Totals Section ---
const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      const totalsX = 130;
      const valuesX = 195;
      
      let currentY = finalY;

      const addTotalRow = (label: string, value: string, isTotal = false) => {
        doc.setFontSize(isTotal ? 12 : 10);
        doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
        doc.setTextColor(COLORS.text);
        doc.text(label, totalsX, currentY);
        doc.text(value, valuesX, currentY, { align: 'right' });
        currentY += isTotal ? 10 : 7;
      };

      addTotalRow('Subtotal:', formatCurrency(order.subtotal));
      
      if (order.discountTotal > 0) {
        doc.setTextColor(22, 163, 74); // Green
        doc.text('Discount:', totalsX, currentY);
        doc.text(`-${formatCurrency(order.discountTotal)}`, valuesX, currentY, { align: 'right' });
        doc.setTextColor(COLORS.text);
        currentY += 7;
      }

      if (order.pointsValue > 0) {
        doc.setTextColor(22, 163, 74);
        doc.text('Points Used:', totalsX, currentY);
        doc.text(`-${formatCurrency(order.pointsValue)}`, valuesX, currentY, { align: 'right' });
        doc.setTextColor(COLORS.text);
        currentY += 7;
      }

      addTotalRow('Shipping:', order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee));

      // Grand Total Box
      currentY += 5;
      doc.setFillColor(COLORS.accent); // Gold bg
      doc.roundedRect(totalsX - 5, currentY - 7, 75, 12, 1, 1, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.white);
      doc.text('GRAND TOTAL', totalsX, currentY + 1);
      doc.text(formatCurrency(order.grandTotal), valuesX, currentY + 1, { align: 'right' });


      // --- 6. Footer ---
      const pageHeight = doc.internal.pageSize.height;
      
      // Bottom Bar
      doc.setFillColor(COLORS.primary);
      doc.rect(0, pageHeight - 15, 210, 15, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(COLORS.white);
      doc.text('Thank you for shopping with Mega Prize Mall!', 105, pageHeight - 9, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(200); // Light gray
      doc.text('www.megaprizemall.com', 105, pageHeight - 5, { align: 'center' });

      // Save
      doc.save(`Invoice_${invoiceNum}.pdf`);

    } catch (error) {
      console.error('Invoice Error:', error);
      setError('Could not generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={generateInvoice}
        disabled={isGenerating}
        variant="outline"
        className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 mr-2" />
        )}
        {isGenerating ? 'Generating...' : 'Download Invoice'}
      </Button>
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}