import { streamText } from 'ai'
import { defaultChatModel } from '@/lib/ai/config'
import { createClient } from '@/lib/supabase/server'
import { KnowledgeBaseRetriever } from '@/lib/knowledge-base/retriever'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { messages, fileIds } = await req.json()
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get last user message
    const lastMessage = messages[messages.length - 1]
    
    // Initialize retriever
    const retriever = new KnowledgeBaseRetriever()

    // Search knowledge base
    const searchResults = await retriever.search(lastMessage.content, {
      userId: user.id,
      fileIds,
      limit: 5,
      threshold: 0.7,
    })

    // Get file information for sources
    const fileIds_unique = [...new Set(searchResults.map(r => r.fileId))]
    let fileMap = new Map()
    
    if (fileIds_unique.length > 0) {
      const { data: files } = await supabase
        .from('files')
        .select('id, name')
        .in('id', fileIds_unique)

      fileMap = new Map(files?.map(f => [f.id, f.name]) || [])
    }

    // Build context with citations
    const contextChunks = searchResults.map((result, index) => ({
      content: result.content,
      fileName: fileMap.get(result.fileId) || 'Unknown',
      fileId: result.fileId,
      similarity: result.similarity,
      citation: index + 1,
    }))

    const context = contextChunks
      .map((chunk, i) => `[${i + 1}] From "${chunk.fileName}":\n${chunk.content}`)
      .join('\n\n---\n\n')

    // Enhanced system prompt with RAG context
    const systemPrompt = context
      ? `You are a helpful AI assistant with access to the user's uploaded files and documents.

CONTEXT FROM USER'S KNOWLEDGE BASE:

${context}

INSTRUCTIONS:

1. Answer the user's question using the context provided above
2. Cite your sources using [1], [2], etc. when referencing information
3. If the context doesn't contain relevant information, say so clearly
4. Be specific and quote exact phrases from the context when appropriate
5. If asked to compare or analyze, use information from multiple sources

Always prioritize accuracy over completeness. If you're unsure, acknowledge it.`
      : 'You are a helpful AI assistant. The user has not uploaded any files yet, so you cannot reference specific documents.'

    // Stream response
    const result = await streamText({
      model: defaultChatModel,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 2048,
      onFinish: async ({ text, usage }) => {
        console.log('Chat completed:', { 
          usage, 
          responseLength: text.length,
          sourcesUsed: contextChunks.length 
        })
      },
    })

    // Create response with sources in headers
    const response = result.toAIStreamResponse()
    
    // Add sources as custom header (encoded)
    const sourcesData = contextChunks.map(c => ({
      fileId: c.fileId,
      fileName: c.fileName,
      snippet: c.content.slice(0, 200) + '...',
      similarity: c.similarity,
      citation: c.citation,
    }))

    response.headers.set('X-Sources', JSON.stringify(sourcesData))

    return response
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

