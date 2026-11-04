import { NextRequest, NextResponse } from 'next/server';
import { createLuckyDrawEntry } from '@/features/lucky-draw/service';
import { OrderModel } from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';
import { sendLuckyDrawEntryEmail } from '@/lib/email-templates';
import { requireAdmin, requireCronBearer } from '@/shared/http';
import { log } from '@/lib/logger';

// This API will be called when order status changes to 'delivered'
// Accepts either:
//   - Authorization: Bearer <CRON_SECRET>  (for cron / server-to-server triggers)
//   - an authenticated admin session       (for admin-initiated triggers)
export async function POST(request: NextRequest) {
  try {
    const cron = requireCronBearer(request);
    if (!cron.ok) {
      const admin = await requireAdmin();
      if (!admin.ok) return admin.response;
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get order to verify
    const order = await OrderModel.findById(orderId).lean();
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order qualifies and create entry
    const result = await createLuckyDrawEntry(orderId);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          message: result.error,
          qualifies: false
        },
        { status: 400 }
      );
    }

    // Send lucky draw entry email (non-blocking)
    if (result.entry) {
      setTimeout(async () => {
        try {
          // Import models
          const { UserModel } = await import('@/models/User');
          const { LuckyDrawEntryModel } = await import('@/models/LuckyDrawEntry');
          const { LuckyDrawModel } = await import('@/models/LuckyDraw');
          
          const user = order.userId ? await UserModel.findById(order.userId) : null;
          const entry = await LuckyDrawEntryModel.findById(result.entry?._id);
          const draw = await LuckyDrawModel.findById(result.drawId);
          
          const recipientEmail = user?.email || (order as { guestEmail?: string }).guestEmail || result.entry?.customerEmail;
          const recipientName = user?.name || result.entry?.customerName || "Customer";

          if (recipientEmail && entry && draw) {
            await sendLuckyDrawEntryEmail(
              { email: recipientEmail, name: recipientName },
              entry,
              draw,
              order
            );
            log.info(`Lucky draw entry email sent for entry ${entry._id}`);
          }
        } catch (emailError) {
          log.error('Failed to send lucky draw entry email', { error: emailError as Error });
        }
      }, 0);
    }

    return NextResponse.json({
      success: true,
      message: 'Lucky draw entry created successfully',
      data: {
        entryId: result.entry?._id,
        drawId: result.drawId,
        entryNumber: result.entry?.entryNumber,
      }
    });

  } catch (error) {
    log.error('Error creating lucky draw entry', { error: error as Error });
    const errorMessage = error instanceof Error ? error.message : 'Failed to create lucky draw entry';

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to create lucky draw entry'
      },
      { status: 400 }
    );
  }
}
