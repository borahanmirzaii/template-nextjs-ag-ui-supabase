import { PlatformConnector } from '@/components/integrations/PlatformConnector'
import { Card } from '@/components/ui/card'

export default function IntegrationsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your platforms to extend functionality
        </p>
      </div>

      <Card className="p-6">
        <PlatformConnector />
      </Card>
    </div>
  )
}
