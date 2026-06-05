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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString()} points (Rs ${(points * 0.1).toFixed(1)})`;
}
