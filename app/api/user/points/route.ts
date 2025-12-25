// app/api/user/points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
  const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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