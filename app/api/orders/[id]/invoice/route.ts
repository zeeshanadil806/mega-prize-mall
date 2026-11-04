import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { UserModel } from "@/models/User";
import { notFound } from "@/shared/http";
import { formatCurrency } from "@/shared/format";
import { Types } from "mongoose";
import { log } from "@/lib/logger";

interface InvoiceAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
  discountAmount: number;
  finalPrice: number;
}

interface InvoiceOrder {
  _id: Types.ObjectId | string;
  userId: string;
  createdAt: Date | string;
  shippingAddress: InvoiceAddress;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  pointsRedeemed: number;
  pointsValue: number;
  shippingFee: number;
  taxAmount?: number;
  grandTotal: number;
  pointsEarned: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod: string;
  status: string;
  transactionId?: string;
  paidAt?: Date | string;
  estimatedDelivery?: Date | string;
  deliveredAt?: Date | string;
  isGuestOrder?: boolean;
  guestEmail?: string;
}

// Dynamic import helper
async function getJsPDF() {
  const { jsPDF } = await import("jspdf");
  return { jsPDF };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Fetch Order
    const order = (await OrderModel.findById(id).lean()) as unknown as (InvoiceOrder & {
      guestSessionId?: string;
      guestPhone?: string;
    }) | null;

    if (!order) {
      return notFound("Order not found");
    }

    // Check permissions (Admin, Registered Customer, or Verified Guest)
    const session = await auth();
    let isAllowed = false;

    if (session?.user?.id) {
      const user = await UserModel.findById(session.user.id);
      const isAdmin = user?.role === "admin";

      if (isAdmin || (order.userId && order.userId === session.user.id)) {
        isAllowed = true;
      } else if (
        order.isGuestOrder &&
        (session.user.id === order.guestSessionId ||
          session.user.id === order.guestPhone)
      ) {
        isAllowed = true;
      }
    }

    if (!isAllowed && order.isGuestOrder) {
      const searchParams = request.nextUrl.searchParams;
      const phoneVerify = searchParams.get("phone")?.trim();
      const guestSessionVerify = searchParams.get("guestSessionId")?.trim();

      if (
        (phoneVerify &&
          (phoneVerify === order.shippingAddress?.phone ||
            phoneVerify === order.guestPhone)) ||
        (guestSessionVerify &&
          guestSessionVerify === order.guestSessionId)
      ) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderIdString = order._id.toString();

    // Fetch User details for email if registered and not guest
    let customerEmail = "";
    if (order.isGuestOrder && order.guestEmail) {
      customerEmail = order.guestEmail;
    } else {
      const customer = await UserModel.findById(order.userId).lean();
      if (customer && customer.email) {
        customerEmail = customer.email;
      }
    }

    // Import jsPDF
    const { jsPDF } = await getJsPDF();

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Brand Colors for professional invoice design
    const primaryColor = [1, 27, 84]; // Brand Navy #011b54
    const secondaryColor = [2, 43, 130]; // Brand Navy Accent #022b82
    const accentColor = [46, 204, 113]; // Green
    const darkColor = [44, 62, 80]; // Dark
    const lightColor = [236, 240, 241]; // Light Gray

    // Helper function to add text
    const addText = (text: string, x: number, y: number, options?: Parameters<typeof doc.text>[3]) => {
      doc.text(text, x, y, options);
    };

    // Helper function to draw line
    const drawLine = (x1: number, y1: number, x2: number, y2: number, width = 0.5, color = darkColor) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(width);
      doc.line(x1, y1, x2, y2);
    };

    // Set font
    doc.setFont("helvetica");

    // ============ HEADER SECTION ============
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 30, "F");

    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    addText("MEGA PRIZE MALL", 20, 20);

    // Tagline
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    addText("Your Luck, Your Price, Your Mall", 20, 26);

    // Invoice Title (right)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    addText("INVOICE", 150, 20);

    // Invoice Number
    doc.setFontSize(12);
    addText(`#${orderIdString.slice(-8).toUpperCase()}`, 150, 26);

    // ============ COMPANY DETAILS ============
    const companyDetailsY = 40;

    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.roundedRect(15, companyDetailsY, 85, 40, 2, 2, "F");

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    addText("MEGA PRIZE MALL", 20, companyDetailsY + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    addText("Lahore, Punjab", 20, companyDetailsY + 19);
    addText("Pakistan", 20, companyDetailsY + 24);
    addText("Phone: +92 325 4007037", 20, companyDetailsY + 30);
    addText("Email: support@megaprizemall.com", 20, companyDetailsY + 35);

    // ============ INVOICE METADATA ============
    const metaY = companyDetailsY;

    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.roundedRect(110, metaY, 85, 40, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    addText("INVOICE DETAILS", 115, metaY + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    addText(`Invoice #: ${orderIdString.slice(-8).toUpperCase()}`, 115, metaY + 15);
    addText(`Date: ${new Date(order.createdAt).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`, 115, metaY + 20);
    addText(`Status: ${order.status.toUpperCase()}`, 115, metaY + 25);
    addText(`Payment: ${order.paymentMethod.toUpperCase()}`, 115, metaY + 30);

    // ============ BILL TO SECTION ============
    const billToY = 90;

    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(15, billToY, 180, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    addText("BILL TO", 20, billToY + 6);

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    addText(order.shippingAddress.fullName, 20, billToY + 16);
    addText(order.shippingAddress.addressLine1, 20, billToY + 22);

    let addressY = billToY + 28;
    if (order.shippingAddress.addressLine2) {
      addText(order.shippingAddress.addressLine2, 20, addressY);
      addressY += 6;
    }

    addText(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`, 20, addressY);
    addText(order.shippingAddress.country || "Pakistan", 20, addressY + 6);
    addText(`Phone: ${order.shippingAddress.phone}`, 20, addressY + 12);

    if (customerEmail) {
      addText(`Email: ${customerEmail}`, 20, addressY + 18);
    }

    // ============ ORDER ITEMS TABLE ============
    const tableStartY = addressY + 26;

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, tableStartY, 180, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    const colPositions = [20, 105, 125, 150, 175];

    addText("PRODUCT", colPositions[0], tableStartY + 7);
    addText("QTY", colPositions[1], tableStartY + 7);
    addText("PRICE", colPositions[2], tableStartY + 7);
    addText("DISCOUNT", colPositions[3], tableStartY + 7);
    addText("TOTAL", colPositions[4], tableStartY + 7);

    // Table rows
    let currentY = tableStartY + 10;
    let rowIndex = 0;

    order.items.forEach((item) => {
      if (rowIndex % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(15, currentY, 180, 10, "F");
      }

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const productName =
        item.productName.length > 35
          ? item.productName.substring(0, 32) + "..."
          : item.productName;

      addText(productName, colPositions[0], currentY + 7);
      addText(item.quantity.toString(), colPositions[1], currentY + 7);
      addText(formatCurrency(item.price), colPositions[2], currentY + 7);

      if (item.discountAmount > 0) {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        addText(`-${formatCurrency(item.discountAmount)}`, colPositions[3], currentY + 7);
      } else {
        addText("-", colPositions[3], currentY + 7);
      }

      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      addText(formatCurrency(item.finalPrice * item.quantity), colPositions[4], currentY + 7);

      currentY += 10;
      rowIndex++;
    });

    // ============ SUMMARY SECTION ============
    const summaryY = currentY + 10;

    // Summary box
    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.roundedRect(100, summaryY, 95, 75, 3, 3, "F");

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    addText("ORDER SUMMARY", 105, summaryY + 8);

    drawLine(105, summaryY + 10, 190, summaryY + 10, 0.3, primaryColor);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let summaryCurrentY = summaryY + 18;

    // Subtotal
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    addText("Subtotal:", 105, summaryCurrentY);
    addText(formatCurrency(order.subtotal), 175, summaryCurrentY, { align: "right" });
    summaryCurrentY += 7;

    // Discounts
    if (order.discountTotal > 0) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      addText("Discounts:", 105, summaryCurrentY);
      addText(`-${formatCurrency(order.discountTotal)}`, 175, summaryCurrentY, { align: "right" });
      summaryCurrentY += 7;
    }

    // Points Redeemed
    if (order.pointsValue > 0) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      addText("Points Redeemed:", 105, summaryCurrentY);
      addText(`-${formatCurrency(order.pointsValue)}`, 175, summaryCurrentY, { align: "right" });
      summaryCurrentY += 7;
    }

    // Shipping
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    addText("Shipping:", 105, summaryCurrentY);
    addText(order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee), 175, summaryCurrentY, { align: "right" });
    summaryCurrentY += 7;

    // Tax
    if (order.taxAmount && order.taxAmount > 0) {
      addText("Tax:", 105, summaryCurrentY);
      addText(formatCurrency(order.taxAmount), 175, summaryCurrentY, { align: "right" });
      summaryCurrentY += 7;
    }

    // Total line
    drawLine(105, summaryCurrentY, 190, summaryCurrentY, 0.5, darkColor);
    summaryCurrentY += 8;

    // Grand Total
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    addText("GRAND TOTAL", 105, summaryCurrentY);
    addText(formatCurrency(order.grandTotal), 175, summaryCurrentY, { align: "right" });
    summaryCurrentY += 9;

    // Points Earned
    if (order.pointsEarned > 0) {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      addText(`Earned ${order.pointsEarned} points (${formatCurrency(order.pointsEarned * 0.1)})`, 105, summaryCurrentY);
    }

    // ============ PAYMENT & SHIPPING INFO ============
    const infoY = summaryY + 80;

    // Payment Info Box
    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.roundedRect(15, infoY, 85, 35, 2, 2, "F");

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    addText("PAYMENT INFORMATION", 20, infoY + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
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
    doc.roundedRect(110, infoY, 85, 35, 2, 2, "F");

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    addText("SHIPPING INFORMATION", 115, infoY + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
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
    const footerY = 265;

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    addText("Thank you for shopping with Mega Prize Mall!", 105, footerY, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    addText("For any queries, contact us at: support@megaprizemall.com | +92 325 4007037", 105, footerY + 6, { align: "center" });
    addText("Terms & Conditions apply. Points expire 90 days from earning.", 105, footerY + 12, { align: "center" });
    addText(`Page 1 of 1 | Generated on ${new Date().toLocaleDateString()}`, 105, footerY + 18, { align: "center" });

    // Return PDF Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${orderIdString.slice(-8)}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    log.error("Error generating invoice", { error: error as Error });
    const errorMessage = error instanceof Error ? error.message : "Failed to generate invoice";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
