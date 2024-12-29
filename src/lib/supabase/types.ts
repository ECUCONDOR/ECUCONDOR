import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

export interface AuthError {
  message: string
  status?: number
  code?: string
}

export interface SupabaseConfig {
  url: string
  anonKey: string
}
