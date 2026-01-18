/**
 * Main Server Entry Point
 * Auto Birthday Wish Sender API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routes/contacts.js';
import messagesRouter from './routes/messages.js';
import logsRouter from './routes/logs.js';
import { startScheduler } from './scheduler/birthdayScheduler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Auto Birthday Wish Sender API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/logs', logsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// CRON JOB ROUTE FOR VERCEL
// Vercel will hit this endpoint externally
app.get('/api/cron', async (req, res) => {
    // Basic security check (Optional: check for specific header from Vercel)
    console.log('⏰ Triggering manual birthday check via Cron Route...');

    // Import the logic dynamically to ensure fresh run
    const { checkBirthdaysAndSend } = await import('./scheduler/birthdayScheduler.js');

    try {
        await checkBirthdaysAndSend();
        res.json({ message: 'Birthday check completed successfully' });
    } catch (error) {
        console.error('Error running cron:', error);
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server (Only runs if NOT in Vercel environment or if running locally)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📧 Email service: ${process.env.SMTP_HOST}`);

        // Start local node-cron only for local dev
        if (process.env.SCHEDULER_ENABLED !== 'false') {
            startScheduler();
            console.log('⏰ Local Birthday scheduler started');
        }
    });
}

export default app;
