// Display formatting helpers — pure, locale-aware.
//
// formatCurrency is the canonical price renderer across the app
// (catalog, cart, checkout, orders, admin, invoices). It produces
// PKR-formatted strings with no decimals — matches the storefront
// convention of whole-rupee prices.
//
// formatPoints is the wallet-balance renderer, showing both the
// integer point count and its rupee-equivalent at the 10-points-per-
// rupee redemption rate.
//
// Moved from lib/bargain-utils.ts as part of Phase 2 (these aren't
// bargain-domain — they're cross-cutting display utilities).
import { STORE_CONFIG } from "./config";

export function formatCurrency(amount: number, currency = "PKR"): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString()} points (Rs ${(points * STORE_CONFIG.pointsToRupeeRate).toFixed(1)})`;
}
