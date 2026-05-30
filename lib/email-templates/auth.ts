import { formatCurrency } from '@/lib/utils';
import { sendEmail, ADMIN_EMAIL } from '@/lib/email';
import { BRAND_COLORS, baseEmailTemplate } from './_base';

// 11. WELCOME EMAIL WITH POINTS
export async function sendWelcomeEmail(
  user: { email: string; name: string; id: string },
  emailSubscriberPoints: number = 0,
  referralBonusPoints: number = 0,
  referralCodeUsed?: string,
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
            1 point per Rs 10 spent
          </p>
        </div>
      </div>

      <div style="background: ${BRAND_COLORS.white}; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
        <p style="margin: 0; font-weight: 600; color: ${BRAND_COLORS.primary};">💡 Points Value:</p>
        <p style="margin: 0.5rem 0 0 0;">
          <strong>10 points = Rs 1 discount</strong><br>
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

export async function sendGoogleWelcomeEmail(options: {
  to: string;
  name: string;
  points?: number;
  loginMethod?: 'google' | 'credentials';
}): Promise<boolean> {
  const brandColors = {
    primary: '#7C2C78',
    secondary: '#A43875',
    accent: '#EAB75F',
    dark: '#1f2937',
    light: '#f9fafb',
    white: '#ffffff'
  };

  const isGoogleLogin = options.loginMethod === 'google';
  const bonusPoints = options.points || 0;

  const content = `
    <div style="max-width: 600px; margin: 0 auto; background: ${brandColors.white}; border-radius: 16px; overflow: hidden;">
      <!-- Header with Brand Gradient -->
      <div style="background: linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary}); padding: 2.5rem 2rem; text-align: center;">
        <div style="background: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
          <div style="font-size: 2.5rem; color: white;">🎉</div>
        </div>
        <h1 style="color: white; font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0;">
          Welcome to Mega Prize Mall!
        </h1>
        <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; margin: 0;">
          Your Electronics Accessories Destination
        </p>
      </div>

      <!-- Welcome Message -->
      <div style="padding: 2rem;">
        <p style="font-size: 1.125rem; color: ${brandColors.dark}; line-height: 1.6; margin: 0 0 1.5rem 0;">
          Hi <strong>${options.name}</strong>,<br>
          We're thrilled to welcome you to Mega Prize Mall! Your account has been successfully created ${isGoogleLogin ? 'via Google' : ''}.
        </p>

        <!-- Account Details Card -->
        <div style="background: ${brandColors.light}; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid ${brandColors.primary};">
          <h3 style="color: ${brandColors.primary}; margin: 0 0 1rem 0; font-size: 1.25rem;">
            📋 Your Account Details
          </h3>
          <div style="display: grid; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Email</span>
              <span style="font-weight: 600; color: ${brandColors.dark};">${options.to}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Account Type</span>
              <span style="font-weight: 600; color: ${brandColors.primary};">Customer Account</span>
            </div>
            ${bonusPoints > 0 ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Welcome Bonus</span>
              <span style="font-weight: 600; color: ${brandColors.accent};">+${bonusPoints} Points</span>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Points Section (if bonus points) -->
        ${bonusPoints > 0 ? `
        <div style="background: linear-gradient(135deg, rgba(234, 183, 95, 0.1), rgba(255, 159, 69, 0.1));
                    border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; border: 2px solid ${brandColors.accent};">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="background: ${brandColors.accent}; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 1.5rem; color: white;">🏆</div>
            </div>
            <div>
              <h3 style="color: ${brandColors.dark}; margin: 0; font-size: 1.25rem;">
                You've Earned ${bonusPoints} Welcome Points!
              </h3>
              <p style="color: #6b7280; margin: 0.25rem 0 0 0;">
                Redeem points for discounts on your purchases
              </p>
            </div>
          </div>
          <p style="color: #6b7280; margin: 0; font-size: 0.875rem;">
            Points have been credited to your wallet. Start shopping to earn more!
          </p>
        </div>
        ` : ''}

        <!-- Features Grid -->
        <div style="margin: 2rem 0;">
          <h3 style="color: ${brandColors.primary}; text-align: center; margin: 0 0 1.5rem 0; font-size: 1.25rem;">
            🚀 Get Started with Mega Prize Mall
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div style="text-align: center; padding: 1rem; background: ${brandColors.light}; border-radius: 10px;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">💎</div>
              <div style="font-weight: 600; color: ${brandColors.dark}; margin-bottom: 0.25rem;">Bargain Deals</div>
              <div style="font-size: 0.875rem; color: #6b7280;">Negotiate prices</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: ${brandColors.light}; border-radius: 10px;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎁</div>
              <div style="font-weight: 600; color: ${brandColors.dark}; margin-bottom: 0.25rem;">Lucky Draw</div>
              <div style="font-size: 0.875rem; color: #6b7280;">Win amazing prizes</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: ${brandColors.light}; border-radius: 10px;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
              <div style="font-weight: 600; color: ${brandColors.dark}; margin-bottom: 0.25rem;">Wallet</div>
              <div style="font-size: 0.875rem; color: #6b7280;">Earn & redeem points</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: ${brandColors.light}; border-radius: 10px;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚡</div>
              <div style="font-weight: 600; color: ${brandColors.dark}; margin-bottom: 0.25rem;">Fast Delivery</div>
              <div style="font-size: 0.875rem; color: #6b7280;">Quick shipping</div>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 2rem 0;">
          <a href="${process.env.NEXTAUTH_URL}"
             style="display: inline-block; background: linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary});
                    color: white; padding: 1rem 2.5rem; border-radius: 50px; text-decoration: none;
                    font-weight: 600; font-size: 1.125rem; box-shadow: 0 4px 15px rgba(124, 44, 120, 0.3);">
            Start Shopping Now →
          </a>
        </div>

        <!-- Tips -->
        <div style="background: rgba(124, 44, 120, 0.05); border-radius: 10px; padding: 1.25rem; margin: 1.5rem 0;">
          <h4 style="color: ${brandColors.primary}; margin: 0 0 0.75rem 0; font-size: 1rem;">
            💡 Quick Tips for New Users
          </h4>
          <ul style="color: #6b7280; padding-left: 1.25rem; margin: 0; font-size: 0.875rem;">
            <li>Complete your profile to get personalized recommendations</li>
            <li>Check the "Bargain Zone" for negotiable deals</li>
            <li>Participate in Lucky Draws for a chance to win free products</li>
            <li>Share your referral code to earn bonus points</li>
          </ul>
        </div>

        <!-- Closing -->
        <div style="text-align: center; color: #6b7280; font-size: 0.875rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 1rem 0;">
            Need help? <a href="mailto:${process.env.GMAIL_USER}" style="color: ${brandColors.primary}; text-decoration: none;">Contact our support team</a>
          </p>
          <p style="margin: 0; font-size: 0.75rem;">
            This email was sent to ${options.to} because you created an account at Mega Prize Mall.
            <br>
            © ${new Date().getFullYear()} Mega Prize Mall. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  const html = baseEmailTemplate(content, `Welcome to Mega Prize Mall, ${options.name.split(' ')[0]}!`);

  return await sendEmail({
    to: options.to,
    subject: `🎉 Welcome to Mega Prize Mall, ${options.name.split(' ')[0]}! ${bonusPoints > 0 ? `(+${bonusPoints} Bonus Points!)` : ''}`,
    html,
  });
}
