'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FileUploadProgress } from '@/types/file'

interface UploadOptions {
  onProgress?: (fileId: string, progress: number) => void
  onComplete?: (fileId: string, filePath: string) => void
  onError?: (fileId: string, error: string) => void
}

export function useFileUpload(options?: UploadOptions) {
  const [uploadQueue, setUploadQueue] = useState<Map<string, FileUploadProgress>>(new Map())
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const uploadFile = useCallback(async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`
    
    // Initialize progress
    setUploadQueue(prev => new Map(prev).set(fileId, {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    }))

    try {
      setIsUploading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload to Supabase Storage
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${user.id}/${timestamp}_${sanitizedName}`

      const { data, error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Update progress
      setUploadQueue(prev => {
        const updated = new Map(prev)
        const current = updated.get(fileId)
        if (current) {
          updated.set(fileId, {
            ...current,
            progress: 100,
            status: 'processing',
          })
        }
        return updated
      })

      // Create file record in database
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: file.name,
          size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          status: 'processing',
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update status to completed
      setUploadQueue(prev => {
        const updated = new Map(prev)
        updated.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 100,
          status: 'completed',
        })
        return updated
      })

      options?.onComplete?.(fileId, filePath)

      // Trigger analysis (fire and forget)
      fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: fileRecord.id }),
      }).catch(console.error)

      return fileRecord

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadQueue(prev => {
        const updated = new Map(prev)
        updated.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: errorMessage,
        })
        return updated
      })

      options?.onError?.(fileId, errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [supabase, options])

  const uploadMultiple = useCallback(async (files: File[]) => {
    const results = await Promise.allSettled(files.map(uploadFile))
    return results
  }, [uploadFile])

  const clearQueue = useCallback(() => {
    setUploadQueue(new Map())
  }, [])

  const removeFromQueue = useCallback((fileId: string) => {
    setUploadQueue(prev => {
      const updated = new Map(prev)
      updated.delete(fileId)
      return updated
    })
  }, [])

  return {
    uploadFile,
    uploadMultiple,
    uploadQueue: Array.from(uploadQueue.values()),
    isUploading,
    clearQueue,
    removeFromQueue,
  }
}

