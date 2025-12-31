import { formatCurrency } from '@/lib/utils';
import { sendEmail, ADMIN_EMAIL } from './email';
import { ClientOrder, ClientOrderItem, OrderDetails, ProductProps } from '@/types';

// YOUR EXACT BRAND COLORS
const BRAND_COLORS = {
  primary: '#7C2C78',      // Purple
  secondary: '#EAB75F',    // Gold
  accent: '#A43875',       // Pink
  dark: '#2E297D',         // Dark Blue
  light: '#F8F9FA',        // Off-white
  white: '#FFFFFF',
  black: '#171717',
};

// Base email template with YOUR brand colors
const baseEmailTemplate = (content: string, title?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Mega Prize Mall'}</title>
  <style>
    /* Email-compatible styles with YOUR brand colors */
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      margin: 0; 
      padding: 0; 
      background-color: ${BRAND_COLORS.light}; 
      color: ${BRAND_COLORS.black};
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: ${BRAND_COLORS.white}; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.dark} 100%); 
      color: ${BRAND_COLORS.white}; 
      padding: 2.5rem 2rem; 
      text-align: center; 
    }
    .content { 
      padding: 2rem; 
      line-height: 1.6;
    }
    .footer { 
      background-color: ${BRAND_COLORS.light}; 
      padding: 1.5rem; 
      text-align: center; 
      color: #6b7280; 
      font-size: 0.875rem; 
      border-top: 1px solid #e5e7eb;
    }
    .btn { 
      display: inline-block; 
      padding: 0.75rem 1.5rem; 
      background-color: ${BRAND_COLORS.primary}; 
      color: ${BRAND_COLORS.white}; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .btn:hover {
      background-color: ${BRAND_COLORS.dark};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 44, 120, 0.3);
    }
    .btn-secondary {
      background-color: ${BRAND_COLORS.secondary};
      color: ${BRAND_COLORS.black};
    }
    .order-card { 
      border: 1px solid #e5e7eb; 
      border-radius: 10px; 
      padding: 1.5rem; 
      margin: 1.5rem 0; 
      background-color: ${BRAND_COLORS.light};
    }
    .text-primary { color: ${BRAND_COLORS.primary}; }
    .text-secondary { color: ${BRAND_COLORS.secondary}; }
    .text-accent { color: ${BRAND_COLORS.accent}; }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .highlight {
      background-color: rgba(234, 183, 95, 0.1);
      border-left: 4px solid ${BRAND_COLORS.secondary};
      padding: 1rem;
      border-radius: 4px;
    }
    .points-badge {
      display: inline-block;
      background: linear-gradient(135deg, ${BRAND_COLORS.secondary}, #ffd166);
      color: ${BRAND_COLORS.black};
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.875rem;
    }
    @media (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .header, .content {
        padding: 1.5rem 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 2rem; font-weight: 800;">🎁 Mega Prize Mall</h1>
      <p style="margin-top: 0.5rem; opacity: 0.9; font-size: 1.1rem;">Your Rewarding Shopping Experience</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0;">© ${new Date().getFullYear()} Mega Prize Mall. All rights reserved.</p>
      <p style="margin: 0.5rem 0 0 0;">
        Need help? 
        <a href="mailto:${ADMIN_EMAIL}" style="color: ${BRAND_COLORS.primary}; text-decoration: none; font-weight: 500;">
          Contact Support
        </a>
      </p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #9ca3af;">
        Shop. Save. Win. Repeat.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Format date helper
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
          Use points for discounts in future orders! (10 points = ₹1)
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
      <li>Orders over ₹3000 get automatic lucky draw entries!</li>
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
        <p style="margin: 0;">${order.pointsRedeemed} points (₹${(order.pointsRedeemed * 0.1).toFixed(2)})</p>
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
//   const orderDate = formatDate(order.createdAt);
  
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
        <span style="color: #6b7280; margin-left: 0.5rem;">(10 points = ₹1)</span>
      </p>
      
      <div style="background: ${BRAND_COLORS.white}; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
        <p class="mb-2"><strong>🎯 How to Use Points:</strong></p>
        <ul style="padding-left: 1.5rem; margin: 0;">
          <li>Redeem in checkout (max 10% of order value)</li>
          <li>1 point = ₹0.10 discount</li>
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
            For orders over ₹3000
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
        ${formatCurrency(points * 0.1)} (10 points = ₹1)
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

interface LuckyDrawEntry {
  _id: string // Allows for Mongoose ObjectId without strict type errors
  entryNumber?: string | number;
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
        For orders over ₹3000
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
        <span style="color: #6b7280; font-size: 0.875rem;">${orderTotal} (₹3000+ order)</span>
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
        or call us at <strong>${process.env.SUPPORT_PHONE || '+92 XXX XXXXXXX'}</strong>
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
        <li>Orders over ₹3000 get automatic entry</li>
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

// 11. WELCOME EMAIL WITH POINTS
export async function sendWelcomeEmail(
  user: { email: string; name: string; id: string },
  emailSubscriberPoints: number = 0,
  referralBonusPoints: number = 0,
  referralCodeUsed?: string,
//   userReferralCode?: string
): Promise<boolean> {
  const totalPoints = emailSubscriberPoints + referralBonusPoints;
  
  const content = `
    <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary}; text-align: center;" class="mb-3">
      🎉 Welcome to Mega Prize Mall!
    </h2>
    
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>Welcome aboard! Your account has been successfully created and you're ready to start your rewarding shopping journey.</p>
    
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.primary}20, ${BRAND_COLORS.accent}20); 
                border-radius: 12px; padding: 2rem; margin: 1.5rem 0; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 1rem;">🪙</div>
      <div style="font-size: 1.5rem; font-weight: 800; color: ${BRAND_COLORS.dark}; margin-bottom: 0.5rem;">
        Your Starting Points Balance
      </div>
      <div style="font-size: 3rem; color: ${BRAND_COLORS.secondary}; font-weight: 800; margin-bottom: 1rem;">
        ${totalPoints}
      </div>
      <div style="color: #6b7280;">
        Total points in your wallet
      </div>
    </div>
    
    <!-- POINTS BREAKDOWN -->
    <div class="order-card">
      <h3 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">📊 Points Breakdown</h3>
      
      ${emailSubscriberPoints > 0 ? `
      <div style="display: flex; justify-content: space-between; align-items: center; 
                  padding: 1rem; background: rgba(124, 44, 120, 0.1); border-radius: 8px; margin-bottom: 0.5rem;">
        <div>
          <p style="margin: 0; font-weight: 600;">Welcome Bonus</p>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
            For joining from our email list
          </p>
        </div>
        <div style="font-size: 1.5rem; font-weight: 800; color: ${BRAND_COLORS.primary};">
          +${emailSubscriberPoints}
        </div>
      </div>
      ` : ''}
      
      ${referralBonusPoints > 0 ? `
      <div style="display: flex; justify-content: space-between; align-items: center; 
                  padding: 1rem; background: rgba(234, 183, 95, 0.1); border-radius: 8px; margin-bottom: 0.5rem;">
        <div>
          <p style="margin: 0; font-weight: 600;">Referral Bonus</p>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
            Using referral code: ${referralCodeUsed}
          </p>
        </div>
        <div style="font-size: 1.5rem; font-weight: 800; color: ${BRAND_COLORS.secondary};">
          +${referralBonusPoints}
        </div>
      </div>
      ` : ''}
      
      ${totalPoints > 0 ? `
      <div style="display: flex; justify-content: space-between; align-items: center; 
                  padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-top: 0.5rem;">
        <div>
          <p style="margin: 0; font-weight: 600;">Total Points</p>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
            Ready to use now!
          </p>
        </div>
        <div style="font-size: 2rem; font-weight: 800; color: #10b981;">
          ${totalPoints}
        </div>
      </div>
      ` : ''}
    </div>
    
    <!-- HOW TO USE POINTS -->
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.secondary}20, #fbbf2420); 
                border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0;">
      <h4 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">💰 How to Use Your Points</h4>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div style="text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛒</div>
          <div style="font-weight: 600;">Redeem at Checkout</div>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
            Max 10% of order value
          </p>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
          <div style="font-weight: 600;">Earn More Points</div>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
            1 point per ₹10 spent
          </p>
        </div>
      </div>
      
      <div style="background: ${BRAND_COLORS.white}; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
        <p style="margin: 0; font-weight: 600; color: ${BRAND_COLORS.primary};">💡 Points Value:</p>
        <p style="margin: 0.5rem 0 0 0;">
          <strong>10 points = ₹1 discount</strong><br>
          Your ${totalPoints} points = ${formatCurrency(totalPoints * 0.1)} discount
        </p>
      </div>
    </div>
    
    <!-- GET STARTED -->
    <div style="background: ${BRAND_COLORS.light}; border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
      <h4 style="color: ${BRAND_COLORS.dark}; margin-top: 0;" class="mb-3">🚀 Ready to Shop?</h4>
      
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin: 1rem 0;">
        <a href="${process.env.NEXTAUTH_URL}/products" class="btn" style="flex: 1; min-width: 150px;">
          🛍️ Shop Now
        </a>
        <a href="${process.env.NEXTAUTH_URL}/customer/dashboard" class="btn" style="flex: 1; min-width: 150px; background-color: ${BRAND_COLORS.secondary}; color: ${BRAND_COLORS.black};">
          📊 View Dashboard
        </a>
      </div>
    </div>
    
    <!-- IMPORTANT NOTES -->
    <div style="border-left: 4px solid ${BRAND_COLORS.accent}; padding-left: 1rem; margin: 1.5rem 0;">
      <p class="mb-2"><strong>📝 Important Notes:</strong></p>
      <ul style="padding-left: 1.5rem; margin: 0;">
        <li>Points have <strong>no expiry date</strong></li>
        <li>Use points with other discounts & coupons</li>
        <li>Check your dashboard for lucky draw entries</li>
        <li>Try the <strong>Bargain System</strong> for extra discounts!</li>
      </ul>
    </div>
    
    <p style="text-align: center; margin-top: 2rem;">
      Need help? <a href="mailto:${ADMIN_EMAIL}" style="color: ${BRAND_COLORS.primary}; font-weight: 500;">Contact Support</a>
    </p>
    
    <p>Happy Shopping!<br>
    <strong>The Mega Prize Mall Team</strong></p>
  `;
  
  const html = baseEmailTemplate(content, `Welcome to Mega Prize Mall!`);
  
  return await sendEmail({
    to: user.email,
    subject: `🎉 Welcome to Mega Prize Mall! +${totalPoints} Bonus Points!`,
    html,
  });
}