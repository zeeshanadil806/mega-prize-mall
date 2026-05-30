import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { deduplicationService } from '@/lib/tiktok/server/deduplication';
import { log } from '@/lib/logger';

// Protect this route with admin authentication
export async function GET(request: NextRequest) {
  try {
    // Add admin auth check here (using your existing auth system)
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectToDatabase();
    
    const stats = await deduplicationService.getStats();
    
    // Get match rate from TikTok API or calculate from your logs
    const matchRate = 0.75; // Placeholder - implement actual calculation
    
    return NextResponse.json({
      total_events: stats.total,
      matched_events: Math.floor(stats.total * matchRate),
      match_rate: matchRate,
      last_24h: stats.last24h,
      top_events: Object.entries(stats.byType).map(([name, count]) => ({
        event_name: name,
        count,
        match_rate: matchRate,
      })),
    });
  } catch (error) {
    log.error('Failed to fetch TikTok stats', { error: error as Error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}