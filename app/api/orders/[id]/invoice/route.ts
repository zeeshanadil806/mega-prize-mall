import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { auth } from "@/auth";
import { formatCurrency } from "@/lib/bargain-utils";
import { Types } from "mongoose";

// --- Types based on your DB Dump ---
interface InvoiceItem {
  productName: string;
  quantity: number;
  finalPrice: number;
}

interface InvoiceAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

// Minimal interface for the Order data we need
interface InvoiceOrder {
  _id: Types.ObjectId | string; // Can be object or string depending on lean()
  userId: string;
  createdAt: Date | string;
  shippingAddress: InvoiceAddress;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  pointsValue: number;
  shippingFee: number;
  grandTotal: number;
  pointsEarned: number;
  paymentMethod: string;
  status: string;
  estimatedDelivery?: Date | string;
}

// Dynamic import helper
async function getJsPDF() {
  const { jsPDF } = await import("jspdf");
  return { jsPDF };
}

interface InvoiceQuery {
  _id: string;
  userId?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Check permissions
    const UserModel = (await import("@/models/User")).UserModel;
    const user = await UserModel.findById(session.user.id);
    const isAdmin = user?.role === "admin";

    const query: InvoiceQuery = { _id: id };
    if (!isAdmin) {
      query.userId = session.user.id;
    }

    // Fetch Order
    const order = (await OrderModel.findOne(
      query
    ).lean()) as unknown as InvoiceOrder;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // FIX: Safely convert ObjectId to string
    const orderIdString = order._id.toString();

    // Import jsPDF
    const { jsPDF } = await getJsPDF();

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set font
    doc.setFont("helvetica");
    doc.setFontSize(20);

    // Header
    doc.text("MEGA PRIZE MALL", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text("INVOICE", 105, 30, { align: "center" });

    doc.setFontSize(10);
    // FIX: Use the string variable here
    doc.text(`Invoice #: ${orderIdString.slice(-8).toUpperCase()}`, 150, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      150,
      50
    );

    // Company Info (Left)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Mega Prize Mall", 20, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    // doc.text("123 Mall Road, Lahore", 20, 45);
    doc.text("Pakistan", 20, 50);
    doc.text("Phone: +92 325 4007037", 20, 55);
    doc.text("Email: support@megaprizemall.com", 20, 60);

    // Customer Info (Right)
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(order.shippingAddress.fullName, 20, 75);
    doc.text(order.shippingAddress.addressLine1, 20, 80);

    let yPos = 85;
    if (order.shippingAddress.addressLine2) {
      doc.text(order.shippingAddress.addressLine2, 20, yPos);
      yPos += 5;
    }

    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
      20,
      yPos
    );
    yPos += 5;
    doc.text(`Postal Code: ${order.shippingAddress.postalCode}`, 20, yPos);
    yPos += 5;
    doc.text(`Phone: ${order.shippingAddress.phone}`, 20, yPos);

    // Table Header
    const tableTop = yPos + 10;

    doc.setFillColor(240, 240, 240);
    doc.rect(20, tableTop, 170, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Description", 22, tableTop + 6);
    doc.text("Qty", 120, tableTop + 6);
    doc.text("Price", 140, tableTop + 6);
    doc.text("Amount", 160, tableTop + 6);

    // Table Rows
    let currentY = tableTop + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // FIX: Use strict type for item
    order.items.forEach((item: InvoiceItem, index: number) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, currentY, 170, 10, "F");
      }

      // Product name (wrap if too long)
      const productName =
        item.productName.length > 50
          ? item.productName.substring(0, 47) + "..."
          : item.productName;

      doc.text(productName, 22, currentY + 7);
      doc.text(item.quantity.toString(), 120, currentY + 7);
      doc.text(formatCurrency(item.finalPrice), 140, currentY + 7);
      doc.text(
        formatCurrency(item.finalPrice * item.quantity),
        160,
        currentY + 7
      );

      currentY += 10;
    });

    // Totals section
    const totalsTop = Math.max(currentY + 10, 260); // Ensure it doesn't overlap if page didn't break

    doc.setDrawColor(200, 200, 200);
    doc.line(120, totalsTop, 190, totalsTop);

    let totalY = totalsTop + 10;

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 140, totalY);
    doc.text(formatCurrency(order.subtotal), 170, totalY, { align: "right" });

    totalY += 8;
    if (order.discountTotal > 0) {
      doc.setTextColor(0, 128, 0);
      doc.text("Discount:", 140, totalY);
      doc.text(`-${formatCurrency(order.discountTotal)}`, 170, totalY, {
        align: "right",
      });
      doc.setTextColor(0, 0, 0);
      totalY += 8;
    }

    if (order.pointsValue > 0) {
      doc.setTextColor(0, 128, 0);
      doc.text("Points Redeemed:", 140, totalY);
      doc.text(`-${formatCurrency(order.pointsValue)}`, 170, totalY, {
        align: "right",
      });
      doc.setTextColor(0, 0, 0);
      totalY += 8;
    }

    doc.text("Shipping:", 140, totalY);
    doc.text(
      order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee),
      170,
      totalY,
      { align: "right" }
    );

    totalY += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", 140, totalY);
    doc.text(formatCurrency(order.grandTotal), 170, totalY, { align: "right" });

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const footerY = 280;

    doc.line(20, footerY, 190, footerY);

    doc.text("Thank you for shopping with Mega Prize Mall!", 105, footerY + 8, {
      align: "center",
    });
    doc.text(
      "For any queries, contact: support@megaprizemall.com",
      105,
      footerY + 15,
      { align: "center" }
    );

    if (order.pointsEarned > 0) {
      doc.setTextColor(0, 100, 0);
      doc.text(
        `You earned ${order.pointsEarned} points (${formatCurrency(
          order.pointsEarned * 0.1
        )}) from this order!`,
        105,
        footerY + 22,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }

    // Payment info
    doc.setFontSize(9);
    doc.text(
      `Payment Method: ${order.paymentMethod.toUpperCase()}`,
      20,
      footerY + 35
    );
    doc.text(
      `Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
      20,
      footerY + 40
    );

    if (order.estimatedDelivery) {
      doc.text(
        `Estimated Delivery: ${new Date(
          order.estimatedDelivery
        ).toLocaleDateString()}`,
        20,
        footerY + 45
      );
    }

    // Return PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${orderIdString.slice(
          -8
        )}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate invoice";

    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
