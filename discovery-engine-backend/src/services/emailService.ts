/**
 * ============================================================================
 * DISCOVERY ENGINE - Email Service
 * ============================================================================
 * SMTP-based email delivery for password reset and notifications.
 * Uses nodemailer with configurable SMTP transport.
 * ============================================================================
 */

import nodemailer from 'nodemailer';
import { smtpConfig } from '../config/auth';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: smtpConfig.user
        ? { user: smtpConfig.user, pass: smtpConfig.pass }
        : undefined,
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const from = `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F05A28;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your Discovery Engine account.</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #F05A28; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #4A4A4A;">${resetUrl}</p>
      <p style="margin-top: 24px; color: #666;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
Reset Your Password

Hello,

You requested a password reset for your Discovery Engine account.

Click the link below to reset your password. This link expires in 1 hour.

${resetUrl}

If you did not request a password reset, you can safely ignore this email.
  `.trim();

  // If no SMTP credentials, log to console in development
  if (!smtpConfig.user || !smtpConfig.pass) {
    console.log(`[Email] DEV MODE — Password reset email would be sent to ${to}`);
    console.log(`[Email] Reset URL: ${resetUrl}`);
    return;
  }

  const info = await getTransporter().sendMail({
    from,
    to,
    subject: 'Password Reset — Discovery Engine',
    text,
    html,
  });

  console.log(`[Email] Password reset sent to ${to}`);
  if (info.messageId) {
    console.log(`[Email] Message ID: ${info.messageId}`);
  }
  // Ethereal preview URL
  if ((info as any).ethereal) {
    console.log(`[Email] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
