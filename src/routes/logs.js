/**
 * Logs API Routes
 * Handles email history/logs
 */

import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/logs
 * Get email logs for authenticated user
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

        // Get query parameters for filtering
        const { limit = 50, status } = req.query;

        let query = supabase
            .from('email_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('sent_at', { ascending: false })
            .limit(parseInt(limit));

        // Filter by status if provided
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/logs/stats
 * Get statistics about sent emails
 */
router.get('/stats', async (req, res) => {
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

        // Get total sent
        const { count: totalSent } = await supabase
            .from('email_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'sent');

        // Get total failed
        const { count: totalFailed } = await supabase
            .from('email_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'failed');

        // Get this month's count
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const { count: thisMonth } = await supabase
            .from('email_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'sent')
            .gte('sent_at', firstDayOfMonth.toISOString());

        res.json({
            totalSent: totalSent || 0,
            totalFailed: totalFailed || 0,
            thisMonth: thisMonth || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
