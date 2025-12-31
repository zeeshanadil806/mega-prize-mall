import { NextRequest, NextResponse } from 'next/server';
import { LuckyDrawModel } from '@/models/LuckyDraw';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@/auth';
import { z } from 'zod';

// Validation schema
const createDrawSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  drawType: z.enum(['instant', 'scheduled', 'manual']).default('manual'),
  prizeName: z.string().min(3).max(100),
  prizeDescription: z.string().min(10).max(500),
  prizeImage: z.string().optional(),
  prizeValue: z.number().min(0).optional(),
  prizeCategory: z.enum(['vehicle', 'electronics', 'cash', 'voucher', 'other']).default('other'),
  entryCriteria: z.object({
    minOrderAmount: z.number().min(0).default(3000),
    qualifyingStatus: z.string().default('delivered'),
    maxEntriesPerUser: z.number().min(1).optional(),
  }).optional(),
  drawDate: z.string().optional(), // ISO string
  announcementDate: z.string().optional(), // ISO string
  isFeatured: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
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

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
interface LuckyDrawQuery {
  status?: string;
}
    // Build query
    const query: LuckyDrawQuery = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [draws, total] = await Promise.all([
      LuckyDrawModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LuckyDrawModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: draws,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching draws:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to fetch draws'
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = createDrawSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const drawData = {
      ...validation.data,
      createdBy: session.user.id,
      status: 'draft', // Start as draft
      isActive: true,
      announcementDate: validation.data.announcementDate 
        ? new Date(validation.data.announcementDate)
        : undefined,
      drawDate: validation.data.drawDate 
        ? new Date(validation.data.drawDate)
        : undefined,
    };

    const draw = await LuckyDrawModel.create(drawData);

    return NextResponse.json({
      success: true,
      message: 'Lucky draw created successfully',
      data: draw,
    });

  } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    console.error('Error creating lucky draw:', error);
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage || 'Failed to create lucky draw'
      },
      { status: 400 }
    );
  }
}