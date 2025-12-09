// services/gemini.ts

import { ChatMessage } from "@/types";

export const sendMessageToGemini = async (messages: ChatMessage[], newMessage: string, context: string) => {
  const requestData = {
    history: messages, // Provide the current message history
    newMessage: newMessage,
    systemInstruction: context, // The system instruction context
  };

  try {
    const response = await fetch('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    return data; // Return the response from the backend API

  } catch (error) {
    console.error('Error:', error);
    throw new Error('Error calling Gemini API');
  }
};
