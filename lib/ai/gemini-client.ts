import { GoogleGenerativeAI } from '@google/generative-ai'
import { google } from '@ai-sdk/google'

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
)

// Vercel AI SDK models
export const geminiFlash = google('gemini-2.0-flash-exp')
export const geminiPro = google('gemini-1.5-pro-latest')

// Direct Gemini API clients
export const geminiFlashModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
})

export const geminiProModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro-latest',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
})

// Embedding model
export const embeddingModel = genAI.getGenerativeModel({
  model: 'text-embedding-004'
})

export { genAI }

