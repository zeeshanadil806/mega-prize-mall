import { NextRequest, NextResponse } from 'next/server';
import { LuckyDrawModel } from '@/models/LuckyDraw';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/shared/http';
import { log } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

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
    draw.updatedBy = admin.user.id;
    
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