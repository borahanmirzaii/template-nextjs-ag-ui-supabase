'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PlatformCard } from './PlatformCard'
import { ToolBrowser } from './tool-browser'
import { ToolExecutor } from './tool-executor'
import { Plus, Plug, Wrench } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  refreshIntegrationAction,
  disconnectIntegrationAction,
  getIntegrationToolsAction,
} from '@/app/actions/mcp-actions'
import type { MCPServer, MCPTool } from '@/types/mcp'

interface IntegrationsDashboardProps {
  initialIntegrations: any[]
}

export function IntegrationsDashboard({ initialIntegrations }: IntegrationsDashboardProps) {
  const [integrations, setIntegrations] = useState<MCPServer[]>(
    initialIntegrations.map(i => ({
      id: i.id,
      name: i.platform,
      platform: i.platform,
      status: i.status,
      credentials: i.credentials,
      config: i.config,
      lastSync: i.last_sync ? new Date(i.last_sync) : undefined,
      error: i.error_message,
    }))
  )
  const [tools, setTools] = useState<MCPTool[]>([])
  const [selectedTool, setSelectedTool] = useState<MCPTool | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Available platforms
  const availablePlatforms = [
    { id: 'google', name: 'Google Workspace', icon: '🔍' },
    { id: 'notion', name: 'Notion', icon: '📝' },
    { id: 'jira', name: 'Jira', icon: '📋' },
    { id: 'github', name: 'GitHub', icon: '🐙' },
  ]

  // Load tools
  useEffect(() => {
    loadAllTools()
  }, [integrations])

  const loadAllTools = async () => {
    const connectedIntegrations = integrations.filter(i => i.status === 'connected')
    
    const allTools = await Promise.all(
      connectedIntegrations.map(async (integration) => {
        try {
          return await getIntegrationToolsAction(integration.id)
        } catch {
          return []
        }
      })
    )
    setTools(allTools.flat())
  }

  const handleConnect = async (platform: string) => {
    window.location.href = `/api/oauth/authorize/${platform}`
  }

  const handleRefresh = async (integrationId: string) => {
    setIsLoading(true)
    try {
      const result = await refreshIntegrationAction(integrationId)
      toast({
        title: 'Integration refreshed',
        description: `Found ${result.toolCount} tools`,
      })
      await loadAllTools()
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return
    setIsLoading(true)
    try {
      await disconnectIntegrationAction(integrationId)
      toast({
        title: 'Integration disconnected',
      })
      setIntegrations(prev => prev.filter(i => i.id !== integrationId))
      await loadAllTools()
    } catch (error) {
      toast({
        title: 'Disconnect failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="platforms" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="platforms" className="gap-2">
          <Plug className="h-4 w-4" />
          Platforms
        </TabsTrigger>
        <TabsTrigger value="tools" className="gap-2">
          <Wrench className="h-4 w-4" />
          Tools
        </TabsTrigger>
      </TabsList>

      {/* Platforms Tab */}
      <TabsContent value="platforms" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePlatforms.map(platform => {
            const integration = integrations.find(i => i.platform === platform.id)
            return integration ? (
              <PlatformCard
                key={platform.id}
                server={integration}
                onRefresh={() => handleRefresh(integration.id)}
                onDisconnect={() => handleDisconnect(integration.id)}
              />
            ) : (
              <Card key={platform.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{platform.icon}</div>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleConnect(platform.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </Card>
            )
          })}
        </div>
      </TabsContent>

      {/* Tools Tab */}
      <TabsContent value="tools" className="mt-6">
        {tools.length === 0 ? (
          <Card className="p-12 text-center">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No tools available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect a platform to access AI-powered tools
            </p>
            <Button onClick={() => {
              const platformsTab = document.querySelector('[value="platforms"]') as HTMLElement
              platformsTab?.click()
            }}>
              Go to Platforms
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ToolBrowser
              tools={tools}
              onToolSelect={setSelectedTool}
              selectedTool={selectedTool}
            />
            {selectedTool ? (
              <ToolExecutor tool={selectedTool} />
            ) : (
              <Card className="flex items-center justify-center h-[700px]">
                <div className="text-center text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a tool to execute</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

