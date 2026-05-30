import { NextRequest, NextResponse } from 'next/server';
import { LuckyDrawModel } from '@/models/LuckyDraw';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@/auth';
import { log } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const UserModel = (await import('@/models/User')).UserModel;
    const user = await UserModel.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const draw = await LuckyDrawModel.findById(id);
    if (!draw) {
      return NextResponse.json(
        { error: 'Draw not found' },
        { status: 404 }
      );
    }

    if (draw.status !== 'draft') {
      return NextResponse.json(
        { error: `Draw is already ${draw.status}` },
        { status: 400 }
      );
    }

    // Announce the draw
    draw.status = 'announced';
    draw.announcementDate = new Date();
    draw.updatedBy = session.user.id;
    
    await draw.save();

    return NextResponse.json({
      success: true,
      message: 'Draw announced successfully',
      data: draw,
    });

  } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    log.error('Error announcing draw', { error: error as Error });
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to announce draw'
      },
      { status: 400 }
    );
  }
}