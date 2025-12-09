// server/api/gemini.js
import { GoogleGenAI } from '@google/genai';

// Rate limiting: 2 calls per day
let lastCallTimes = [];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CALLS_PER_DAY = 2;

/**
 * Sends a message to Gemini AI
 * @param {Array} history - Chat history
 * @param {string} newMessage - The new user message
 * @param {string} systemInstruction - System instructions for AI
 * @param {string} apiKey - Your Gemini API key
 * @returns {Promise<{text: string, sources: Array}>}
 */
export const sendMessageToGemini = async (history, newMessage, systemInstruction, apiKey) => {
    const ai = new GoogleGenAI({ apiKey });
    const now = Date.now();

    // Remove old calls
    lastCallTimes = lastCallTimes.filter(time => now - time < ONE_DAY_MS);

    // Rate limit check
    if (lastCallTimes.length >= MAX_CALLS_PER_DAY) {
        const nextAvailable = new Date(Math.min(...lastCallTimes) + ONE_DAY_MS);
        return {
            text: `Rate limit exceeded. You can send another message after ${nextAvailable.toLocaleString()}.`,
            sources: [],
        };
    }

    try {
        lastCallTimes.push(now);

        // Prepare chat history for the model
        const chatHistory = history
            .filter(msg => msg.role !== 'model' || !msg.isThinking)
            .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }));

        // Create chat
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }], // optional
            },
            history: chatHistory,
        });

        const result = await chat.sendMessage({ message: newMessage });
        const responseText = result.text;

        // Extract grounding sources
        const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = [];

        if (groundingChunks) {
            groundingChunks.forEach(chunk => {
                if (chunk.web) {
                    sources.push({
                        title: chunk.web.title || 'Web Source',
                        uri: chunk.web.uri,
                    });
                }
            });
        }

        // Deduplicate sources
        const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

        return {
            text: responseText,
            sources: uniqueSources,
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        return {
            text: 'I apologize, but I encountered an error while processing your request. Please try again.',
            sources: [],
        };
    }
};
