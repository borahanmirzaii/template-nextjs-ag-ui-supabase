import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// React cache (request deduplication)
export const getFile = cache(async (fileId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single()
  
  return data
})

// Next.js cache (persistent)
export const getCachedFiles = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return data
  },
  ['user-files'],
  {
    revalidate: 60, // 1 minute
    tags: ['files'],
  }
)

// Parallel data fetching helper
export async function getPageData(userId: string) {
  const [files] = await Promise.all([
    getCachedFiles(userId),
  ])

  return { files }
}

