export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FileStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type IntegrationStatus = 'connected' | 'disconnected' | 'error'
export type Platform = 'google' | 'notion' | 'jira'

export interface Database {
  public: {
    Tables: {
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          size: number
          mime_type: string
          storage_path: string
          metadata: Json
          status: FileStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          size: number
          mime_type: string
          storage_path: string
          metadata?: Json
          status?: FileStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          size?: number
          mime_type?: string
          storage_path?: string
          metadata?: Json
          status?: FileStatus
          updated_at?: string
        }
      }
      analysis: {
        Row: {
          id: string
          file_id: string
          status: AnalysisStatus
          result: Json
          insights: Json
          agent_type: string
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          file_id: string
          status?: AnalysisStatus
          result?: Json
          insights?: Json
          agent_type: string
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          status?: AnalysisStatus
          result?: Json
          insights?: Json
          error_message?: string | null
          completed_at?: string | null
        }
      }
      knowledge_base: {
        Row: {
          id: string
          user_id: string
          file_id: string
          content: string
          embedding: number[] | null
          metadata: Json
          chunk_index: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_id: string
          content: string
          embedding?: number[] | null
          metadata?: Json
          chunk_index: number
          created_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          platform: Platform
          credentials: Json
          config: Json
          status: IntegrationStatus
          last_sync: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: Platform
          credentials: Json
          config?: Json
          status?: IntegrationStatus
          last_sync?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          credentials?: Json
          config?: Json
          status?: IntegrationStatus
          last_sync?: string | null
          error_message?: string | null
          updated_at?: string
        }
      }
    }
    Functions: {
      match_knowledge_base: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
          filter_user_id?: string
          filter_file_id?: string
        }
        Returns: {
          id: string
          file_id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
    }
  }
}

