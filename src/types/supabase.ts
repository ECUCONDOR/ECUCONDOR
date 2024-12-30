import { Database as DatabaseGenerated } from './database.types';

export type Database = DatabaseGenerated;

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Auth Types
export interface UserMetadata {
  name?: string;
  avatar_url?: string;
  preferred_language?: string;
}

// Custom Types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}