import { createClient } from '@/lib/supabase/server'
import { kbService } from '@/services/kb-service'
import { KBBrowser } from '@/components/knowledge-base/KBBrowser'
import { searchKnowledgeBaseAction } from '@/app/actions/search-kb'

export default async function KnowledgeBasePage() {
  const supabase = await createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in</div>
  }

  // Get user files
  const files = await kbService.getUserFiles(user.id)

  // Get KB stats
  const stats = await kbService.getFileStats(user.id)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Search your files with semantic understanding or chat with AI about your documents
        </p>
      </div>

      <KBBrowser
        files={files}
        stats={stats}
        onSearch={searchKnowledgeBaseAction}
      />
    </div>
  )
}

