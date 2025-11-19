'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Lightbulb, 
  FileText, 
  Tag, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react'
import type { AnalysisResult } from '@/lib/ai/agents/base-agent'

interface AnalysisViewerProps {
  analysis: AnalysisResult
  fileName: string
}

export function AnalysisViewer({ analysis, fileName }: AnalysisViewerProps) {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'low':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />
      case 'medium':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
        <p className="text-muted-foreground">{fileName}</p>
      </div>

      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <FileText className="h-5 w-5 text-primary mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-muted-foreground">{analysis.summary}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="key-points">Key Points</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-3">
                  {getImportanceIcon(insight.importance)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={getImportanceColor(insight.importance)}
                      >
                        {insight.importance}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Key Points Tab */}
        <TabsContent value="key-points" className="mt-6">
          <Card className="p-6">
            <ul className="space-y-3">
              {analysis.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{point}</p>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="mt-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Topics */}
              {analysis.metadata.topics.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Topics</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.metadata.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Language</p>
                  <p className="font-medium">{analysis.metadata.language.toUpperCase()}</p>
                </div>

                {analysis.metadata.sentiment && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sentiment</p>
                    <Badge variant="outline">
                      {analysis.metadata.sentiment}
                    </Badge>
                  </div>
                )}

                {analysis.metadata.wordCount && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Word Count</p>
                    <p className="font-medium">{analysis.metadata.wordCount.toLocaleString()}</p>
                  </div>
                )}

                {analysis.metadata.pageCount && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pages</p>
                    <p className="font-medium">{analysis.metadata.pageCount}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

