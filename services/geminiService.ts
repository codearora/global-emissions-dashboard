import { GoogleGenAI } from "@google/genai";
import { ChatMessage, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  try {
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
        tools: [{ googleSearch: {} }], // Enable Google Search
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