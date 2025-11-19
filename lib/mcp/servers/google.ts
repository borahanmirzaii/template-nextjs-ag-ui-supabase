import { BaseMCPServer } from './base'
import type { MCPTool } from '../protocol'

export class GoogleMCPServer extends BaseMCPServer {
  platform = 'google'
  private accessToken: string = ''

  tools: MCPTool[] = [
    {
      name: 'google_drive_list',
      description: 'List files in Google Drive',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
      },
    },
    {
      name: 'google_drive_get',
      description: 'Get a Google Drive file',
      inputSchema: {
        type: 'object',
        properties: {
          fileId: { type: 'string', description: 'Google Drive file ID' },
        },
        required: ['fileId'],
      },
    },
  ]

  async connect(credentials: Record<string, any>): Promise<void> {
    this.accessToken = credentials.accessToken
    if (!this.accessToken) {
      throw new Error('Google access token required')
    }
  }

  async disconnect(): Promise<void> {
    this.accessToken = ''
  }

  async executeTool(toolName: string, params: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'google_drive_list':
        return await this.listFiles(params.query)
      case 'google_drive_get':
        return await this.getFile(params.fileId)
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  }

  private async listFiles(query?: string): Promise<any> {
    const url = query
      ? `https://www.googleapis.com/drive/v3/files?q=name contains '${query}'`
      : 'https://www.googleapis.com/drive/v3/files'
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    return await response.json()
  }

  private async getFile(fileId: string): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    return await response.json()
  }
}

