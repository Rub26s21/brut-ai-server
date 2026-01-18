// Test Email Sending
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function sendTestEmail() {
    console.log('📧 Testing Email Configuration...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('User:', process.env.SMTP_USER);

    if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'your-app-specific-password') {
        console.error('❌ ERROR: SMTP_PASS is not configured in .env file!');
        console.log('👉 Go to https://myaccount.google.com/apppasswords to get one.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 465, // Try 465 SSL
        secure: true, // true for 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // Verify connection config
        await transporter.verify();
        console.log('✅ SMTP Connection Verified!');

        // Send test email
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'BRUT AI'}" <${process.env.SMTP_USER}>`,
            to: 'rubahan26@gmail.com', // Explicitly send to user
            subject: "Verify Email - BRUT AI Test",
            text: "Success! Your email configuration is working correctly.",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0fdf4; border-radius: 10px;">
                    <h2 style="color: #166534;">🎉 It Works!</h2>
                    <p>Your email service is correctly configured.</p>
                    <p><strong>Configured Account:</strong> ${process.env.SMTP_USER}</p>
                    <p>You are ready to send birthday wishes via <strong>BRUT AI</strong>!</p>
                </div>
            `,
        });

        console.log('✅ Test Email Sent!');
        console.log('Message ID:', info.messageId);
        console.log(`👉 Check your inbox (${process.env.SMTP_USER})`);

    } catch (error) {
        console.error('❌ Email Failed:', error.message);
        if (error.code === 'EAUTH') {
            console.log('👉 Check your email and app password in .env');
        }
    }
}

sendTestEmail();
