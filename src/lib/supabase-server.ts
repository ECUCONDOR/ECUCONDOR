'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';
import { Database } from '@/types/database.types';

export async function createServerSupabaseClient(request: NextRequest) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = cookies();
          const cookie = await cookieStore;
          return cookie.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = cookies();
          const cookie = await cookieStore;
          cookie.set(name, value, options);
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = cookies();
          const cookie = await cookieStore;
          cookie.delete(name);
        },
      },
    }
  );
}
