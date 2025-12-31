import { NextRequest, NextResponse } from 'next/server';
import { sendBargainExpiryReminders } from '@/lib/bargain-expiry-reminders';

// Add secret for security
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify secret key
    const secret = request.nextUrl.searchParams.get('secret');
    if (CRON_SECRET && secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔔 Running bargain expiry cron job...');
    await sendBargainExpiryReminders();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bargain expiry reminders processed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process bargain expiry reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}