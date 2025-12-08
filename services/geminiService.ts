import { GoogleGenAI } from "@google/genai";
import { ChatMessage, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Store last call times (in a real app, use persistent storage)
let lastCallTimes: number[] = [];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CALLS_PER_DAY = 2;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string
): Promise<{ text: string; sources: GroundingSource[] }> => {

  const now = Date.now();

  // Remove calls older than 24 hours
  lastCallTimes = lastCallTimes.filter(time => now - time < ONE_DAY_MS);

  // Check rate limit
  if (lastCallTimes.length >= MAX_CALLS_PER_DAY) {
    const nextAvailable = new Date(Math.min(...lastCallTimes) + ONE_DAY_MS);
    return {
      text: `Rate limit exceeded. You can send another message after ${nextAvailable.toLocaleString()}.`,
      sources: [],
    };
  }

  try {
    // Record this call
    lastCallTimes.push(now);

    // Construct chat history for the model
    const chatHistory = history
      .filter(msg => msg.role !== 'model' || !msg.isThinking)
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: newMessage });
    const responseText = result.text;

    // Extract grounding chunks if available
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = [];

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Web Source',
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      text: responseText,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "I apologize, but I encountered an error while processing your request. Please try again.",
      sources: []
    };
  }
};
