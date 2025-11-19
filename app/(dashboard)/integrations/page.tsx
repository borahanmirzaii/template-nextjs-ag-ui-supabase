import { createClient } from '@/lib/supabase/server'
import { IntegrationsDashboard } from '@/components/integrations/integrations-dashboard'

export const metadata = {
  title: 'Integrations | AI File Platform',
  description: 'Connect external platforms and execute tools',
}

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in</div>
  }

  // Get user integrations
  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground">
          Connect external platforms and execute AI-powered tools
        </p>
      </div>
      <IntegrationsDashboard initialIntegrations={integrations || []} />
    </div>
  )
}
