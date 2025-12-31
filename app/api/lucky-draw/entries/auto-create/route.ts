import { NextRequest, NextResponse } from 'next/server';
import { createLuckyDrawEntry } from '@/lib/lucky-draw-utils';
import { OrderModel } from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';
import { sendLuckyDrawEntryEmail } from '@/lib/email-templates';

// This API will be called when order status changes to 'delivered'
export async function POST(request: NextRequest) {
  try {
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
    console.error('Failed to send lucky draw entry email:', emailError);
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
    console.error('Error creating lucky draw entry:', error);
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