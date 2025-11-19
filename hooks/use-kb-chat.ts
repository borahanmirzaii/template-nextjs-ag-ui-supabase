'use client'

import { useChat } from 'ai/react'
import { useState, useCallback } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
  sources?: {
    fileId: string
    fileName: string
    snippet: string
    similarity: number
  }[]
}

export function useKBChat(options?: {
  fileIds?: string[]
  onSourcesRetrieved?: (sources: any[]) => void
}) {
  const [sources, setSources] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const chat = useChat({
    api: '/api/chat',
    body: {
      fileIds: options?.fileIds,
    },
    onResponse: (response) => {
      setIsSearching(false)
      
      // Extract sources from response headers
      const sourcesHeader = response.headers.get('X-Sources')
      if (sourcesHeader) {
        try {
          const parsedSources = JSON.parse(sourcesHeader)
          setSources(parsedSources)
          options?.onSourcesRetrieved?.(parsedSources)
        } catch (e) {
          console.error('Failed to parse sources:', e)
        }
      }
    },
    onError: (error) => {
      setIsSearching(false)
      console.error('Chat error:', error)
    },
  })

  const sendMessageWithRAG = useCallback(async (content: string) => {
    setIsSearching(true)
    setSources([])
    
    await chat.append({
      role: 'user',
      content,
    })
  }, [chat])

  return {
    ...chat,
    sources,
    isSearching,
    sendMessageWithRAG,
  }
}

