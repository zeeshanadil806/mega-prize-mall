// app/api/user/points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/shared/http';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!session.ok) return session.response;
    
    await connectToDatabase();
    const user = await UserModel.findById(session.user.id).select('points').lean();
    
    return NextResponse.json({
      points: user?.points || 0,
    });
    
  } catch (error) {
    log.error('Error fetching user points', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    );
  }
}
