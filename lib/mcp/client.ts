import { MCPServerFactory, type Platform } from './server-factory'
import { BaseMCPServer } from './servers/base'
import type { MCPRequest, MCPResponse } from './protocol'

export class MCPClient {
  private servers: Map<string, BaseMCPServer> = new Map()

  async connect(platform: Platform, credentials: Record<string, any>): Promise<void> {
    const server = MCPServerFactory.create(platform, credentials)
    await server.connect(credentials)
    this.servers.set(platform, server)
  }

  async disconnect(platform: Platform): Promise<void> {
    const server = this.servers.get(platform)
    if (server) {
      await server.disconnect()
      this.servers.delete(platform)
    }
  }

  async execute(platform: Platform, request: MCPRequest): Promise<MCPResponse> {
    const server = this.servers.get(platform)
    if (!server) {
      throw new Error(`Server not connected for platform: ${platform}`)
    }
    return await server.handleRequest(request)
  }

  getServer(platform: Platform): BaseMCPServer | undefined {
    return this.servers.get(platform)
  }
}

export const mcpClient = new MCPClient()

