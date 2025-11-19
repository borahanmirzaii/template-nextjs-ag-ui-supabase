import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/ai/embeddings'

export interface RetrievalResult {
  content: string
  similarity: number
  metadata: any
  fileId: string
}

export class KnowledgeBaseRetriever {
  async search(
    query: string,
    options: {
      userId?: string
      fileIds?: string[]
      limit?: number
      threshold?: number
    } = {}
  ): Promise<RetrievalResult[]> {
    const {
      userId,
      fileIds,
      limit = 5,
      threshold = 0.7,
    } = options

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)

    const supabase = await createClient()

    // Perform vector similarity search
    const { data, error } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_user_id: userId || null,
      filter_file_id: fileIds?.[0] || null,
    })

    if (error) {
      console.error('Knowledge base search error:', error)
      return []
    }

    return (data || []).map((item: any) => ({
      content: item.content,
      similarity: item.similarity,
      metadata: item.metadata,
      fileId: item.file_id,
    }))
  }

  async buildContext(query: string, userId: string, maxTokens: number = 2000): Promise<string> {
    const results = await this.search(query, { userId, limit: 10 })

    let context = ''
    let tokenCount = 0

    for (const result of results) {
      const chunk = `[Source: ${result.metadata.source}]\n${result.content}\n\n`
      const chunkTokens = Math.ceil(chunk.length / 4) // Rough estimate
      
      if (tokenCount + chunkTokens > maxTokens) break
      
      context += chunk
      tokenCount += chunkTokens
    }

    return context
  }
}

