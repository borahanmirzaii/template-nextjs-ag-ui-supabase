import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, chunkText } from '@/lib/ai/embeddings'
import { downloadFile } from '@/lib/supabase/storage'
import { FileParser } from '@/lib/utils/file-parser'

export class KnowledgeBaseBuilder {
  async processFile(fileId: string): Promise<void> {
    const supabase = await createClient()

    // Get file record
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (error || !file) {
      throw new Error('File not found')
    }

    // Download file content
    const blob = await downloadFile(file.storage_path)
    if (!blob) {
      throw new Error('Failed to download file')
    }

    // Extract text content
    const textContent = await this.extractText(blob, file.mime_type)

    if (!textContent || textContent.trim().length === 0) {
      console.warn(`No text content extracted from file ${fileId}`)
      return
    }

    // Chunk text
    const chunks = chunkText(textContent, 1000, 200)

    if (chunks.length === 0) {
      console.warn(`No chunks created for file ${fileId}`)
      return
    }

    // Generate embeddings for each chunk
    const embeddings = await Promise.all(
      chunks.map(chunk => generateEmbedding(chunk))
    )

    // Store in knowledge base
    const kbEntries = chunks.map((chunk, index) => ({
      user_id: file.user_id,
      file_id: fileId,
      content: chunk,
      embedding: embeddings[index],
      chunk_index: index,
      metadata: {
        source: file.name,
        mimeType: file.mime_type,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }))

    // Batch insert
    const { error: insertError } = await supabase
      .from('knowledge_base')
      .insert(kbEntries)

    if (insertError) {
      throw new Error(`Failed to insert knowledge base entries: ${insertError.message}`)
    }

    console.log(`Processed ${chunks.length} chunks for file ${fileId}`)
  }

  private async extractText(blob: Blob, mimeType: string): Promise<string> {
    try {
      switch (mimeType) {
        case 'text/plain':
        case 'text/javascript':
        case 'text/typescript':
          return await blob.text()

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await FileParser.parseDOCX(blob)

        case 'application/json':
          const json = await FileParser.parseJSON(blob)
          return JSON.stringify(json, null, 2)

        case 'text/csv':
          const csv = await FileParser.parseCSV(blob)
          return csv.map(row => row.join(',')).join('\n')

        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          const excel = await FileParser.parseExcel(blob)
          return Object.entries(excel.sheets)
            .map(([name, data]) => `Sheet: ${name}\n${JSON.stringify(data)}`)
            .join('\n\n')

        default:
          return await blob.text()
      }
    } catch (error) {
      console.error('Error extracting text:', error)
      return ''
    }
  }
}

