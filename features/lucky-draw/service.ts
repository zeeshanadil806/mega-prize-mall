// Lucky-draw service — orchestration layer.
//
// Coordinates the flows that lived inline in lib/lucky-draw-utils.ts:
//   - checkOrderQualifiesForDraw: read-only qualification check
//   - createLuckyDrawEntry:       transactional entry creation
//   - selectDrawWinner:           transactional winner selection
//   - getDrawEntriesForSpin:      read for the admin spin UI
//   - getUserLuckyDrawEntries:    customer dashboard listing
//   - getActiveDraws:             public active-draws listing
//
// Behavior locked to the original lib/lucky-draw-utils.ts: same query
// shapes, same transaction boundaries (manual startTransaction +
// commit/abort, not withTransaction — preserved verbatim because
// changing the transaction style would alter retry semantics),
// same error wrapping.

import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateDaysRemaining } from "./domain";
import {
  findActiveDrawForOrderAmount,
  findAnnouncedActiveDraws,
  findActiveEntriesForDraw,
  findActiveEntriesForSpin,
  findDrawById,
  findEntriesByUserWithDraw,
  findEntryByOrderId,
  findLastEntryForDraw,
  findLeanOrderById,
  findOrderWithUser,
  createEntry,
  incrementDrawEntryCount,
  markEntryAsWinner,
  persistDrawWinner,
} from "./repository";
import type {
  ActiveDraw,
  DrawWinner,
  UserLuckyDrawEntry,
} from "./schema";

// ─── Public types ────────────────────────────────────────────────

export interface OrderQualificationResult {
  qualifies: boolean;
  reason?: string;
  orderAmount?: number;
  drawId?: string;
}

export interface CreateEntryResult {
  success: boolean;
  entry?: {
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
  };
  error?: string;
  drawId?: string;
}

export interface SelectWinnerResult {
  success: boolean;
  winner?: DrawWinner;
  error?: string;
}

export interface SpinEntry {
  entryId: string;
  entryNumber: number;
  customerName: string;
  orderId: string;
  orderAmount: number;
}

export interface UserEntriesResult {
  totalEntries: number;
  activeEntries: number;
  wonDraws: number;
  entries: UserLuckyDrawEntry[];
}

// ─── Order qualification ─────────────────────────────────────────

export async function checkOrderQualifiesForDraw(
  orderId: string,
): Promise<OrderQualificationResult> {
  try {
    await connectToDatabase();

    const order = await findLeanOrderById(orderId);
    if (!order) return { qualifies: false, reason: "Order not found" };

    if (order.status !== "delivered") {
      return {
        qualifies: false,
        reason: `Order status is ${order.status}, needs to be delivered`,
      };
    }

    // One-entry-per-order: bail if we already created one.
    const existingEntry = await findEntryByOrderId(orderId);
    if (existingEntry) {
      return {
        qualifies: false,
        reason: "Entry already exists for this order",
        drawId: existingEntry.drawId,
      };
    }

    // Per-draw minOrderAmount is enforced in the query itself; no
    // hardcoded floor here.
    const activeDraw = await findActiveDrawForOrderAmount(order.grandTotal);
    if (!activeDraw) {
      return { qualifies: false, reason: "No active lucky draw found" };
    }

    return {
      qualifies: true,
      orderAmount: order.grandTotal,
      drawId: activeDraw._id.toString(),
    };
  } catch (error) {
    console.error("Error checking order qualification:", error);
    return { qualifies: false, reason: "Server error" };
  }
}

// ─── Entry creation (transactional) ──────────────────────────────

interface PopulatedUser {
  _id: string;
  email?: string;
  name?: string;
  phone?: string;
}

export async function createLuckyDrawEntry(
  orderId: string,
): Promise<CreateEntryResult> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await connectToDatabase();

    const order = await findOrderWithUser(orderId, { session });
    if (!order) throw new Error("Order not found");

    const qualification = await checkOrderQualifiesForDraw(orderId);
    if (!qualification.qualifies || !qualification.drawId) {
      throw new Error(qualification.reason || "Order does not qualify");
    }

    const drawId = qualification.drawId;

    // Sequential entry numbering: read max, add 1.
    const lastEntry = await findLastEntryForDraw(drawId, { session });
    const nextEntryNumber = (lastEntry?.entryNumber || 0) + 1;

    const participantId =
      order.userId?.toString() ||
      (order as { guestPhone?: string }).guestPhone ||
      order.shippingAddress?.phone ||
      "guest";

    // Increment counters before the entry write — matches original ordering.
    await incrementDrawEntryCount(drawId, participantId, { session });

    const entry = await createEntry(
      {
        drawId,
        userId: participantId,
        orderId: (order._id as { toString(): string }).toString(),
        entryNumber: nextEntryNumber,
        orderAmount: order.grandTotal,
        orderDate: order.createdAt,
        customerName: order.shippingAddress.fullName,
        customerEmail:
          (order.userId as unknown as PopulatedUser | undefined)?.email ||
          order.shippingAddress.phone,
        customerPhone: order.shippingAddress.phone,
        status: "active",
      },
      { session },
    );

    await session.commitTransaction();

    return {
      success: true,
      entry: {
        _id: (entry._id as { toString(): string }).toString(),
        drawId: entry.drawId,
        userId: entry.userId,
        orderId: entry.orderId,
        entryNumber: entry.entryNumber,
        orderAmount: entry.orderAmount,
        orderDate: entry.orderDate,
        customerName: entry.customerName,
        customerEmail: entry.customerEmail,
        customerPhone: entry.customerPhone,
        status: entry.status,
        createdAt: entry.createdAt,
      },
      drawId,
    };
  } catch (error) {
    // NOTE: the original utility had a copy-pasted error message
    // ("Failed to cancel order") that surfaced when the underlying
    // error wasn't an Error instance. Preserved verbatim because
    // changing the user-visible string would be a behavior change.
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel order";
    await session.abortTransaction();
    console.error("Error creating lucky draw entry:", error);
    return {
      success: false,
      error: errorMessage || "Failed to create entry",
    };
  } finally {
    session.endSession();
  }
}

// ─── Winner selection (transactional) ────────────────────────────

export async function selectDrawWinner(
  drawId: string,
  adminId: string,
): Promise<SelectWinnerResult> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await connectToDatabase();

    const draw = await findDrawById(drawId, { session });
    if (!draw) throw new Error("Draw not found");
    if (draw.status === "completed") throw new Error("Draw already completed");
    if (draw.status !== "announced") {
      throw new Error("Draw must be announced before selecting winner");
    }

    const entries = await findActiveEntriesForDraw(drawId, { session });
    if (entries.length === 0) {
      throw new Error("No entries found for this draw");
    }

    const winningEntry = entries[Math.floor(Math.random() * entries.length)];

    await markEntryAsWinner(
      (winningEntry._id as { toString(): string }).toString(),
      { session },
    );

    // Write winner snapshot onto the draw document.
    draw.status = "completed";
    draw.resultDate = new Date();
    draw.winnerUserId = winningEntry.userId;
    draw.winnerOrderId = winningEntry.orderId;
    draw.winnerEntryId = (
      winningEntry._id as { toString(): string }
    ).toString();
    draw.winnerName = winningEntry.customerName;
    draw.winnerEmail = winningEntry.customerEmail;
    draw.winnerPhone = winningEntry.customerPhone;
    draw.updatedBy = adminId;

    await persistDrawWinner(draw, { session });
    await session.commitTransaction();

    return {
      success: true,
      winner: {
        entryId: (winningEntry._id as { toString(): string }).toString(),
        userId: winningEntry.userId.toString(),
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
    // Same copy-pasted message as above — preserved verbatim.
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel order";
    console.error("Error selecting draw winner:", error);
    return {
      success: false,
      error: errorMessage || "Failed to select winner",
    };
  } finally {
    session.endSession();
  }
}

// ─── Read paths ──────────────────────────────────────────────────

export async function getDrawEntriesForSpin(
  drawId: string,
): Promise<SpinEntry[]> {
  try {
    await connectToDatabase();
    const entries = await findActiveEntriesForSpin(drawId);
    return entries.map((entry) => ({
      entryId: entry._id.toString(),
      entryNumber: entry.entryNumber,
      customerName: entry.customerName,
      orderId: entry.orderId,
      orderAmount: entry.orderAmount,
    }));
  } catch (error) {
    console.error("Error getting draw entries:", error);
    return [];
  }
}

export async function getUserLuckyDrawEntries(
  userId: string,
): Promise<UserEntriesResult> {
  try {
    await connectToDatabase();
    const entries = await findEntriesByUserWithDraw(userId);

    const totalEntries = entries.length;
    const activeEntries = entries.filter((e) => e.status === "active").length;
    const wonDraws = entries.filter((e) => e.status === "winner").length;

    interface PopulatedDraw {
      title?: string;
      prizeName?: string;
      status?: string;
    }

    return {
      totalEntries,
      activeEntries,
      wonDraws,
      entries: entries.map((entry) => {
        const populated = entry.drawId as unknown as PopulatedDraw;
        return {
          // Original code returned entry._id without toString(); preserve.
          id: entry._id as unknown as string,
          orderId: entry.orderId ? entry.orderId.toString() : "",
          entryNumber: entry.entryNumber,
          drawTitle: populated?.title as string,
          prizeName: populated?.prizeName as string,
          status: entry.status,
          orderAmount: entry.orderAmount,
          // Original code returned Date objects directly despite the
          // UserLuckyDrawEntry type declaring them as ISO strings — the
          // client component coerces via new Date(...). Preserve.
          orderDate: entry.orderDate as unknown as string,
          createdAt: entry.createdAt as unknown as string,
          drawStatus: populated?.status as string,
          isWinner: entry.status === "winner",
        };
      }),
    };
  } catch (error) {
    console.error("Error getting user entries:", error);
    return {
      totalEntries: 0,
      activeEntries: 0,
      wonDraws: 0,
      entries: [],
    };
  }
}

export async function getActiveDraws(): Promise<ActiveDraw[]> {
  try {
    await connectToDatabase();
    const draws = await findAnnouncedActiveDraws();
    return draws.map((draw) => ({
      // Same as above: original returned raw _id without toString().
      id: draw._id as unknown as string,
      title: draw.title,
      description: draw.description,
      prizeName: draw.prizeName,
      prizeImage: draw.prizeImage,
      prizeCategory: draw.prizeCategory,
      totalEntries: draw.totalEntries,
      // Pre-existing quirk: the model declares eligibleUserCount as
      // Number, but createLuckyDrawEntry uses `$addToSet` (an array
      // operator) on it. Whatever shape mongo persists, return it
      // verbatim — fixing the type would be a behavior change.
      eligibleUserCount: draw.eligibleUserCount,
      drawDate: draw.drawDate as unknown as string,
      daysRemaining: calculateDaysRemaining(draw.drawDate),
    }));
  } catch (error) {
    console.error("Error getting active draws:", error);
    return [];
  }
}
