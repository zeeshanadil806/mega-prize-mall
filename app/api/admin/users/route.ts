import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { auth } from '@/auth';
import { z } from 'zod';
import { log } from '@/lib/logger';

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['customer', 'admin', 'support']).default('customer'),
  phone: z.string().optional(),
  points: z.number().min(0).default(0),
});

const updatePointsSchema = z.object({
  userId: z.string().min(1),
  points: z.number().int(),
  action: z.enum(['add', 'deduct', 'set']),
  reason: z.string().min(1).max(500),
});

// GET all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check admin authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const adminUser = await UserModel.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    interface MongoRegexFilter {
  $regex: string;
  $options: string;
}

// Interface for the specific query object used in GET
interface UserQuery {
  role?: string;
  $or?: Array<
    | { name: MongoRegexFilter }
    | { email: MongoRegexFilter }
    | { phone: MongoRegexFilter }
  >;
}
    // Build query
    const query: UserQuery = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      UserModel.find(query)
        .select('-password') // Exclude password
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);
    
    // Calculate referral stats
    const usersWithStats = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
      // Ensure we use the field from the DB. 
      // If the field is missing in old records, default to 0.
      totalReferrals: (user).totalReferrals || 0, 
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
          hasNextPage: page * limit < totalUsers,
          hasPrevPage: page > 1,
        },
        filters: {
          role,
          search,
          sortBy,
          sortOrder,
        },
      },
    });
    
  } catch (error) {
    log.error('Error fetching users:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check admin authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const adminUser = await UserModel.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: validatedData.email 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Import bcrypt for password hashing
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Create user
    const user = await UserModel.create({
      ...validatedData,
      password: hashedPassword,
      emailVerified: new Date(),
    });
    
    // Remove password from response
    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    log.info('Admin created user', {
      adminId: session.user.id,
      userId: user._id.toString(),
      role: validatedData.role,
    });
    
    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: userResponse,
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    log.error('Error creating user:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH - Update user points (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check admin authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const adminUser = await UserModel.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    const body = await request.json();
    const validatedData = updatePointsSchema.parse(body);
    
    // Find user
    const user = await UserModel.findById(validatedData.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate new points
    let newPoints = user.points;
    
    switch (validatedData.action) {
      case 'add':
        newPoints += validatedData.points;
        break;
      case 'deduct':
        newPoints = Math.max(0, newPoints - validatedData.points);
        break;
      case 'set':
        newPoints = Math.max(0, validatedData.points);
        break;
    }
    
    // Update user points
    user.points = newPoints;
    await user.save();
    
    // TODO: Create wallet transaction record for audit
    // await WalletTransactionModel.create({ ... })
    
    log.info('Admin updated user points', {
      adminId: session.user.id,
      userId: user._id.toString(),
      action: validatedData.action,
      points: validatedData.points,
      newBalance: newPoints,
      reason: validatedData.reason,
    });
    
    return NextResponse.json({
      success: true,
      message: `Points ${validatedData.action === 'add' ? 'added to' : validatedData.action === 'deduct' ? 'deducted from' : 'set for'} user successfully`,
      data: {
        userId: user._id.toString(),
        previousPoints: user.points - (validatedData.action === 'add' ? validatedData.points : validatedData.action === 'deduct' ? -validatedData.points : 0),
        newPoints: user.points,
        action: validatedData.action,
        pointsChanged: validatedData.points,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    log.error('Error updating user points:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update user points',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}