import { formatCurrency } from '@/lib/utils';
import { sendEmail, ADMIN_EMAIL } from '@/lib/email';
import { ClientOrder, ClientOrderItem, OrderDetails } from '@/types';
import { BRAND_COLORS, baseEmailTemplate, formatDate } from './_base';

// 1. ORDER CONFIRMATION EMAIL
export async function sendOrderConfirmationEmail(
  order: OrderDetails,
  user: { email: string; name?: string }
): Promise<boolean> {
  const orderTotal = formatCurrency(order.grandTotal);
  const orderDate = formatDate(order.createdAt);
  const shortOrderId = order._id.toString().slice(-6).toUpperCase();

  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🎉 Order Confirmed!</h2>
    <p>Dear <strong>${user.name || 'Valued Customer'}</strong>,</p>
    <p>Thank you for shopping at Mega Prize Mall! Your order has been received and is being processed.</p>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="text-center mb-4">📋 Order Summary</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p class="mb-2"><strong>Order ID:</strong></p>
          <p><code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">MPM-${shortOrderId}</code></p>
        </div>
        <div>
          <p class="mb-2"><strong>Order Date:</strong></p>
          <p>${orderDate}</p>
        </div>
      </div>

      <p class="mb-2"><strong>Total Amount:</strong></p>
      <p style="font-size: 1.5rem; color: ${BRAND_COLORS.primary}; font-weight: 800;" class="mb-3">${orderTotal}</p>

      <p class="mb-2"><strong>Payment Method:</strong></p>
      <p>💵 Cash on Delivery</p>

      <p class="mb-2"><strong>Shipping Address:</strong></p>
      <p>
        ${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.addressLine1}<br>
        ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
        ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
        ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
      </p>

      <div class="highlight mt-4">
        <p class="mb-2"><strong>🎁 Points Earned:</strong></p>
        <p style="margin: 0;">
          <span class="points-badge">${order.pointsEarned} Points</span>
          <span style="font-size: 0.875rem; color: #6b7280; margin-left: 0.5rem;">
            (Will be added after delivery)
          </span>
        </p>
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">
          Use points for discounts in future orders! (10 points = Rs 1)
        </p>
      </div>
    </div>

    <div class="text-center mb-4">
      <p class="mb-3">Track your order status anytime from your dashboard:</p>
      <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/orders" class="btn">
        📱 View Order Details
      </a>
    </div>

    <p class="mb-3"><strong>What's Next?</strong></p>
    <ul style="padding-left: 1.5rem; margin-bottom: 1.5rem;">
      <li>We'll notify you when your order ships</li>
      <li>You'll earn points after delivery</li>
      <li>Orders over Rs 3000 get automatic lucky draw entries!</li>
    </ul>

    <p>Thank you for choosing Mega Prize Mall!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Order Confirmation #MPM-${shortOrderId}`);

  return await sendEmail({
    to: user.email,
    subject: `✅ Order Confirmed #MPM-${shortOrderId} - ${orderTotal}`,
    html,
  });
}

// 2. ADMIN NOTIFICATION FOR NEW ORDER
export async function sendAdminOrderNotification(order: ClientOrder): Promise<boolean> {
  const orderTotal = formatCurrency(order.grandTotal);
  const shortOrderId = order._id.toString().slice(-6).toUpperCase();
  const itemCount = order.items.reduce((sum: number, item: ClientOrderItem) => sum + item.quantity, 0);

  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🛒 New Order Received!</h2>
    <p>A new order has been placed on Mega Prize Mall and requires your attention.</p>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">📊 Order Details</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p class="mb-2"><strong>Order ID:</strong></p>
          <p><code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">MPM-${shortOrderId}</code></p>
        </div>
        <div>
          <p class="mb-2"><strong>Customer ID:</strong></p>
          <p>${order.userId.slice(-8)}</p>
        </div>
      </div>

      <p class="mb-2"><strong>Total Amount:</strong></p>
      <p style="font-size: 1.25rem; color: ${BRAND_COLORS.accent}; font-weight: 700;">${orderTotal}</p>

      <p class="mb-2"><strong>Order Items:</strong></p>
      <p>${itemCount} item${itemCount > 1 ? 's' : ''} across ${order.items.length} product${order.items.length > 1 ? 's' : ''}</p>

      <p class="mb-2"><strong>Shipping Method:</strong></p>
      <p>${order.shippingMethod === 'express' ? '🚀 Express' : '📦 Standard'} Shipping</p>

      <p class="mb-2"><strong>Delivery Address:</strong></p>
      <p style="background: #f9fafb; padding: 0.75rem; border-radius: 6px; font-size: 0.875rem;">
        ${order.shippingAddress.fullName}<br>
        📞 ${order.shippingAddress.phone}<br>
        📍 ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}<br>
        ${order.shippingAddress.state}, ${order.shippingAddress.country}
      </p>

      ${order.pointsRedeemed > 0 ? `
      <div style="background: rgba(234, 183, 95, 0.1); padding: 0.75rem; border-radius: 6px; margin-top: 1rem;">
        <p class="mb-1"><strong>🪙 Points Redeemed:</strong></p>
        <p style="margin: 0;">${order.pointsRedeemed} points (Rs ${(order.pointsRedeemed * 0.1).toFixed(2)})</p>
      </div>
      ` : ''}

      ${order.pointsEarned > 0 ? `
      <div style="background: rgba(124, 44, 120, 0.1); padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem;">
        <p class="mb-1"><strong>🎯 Points to Earn:</strong></p>
        <p style="margin: 0;">${order.pointsEarned} points (after delivery)</p>
      </div>
      ` : ''}
    </div>

    <div class="text-center">
      <a href="${process.env.NEXTAUTH_URL}/admin/orders" class="btn">
        ⚡ Process This Order
      </a>
    </div>

    <p class="mt-4" style="font-size: 0.875rem; color: #6b7280;">
      This order was placed on ${formatDate(order.createdAt)}
    </p>
  `;

  const html = baseEmailTemplate(content, `New Order #MPM-${shortOrderId}`);

  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🛒 New Order #MPM-${shortOrderId} - ${orderTotal}`,
    html,
  });
}

// 3. ORDER SHIPPED EMAIL
export async function sendOrderShippedEmail(
  order: ClientOrder,
  user: { email: string; name?: string },
  trackingInfo?: { number?: string; carrier?: string; url?: string }
): Promise<boolean> {
  const shortOrderId = order._id.toString().slice(-6).toUpperCase();

  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🚚 Your Order Has Shipped!</h2>
    <p>Dear <strong>${user.name || 'Valued Customer'}</strong>,</p>
    <p>Great news! Your order <strong>MPM-${shortOrderId}</strong> has been shipped and is on its way to you.</p>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">📦 Shipping Details</h3>

      <p class="mb-2"><strong>Order ID:</strong></p>
      <p><code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">MPM-${shortOrderId}</code></p>

      ${trackingInfo?.number ? `
      <p class="mb-2"><strong>Tracking Number:</strong></p>
      <p style="font-size: 1.1rem; font-weight: 600; color: ${BRAND_COLORS.accent};">
        ${trackingInfo.number}
      </p>
      ` : ''}

      ${trackingInfo?.carrier ? `
      <p class="mb-2"><strong>Shipping Carrier:</strong></p>
      <p>${trackingInfo.carrier}</p>
      ` : ''}

      ${trackingInfo?.url ? `
      <p class="mb-2"><strong>Track Your Package:</strong></p>
      <p>
        <a href="${trackingInfo.url}" style="color: ${BRAND_COLORS.primary}; font-weight: 500;">
          Click here to track delivery status →
        </a>
      </p>
      ` : ''}

      <p class="mb-2"><strong>Estimated Delivery:</strong></p>
      <p>
        ${order.estimatedDelivery
          ? formatDate(order.estimatedDelivery)
          : 'Within 3-7 business days'
        }
      </p>

      <p class="mb-2"><strong>Shipping Address:</strong></p>
      <p style="background: #f9fafb; padding: 0.75rem; border-radius: 6px; font-size: 0.875rem;">
        ${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.addressLine1}<br>
        ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
        ${order.shippingAddress.city}, ${order.shippingAddress.state}
      </p>
    </div>

    <div class="highlight mt-4">
      <p class="mb-2"><strong>📝 Important Notes:</strong></p>
      <ul style="padding-left: 1.5rem; margin: 0;">
        <li>Please ensure someone is available to receive the package</li>
        <li>You'll earn <strong>${order.pointsEarned} points</strong> after delivery</li>
        ${order.grandTotal >= 3000 ? '<li>This order qualifies for automatic lucky draw entry!</li>' : ''}
      </ul>
    </div>

    <div class="text-center mt-4">
      <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/orders/${order._id}" class="btn">
        📱 View Order Details
      </a>
    </div>

    <p class="mt-4">We'll notify you once your order is delivered.<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Order Shipped #MPM-${shortOrderId}`);

  return await sendEmail({
    to: user.email,
    subject: `🚚 Order Shipped #MPM-${shortOrderId}`,
    html,
  });
}

// 4. ORDER DELIVERED EMAIL (WITH POINTS EARNED)
export async function sendOrderDeliveredEmail(
  order: ClientOrder,
  user: { email: string; name?: string },
  pointsEarned: number,
  luckyDrawEntry?: { drawTitle: string; entryId: string }
): Promise<boolean> {
  const shortOrderId = order._id.toString().slice(-6).toUpperCase();
  const orderTotal = formatCurrency(order.grandTotal);

  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary};" class="mb-3">🎊 Order Delivered Successfully!</h2>
    <p>Dear <strong>${user.name || 'Valued Customer'}</strong>,</p>
    <p>Your order <strong>MPM-${shortOrderId}</strong> has been delivered. We hope you're enjoying your purchase!</p>

    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">🎁 Delivery Confirmed</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p class="mb-2"><strong>Order ID:</strong></p>
          <p>MPM-${shortOrderId}</p>
        </div>
        <div>
          <p class="mb-2"><strong>Delivered On:</strong></p>
          <p>${formatDate(new Date())}</p>
        </div>
      </div>

      <p class="mb-2"><strong>Order Total:</strong></p>
      <p style="font-size: 1.25rem; color: ${BRAND_COLORS.accent}; font-weight: 700;">${orderTotal}</p>
    </div>

    <!-- POINTS EARNED SECTION -->
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.secondary}20, ${BRAND_COLORS.primary}20);
                border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0; border: 2px dashed ${BRAND_COLORS.secondary};">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">🪙 Points Rewarded!</h3>

      <div style="text-align: center; margin: 1rem 0;">
        <div style="font-size: 2.5rem; color: ${BRAND_COLORS.secondary}; font-weight: 800; margin-bottom: 0.5rem;">
          +${pointsEarned}
        </div>
        <div style="font-size: 1.1rem; color: ${BRAND_COLORS.dark}; font-weight: 600;">
          Points Added to Your Wallet
        </div>
      </div>

      <p style="text-align: center; margin-bottom: 0;">
        <strong>💰 Value:</strong> ${formatCurrency(pointsEarned * 0.1)}
        <span style="color: #6b7280; margin-left: 0.5rem;">(10 points = Rs 1)</span>
      </p>

      <div style="background: ${BRAND_COLORS.white}; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
        <p class="mb-2"><strong>🎯 How to Use Points:</strong></p>
        <ul style="padding-left: 1.5rem; margin: 0;">
          <li>Redeem in checkout (max 10% of order value)</li>
          <li>1 point = Rs 0.10 discount</li>
          <li>No minimum redemption</li>
          <li>Points never expire</li>
        </ul>
      </div>
    </div>

    <!-- LUCKY DRAW SECTION (if applicable) -->
    ${luckyDrawEntry ? `
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.accent}20, ${BRAND_COLORS.primary}20);
                border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid ${BRAND_COLORS.accent};">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">🎪 Lucky Draw Entry Added!</h3>

      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div style="font-size: 2rem;">🎰</div>
        <div>
          <p style="margin: 0; font-weight: 600;">You've earned an automatic entry!</p>
          <p style="margin: 0.25rem 0 0 0; color: #6b7280; font-size: 0.875rem;">
            For orders over Rs 3000
          </p>
        </div>
      </div>

      <p><strong>Draw:</strong> ${luckyDrawEntry.drawTitle}</p>
      <p><strong>Entry ID:</strong> ${luckyDrawEntry.entryId.slice(-8)}</p>

      <div style="margin-top: 1rem;">
        <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/lucky-draw"
           style="color: ${BRAND_COLORS.accent}; font-weight: 600; text-decoration: none;">
          🎯 View Your Lucky Draw Entries →
        </a>
      </div>
    </div>
    ` : ''}

    <div class="text-center">
      <p class="mb-3">Need help with your order or want to leave feedback?</p>
      <a href="${process.env.NEXTAUTH_URL}/customer/dashboard/orders/${order._id}" class="btn">
        📝 View Order Details
      </a>
    </div>

    <p class="mt-4">Thank you for shopping with us!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;

  const html = baseEmailTemplate(content, `Order Delivered #MPM-${shortOrderId}`);

  return await sendEmail({
    to: user.email,
    subject: `🎊 Order Delivered #MPM-${shortOrderId} +${pointsEarned} Points!`,
    html,
  });
}
