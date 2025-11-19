import { BaseMCPServer } from './base'
import type { MCPTool } from '../protocol'

export class JiraMCPServer extends BaseMCPServer {
  platform = 'jira'
  private apiToken: string = ''
  private domain: string = ''

  tools: MCPTool[] = [
    {
      name: 'jira_search',
      description: 'Search Jira issues',
      inputSchema: {
        type: 'object',
        properties: {
          jql: { type: 'string', description: 'JQL query string' },
        },
        required: ['jql'],
      },
    },
    {
      name: 'jira_get_issue',
      description: 'Get a Jira issue by key',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: { type: 'string', description: 'Jira issue key (e.g., PROJ-123)' },
        },
        required: ['issueKey'],
      },
    },
  ]

  async connect(credentials: Record<string, any>): Promise<void> {
    this.apiToken = credentials.apiToken
    this.domain = credentials.domain
    if (!this.apiToken || !this.domain) {
      throw new Error('Jira API token and domain required')
    }
  }

  async disconnect(): Promise<void> {
    this.apiToken = ''
    this.domain = ''
  }

  async executeTool(toolName: string, params: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'jira_search':
        return await this.search(params.jql)
      case 'jira_get_issue':
        return await this.getIssue(params.issueKey)
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  }

  private async search(jql: string): Promise<any> {
    const response = await fetch(`https://${this.domain}/rest/api/3/search`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${this.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ jql }),
    })

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.statusText}`)
    }

    return await response.json()
  }

  private async getIssue(issueKey: string): Promise<any> {
    const response = await fetch(`https://${this.domain}/rest/api/3/issue/${issueKey}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${this.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.statusText}`)
    }

    return await response.json()
  }
}

