import { google } from '@ai-sdk/google'

// Model configurations
export const models = {
  // Google Gemini models
  gemini: {
    flash: google('gemini-2.0-flash-exp', {
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
    pro: google('gemini-1.5-pro-latest'),
  },
}

// Default model for file analysis
export const defaultAnalysisModel = models.gemini.flash

// Default model for chat
export const defaultChatModel = models.gemini.flash

// Embedding configuration
export const embeddingConfig = {
  model: 'text-embedding-004',
  dimensions: 768,
}

