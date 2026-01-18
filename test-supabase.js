// Test Supabase Connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.SUPABASE_URL);
    console.log('Key:', process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Missing');

    try {
        // Try to query the contacts table
        const { data, error } = await supabase
            .from('contacts')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Supabase Error:', error);
        } else {
            console.log('✅ Supabase connection successful!');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

testConnection();
