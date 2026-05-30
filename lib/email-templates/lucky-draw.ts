import { formatCurrency } from '@/lib/utils';
import { sendEmail } from '@/lib/email';
import { ClientOrder } from '@/types';
import { BRAND_COLORS, baseEmailTemplate, formatDate } from './_base';

interface LuckyDrawEntry {
  _id: string; // Allows for Mongoose ObjectId without strict type errors
  entryNumber?: string | number;
}

interface WinningEntry {
  _id: string; // 'any' allows for Mongoose ObjectId without strict typing issues
  entryNumber?: string | number;
}

interface LuckyDrawDetails {
  _id: string;
  title: string;
  prizeName: string;
  prizeDescription?: string;
  resultDate?: string | Date;
  winnerAnnouncedAt?: string | Date; // Used to check if winner was announced live
  endDate?: string | Date;
}

// 8. LUCKY DRAW ENTRY EMAIL
export async function sendLuckyDrawEntryEmail(
  user: { email: string; name?: string },
  entry: LuckyDrawEntry,
  draw: LuckyDrawDetails,
  order: ClientOrder
): Promise<boolean> {
  const entryNumber = entry.entryNumber || entry._id.toString().slice(-8).toUpperCase();
  const orderTotal = formatCurrency(order.grandTotal);

  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🎪 Congratulations! Lucky Draw Entry Added</h2>
    <p>Dear <strong>${user.name || 'Lucky Customer'}</strong>,</p>
    <p>You've earned an automatic lucky draw entry for your order <strong>MPM-${order._id.toString().slice(-6).toUpperCase()}</strong>!</p>

    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.accent}20, ${BRAND_COLORS.primary}20);
                border-radius: 12px; padding: 2rem; margin: 1.5rem 0; text-align: center;
                border: 3px dashed ${BRAND_COLORS.accent};">
      <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎰</div>
      <div style="font-size: 1.5rem; font-weight: 800; color: ${BRAND_COLORS.dark}; margin-bottom: 0.5rem;">
        You're in the Draw!
      </div>
      <div style="font-size: 0.875rem; color: #6b7280;">
        For orders over Rs 3000
      </div>
    </div>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">🎯 Entry Details</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p class="mb-2"><strong>Draw:</strong></p>
          <p style="font-weight: 600; color: ${BRAND_COLORS.primary};">${draw.title}</p>
        </div>
        <div>
          <p class="mb-2"><strong>Entry Number:</strong></p>
          <p><code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">${entryNumber}</code></p>
        </div>
      </div>

      <p class="mb-2"><strong>Prize:</strong></p>
      <p style="font-size: 1.25rem; color: ${BRAND_COLORS.accent}; font-weight: 700;">
        🏆 ${draw.prizeName}
      </p>

      ${draw.prizeDescription ? `
      <p class="mb-2"><strong>Prize Details:</strong></p>
      <p>${draw.prizeDescription}</p>
      ` : ''}

      <p class="mb-2"><strong>Qualifying Order:</strong></p>
      <p>
        Order #MPM-${order._id.toString().slice(-6).toUpperCase()}<br>
        <span style="color: #6b7280; font-size: 0.875rem;">${orderTotal} (Rs 3000+ order)</span>
      </p>
    </div>

    <div class="highlight">
      <p class="mb-2"><strong>📅 Important Dates:</strong></p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <p style="margin: 0; font-size: 0.875rem;">Draw Ends:</p>
          <p style="margin: 0.25rem 0 0 0; font-weight: 600;">
            ${draw.endDate ? formatDate(draw.endDate) : 'To be announced'}
          </p>
        </div>
        <div>
          <p style="margin: 0; font-size: 0.875rem;">Winner Announcement:</p>
          <p style="margin: 0.25rem 0 0 0; font-weight: 600;">
            ${draw.resultDate ? formatDate(draw.resultDate) : 'After draw ends'}
          </p>
        </div>
      </div>
    </div>

    <div style="background: rgba(234, 183, 95, 0.1); border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
      <p style="margin: 0; display: flex; align-items: flex-start; gap: 0.5rem;">
        <span style="color: ${BRAND_COLORS.secondary}; font-size: 1.25rem;">💡</span>
        <span>
          <strong>How Winners Are Chosen:</strong> Admin will spin a virtual wheel live on the website.
          All entries have equal chance!
        </span>
      </p>
    </div>

    <div class="text-center">
      <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/lucky-draw" class="btn">
        🎪 View All Your Entries
      </a>
      <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
        Good luck! 🍀
      </p>
    </div>

    <p class="mt-4">Best of luck in the draw!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Lucky Draw Entry: ${draw.title}`);

  return await sendEmail({
    to: user.email,
    subject: `🎪 Lucky Draw Entry Added! - ${draw.title}`,
    html,
  });
}

// 9. LUCKY DRAW WINNER EMAIL
export async function sendLuckyDrawWinnerEmail(
  user: { email: string; name?: string },
  entry: WinningEntry,
  draw: LuckyDrawDetails
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary}; text-align: center;" class="mb-3">
      🎊 CONGRATULATIONS! YOU WON! 🎊
    </h2>

    <div style="text-align: center; margin: 2rem 0;">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
      <div style="font-size: 2rem; font-weight: 800; color: ${BRAND_COLORS.secondary}; margin-bottom: 0.5rem;">
        You're a Winner!
      </div>
      <div style="font-size: 1.25rem; color: ${BRAND_COLORS.dark};">
        ${draw.title}
      </div>
    </div>

    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.secondary}20, ${BRAND_COLORS.primary}20);
                border-radius: 12px; padding: 2rem; margin: 1.5rem 0; text-align: center;">
      <div style="font-size: 1.5rem; font-weight: 700; color: ${BRAND_COLORS.dark}; margin-bottom: 0.5rem;">
        Your Prize
      </div>
      <div style="font-size: 2rem; color: ${BRAND_COLORS.accent}; font-weight: 800; margin-bottom: 1rem;">
        🎁 ${draw.prizeName}
      </div>
      ${draw.prizeDescription ? `
      <p style="margin: 0; color: #6b7280;">${draw.prizeDescription}</p>
      ` : ''}
    </div>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">📋 Winning Details</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p class="mb-2"><strong>Draw:</strong></p>
          <p>${draw.title}</p>
        </div>
        <div>
          <p class="mb-2"><strong>Entry Number:</strong></p>
          <p><code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">
            ${entry.entryNumber || entry._id.toString().slice(-8).toUpperCase()}
          </code></p>
        </div>
      </div>

      <p class="mb-2"><strong>Announced On:</strong></p>
      <p>${formatDate(draw.resultDate || new Date())}</p>

      ${draw.winnerAnnouncedAt ? `
      <p class="mb-2"><strong>Winner Selected:</strong></p>
      <p>Via live spin wheel selection</p>
      ` : ''}
    </div>

    <div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0;
                border-left: 4px solid #10b981;">
      <h4 style="color: #047857; margin-top: 0;" class="mb-3">✅ Next Steps to Claim Your Prize</h4>
      <ol style="padding-left: 1.5rem; margin: 0;">
        <li>Our team will contact you within <strong>24 hours</strong> via phone</li>
        <li>Verify your identity with order details</li>
        <li>Prize will be shipped to your registered address</li>
        <li>Delivery within 7-10 business days</li>
      </ol>
      <p style="margin-top: 1rem; color: #047857;">
        <strong>⚠️ Important:</strong> Please ensure your phone number is updated in your account.
      </p>
    </div>

    <div class="text-center">
      <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/lucky-draw" class="btn" style="background: linear-gradient(135deg, ${BRAND_COLORS.secondary}, #fbbf24);">
        🏆 View Your Winning Entry
      </a>
      <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
        or call us at <strong>${process.env.SUPPORT_PHONE || '+92 325 4007037'}</strong>
      </p>
    </div>

    <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 1.5rem; color: ${BRAND_COLORS.primary};">
        🎉 Congratulations again! 🎉
      </p>
      <p style="margin: 0.5rem 0 0 0;">
        Thank you for shopping with Mega Prize Mall!
      </p>
    </div>
  `;

  const html = baseEmailTemplate(content, `CONGRATULATIONS! You Won: ${draw.prizeName}`);

  return await sendEmail({
    to: user.email,
    subject: `🏆 CONGRATULATIONS! You Won: ${draw.prizeName}`,
    html,
  });
}

// 10. LUCKY DRAW RESULTS EMAIL (to all participants)
export async function sendLuckyDrawResultsEmail(
  user: { email: string; name?: string },
  draw: LuckyDrawDetails,
  winnerName: string,
  userEntryCount: number
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🎪 Lucky Draw Results Announced</h2>
    <p>Dear <strong>${user.name || 'Valued Customer'}</strong>,</p>
    <p>The lucky draw <strong>"${draw.title}"</strong> has concluded and the winner has been selected!</p>

    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}20, ${BRAND_COLORS.accent}20);
                border-radius: 12px; padding: 2rem; margin: 1.5rem 0; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 1rem;">🏆</div>
      <div style="font-size: 1.5rem; font-weight: 800; color: ${BRAND_COLORS.dark}; margin-bottom: 0.5rem;">
        And the winner is...
      </div>
      <div style="font-size: 1.75rem; color: ${BRAND_COLORS.accent}; font-weight: 700; margin-bottom: 1rem;">
        ${winnerName}
      </div>
      <div style="font-size: 1.1rem; color: ${BRAND_COLORS.primary};">
        Prize: <strong>${draw.prizeName}</strong>
      </div>
    </div>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">📊 Your Participation</h3>

      <div style="text-align: center; padding: 1rem;">
        <div style="font-size: 3rem; color: ${BRAND_COLORS.primary}; font-weight: 800; margin-bottom: 0.5rem;">
          ${userEntryCount}
        </div>
        <div style="font-size: 1.1rem; color: ${BRAND_COLORS.dark};">
          Entries in This Draw
        </div>
        <p style="margin-top: 0.5rem; color: #6b7280; font-size: 0.875rem;">
          Thank you for participating!
        </p>
      </div>

      <p style="text-align: center; margin: 1rem 0 0 0;">
        <a href="${process.env.NEXTAUTH_URL}/lucky-draw/results/${draw._id}"
           style="color: ${BRAND_COLORS.primary}; font-weight: 600;">
          View Full Results & Spin Recording →
        </a>
      </p>
    </div>

    <div style="background: rgba(124, 44, 120, 0.1); border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
      <p style="margin: 0; display: flex; align-items: flex-start; gap: 0.5rem;">
        <span style="color: ${BRAND_COLORS.primary}; font-size: 1.25rem;">🎰</span>
        <span>
          <strong>How the winner was chosen:</strong> Admin spun a virtual wheel with all valid entries.
          The selection was recorded and can be viewed in the results page.
        </span>
      </p>
    </div>

    <div class="highlight">
      <p class="mb-2"><strong>🎯 Next Draw Coming Soon!</strong></p>
      <p style="margin: 0;">Keep shopping to earn more automatic entries:</p>
      <ul style="padding-left: 1.5rem; margin: 0.5rem 0;">
        <li>Orders over Rs 3000 get automatic entry</li>
        <li>No limit on entries per customer</li>
        <li>Draws announced regularly</li>
      </ul>
    </div>

    <div class="text-center">
      <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/lucky-draw" class="btn">
        🎪 View Your Entries
      </a>
      <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
        Better luck next time! 🍀
      </p>
    </div>

    <p class="mt-4">Thank you for participating!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Lucky Draw Results: ${draw.title}`);

  return await sendEmail({
    to: user.email,
    subject: `🎪 Lucky Draw Results: ${draw.title}`,
    html,
  });
}
