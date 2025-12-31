import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { auth } from '@/auth';
import { z } from 'zod';
import { log } from '@/lib/logger';

// Validation schema for user updates
const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  role: z.enum(['customer', 'admin', 'support']).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    // Get user with detailed information
    const user = await UserModel.findById(id)
      .select('-password') // Exclude password
      .lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user's referral stats
    const totalReferrals = await UserModel.countDocuments({ 
      referredBy: id 
    });
    
    // Get user's recent wallet transactions
    const recentTransactions = await WalletTransactionModel.find({
      userId: id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get user's orders count
    const OrderModel = (await import('@/models/Order')).OrderModel;
    const ordersCount = await OrderModel.countDocuments({ userId: id });
    
    // Get total spend
    const totalSpendResult = await OrderModel.aggregate([
      { $match: { userId: id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    
    const totalSpend = totalSpendResult[0]?.total || 0;
    
    const userDetails = {
      ...user,
      _id: user._id.toString(),
      stats: {
        totalReferrals,
        ordersCount,
        totalSpend,
        pointsEarned: user.points + (recentTransactions
          .filter(t => t.type === 'redeem')
          .reduce((sum, t) => sum + Math.abs(t.points), 0)),
        pointsRedeemed: recentTransactions
          .filter(t => t.type === 'redeem')
          .reduce((sum, t) => sum + Math.abs(t.points), 0),
      },
      recentTransactions: recentTransactions.map(t => ({
        ...t,
        _id: t._id.toString(),
      })),
    };
    
    return NextResponse.json({
      success: true,
      data: userDetails,
    });
    
  } catch (error) {
    log.error('Error fetching user details:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH - Update user details (role, name, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    
    // Find user
    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent admin from removing their own admin role
    if (validatedData.role && id === session.user.id && validatedData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role' },
        { status: 400 }
      );
    }
    
    // Update user
    const previousRole = user.role;
    
    Object.assign(user, validatedData);
    await user.save();
    
    log.info('Admin updated user', {
      adminId: session.user.id,
      userId: id,
      updates: validatedData,
      previousRole,
      newRole: user.role,
    });
    
    // Remove password from response
    const userResponse = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      points: user.points,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse,
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
    
    log.error('Error updating user:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Soft delete - add isActive field to schema if not exists
    // For now, we'll just log the deletion intent
    log.info('Admin requested user deletion', {
      adminId: session.user.id,
      userId: id,
      userName: user.name,
      userEmail: user.email,
    });
    
    // TODO: Implement soft delete when User schema has isActive field
    // user.isActive = false;
    // await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'User marked for deletion (soft delete pending schema update)',
      data: {
        userId: id,
        action: 'marked_for_deletion',
      },
    });
    
  } catch (error) {
    log.error('Error deleting user:', { error: error as Error });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}