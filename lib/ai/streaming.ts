import { streamText, streamObject, generateObject, generateText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { z } from 'zod'

// Example: Stream text generation
export async function streamTextGeneration(
  model: any,
  prompt: string,
  options?: {
    system?: string
    maxTokens?: number
    temperature?: number
  }
) {
  const result = await streamText({
    model,
    prompt,
    system: options?.system,
    maxTokens: options?.maxTokens || 2048,
    temperature: options?.temperature || 0.7,
  })

  return result.toAIStreamResponse()
}

// Example: Stream structured object generation
export async function streamStructuredGeneration<T extends z.ZodType>(
  model: any,
  prompt: string,
  schema: T,
  options?: {
    system?: string
  }
) {
  const result = await streamObject({
    model,
    prompt,
    schema,
    system: options?.system,
  })

  return result.toAIStreamResponse()
}

// Example: Generate structured object (non-streaming)
export async function generateStructuredObject<T extends z.ZodType>(
  model: any,
  prompt: string,
  schema: T,
  options?: {
    system?: string
    maxRetries?: number
  }
) {
  const result = await generateObject({
    model,
    prompt,
    schema,
    system: options?.system,
    maxRetries: options?.maxRetries || 3,
  })

  return result.object
}

// RSC: Create streamable value for Server Components
export function createStreamableResponse<T = any>() {
  const stream = createStreamableValue<T>()
  
  return {
    stream,
    update: (value: T) => stream.update(value),
    done: (finalValue?: T) => stream.done(finalValue),
    error: (error: Error) => stream.error(error),
  }
}

