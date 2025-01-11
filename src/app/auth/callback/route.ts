import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    if (code) {
      const cookieStore = cookies()
      const supabase = createServerClient<Database>(
        process.env['NEXT_PUBLIC_SUPABASE_URL']!,
        process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options) {
              try {
                cookieStore.set({ name, value, ...options })
              } catch (error) {
                console.error('Error al establecer cookie:', error)
              }
            },
            remove(name: string, options) {
              try {
                cookieStore.delete({ name, ...options })
              } catch (error) {
                console.error('Error al eliminar cookie:', error)
              }
            },
          },
        }
      )
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error al intercambiar código por sesión:', error)
        return NextResponse.redirect(new URL('/login?error=auth', request.url))
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Error en el callback de autenticación:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}
