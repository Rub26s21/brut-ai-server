/**
 * Contacts API Routes
 * Handles CRUD operations for customer contacts
 */

import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/contacts
 * Get all contacts for authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fix RLS Error: Create a new client authenticated as the user
        const { createClient } = await import('@supabase/supabase-js');
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        const { data, error } = await userSupabase
            .from('contacts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/contacts
 * Create a new contact
 */
router.post('/', async (req, res) => {
    console.log('📝 Received Create Contact Request');
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.log('❌ Auth Error:', authError?.message);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('👤 User Authenticated:', user.id);
        const { name, email, dob, tone } = req.body;

        if (!name || !email || !dob) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // CREATE AUTHENTICATED CLIENT
        // This is the key fix for RLS errors
        const { createClient } = await import('@supabase/supabase-js');
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        console.log('🔄 Inserting into Supabase using User Token...');
        const { data, error } = await userSupabase
            .from('contacts')
            .insert([{
                user_id: user.id, // Explicitly set user_id
                name,
                email,
                dob,
                tone: tone || 'friendly'
            }])
            .select()
            .single();

        if (error) {
            console.log('❌ Database Error:', error);
            throw error;
        }

        console.log('✅ Contact Created:', data.id);
        res.status(201).json(data);
    } catch (error) {
        console.error('💥 Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/contacts/:id
 * Update an existing contact
 */
router.put('/:id', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { name, email, dob, tone } = req.body;

        // Fix RLS Error: Create authenticated client
        const { createClient } = await import('@supabase/supabase-js');
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        const { data, error } = await userSupabase
            .from('contacts')
            .update({ name, email, dob, tone })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/contacts/:id
 * Delete a contact
 */
router.delete('/:id', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        // Fix RLS Error: Create authenticated client
        const { createClient } = await import('@supabase/supabase-js');
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        );

        const { error } = await userSupabase
            .from('contacts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
