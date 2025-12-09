// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Import your Gemini logic
import { sendMessageToGemini } from './server/api/gemini.js'; // note .js at the end in ESM

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API route
app.post('/api/gemini', async (req, res) => {
  try {
    const { history, newMessage, systemInstruction } = req.body;

    const response = await sendMessageToGemini(
      history,
      newMessage,
      systemInstruction,
      process.env.GEMINI_API_KEY || ''
    );

    res.json(response);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      text: 'Error processing request',
      sources: [],
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
