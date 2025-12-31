import { LuckyDrawModel } from '@/models/LuckyDraw';
import { LuckyDrawEntryModel } from '@/models/LuckyDrawEntry';
import { OrderModel } from '@/models/Order';
// import { UserModel } from '@/models/User';
import { connectToDatabase } from './mongodb';
import mongoose from 'mongoose';

interface EntryProps {
    _id: string;
  drawId: string;
  userId: string;
  orderId: string;
  entryNumber: number;
  orderAmount: number;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: string;
  createdAt: Date;
}
// Check if order qualifies for lucky draw
export async function checkOrderQualifiesForDraw(orderId: string): Promise<{
  qualifies: boolean;
  reason?: string;
  orderAmount?: number;
  drawId?: string;
}> {
  try {
    await connectToDatabase();
    
    const order = await OrderModel.findById(orderId).lean();
    if (!order) {
      return { qualifies: false, reason: 'Order not found' };
    }
    
    // Check order status
    if (order.status !== 'delivered') {
      return { qualifies: false, reason: `Order status is ${order.status}, needs to be delivered` };
    }
    
    // Check order amount
    if (order.grandTotal < 3000) {
      return { 
        qualifies: false, 
        reason: `Order amount ${order.grandTotal} is less than 3000`,
        orderAmount: order.grandTotal 
      };
    }
    
    // Check if entry already exists for this order
    const existingEntry = await LuckyDrawEntryModel.findOne({ orderId }).lean();
    if (existingEntry) {
      return { 
        qualifies: false, 
        reason: 'Entry already exists for this order',
        drawId: existingEntry.drawId 
      };
    }
    
    // Find active draw
    const activeDraw = await LuckyDrawModel.findOne({
      status: 'announced',
      isActive: true,
      'entryCriteria.minOrderAmount': { $lte: order.grandTotal },
      'entryCriteria.qualifyingStatus': 'delivered',
    }).sort({ createdAt: -1 }).lean();
    
    if (!activeDraw) {
      return { qualifies: false, reason: 'No active lucky draw found' };
    }
    
    return { 
      qualifies: true, 
      orderAmount: order.grandTotal,
      drawId: activeDraw._id.toString()
    };
    
  } catch (error) {
    console.error('Error checking order qualification:', error);
    return { qualifies: false, reason: 'Server error' };
  }
}

// Create lucky draw entry for qualified order
export async function createLuckyDrawEntry(orderId: string): Promise<{
  success: boolean;
  entry?: EntryProps;
  error?: string;
  drawId?: string;
}> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    await connectToDatabase();
    
    // Get order with user details
    const order = await OrderModel.findById(orderId)
      .populate('userId', 'name email phone')
      .session(session);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Check qualification
    const qualification = await checkOrderQualifiesForDraw(orderId);
    if (!qualification.qualifies || !qualification.drawId) {
      throw new Error(qualification.reason || 'Order does not qualify');
    }
    
    const drawId = qualification.drawId;
    
    // Get next entry number for this draw
    const lastEntry = await LuckyDrawEntryModel.findOne({ drawId })
      .sort({ entryNumber: -1 })
      .session(session);
    
    const nextEntryNumber = (lastEntry?.entryNumber || 0) + 1;
    interface PopulatedUser {
  _id: string;
  email?: string;
  name?: string;
  phone?: string;
}

    // Create entry
    const entry = new LuckyDrawEntryModel({
      drawId,
      userId: order.userId,
      orderId: order._id,
      entryNumber: nextEntryNumber,
      orderAmount: order.grandTotal,
      orderDate: order.createdAt,
      customerName: order.shippingAddress.fullName,
      customerEmail: (order.userId as PopulatedUser)?.email || order.shippingAddress.phone,
      customerPhone: order.shippingAddress.phone,
      status: 'active',
    });
    
    // Update draw entry count
    await LuckyDrawModel.findByIdAndUpdate(
      drawId,
      { 
        $inc: { totalEntries: 1 },
        $addToSet: { eligibleUserCount: order.userId } // Unique users count
      },
      { session }
    ).exec();
    
    await entry.save({ session });
    await session.commitTransaction();
    
    return {
      success: true,
      entry,
      drawId,
    };
    
  } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';

    await session.abortTransaction();
    console.error('Error creating lucky draw entry:', error);
    return {
      success: false,
      error: errorMessage || 'Failed to create entry',
    };
  } finally {
    session.endSession();
  }
}

// Get all entries for a draw (for spin wheel)
export async function getDrawEntriesForSpin(drawId: string): Promise<Array<{
  entryId: string;
  entryNumber: number;
  customerName: string;
  orderId: string;
  orderAmount: number;
}>> {
  try {
    await connectToDatabase();
    
    const entries = await LuckyDrawEntryModel.find(
      { drawId, status: 'active' },
      'entryNumber customerName orderId orderAmount'
    ).lean();
    
    return entries.map(entry => ({
      entryId: entry._id.toString(),
      entryNumber: entry.entryNumber,
      customerName: entry.customerName,
      orderId: entry.orderId,
      orderAmount: entry.orderAmount,
    }));
    
  } catch (error) {
    console.error('Error getting draw entries:', error);
    return [];
  }
}

// Select random winner for a draw
export async function selectDrawWinner(drawId: string, adminId: string): Promise<{
  success: boolean;
  winner?: DrawWinner;
  error?: string;
}> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    await connectToDatabase();
    
    // Get draw
    const draw = await LuckyDrawModel.findById(drawId).session(session);
    if (!draw) {
      throw new Error('Draw not found');
    }
    
    if (draw.status === 'completed') {
      throw new Error('Draw already completed');
    }
    
    if (draw.status !== 'announced') {
      throw new Error('Draw must be announced before selecting winner');
    }
    
    // Get all active entries
    const entries = await LuckyDrawEntryModel.find(
      { drawId, status: 'active' },
      null,
      { session }
    ).lean();
    
    if (entries.length === 0) {
      throw new Error('No entries found for this draw');
    }
    
    // Random selection
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winningEntry = entries[randomIndex];
    
    // Get user details
    // const user = await UserModel.findById(winningEntry.userId).session(session);
    
    // Update winning entry
    await LuckyDrawEntryModel.findByIdAndUpdate(
      winningEntry._id,
      {
        status: 'winner',
        winnerDeclaredAt: new Date(),
      },
      { session }
    );
    
    // Update draw with winner information
    draw.status = 'completed';
    draw.resultDate = new Date();
    draw.winnerUserId = winningEntry.userId;
    draw.winnerOrderId = winningEntry.orderId;
    draw.winnerEntryId = winningEntry._id.toString();
    draw.winnerName = winningEntry.customerName;
    draw.winnerEmail = winningEntry.customerEmail;
    draw.winnerPhone = winningEntry.customerPhone;
    draw.updatedBy = adminId;
    
    await draw.save({ session });
    await session.commitTransaction();
    
    return {
      success: true,
      winner: {
        entryId: winningEntry._id.toString(),
        userId: winningEntry.userId.toString(), // <--- Added this line
        entryNumber: winningEntry.entryNumber,
        customerName: winningEntry.customerName,
        customerEmail: winningEntry.customerEmail,
        customerPhone: winningEntry.customerPhone,
        orderId: winningEntry.orderId,
        orderAmount: winningEntry.orderAmount,
        drawTitle: draw.title,
        prizeName: draw.prizeName,
        prizeDescription: draw.prizeDescription,
      },
    };
    
  } catch (error) {
    await session.abortTransaction();
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
    
    console.error('Error selecting draw winner:', error);
    return {
      success: false,
      error: errorMessage || 'Failed to select winner',
    };
  } finally {
    session.endSession();
  }
}
interface DrawWinner {
  entryId: string;
  userId: string;
  entryNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderId: string;
  orderAmount: number;
  drawTitle: string;
  prizeName: string;
  prizeDescription: string;
}
export interface UserLuckyDrawEntry {
  id: string;
  entryNumber: number;
  drawTitle: string;
  prizeName: string;
  status: string;
  orderId: string; // Required for page.tsx filtering
  orderAmount: number;
  orderDate: string; // Client component expects ISO string
  createdAt: string; // Client component expects ISO string
  drawStatus: string;
  isWinner: boolean;
}
// Get user's lucky draw entries
export async function getUserLuckyDrawEntries(userId: string): Promise<{
  totalEntries: number;
  activeEntries: number;
  wonDraws: number;
  entries: UserLuckyDrawEntry[];
}> {
  try {
    await connectToDatabase();
    
    const entries = await LuckyDrawEntryModel.find({ userId })
      .populate('drawId', 'title prizeName status drawDate')
      .sort({ createdAt: -1 })
      .lean();
    
    const totalEntries = entries.length;
    const activeEntries = entries.filter(e => e.status === 'active').length;
    const wonDraws = entries.filter(e => e.status === 'winner').length;
    
    return {
      totalEntries,
      activeEntries,
      wonDraws,
      entries: entries.map(entry => ({
        id: entry._id,
        orderId: entry.orderId ? entry.orderId.toString() : '',
        entryNumber: entry.entryNumber,
        drawTitle: (entry.drawId)?.title,
        prizeName: (entry.drawId)?.prizeName,
        status: entry.status,
        orderAmount: entry.orderAmount,
        orderDate: entry.orderDate,
        createdAt: entry.createdAt,
        drawStatus: (entry.drawId)?.status,
        isWinner: entry.status === 'winner',
      })),
    };
    
  } catch (error) {
    console.error('Error getting user entries:', error);
    return {
      totalEntries: 0,
      activeEntries: 0,
      wonDraws: 0,
      entries: [],
    };
  }
}

export interface ActiveDraw {
  id: string;
  title: string;
  description: string;
  prizeName: string;
  prizeImage?: string;
  prizeCategory: string;
  totalEntries: number;
  eligibleUserCount: number;
  drawDate?: string;
  daysRemaining?: number | null;
}
// Get active draws
export async function getActiveDraws(): Promise<ActiveDraw[]> {
  try {
    await connectToDatabase();
    
    const draws = await LuckyDrawModel.find({
      status: 'announced',
      isActive: true,
    })
      .sort({ drawDate: 1, createdAt: -1 })
      .lean();
    
    return draws.map(draw => ({
      id: draw._id,
      title: draw.title,
      description: draw.description,
      prizeName: draw.prizeName,
      prizeImage: draw.prizeImage,
      prizeCategory: draw.prizeCategory,
      totalEntries: draw.totalEntries,
      eligibleUserCount: draw.eligibleUserCount,
      drawDate: draw.drawDate,
      daysRemaining: draw.drawDate 
        ? Math.ceil((draw.drawDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));
    
  } catch (error) {
    console.error('Error getting active draws:', error);
    return [];
  }
}