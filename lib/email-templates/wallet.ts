import { formatCurrency } from '@/lib/utils';
import { sendEmail } from '@/lib/email';
import { BRAND_COLORS, baseEmailTemplate } from './_base';

// 5. POINTS EARNED EMAIL (Standalone - if needed elsewhere)
export async function sendPointsEarnedEmail(
  user: { email: string; name?: string },
  points: number,
  reason: string,
  orderId?: string
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🪙 Points Added to Your Wallet!</h2>
    <p>Dear <strong>${user.name || 'Valued Customer'}</strong>,</p>
    <p>You've earned <strong>${points} points</strong> in your Mega Prize Mall wallet.</p>

    <div style="text-align: center; margin: 2rem 0;">
      <div style="font-size: 3rem; color: ${BRAND_COLORS.secondary}; font-weight: 800; margin-bottom: 0.5rem;">
        +${points}
      </div>
      <div style="font-size: 1.2rem; color: ${BRAND_COLORS.dark};">
        Points Added
      </div>
    </div>

    <div class="order-card">
      <p class="mb-2"><strong>Reason:</strong></p>
      <p>${reason}</p>

      ${orderId ? `
      <p class="mb-2"><strong>Order ID:</strong></p>
      <p>MPM-${orderId.toString().slice(-6).toUpperCase()}</p>
      ` : ''}

      <p class="mb-2"><strong>Points Value:</strong></p>
      <p style="color: ${BRAND_COLORS.accent}; font-weight: 600;">
        ${formatCurrency(points * 0.1)} (10 points = Rs 1)
      </p>
    </div>

    <div class="highlight">
      <p class="mb-2"><strong>🎯 How to Use Your Points:</strong></p>
      <ul style="padding-left: 1.5rem; margin: 0;">
        <li>Redeem at checkout for discounts</li>
        <li>Max 10% of order value</li>
        <li>No minimum order required</li>
        <li>Combine with other offers</li>
      </ul>
    </div>

    <div class="text-center mt-4">
      <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/wallet" class="btn">
        💰 View Wallet Balance
      </a>
    </div>

    <p class="mt-4">Happy Shopping!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Points Earned +${points}`);

  return await sendEmail({
    to: user.email,
    subject: `🪙 +${points} Points Added to Your Wallet`,
    html,
  });
}
