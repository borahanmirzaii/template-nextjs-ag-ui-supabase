import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock file upload
  http.post('/api/upload', async () => {
    return HttpResponse.json({
      success: true,
      fileId: 'mock-file-id',
      message: 'File uploaded successfully',
    })
  }),

  // Mock analysis
  http.post('/api/analyze', async () => {
    return HttpResponse.json({
      success: true,
      analysis: {
        summary: 'Mock analysis summary',
        keyPoints: ['Point 1', 'Point 2'],
        insights: [],
        metadata: { topics: ['test'], language: 'en' },
      },
    })
  }),

  // Mock chat
  http.post('/api/chat', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('Mock AI response'))
        controller.close()
      },
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }),

  // Mock knowledge search
  http.post('/api/knowledge/search', async () => {
    return HttpResponse.json({
      results: [
        {
          id: '1',
          content: 'Mock search result',
          fileId: 'file-1',
          fileName: 'test.pdf',
          similarity: 0.95,
        },
      ],
    })
  }),
]

