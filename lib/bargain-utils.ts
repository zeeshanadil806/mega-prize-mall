// Re-export shim.
//
// All concrete implementations have moved out:
//   - Bargain domain (validateBargainOffer, calculateDiscountPercentage,
//     generateBargainCouponCode) → features/bargain/domain
//   - Wallet domain (calculatePointsForOrder, calculateMaxRedeemable-
//     Points) → features/wallet/domain
//   - Display (formatCurrency, formatPoints) → shared/format
//
// This file stays so existing import sites keep working. New code
// should import from the canonical locations above.

export {
  generateBargainCouponCode,
  calculateDiscountPercentage,
  validateBargainOffer,
} from "@/features/bargain/domain";

export {
  calculatePointsForOrder,
  calculateMaxRedeemablePoints,
} from "@/features/wallet/domain";

export { formatCurrency, formatPoints } from "@/shared/format";
