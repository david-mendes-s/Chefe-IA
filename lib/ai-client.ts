// src/lib/ai-client.ts

import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY não está definida nas variáveis de ambiente.");
}

const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export default aiClient;