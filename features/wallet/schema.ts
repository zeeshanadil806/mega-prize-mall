// Wallet domain schemas.
//
// Re-exports the WalletTransaction model + types. Phase 3 will
// physically move the Zod/Mongoose definitions into
// features/wallet/repository.ts.

export {
  WalletTransactionModel,
  type IWalletTransaction,
} from "@/models/WalletTransaction";

/** Service outcome of the daily expiry job. Mirrors the route's
 *  existing JSON response shape so the controller can map directly. */
export interface ExpirePointsResult {
  expiredTransactions: number;
  affectedUsers: number;
  totalPointsExpired: number;
}

/** Service outcome of a manual redemption. */
export interface RedeemPointsResult {
  transactionId: unknown;
  pointsRedeemed: number;
  discountValue: number;
  newBalance: number;
  expiresAt: Date;
}
