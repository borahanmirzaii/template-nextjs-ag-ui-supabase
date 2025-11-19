'use client'

import { useEffect, useState } from 'react'
import { readStreamableValue } from 'ai/rsc'
import { analyzeFileStreaming } from '@/app/actions/analyze-file'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { AnalysisViewer } from './AnalysisViewer'
import type { AnalysisResult } from '@/lib/ai/agents/base-agent'

interface StreamingAnalysisProps {
  fileId: string
  fileName: string
}

export function StreamingAnalysis({ fileId, fileName }: StreamingAnalysisProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'completed' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const stream = await analyzeFileStreaming(fileId)

        for await (const update of readStreamableValue(stream)) {
          if (update) {
            setStatus(update.status)
            setMessage(update.message || '')
            
            if (update.result) {
              setResult(update.result)
            }
          }
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Analysis failed')
      }
    })()
  }, [fileId])

  if (status === 'error') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <XCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (status === 'completed' && result) {
    return <AnalysisViewer analysis={result} fileName={fileName} />
  }

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <p className="font-semibold mb-1">Analyzing {fileName}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Progress value={undefined} className="w-full max-w-md" />
      </div>
    </Card>
  )
}

