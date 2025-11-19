import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { vectorSearch } from '@/lib/knowledge/search'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, fileId, threshold, limit } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    const results = await vectorSearch(query, {
      userId: user.id,
      fileId,
      threshold,
      limit,
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Knowledge search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

