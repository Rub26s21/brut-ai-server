/**
 * Messages API Routes
 * Handles AI message generation
 */

import express from 'express';
import { generateBirthdayMessage } from '../services/aiService.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/messages/generate
 * Generate a birthday message using AI
 */
router.post('/generate', async (req, res) => {
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

        const { name, tone, businessName } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Customer name is required' });
        }

        // Generate AI message
        const message = await generateBirthdayMessage(
            name,
            tone || 'friendly',
            businessName || 'our team'
        );

        res.json({ message });
    } catch (error) {
        console.error('Error generating message:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
