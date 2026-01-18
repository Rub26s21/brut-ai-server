/**
 * Email Service - Send Birthday Emails
 * Uses Nodemailer to send emails via SMTP
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send a birthday email
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} message - Birthday message content
 * @returns {Promise<object>} Email send result
 */
export async function sendBirthdayEmail(to, name, message) {
  try {
    // Validate configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email service not configured. Please set SMTP environment variables.');
    }

    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'BRUT AI'}" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `🎂 Happy Birthday, ${name}!`,
      text: message, // Plain text version
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 40px;
              text-align: center;
              color: white;
            }
            .emoji {
              font-size: 60px;
              margin-bottom: 20px;
            }
            .message {
              background: white;
              color: #333;
              padding: 30px;
              border-radius: 8px;
              margin: 20px 0;
              white-space: pre-line;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">🎉🎂🎈</div>
            <h1>Happy Birthday!</h1>
            <div class="message">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              Sent automatically by <strong>BRUT AI</strong>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if configuration is valid
 */
export async function testEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}
