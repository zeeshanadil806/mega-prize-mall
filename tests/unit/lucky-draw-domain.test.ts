import { describe, it, expect } from "vitest";
import {
  calculateDaysRemaining,
  MILLIS_PER_DAY,
} from "@/features/lucky-draw/domain";

describe("calculateDaysRemaining", () => {
  it("returns null when drawDate is missing", () => {
    expect(calculateDaysRemaining(null)).toBeNull();
    expect(calculateDaysRemaining(undefined)).toBeNull();
  });

  it("returns a positive integer for future dates (ceiling)", () => {
    const now = new Date("2026-06-05T00:00:00Z");
    const drawDate = new Date(now.getTime() + 3.2 * MILLIS_PER_DAY);
    // Math.ceil(3.2) === 4
    expect(calculateDaysRemaining(drawDate, now)).toBe(4);
  });

  it("returns 0 or 1 when the draw is right now", () => {
    const now = new Date("2026-06-05T00:00:00Z");
    expect(calculateDaysRemaining(now, now)).toBe(0);
  });

  it("returns a negative number for past dates", () => {
    const now = new Date("2026-06-05T00:00:00Z");
    const past = new Date(now.getTime() - 2 * MILLIS_PER_DAY);
    expect(calculateDaysRemaining(past, now)).toBe(-2);
  });

  it("MILLIS_PER_DAY is exactly 24h in ms", () => {
    expect(MILLIS_PER_DAY).toBe(24 * 60 * 60 * 1000);
  });
});
