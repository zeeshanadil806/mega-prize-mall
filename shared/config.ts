/**
 * Global Store Configuration & Constants
 * Centralizes duplicate business logic, support details, and multipliers.
 */
export const STORE_CONFIG = {
  name: "Mega Prize Mall",
  supportPhone: "923254007037",
  supportEmail: "support@megaprizemall.com",
  pointsToRupeeRate: 0.1, // 10 points = Rs 1
  whatsappLink: "https://wa.me/923254007037",
} as const;

/**
 * Calculates the monetary discount value in Rupees for a given points balance.
 */
export function getPointsValue(points: number): number {
  return points * STORE_CONFIG.pointsToRupeeRate;
}

/**
 * Generates a direct WhatsApp link with a pre-filled message text.
 */
export function getWhatsAppSupportLink(message?: string): string {
  if (!message) return STORE_CONFIG.whatsappLink;
  return `${STORE_CONFIG.whatsappLink}?text=${encodeURIComponent(message)}`;
}
