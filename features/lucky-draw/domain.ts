// Lucky-draw pure helpers.
//
// Only one real piece of math lives in the lucky-draw flow: the
// "days remaining until the draw" countdown used by ActiveDraw cards
// in the customer dashboard. The rest of the domain is DB-bound and
// lives in repository.ts / service.ts.

export const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole days from `now` to `drawDate`, rounded up.
 *  Returns null when no draw date is set. Matches the original
 *  inline expression in getActiveDraws. */
export function calculateDaysRemaining(
  drawDate: Date | undefined | null,
  now: Date = new Date(),
): number | null {
  if (!drawDate) return null;
  return Math.ceil((drawDate.getTime() - now.getTime()) / MILLIS_PER_DAY);
}
