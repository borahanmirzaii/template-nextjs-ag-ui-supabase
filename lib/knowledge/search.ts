import { generateEmbedding } from '@/lib/ai/embeddings'
import { knowledgeRepository } from '@/lib/repositories/knowledge-repository'

export async function vectorSearch(
  query: string,
  options?: {
    userId?: string
    fileId?: string
    threshold?: number
    limit?: number
  }
) {
  const queryEmbedding = await generateEmbedding(query)
  return await knowledgeRepository.search(queryEmbedding, options)
}

