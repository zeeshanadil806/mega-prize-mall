import { formatCurrency } from '@/lib/utils';
import { sendEmail } from '@/lib/email';
import { ProductProps } from '@/types';
import { BRAND_COLORS, baseEmailTemplate } from './_base';

interface BargainCouponDetails {
  code: string;
  validUntil: string | Date;
  discountPercentage: number;
  discountAmount: number;
  originalPrice: number;
  discountedPrice: number;
}

// 6. BARGAIN COUPON GENERATED EMAIL
export async function sendBargainCouponEmail(
  coupon: BargainCouponDetails,
  product: ProductProps,
  user: { email: string; name?: string }
): Promise<boolean> {
  const couponCode = coupon.code;
  const validUntil = new Date(coupon.validUntil);
  const expiryTime = validUntil.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const expiryDate = validUntil.toLocaleDateString('en-PK', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hoursLeft = Math.round((validUntil.getTime() - Date.now()) / (1000 * 60 * 60));

  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🎉 Bargain Success! Coupon Generated</h2>
    <p>Dear <strong>${user.name || 'Bargain Master'}</strong>,</p>
    <p>Congratulations! Your bargain for <strong>${product.name}</strong> was accepted!</p>

    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.secondary}20, ${BRAND_COLORS.accent}20);
                border-radius: 12px; padding: 2rem; margin: 1.5rem 0; text-align: center;
                border: 2px solid ${BRAND_COLORS.secondary};">
      <div style="font-size: 0.875rem; color: ${BRAND_COLORS.accent}; font-weight: 600; margin-bottom: 0.5rem;">
        YOUR EXCLUSIVE COUPON CODE
      </div>
      <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: 4px; color: ${BRAND_COLORS.dark};
                  background: ${BRAND_COLORS.white}; padding: 1rem; border-radius: 8px;
                  border: 3px dashed ${BRAND_COLORS.primary}; margin: 1rem 0;">
        ${couponCode}
      </div>
      <div style="font-size: 1.25rem; color: ${BRAND_COLORS.primary}; font-weight: 700; margin: 1rem 0;">
        ${coupon.discountPercentage}% OFF
      </div>
      <div style="display: inline-block; background: ${BRAND_COLORS.accent}; color: white;
                  padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600;">
        Save ${formatCurrency(coupon.discountAmount)}
      </div>
    </div>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">📋 Bargain Details</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p class="mb-2"><strong>Product:</strong></p>
          <p>${product.name}</p>
        </div>
        <div>
          <p class="mb-2"><strong>Original Price:</strong></p>
          <p style="text-decoration: line-through; color: #6b7280;">
            ${formatCurrency(coupon.originalPrice)}
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p class="mb-2"><strong>Your Price:</strong></p>
          <p style="font-size: 1.25rem; color: ${BRAND_COLORS.accent}; font-weight: 700;">
            ${formatCurrency(coupon.discountedPrice)}
          </p>
        </div>
        <div>
          <p class="mb-2"><strong>You Save:</strong></p>
          <p style="color: #10b981; font-weight: 600;">
            ${formatCurrency(coupon.discountAmount)} (${coupon.discountPercentage}%)
          </p>
        </div>
      </div>
    </div>

    <!-- EXPIRY WARNING -->
    <div style="background: linear-gradient(135deg, #fef3c7, #fde68a);
                border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;
                border-left: 4px solid #f59e0b;">
      <h4 style="color: #92400e; margin-top: 0; display: flex; align-items: center; gap: 0.5rem;">
        ⏰ <span>Limited Time Offer!</span>
      </h4>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
        <div>
          <p style="margin: 0; font-size: 0.875rem; color: #92400e;">Expires In:</p>
          <p style="margin: 0.25rem 0 0 0; font-size: 1.5rem; font-weight: 800; color: #92400e;">
            ${hoursLeft} hours
          </p>
        </div>
        <div>
          <p style="margin: 0; font-size: 0.875rem; color: #92400e;">Valid Until:</p>
          <p style="margin: 0.25rem 0 0 0; font-weight: 600; color: #92400e;">
            ${expiryDate}<br>
            ${expiryTime}
          </p>
        </div>
      </div>

      <p style="margin: 0; font-size: 0.875rem; color: #92400e;">
        ⚡ This coupon is valid for <strong>24 hours only</strong>. Use it before it expires!
      </p>
    </div>

    <!-- HOW TO USE -->
    <div class="highlight">
      <p class="mb-2"><strong>🎯 How to Use This Coupon:</strong></p>
      <ol style="padding-left: 1.5rem; margin: 0;">
        <li>Add <strong>${product.name}</strong> to your cart</li>
        <li>Proceed to checkout</li>
        <li>Apply coupon code: <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">${couponCode}</code></li>
        <li>Discount will be automatically applied</li>
      </ol>
      <p style="margin-top: 0.75rem; font-size: 0.875rem; color: #6b7280;">
        💡 This coupon is only valid for the specific product you bargained for.
      </p>
    </div>

    <div class="text-center mt-4">
      <a href="${process.env.NEXTAUTH_URL}/products/${product.slug}" class="btn">
        🛒 Use Coupon Now
      </a>
      <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
        or <a href="${process.env.NEXTAUTH_URL}/customer/dashboard" style="color: ${BRAND_COLORS.primary};">
          View in Dashboard
        </a>
      </p>
    </div>

    <p class="mt-4">Happy Shopping!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Bargain Coupon: ${couponCode}`);

  return await sendEmail({
    to: user.email,
    subject: `🎉 Bargain Success! ${coupon.discountPercentage}% OFF Coupon: ${couponCode}`,
    html,
  });
}

interface BargainCoupon {
  code: string;
  validUntil: string | Date;
  discountPercentage: number;
  discountAmount: number;
}

// 7. BARGAIN COUPON EXPIRING SOON EMAIL
export async function sendBargainExpiryReminderEmail(
  coupon: BargainCoupon,
  product: ProductProps,
  user: { email: string; name?: string },
  hoursLeft: number
): Promise<boolean> {
  const couponCode = coupon.code;
  const validUntil = new Date(coupon.validUntil);
  const expiryTime = validUntil.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">⏰ Your Bargain Coupon Expires Soon!</h2>
    <p>Dear <strong>${user.name || 'Valued Customer'}</strong>,</p>
    <p>Your exclusive bargain coupon for <strong>${product.name}</strong> will expire in <strong>${hoursLeft} hours</strong>!</p>

    <div style="background: linear-gradient(135deg, #fee2e2, #fecaca);
                border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;
                border: 2px solid #ef4444;">
      <div style="text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔥</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #dc2626; margin-bottom: 0.5rem;">
          ${hoursLeft} HOURS LEFT
        </div>
        <div style="color: #7f1d1d; margin-bottom: 1rem;">
          Expires: ${expiryTime}
        </div>
      </div>
    </div>

    <div style="background: ${BRAND_COLORS.white}; border-radius: 10px; padding: 1.5rem;
                border: 2px solid ${BRAND_COLORS.secondary}; margin: 1.5rem 0;">
      <div style="text-align: center; margin-bottom: 1rem;">
        <div style="font-size: 1.25rem; font-weight: 700; color: ${BRAND_COLORS.dark}; margin-bottom: 0.5rem;">
          Your Coupon Code
        </div>
        <div style="font-size: 2rem; font-weight: 800; letter-spacing: 3px; color: ${BRAND_COLORS.primary};
                    background: #f3f4f6; padding: 1rem; border-radius: 8px;">
          ${couponCode}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
        <div style="text-align: center;">
          <div style="font-size: 0.875rem; color: #6b7280;">Discount</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: ${BRAND_COLORS.accent};">
            ${coupon.discountPercentage}% OFF
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.875rem; color: #6b7280;">You Save</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #10b981;">
            ${formatCurrency(coupon.discountAmount)}
          </div>
        </div>
      </div>
    </div>

    <div class="highlight">
      <p class="mb-2"><strong>🎯 Don't Miss Out!</strong></p>
      <p style="margin: 0;">This coupon was earned through bargaining and is:</p>
      <ul style="padding-left: 1.5rem; margin: 0.5rem 0;">
        <li>Valid only for <strong>${product.name}</strong></li>
        <li>Cannot be transferred or extended</li>
        <li>Will expire automatically</li>
      </ul>
    </div>

    <div style="background: rgba(234, 183, 95, 0.1); border-radius: 8px; padding: 1rem; margin: 1.5rem 0;">
      <p style="margin: 0; display: flex; align-items: flex-start; gap: 0.5rem;">
        <span style="color: ${BRAND_COLORS.secondary}; font-size: 1.25rem;">💡</span>
        <span>
          <strong>Pro Tip:</strong> Add to cart now and complete checkout later.
          The coupon will be reserved once added to cart!
        </span>
      </p>
    </div>

    <div class="text-center">
      <a href="${process.env.NEXTAUTH_URL}/products/${product.slug}" class="btn" style="background-color: #dc2626;">
        🔥 Use Coupon Before Expiry
      </a>
      <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
        <a href="${process.env.NEXTAUTH_URL}/customer/dashboard" style="color: ${BRAND_COLORS.primary};">
          View all your coupons →
        </a>
      </p>
    </div>

    <p class="mt-4">This is your final reminder!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Coupon Expiring Soon: ${couponCode}`);

  return await sendEmail({
    to: user.email,
    subject: `⏰ LAST CHANCE! ${coupon.discountPercentage}% OFF Coupon Expires in ${hoursLeft} hours`,
    html,
  });
}
