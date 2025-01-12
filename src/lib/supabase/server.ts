'use server'

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type Database } from '@/types/database.types'

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle edge cases where cookies cannot be set
            // This can happen in middleware or static pages
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle edge cases where cookies cannot be removed
          }
        },
      },
    }
  )
}
