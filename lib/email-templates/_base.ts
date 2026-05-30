import { ADMIN_EMAIL } from '@/lib/email';

export const BRAND_COLORS = {
  primary: '#7C2C78',      // Purple
  secondary: '#EAB75F',    // Gold
  accent: '#A43875',       // Pink
  dark: '#2E297D',         // Dark Blue
  light: '#F8F9FA',        // Off-white
  white: '#FFFFFF',
  black: '#171717',
};

export const baseEmailTemplate = (content: string, title?: string) => `
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

export function formatDate(date: Date | string): string {
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
