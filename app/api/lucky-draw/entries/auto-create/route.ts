import { NextRequest, NextResponse } from 'next/server';
import { createLuckyDrawEntry } from '@/features/lucky-draw/service';
import { OrderModel } from '@/models/Order';
import { UserModel } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { sendLuckyDrawEntryEmail } from '@/lib/email-templates';
import { auth } from '@/auth';
import { log } from '@/lib/logger';

// This API will be called when order status changes to 'delivered'
// Accepts either:
//   - Authorization: Bearer <CRON_SECRET>  (for cron / server-to-server triggers)
//   - an authenticated admin session       (for admin-initiated triggers)
export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    const isCronRequest =
      !!cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronRequest) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      await connectToDatabase();
      const caller = await UserModel.findById(session.user.id).select('role');
      if (!caller || caller.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Admin access required' },
          { status: 403 }
        );
      }
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
    
    // Send lucky draw entry email (non-blocking)
setTimeout(async () => {
  try {
    // Import models
    const { UserModel } = await import('@/models/User');
    const { LuckyDrawEntryModel } = await import('@/models/LuckyDrawEntry');
    const { LuckyDrawModel } = await import('@/models/LuckyDraw');
    
    const user = await UserModel.findById(order.userId);
    const entry = await LuckyDrawEntryModel.findById(result.entry?._id);
    const draw = await LuckyDrawModel.findById(result.drawId);
    
    if (user?.email && entry && draw) {
      await sendLuckyDrawEntryEmail(
        { email: user.email, name: user.name },
        entry,
        draw,
        order
      );
      console.log(`Lucky draw entry email sent for entry ${entry._id}`);
    }
  } catch (emailError) {
    log.error('Failed to send lucky draw entry email', { error: emailError as Error });
  }
}, 0);

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
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to create lucky draw entry'
      },
      { status: 400 }
    );
  }
}