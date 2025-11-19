'use server'

import { createStreamableValue } from 'ai/rsc'
import { AgentFactory } from '@/lib/ai/agents/factory'
import { KnowledgeBaseBuilder } from '@/lib/knowledge-base/builder'
import { createClient } from '@/lib/supabase/server'
import { downloadFile } from '@/lib/supabase/storage'

export async function analyzeFileStreaming(fileId: string) {
  const stream = createStreamableValue()
  const supabase = await createClient()

  ;(async () => {
    try {
      stream.update({ status: 'loading', message: 'Fetching file...' })

      // Get file
      const { data: file, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single()

      if (error || !file) {
        stream.error('File not found')
        return
      }

      stream.update({ status: 'processing', message: 'Downloading file...' })

      // Download file
      const blob = await downloadFile(file.storage_path)
      if (!blob) {
        stream.error('Failed to download file')
        return
      }

      stream.update({ status: 'processing', message: 'Analyzing with AI...' })

      // Create appropriate agent
      const factory = new AgentFactory(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
      const agent = factory.createAgent(file.mime_type)

      // Analyze
      const buffer = Buffer.from(await blob.arrayBuffer())
      const result = await agent.analyze(buffer, {
        fileName: file.name,
        mimeType: file.mime_type,
      })

      stream.update({ status: 'processing', message: 'Saving analysis...' })

      // Save analysis
      await supabase.from('analysis').insert({
        file_id: fileId,
        status: 'completed',
        result,
        insights: result.insights,
        agent_type: file.mime_type,
      })

      // Update file status
      await supabase
        .from('files')
        .update({ status: 'completed' })
        .eq('id', fileId)

      stream.update({ status: 'processing', message: 'Building knowledge base...' })

      // Build knowledge base (fire and forget)
      const kbBuilder = new KnowledgeBaseBuilder()
      kbBuilder.processFile(fileId).catch(console.error)

      stream.update({ 
        status: 'completed', 
        result,
        message: 'Analysis complete!'
      })

      stream.done()
    } catch (error) {
      console.error('Analysis error:', error)
      stream.error(error instanceof Error ? error.message : 'Analysis failed')
    }
  })()

  return stream.value
}

