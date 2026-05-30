import { NextRequest, NextResponse } from 'next/server';
import { getActiveDraws } from '@/lib/lucky-draw-utils';
import { log } from '@/lib/logger';

export async function GET() {
  try {
    const activeDraws = await getActiveDraws();
    
    return NextResponse.json({
      success: true,
      data: activeDraws,
      count: activeDraws.length,
    });

  } catch (error) {
    log.error('Error fetching active draws', { error: error as Error });
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to fetch active draws'
      },
      { status: 400 }
    );
  }
}