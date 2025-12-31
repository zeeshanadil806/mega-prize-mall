import nodemailer from 'nodemailer';
import { log } from '@/lib/logger';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    log.error('Email transporter verification failed:', {error});
  } else {
    log.info('Email transporter is ready to send messages');
  }
});

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const from = `"Mega Prize Mall" <${process.env.GMAIL_USER}>`;
    
    const mailOptions = {
      from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
      replyTo: options.replyTo,
    };

    const info = await transporter.sendMail(mailOptions);
    log.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });
    
    return true;
  } catch (error) {
    log.error('Failed to send email:', {
      error: error as Error,
      to: options.to,
      subject: options.subject,
    });
    return false;
  }
}

// Admin email from environment or fallback to Gmail
// export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'admin@megaprizemall.com';
export const ADMIN_EMAIL = process.env.GMAIL_USER!;