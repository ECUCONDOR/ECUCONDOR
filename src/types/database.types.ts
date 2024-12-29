import { PostgrestError } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Tables = {
  profiles: Profile;
  transactions: Transaction;
};

export interface Profile {
  id: string;
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
}

export interface ProfileInsert {
  id: string;
  updated_at?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
}

export interface ProfileUpdate {
  id?: string;
  updated_at?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
}

export interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  type: 'buy' | 'sell';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
}

export interface TransactionInsert {
  id?: string;
  created_at?: string;
  user_id: string;
  type: 'buy' | 'sell';
  amount: number;
  currency: string;
  status?: 'pending' | 'completed' | 'failed';
  payment_method: string;
}

export interface TransactionUpdate {
  id?: string;
  created_at?: string;
  user_id?: string;
  type?: 'buy' | 'sell';
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed';
  payment_method?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
