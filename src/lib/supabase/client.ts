import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { logError } from '../utils/error-handler';
import type { Database } from '@/types/supabase';

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export const createClient = () => {
  try {
    if (!supabaseClient) {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables');
      }

      supabaseClient = createClientComponentClient<Database>({
        options: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('Supabase client created successfully');
    }
    return supabaseClient;
  } catch (error) {
    logError('supabase-client', error, {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    throw error;
  }
};

export const validateSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  try {
    new URL(url);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }

  if (!key.match(/^[a-zA-Z0-9._-]+$/)) {
    throw new Error('Invalid Supabase anon key format');
  }

  return true;
};

// Tipos de error personalizados
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
    
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Función para verificar el estado de la sesión
export const checkSession = async () => {
  const client = createClient();
  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    logError('check-session', error);
    return null;
  }
};
