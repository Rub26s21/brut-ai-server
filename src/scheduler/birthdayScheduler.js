/**
 * Birthday Scheduler
 * Automatically checks for birthdays and sends emails daily
 */

import cron from 'node-cron';
import { supabase } from '../config/supabase.js';
import { generateBirthdayMessage } from '../services/aiService.js';
import { sendBirthdayEmail } from '../services/emailService.js';

/**
 * Check for birthdays today and send emails
 */
async function checkBirthdaysAndSend() {
    console.log('🔍 Checking for birthdays today...');

    try {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // Get all contacts with birthdays today
        // We need to check month and day separately since dob is stored as full date
        const { data: allContacts, error: fetchError } = await supabase
            .from('contacts')
            .select('*, profiles!inner(business_name)');

        if (fetchError) {
            console.error('Error fetching contacts:', fetchError);
            return;
        }

        // Filter contacts with birthday today
        const birthdayContacts = allContacts.filter(contact => {
            const dob = new Date(contact.dob);
            const dobMonth = String(dob.getMonth() + 1).padStart(2, '0');
            const dobDay = String(dob.getDate()).padStart(2, '0');
            return dobMonth === month && dobDay === day;
        });

        console.log(`🎂 Found ${birthdayContacts.length} birthday(s) today`);

        // Process each birthday contact
        for (const contact of birthdayContacts) {
            try {
                // Check if we already sent an email this year
                const thisYear = today.getFullYear();
                const yearStart = new Date(thisYear, 0, 1).toISOString();
                const yearEnd = new Date(thisYear, 11, 31, 23, 59, 59).toISOString();

                const { data: existingLog } = await supabase
                    .from('email_logs')
                    .select('id')
                    .eq('contact_id', contact.id)
                    .gte('sent_at', yearStart)
                    .lte('sent_at', yearEnd)
                    .eq('status', 'sent')
                    .single();

                if (existingLog) {
                    console.log(`⏭️  Already sent birthday email to ${contact.name} this year`);
                    continue;
                }

                // Get business name from profile
                const businessName = contact.profiles?.business_name || 'Our Team';

                // Generate AI message
                console.log(`🤖 Generating message for ${contact.name}...`);
                const message = await generateBirthdayMessage(
                    contact.name,
                    contact.tone || 'friendly',
                    businessName
                );

                // Send email
                console.log(`📧 Sending email to ${contact.email}...`);
                await sendBirthdayEmail(contact.email, contact.name, message);

                // Log success
                await supabase.from('email_logs').insert({
                    contact_id: contact.id,
                    user_id: contact.user_id,
                    contact_name: contact.name,
                    contact_email: contact.email,
                    message_content: message,
                    status: 'sent',
                });

                console.log(`✅ Successfully sent birthday email to ${contact.name}`);

            } catch (error) {
                console.error(`❌ Failed to send email to ${contact.name}:`, error);

                // Log failure
                await supabase.from('email_logs').insert({
                    contact_id: contact.id,
                    user_id: contact.user_id,
                    contact_name: contact.name,
                    contact_email: contact.email,
                    message_content: '',
                    status: 'failed',
                    error_message: error.message,
                });
            }
        }

        console.log('✨ Birthday check completed');

    } catch (error) {
        console.error('Error in birthday scheduler:', error);
    }
}

/**
 * Start the birthday scheduler
 * Default: Runs every day at 9:00 AM
 */
export function startScheduler() {
    const cronExpression = process.env.SCHEDULER_CRON || '0 9 * * *';

    console.log(`⏰ Scheduler configured: ${cronExpression}`);

    // Schedule the job
    cron.schedule(cronExpression, () => {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🎂 Birthday Scheduler Running - ${new Date().toISOString()}`);
        console.log('='.repeat(50));
        checkBirthdaysAndSend();
    });

    // Optional: Run immediately on startup for testing
    // Uncomment the line below to test the scheduler on server start
    // checkBirthdaysAndSend();
}

// Export for manual testing
export { checkBirthdaysAndSend };
