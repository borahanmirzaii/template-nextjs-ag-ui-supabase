import type { MCPTool, MCPRequest, MCPResponse } from '../protocol'

export abstract class BaseMCPServer {
  abstract platform: string
  abstract tools: MCPTool[]

  abstract connect(credentials: Record<string, any>): Promise<void>
  abstract disconnect(): Promise<void>
  abstract executeTool(toolName: string, params: Record<string, any>): Promise<any>

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'tools/list':
          return { result: { tools: this.tools } }
        
        case 'tools/call':
          const { name, arguments: args } = request.params || {}
          if (!name) {
            return { error: { code: -32602, message: 'Tool name required' } }
          }
          const result = await this.executeTool(name, args || {})
          return { result }
        
        default:
          return { error: { code: -32601, message: 'Method not found' } }
      }
    } catch (error) {
      return {
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }
}

