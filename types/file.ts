export interface FileMetadata {
  originalName: string
  uploadedAt: string
  contentType: string
  size: number
  [key: string]: any
}

export interface FileUploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export type SupportedFileType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'text/plain'
  | 'text/csv'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'text/javascript'
  | 'text/typescript'
  | 'application/json'

export interface FileAnalysisRequest {
  fileId: string
  filePath: string
  mimeType: string
}

