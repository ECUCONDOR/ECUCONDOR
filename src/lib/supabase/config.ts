'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SupabaseClientOptions } from '@supabase/supabase-js';
import { CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/database.types'

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
  options?: SupabaseClientOptions<'public'>;
  cookieOptions?: CookieOptions & {
    name?: string;
  };
  isSingleton?: boolean;
}

export const SUPABASE_CONFIG: SupabaseConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  cookieOptions: {
    name: 'sb-auth',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    path: '/'
  }
};

export function validateSupabaseConfig(): SupabaseConfig {
  if (!SUPABASE_CONFIG.supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definido');
  }
  if (!SUPABASE_CONFIG.supabaseKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definido');
  }
  return SUPABASE_CONFIG;
}

export const createClient = () => {
  const config = validateSupabaseConfig()
  return createClientComponentClient<Database>(config)
}
