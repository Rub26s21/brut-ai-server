import nodemailer from 'nodemailer';

const user = 'rubahan26@gmail.com';
const pass = 'cmtbtemhcmwodfkm';

console.log('---------------------------------------------------');
console.log('🧪 DEBUG EMAIL TEST');
console.log(`👤 User: ${user}`);
console.log(`🔑 Pass: ${pass}`);
console.log('---------------------------------------------------');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: user,
        pass: pass
    }
});

async function run() {
    try {
        console.log('🔌 Connecting to Gmail...');
        await transporter.verify();
        console.log('✅ LOGIN SUCCESS! Credentials are correct.');

        console.log('📨 Sending test email...');
        const info = await transporter.sendMail({
            from: `"Brut AI Debug" <${user}>`,
            to: user,
            subject: "Debug Test HTML",
            html: "<h1>It Works!</h1><p>Credentials are valid.</p>"
        });
        console.log('✅ EMAIL SENT:', info.messageId);
    } catch (err) {
        console.error('❌ FAILURE:', err.message);
        if (err.message.includes('Username and Password not accepted')) {
            console.log('\n⚠️ DIAGNOSIS: The password "vudfafbersdgkiqn" does NOT match the account "rubahan26@gmail.com".');
            console.log('   Please check if you generated the password while logged into a DIFFERENT Google Account.');
        }
    }
}

run();
