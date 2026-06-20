import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Your existing MongoDB connection
import { tiktokConversionAPI } from '@/lib/tiktok/server/conversion-api';
import { deduplicationService } from '@/lib/tiktok/server/deduplication';
import { rateLimit } from '@/lib/rate-limit';
import { log } from '@/lib/logger';
import { applyRateLimit, ipFromRequest } from '@/shared/http';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limit (10 requests/minute per IP)
    const rl = await applyRateLimit(limiter, 10, ipFromRequest(request));
    if (!rl.ok) return rl.response;


    // Connect to MongoDB
    await connectToDatabase();
    
    const body = await request.json();
    const {
      event,
      event_id,
      properties,
      user_data,
      ttclid,
    } = body;

    // Validate required fields
    if (!event || !event_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event, event_id' },
        { status: 400 }
      );
    }

    // Check for duplicates
    const isDuplicate = await deduplicationService.isDuplicate(event_id);
    if (isDuplicate) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Event already processed', 
          event_id,
          duplicate: true 
        },
        { status: 200 }
      );
    }

    // Send to TikTok Conversion API
    const response = await tiktokConversionAPI.sendCustomEvent({
      eventName: event,
      eventId: event_id,
      params: properties,
      userData: user_data,
      ttclid,
    });

    // Record successful event (non-duplicate)
    await deduplicationService.recordEvent(
      event_id,
      event,
      'conversion_api',
      user_data?.external_id
    );

    return NextResponse.json({
      success: response.code === 0,
      event_id,
      response,
    });
  } catch (error) {
    log.error('TikTok tracking API error', { error: error as Error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
