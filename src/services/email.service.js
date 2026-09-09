import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const user = process.env.GMAIL_USER || process.env.SMTP_USERNAME || process.env.EMAIL_USER;
    let pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

    if (pass) {
      pass = pass.replace(/\s+/g, '');
    }

    if (user && pass) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
  }
  return transporter;
};

/**
 * Sends an OTP email to the user via Gmail SMTP.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP verification code
 * @returns {Promise<boolean>} True if email dispatched or handled
 */
export const sendOtpEmail = async (toEmail, otp) => {
  const activeTransporter = getTransporter();
  const mailOptions = {
    from: `"Echo SOS Safety" <${process.env.GMAIL_USER || 'no-reply@echosos.com'}>`,
    to: toEmail,
    subject: `Your Echo SOS Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #dc2626; margin: 0; font-size: 26px; font-weight: 800;">ECHO SOS</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Personal & Community Safety Network</p>
        </div>
        <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 8px;">Verification Code</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">Use the 6-digit code below to log into your Echo SOS account:</p>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  logger.info(`[OTP EMAIL DISPATCH] Target: ${toEmail} | Code: ${otp}`);

  if (activeTransporter) {
    try {
      const info = await activeTransporter.sendMail(mailOptions);
      logger.info(`[OTP EMAIL SUCCESS] Dispatched to ${toEmail}. MessageID: ${info.messageId}`);
      return true;
    } catch (err) {
      logger.error(`[OTP EMAIL ERROR] Failed to send to ${toEmail}:`, err.message);
      return process.env.NODE_ENV === 'development' || true;
    }
  } else {
    logger.warn(`[OTP EMAIL NOTICE] GMAIL_USER / GMAIL_APP_PASSWORD not set in .env. Code logged for development.`);
    return true;
  }
};
