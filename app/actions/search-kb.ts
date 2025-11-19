'use server'

import { kbService } from '@/services/kb-service'
import { createClient } from '@/lib/supabase/server'

export async function searchKnowledgeBaseAction(
  query: string,
  fileIds?: string[]
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  return await kbService.searchKnowledgeBase(query, user.id, {
    fileIds,
    limit: 10,
    threshold: 0.7,
  })
}

