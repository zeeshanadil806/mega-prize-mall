import { NextRequest, NextResponse } from 'next/server';
import { getUserLuckyDrawEntries } from '@/lib/lucky-draw-utils';
import { auth } from '@/auth';
import { log } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    
    // User can only view their own entries
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const entries = await getUserLuckyDrawEntries(userId);
    
    return NextResponse.json({
      success: true,
      data: entries,
    });

  } catch (error) {
    log.error('Error fetching user entries', { error: error as Error });
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to fetch entries'
      },
      { status: 400 }
    );
  }
}