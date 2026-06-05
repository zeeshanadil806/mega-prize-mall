// Re-export shim.
//
// All concrete implementations have moved to features/lucky-draw/*:
//   - Service orchestrators → features/lucky-draw/service
//   - Result + entry types  → features/lucky-draw/schema
//   - Pure helpers          → features/lucky-draw/domain
//
// This file stays so existing import sites keep working. New code
// should import from the canonical locations above.

export {
  checkOrderQualifiesForDraw,
  createLuckyDrawEntry,
  getDrawEntriesForSpin,
  selectDrawWinner,
  getUserLuckyDrawEntries,
  getActiveDraws,
} from "@/features/lucky-draw/service";

export type {
  UserLuckyDrawEntry,
  ActiveDraw,
} from "@/features/lucky-draw/schema";
