/**
 * AI Service - Birthday Message Generation
 * Uses Groq API to generate personalized birthday messages
 */

import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate a personalized birthday message using AI
 * @param {string} customerName - Name of the customer
 * @param {string} tone - Tone of the message (friendly, professional, formal)
 * @param {string} businessName - Name of the business
 * @returns {Promise<string>} Generated birthday message
 */
export async function generateBirthdayMessage(customerName, tone = 'friendly', businessName = 'our team') {
    try {
        // Validate API key
        if (!process.env.GROQ_API_KEY) {
            throw new Error('Groq API key not configured');
        }

        // Define tone-specific instructions
        const toneInstructions = {
            friendly: 'warm, casual, and cheerful. Use exclamation marks and emojis sparingly.',
            professional: 'polite, respectful, and business-appropriate. Maintain professionalism.',
            formal: 'very formal, respectful, and traditional. Use proper business etiquette.'
        };

        const toneInstruction = toneInstructions[tone] || toneInstructions.friendly;

        // Create the prompt
        const prompt = `You are writing a birthday wish email from ${businessName} to a valued customer named ${customerName}.

Requirements:
- Tone: ${toneInstruction}
- Length: 2-3 sentences maximum
- Personalize with the customer's name
- Express genuine appreciation for their business
- Make it unique and avoid generic templates
- Do NOT include subject line, just the message body
- Do NOT include signature or closing (we'll add that separately)

Write a heartfelt birthday message:`;

        // Call Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // Fast and high-quality model
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional copywriter specializing in personalized customer communications. You write warm, genuine birthday messages that make customers feel valued.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8, // Higher temperature for more creative/varied responses
            max_tokens: 150,
        });

        const message = completion.choices[0].message.content.trim();

        // Add signature
        const fullMessage = `${message}\n\nWarm regards,\n${businessName}`;

        return fullMessage;

    } catch (error) {
        console.error('Error generating AI message:', error);

        // Fallback to template if AI fails
        const fallbackMessages = {
            friendly: `Happy Birthday, ${customerName}! 🎉 We hope your special day is filled with joy and wonderful moments. Thank you for being such an amazing customer!\n\nWarm regards,\n${businessName}`,
            professional: `Dear ${customerName},\n\nWishing you a very happy birthday. We appreciate your continued partnership and hope you have a wonderful celebration.\n\nBest regards,\n${businessName}`,
            formal: `Dear ${customerName},\n\nOn behalf of ${businessName}, we extend our warmest wishes on your birthday. We value your patronage and hope this day brings you much happiness.\n\nRespectfully,\n${businessName}`
        };

        return fallbackMessages[tone] || fallbackMessages.friendly;
    }
}
