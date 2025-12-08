# EcoInsight - Global Emissions Tracker

EcoInsight is a comprehensive dashboard designed to track and visualize global carbon emissions data. It bridges the gap between complex climate data and actionable insights by combining real-time visualization with an AI-powered analyst.

## Features

- **Global Emissions Dashboard**: Visualize emissions data across major sectors (Energy, Industry, Agriculture, Transport, Waste).
- **AI-Powered Analyst**: Integrated chat interface powered by **Google Gemini 2.5**, capable of analyzing dashboard data and answering complex climate questions with real-time internet access.
- **Top Assets Tracking**: Monitor high-emission assets and facilities globally.
- **Interactive Visualizations**: Dynamic charts and graphs built with Recharts for clear data interpretation.

## Tech Stack

- **Frontend**: [React](https://react.dev/) (v19) with [Vite](https://vitejs.dev/)
- **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (Gemini 2.5 Flash)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Language**: TypeScript

## Getting Started

Follow these steps to run the application locally.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- A **Google Gemini API Key** (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` or `.env.local` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/components`: UI components including Dashboard and ChatPanel.
- `src/services`: API services for fetching emission data and communicating with Gemini.
- `src/types.ts`: TypeScript definitions for data models.

## License

This project is licensed under the MIT License.
