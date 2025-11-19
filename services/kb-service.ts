import { createClient } from '@/lib/supabase/server'
import { KnowledgeBaseRetriever } from '@/lib/knowledge-base/retriever'

export interface KBSearchResult {
  id: string
  content: string
  fileId: string
  fileName: string
  similarity: number
  metadata: any
  chunkIndex: number
}

export class KnowledgeBaseService {
  private retriever: KnowledgeBaseRetriever

  constructor() {
    this.retriever = new KnowledgeBaseRetriever()
  }

  async searchKnowledgeBase(
    query: string,
    userId: string,
    options?: {
      fileIds?: string[]
      limit?: number
      threshold?: number
    }
  ): Promise<KBSearchResult[]> {
    const results = await this.retriever.search(query, {
      userId,
      fileIds: options?.fileIds,
      limit: options?.limit || 10,
      threshold: options?.threshold || 0.7,
    })

    const supabase = await createClient()

    // Get file names
    const fileIds = [...new Set(results.map(r => r.fileId))]
    if (fileIds.length > 0) {
      const { data: files } = await supabase
        .from('files')
        .select('id, name')
        .in('id', fileIds)

      const fileMap = new Map(files?.map(f => [f.id, f.name]) || [])

      return results.map(result => ({
        id: crypto.randomUUID(),
        content: result.content,
        fileId: result.fileId,
        fileName: fileMap.get(result.fileId) || 'Unknown',
        similarity: result.similarity,
        metadata: result.metadata,
        chunkIndex: result.metadata.chunkIndex || 0,
      }))
    }

    return []
  }

  async getUserFiles(userId: string) {
    const supabase = await createClient()
    
    const { data: files, error } = await supabase
      .from('files')
      .select('id, name, mime_type, created_at, status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) throw error
    return files || []
  }

  async getFileStats(userId: string) {
    const supabase = await createClient()

    // Count total chunks in KB
    const { count: chunkCount } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Count total files
    const { count: fileCount } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    return {
      totalFiles: fileCount || 0,
      totalChunks: chunkCount || 0,
    }
  }

  async getRecentSearches(userId: string, limit: number = 5) {
    // In production, store search history in database
    // For now, return empty array
    return []
  }
}

export const kbService = new KnowledgeBaseService()

