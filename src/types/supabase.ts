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
      ordenes_p2p: {
        Row: {
          id: string
          created_at: string
          user_id: string
          moneda: string
          tipo: 'compra' | 'venta'
          cantidad: number
          precio: number
          metodo_pago: string
          instrucciones: string
          estado: 'abierta' | 'en_proceso' | 'completada' | 'cancelada'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          moneda: string
          tipo: 'compra' | 'venta'
          cantidad: number
          precio: number
          metodo_pago: string
          instrucciones: string
          estado?: 'abierta' | 'en_proceso' | 'completada' | 'cancelada'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          moneda?: string
          tipo?: 'compra' | 'venta'
          cantidad?: number
          precio?: number
          metodo_pago?: string
          instrucciones?: string
          estado?: 'abierta' | 'en_proceso' | 'completada' | 'cancelada'
        }
      }
      user_limits: {
        Row: {
          id: string
          user_id: string
          verified: boolean
          max_order_amount: number
          daily_limit: number
          monthly_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          verified?: boolean
          max_order_amount?: number
          daily_limit?: number
          monthly_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          verified?: boolean
          max_order_amount?: number
          daily_limit?: number
          monthly_limit?: number
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