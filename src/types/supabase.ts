import { Database as DatabaseGenerated } from './database.types';

export type Database = DatabaseGenerated & {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          document_type: string
          document_number: string
          phone: string
          status: string
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          document_type: string
          document_number: string
          phone: string
          status?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          document_type?: string
          document_number?: string
          phone?: string
          status?: string
          user_id?: string | null
        }
      }
      wallets: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          balance: number
          currency: string
          client_id: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          balance?: number
          currency: string
          client_id: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          balance?: number
          currency?: string
          client_id?: string
          status?: string
        }
      }
      transfers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          from_wallet_id: string
          to_wallet_id: string
          amount: number
          description: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          from_wallet_id: string
          to_wallet_id: string
          amount: number
          description?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          from_wallet_id?: string
          to_wallet_id?: string
          amount?: number
          description?: string | null
          status?: string
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          amount: number
          description: string
          type: 'ingreso' | 'egreso'
          status: 'pending' | 'completed' | 'failed'
          client_id: string
          reference?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          amount: number
          description: string
          type: 'ingreso' | 'egreso'
          status?: 'pending' | 'completed' | 'failed'
          client_id: string
          reference?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          amount?: number
          description?: string
          type?: 'ingreso' | 'egreso'
          status?: 'pending' | 'completed' | 'failed'
          client_id?: string
          reference?: string
        }
      }
    }
    Views: {
      transfer_history: {
        Row: {
          id: string
          created_at: string
          from_wallet_id: string
          to_wallet_id: string
          amount: number
          description: string | null
          status: string
          from_client_id: string | null
          to_client_id: string | null
        }
      }
    }
    Functions: {
      create_transfer: {
        Args: {
          p_from_wallet_id: string
          p_to_wallet_id: string
          p_amount: number
          p_description?: string
        }
        Returns: {
          status: string
          message: string
        }
      }
      get_transfer_history: {
        Args: {
          p_client_id: string
        }
        Returns: {
          id: string
          created_at: string
          from_wallet_id: string
          to_wallet_id: string
          amount: number
          description: string | null
          status: string
          from_client_id: string | null
          to_client_id: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Auth Types
export interface UserMetadata {
  name?: string;
  avatar_url?: string;
  preferred_language?: string;
}

// Custom Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Transfer Types
export interface TransferResult {
  status: string;
  message: string;
}