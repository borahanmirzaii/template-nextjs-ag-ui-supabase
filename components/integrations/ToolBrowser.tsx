'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Wrench,
} from 'lucide-react'
import type { MCPTool, MCPToolExecution } from '@/types/mcp'

interface ToolBrowserProps {
  tools: MCPTool[]
  onExecute: (toolId: string, input: any) => Promise<any>
}

export function ToolBrowser({ tools, onExecute }: ToolBrowserProps) {
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null)
  const [inputValues, setInputValues] = useState<Record<string, any>>({})
  const [executions, setExecutions] = useState<MCPToolExecution[]>([])
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    if (!selectedTool) return

    setIsExecuting(true)
    const executionId = crypto.randomUUID()
    
    const execution: MCPToolExecution = {
      id: executionId,
      toolId: selectedTool.id,
      toolName: selectedTool.name,
      input: inputValues,
      status: 'running',
      startedAt: new Date(),
    }

    setExecutions(prev => [execution, ...prev])

    try {
      const result = await onExecute(selectedTool.id, inputValues)
      
      setExecutions(prev => prev.map(e => 
        e.id === executionId 
          ? { ...e, status: 'completed' as const, output: result, completedAt: new Date() }
          : e
      ))
    } catch (error) {
      setExecutions(prev => prev.map(e => 
        e.id === executionId 
          ? { 
              ...e, 
              status: 'failed' as const, 
              error: error instanceof Error ? error.message : 'Execution failed',
              completedAt: new Date()
            }
          : e
      ))
    } finally {
      setIsExecuting(false)
    }
  }

  const renderInputField = (name: string, schema: any) => {
    const value = inputValues[name] || ''
    
    return (
      <div key={name} className="space-y-2">
        <Label htmlFor={name}>
          {name}
          {schema.required?.includes(name) && <span className="text-destructive">*</span>}
        </Label>
        {schema.properties[name]?.type === 'string' && (
          <Input
            id={name}
            value={value}
            onChange={(e) => setInputValues({ ...inputValues, [name]: e.target.value })}
            placeholder={schema.properties[name]?.description}
          />
        )}
        {schema.properties[name]?.type === 'number' && (
          <Input
            id={name}
            type="number"
            value={value}
            onChange={(e) => setInputValues({ ...inputValues, [name]: Number(e.target.value) })}
            placeholder={schema.properties[name]?.description}
          />
        )}
        {schema.properties[name]?.type === 'boolean' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={name}
              checked={value}
              onChange={(e) => setInputValues({ ...inputValues, [name]: e.target.checked })}
            />
            <Label htmlFor={name}>{schema.properties[name]?.description}</Label>
          </div>
        )}
        {schema.properties[name]?.description && (
          <p className="text-xs text-muted-foreground">
            {schema.properties[name].description}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tools List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Available Tools</h3>
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {tools.map((tool) => (
              <Card
                key={tool.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedTool?.id === tool.id ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  setSelectedTool(tool)
                  setInputValues({})
                }}
              >
                <div className="flex items-start gap-2">
                  <Wrench className="h-4 w-4 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    {tool.category && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {tool.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Tool Input Form */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">
          {selectedTool ? `Execute: ${selectedTool.name}` : 'Select a Tool'}
        </h3>
        
        {selectedTool ? (
          <div className="space-y-4">
            <div className="space-y-4">
              {selectedTool.inputSchema.properties &&
                Object.keys(selectedTool.inputSchema.properties).map((key) =>
                  renderInputField(key, selectedTool.inputSchema)
                )}
            </div>
            
            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Tool
                </>
              )}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a tool from the list to execute it
          </p>
        )}
      </Card>

      {/* Execution History */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Execution History</h3>
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {executions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No executions yet
              </p>
            ) : (
              executions.map((execution) => (
                <Card key={execution.id} className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    {execution.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    )}
                    {execution.status === 'failed' && (
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                    )}
                    {execution.status === 'running' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{execution.toolName}</p>
                      <p className="text-xs text-muted-foreground">
                        {execution.startedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {execution.status}
                    </Badge>
                  </div>
                  
                  {execution.output && (
                    <div className="mt-2 p-2 bg-accent rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(execution.output, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {execution.error && (
                    <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-xs">
                      {execution.error}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

