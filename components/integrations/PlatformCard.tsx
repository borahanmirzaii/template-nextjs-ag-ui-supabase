'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CheckCircle2,
  XCircle,
  MoreVertical,
  RefreshCw,
  Trash2,
  Settings,
} from 'lucide-react'
import type { MCPServer } from '@/types/mcp'

interface PlatformCardProps {
  server: MCPServer
  onConnect?: () => void
  onDisconnect?: () => void
  onRefresh?: () => void
  onDelete?: () => void
  onConfigure?: () => void
}

export function PlatformCard({
  server,
  onConnect,
  onDisconnect,
  onRefresh,
  onDelete,
  onConfigure,
}: PlatformCardProps) {
  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      google: '🔍',
      notion: '📝',
      jira: '📋',
      github: '🐙',
    }
    return icons[platform] || '🔌'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'disconnected':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return ''
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{getPlatformIcon(server.platform)}</div>
          <div>
            <h3 className="font-semibold capitalize">{server.name}</h3>
            <Badge variant="outline" className={getStatusColor(server.status)}>
              {server.status === 'connected' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {server.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
              {server.status}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRefresh && (
              <DropdownMenuItem onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </DropdownMenuItem>
            )}
            {onConfigure && (
              <DropdownMenuItem onClick={onConfigure}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {server.error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {server.error}
        </div>
      )}

      {server.lastSync && (
        <p className="text-sm text-muted-foreground mb-4">
          Last synced: {new Date(server.lastSync).toLocaleString()}
        </p>
      )}

      {server.status === 'connected' ? (
        <Button variant="outline" className="w-full" onClick={onDisconnect}>
          Disconnect
        </Button>
      ) : (
        <Button className="w-full" onClick={onConnect}>
          Connect
        </Button>
      )}
    </Card>
  )
}

