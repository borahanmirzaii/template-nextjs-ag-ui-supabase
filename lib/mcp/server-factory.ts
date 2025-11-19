import { BaseMCPServer } from './servers/base'
import { NotionMCPServer } from './servers/notion'
import { JiraMCPServer } from './servers/jira'
import { GoogleMCPServer } from './servers/google'

export type Platform = 'notion' | 'jira' | 'google'

export class MCPServerFactory {
  static create(platform: Platform, credentials: Record<string, any>): BaseMCPServer {
    switch (platform) {
      case 'notion':
        return new NotionMCPServer(credentials)
      case 'jira':
        return new JiraMCPServer(credentials)
      case 'google':
        return new GoogleMCPServer(credentials)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }
}

