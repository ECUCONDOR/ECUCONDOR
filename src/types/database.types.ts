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
      clients: {
        Row: {
          id: number
          first_name: string
          last_name: string
          identification: string
          email: string
          phone: string | null
          address: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          first_name: string
          last_name: string
          identification: string
          email: string
          phone?: string | null
          address?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          identification?: string
          email?: string
          phone?: string | null
          address?: string | null
          updated_at?: string
        }
      }
      user_client_relation: {
        Row: {
          id: string
          user_id: string
          client_id: number
          status: 'ACTIVE' | 'INACTIVE'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: number
          status?: 'ACTIVE' | 'INACTIVE'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          client_id?: number
          status?: 'ACTIVE' | 'INACTIVE'
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
