// Lucky-draw domain schemas.
//
// Re-exports the LuckyDraw + LuckyDrawEntry models and their types,
// plus the service-layer return shapes that callers depend on. Phase 3
// will physically move the Zod/Mongoose definitions into
// features/lucky-draw/repository.ts.

export { LuckyDrawModel, type ILuckyDraw } from "@/models/LuckyDraw";
export {
  LuckyDrawEntryModel,
  type ILuckyDrawEntry,
} from "@/models/LuckyDrawEntry";

// Service return shapes — kept here so caller code (route handlers,
// SSR pages, client components) can import them from the feature
// barrel rather than digging into service.ts.

export interface DrawWinner {
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
  orderId: string;
  orderAmount: number;
  /** Client component expects ISO string. */
  orderDate: string;
  /** Client component expects ISO string. */
  createdAt: string;
  drawStatus: string;
  isWinner: boolean;
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
