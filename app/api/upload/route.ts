import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/supabase/storage'
import { fileRepository } from '@/lib/repositories/file-repository'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const { path, error: uploadError } = await uploadFile(file, user.id)

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create file record in database
    const fileRecord = await fileRepository.create({
      user_id: user.id,
      name: file.name,
      size: file.size,
      mime_type: file.type,
      storage_path: path,
      status: 'pending',
      metadata: {},
    })

    // Trigger processing (async)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId: fileRecord.id }),
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      file: fileRecord,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

