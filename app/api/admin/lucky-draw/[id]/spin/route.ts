import { NextRequest, NextResponse } from 'next/server';
import { getDrawEntriesForSpin, selectDrawWinner } from '@/features/lucky-draw/service';
import { auth } from '@/auth';
import { log } from '@/lib/logger';
// import { UserModel } from '@/models/User';

export async function GET(
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
    const entries = await getDrawEntriesForSpin(id);
    
    return NextResponse.json({
      success: true,
      data: {
        drawId: id,
        entries,
        totalEntries: entries.length,
        spinReady: entries.length > 0,
      }
    });

  } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
    log.error('Error getting draw entries for spin', { error: error as Error });
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to get spin entries'
      },
      { status: 400 }
    );
  }
}

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
    const result = await selectDrawWinner(id, session.user.id);
    
    // Send winner announcement emails (non-blocking)
setTimeout(async () => {
  try {
    // Import models and email functions
    const { LuckyDrawModel } = await import('@/models/LuckyDraw');
    const { LuckyDrawEntryModel } = await import('@/models/LuckyDrawEntry');
    const { UserModel } = await import('@/models/User');
    const { sendLuckyDrawWinnerEmail, sendLuckyDrawResultsEmail } = await import('@/lib/email-templates');
    
    // Get draw details
    const draw = await LuckyDrawModel.findById(id);
    if (!draw || !result.winner) return;
    
    // Send winner email
    const winnerUser = await UserModel.findById(result.winner.userId);
    const winnerEntry = await LuckyDrawEntryModel.findById(result.winner.entryId);
    
    if (winnerUser?.email && winnerEntry) {
      await sendLuckyDrawWinnerEmail(
        { email: winnerUser.email, name: winnerUser.name },
        winnerEntry,
        draw
      );
    }
    
    // Send results email to all participants
    // Get all unique participants
    const allEntries = await LuckyDrawEntryModel.find({ drawId: id });
    const uniqueUserIds = [...new Set(allEntries.map(entry => entry.userId))];
    
    for (const userId of uniqueUserIds) {
      const participant = await UserModel.findById(userId);
      if (participant?.email) {
        const userEntryCount = allEntries.filter(entry => entry.userId === userId).length;
        
        await sendLuckyDrawResultsEmail(
          { email: participant.email, name: participant.name },
          draw,
          winnerUser?.name || 'Winner',
          userEntryCount
        );
      }
    }
    
    console.log(`Winner emails sent for draw ${id}`);
  } catch (emailError) {
    log.error('Failed to send winner emails', { error: emailError as Error });
  }
}, 0);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }

    // TODO: Send email notification to winner
    // await sendWinnerEmail(result.winner);

    return NextResponse.json({
      success: true,
      message: 'Winner selected successfully',
      data: result.winner,
    });

  } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    log.error('Error selecting winner', { error: error as Error });
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to select winner'
      },
      { status: 400 }
    );
  }
}