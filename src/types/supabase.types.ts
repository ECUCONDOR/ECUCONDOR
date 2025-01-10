import { Database } from '@/utils/database.types'

export type Tables = Database['public']['Tables']

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never

export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

export type UserRecord = Tables['usuarios']['Row']
export type PaymentRecord = Tables['pagos']['Row']
export type BankRecord = Tables['registro_bancario']['Row']
export type OrderRecord = Tables['ordenes']['Row']
export type DocumentRecord = Tables['documentos']['Row']

// Tipos específicos para respuestas de Supabase
export type InsertResponse<T> = DbResult<SupabaseResponse<T>>
export type SelectResponse<T> = DbResult<SupabaseResponse<T[]>>
export type SingleResponse<T> = DbResult<SupabaseResponse<T>>
export type UpdateResponse<T> = DbResult<SupabaseResponse<T>>
export type DeleteResponse = DbResult<SupabaseResponse<null>>
