export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          name: string
          website_url: string
          industry: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          website_url: string
          industry?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          website_url?: string
          industry?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      page_audits: {
        Row: {
          id: string
          brand_id: string
          page_url: string
          page_title: string | null
          is_homepage: boolean
          technical_score: number | null
          content_score: number | null
          aeo_score: number | null
          last_audited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          page_url: string
          page_title?: string | null
          is_homepage?: boolean
          technical_score?: number | null
          content_score?: number | null
          aeo_score?: number | null
          last_audited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          page_url?: string
          page_title?: string | null
          is_homepage?: boolean
          technical_score?: number | null
          content_score?: number | null
          aeo_score?: number | null
          last_audited_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
