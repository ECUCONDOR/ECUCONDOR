'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User, AuthError } from '@supabase/supabase-js'

interface UseSupabaseAuthReturn {
  session: Session | null
  user: User | null
  loading: boolean
  error: AuthError | null
  signOut: () => Promise<void>
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setError(error)
      setLoading(false)
    })

    // Suscribirse a cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err as AuthError)
      console.error('Error al cerrar sesión:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    session,
    user,
    loading,
    error,
    signOut
  }
}
