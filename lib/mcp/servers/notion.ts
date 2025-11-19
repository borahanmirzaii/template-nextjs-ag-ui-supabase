import { BaseMCPServer } from './base'
import type { MCPTool } from '../protocol'

export class NotionMCPServer extends BaseMCPServer {
  platform = 'notion'
  private apiKey: string = ''

  tools: MCPTool[] = [
    {
      name: 'notion_search',
      description: 'Search Notion pages and databases',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
    {
      name: 'notion_get_page',
      description: 'Get a Notion page by ID',
      inputSchema: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'Notion page ID' },
        },
        required: ['pageId'],
      },
    },
  ]

  async connect(credentials: Record<string, any>): Promise<void> {
    this.apiKey = credentials.apiKey
    if (!this.apiKey) {
      throw new Error('Notion API key required')
    }
  }

  async disconnect(): Promise<void> {
    this.apiKey = ''
  }

  async executeTool(toolName: string, params: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'notion_search':
        return await this.search(params.query)
      case 'notion_get_page':
        return await this.getPage(params.pageId)
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  }

  private async search(query: string): Promise<any> {
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`)
    }

    return await response.json()
  }

  private async getPage(pageId: string): Promise<any> {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Notion-Version': '2022-06-28',
      },
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`)
    }

    return await response.json()
  }
}

