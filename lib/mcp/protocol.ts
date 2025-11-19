export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface MCPRequest {
  method: string
  params?: Record<string, any>
}

export interface MCPResponse {
  result?: any
  error?: {
    code: number
    message: string
  }
}

export interface MCPConnection {
  platform: string
  credentials: Record<string, any>
  status: 'connected' | 'disconnected' | 'error'
}

