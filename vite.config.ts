import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express'; // Import Express to create your own API
import { sendMessageToGemini } from './server/api/gemini';

// Define the Vite configuration
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 5173, // Define the port for the Vite dev server
      host: '0.0.0.0', // This makes the server accessible from other devices
    },
    plugins: [
      react() // Using React plugin for Vite
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY), // API key from .env
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'), // Path alias to resolve imports
      }
    },
    configureServer(server) {
      const app = express(); // Initialize Express

      app.use(express.json()); // Middleware to handle JSON requests

      // Define the /api/gemini route
      app.post('/', async (req, res) => {
        const { history, newMessage, systemInstruction } = req.body;
        try {
          // Call your custom Gemini API logic here (using sendMessageToGemini)
          const response = await sendMessageToGemini(history, newMessage, systemInstruction, env.VITE_GEMINI_API_KEY);
          res.json(response); // Return response to client
        } catch (error) {
          console.error('Gemini API Error:', error);
          res.status(500).json({
            text: 'Error processing your request. Please try again.',
            sources: [],
          });
        }
      });

      server.middlewares.use('/api/gemini', app); // Use Express app as middleware in Vite server
    }
  };
});
