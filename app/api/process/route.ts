import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fileRepository } from '@/lib/repositories/file-repository'
import { deepAnalyzer } from '@/lib/ai/analyzer'
import { knowledgeRepository } from '@/lib/repositories/knowledge-repository'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    // Get file record
    const file = await fileRepository.findById(fileId)
    if (!file || file.user_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Update status to processing
    await fileRepository.updateStatus(fileId, 'processing')

    try {
      // Analyze file
      const analysis = await deepAnalyzer.analyze(
        fileId,
        file.storage_path,
        file.mime_type
      )

      // Save analysis
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('analysis')
        .insert({
          file_id: fileId,
          status: 'completed',
          result: analysis,
          insights: analysis.insights,
          agent_type: 'gemini-flash',
        })
        .select()
        .single()

      if (analysisError) throw analysisError

      // Generate knowledge base chunks
      const content = JSON.stringify(analysis)
      const chunks = await deepAnalyzer.generateKnowledgeBaseChunks(
        content,
        fileId,
        user.id
      )

      // Save chunks to knowledge base
      await knowledgeRepository.createBatch(
        chunks.map((chunk, index) => ({
          user_id: user.id,
          file_id: fileId,
          content: chunk.content,
          embedding: chunk.embedding,
          chunk_index: index,
          metadata: {},
        }))
      )

      // Update file status to completed
      await fileRepository.updateStatus(fileId, 'completed')

      return NextResponse.json({
        success: true,
        analysis: analysisRecord,
      })
    } catch (error) {
      console.error('Processing error:', error)
      await fileRepository.updateStatus(fileId, 'failed')
      
      return NextResponse.json(
        { error: 'Processing failed', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Process API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

